import { db } from '../db/database.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';
import { storageService } from './storage/storageService.js';
import { qrService } from './qrService.js';
import { config } from '../config/env.js';
import { validator } from '../utils/validator.js';
import { createStorageQuota } from './storageQuota.js';

const storageQuota = createStorageQuota({ db, config });

// Share lifetime is enforced server-side: only the allowed durations (5 or 10
// minutes) are accepted from the client; anything else uses the default.
function resolveExpiryMinutes(requested) {
  const minutes = parseInt(requested, 10);
  return config.shareExpiryOptionsMinutes.includes(minutes)
    ? minutes
    : config.shareExpiryDefaultMinutes;
}

function shareExpiryDate(requestedMinutes) {
  return new Date(Date.now() + resolveExpiryMinutes(requestedMinutes) * 60 * 1000).toISOString();
}

// Shares created before PIN protection was removed still carry a pin_hash
// (the column is intentionally kept). There is no PIN prompt any more, so
// fail closed instead of silently exposing content its sender PIN-protected.
function assertNoLegacyPin(share) {
  if (share.pin_hash) {
    throw new Error(
      'This share was created with PIN protection, which is no longer supported. It is no longer available.'
    );
  }
}

// Removes a share whose upload failed (rows cascade) and any objects already stored.
async function discardShare(shareId, storageKeys = []) {
  try {
    if (storageKeys.length > 0) {
      await storageService.deleteFiles(storageKeys);
    }
  } catch (e) {
    console.warn('[Share] Could not remove partially uploaded objects:', e.message);
  }
  try {
    await db.query(`DELETE FROM shares WHERE id = $1`, [shareId]);
  } catch (e) {
    console.warn('[Share] Could not remove failed share record:', e.message);
  }
}

export const shareService = {
  /**
   * Create a text share
   */
  async createTextShare({ text, maxAccesses = 0, expiryMinutes }) {
    if (!validator.isValidText(text)) {
      throw new Error('Invalid text content or exceeds 100,000 characters limit');
    }

    const otp = cryptoUtils.generateOtp();
    const otpHash = cryptoUtils.hashOtp(otp);
    const shareToken = cryptoUtils.generateShareToken();

    const expiresAt = shareExpiryDate(expiryMinutes);
    const maxAcc = parseInt(maxAccesses, 10) || 0;

    let insertQuery = '';
    let params = [];

    if (db.isPostgres) {
      insertQuery = `
        INSERT INTO shares (
          share_token, otp_hash, share_type, text_content, 
          expires_at, max_accesses, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING id, share_token, expires_at;
      `;
      params = [shareToken, otpHash, 'text', text, expiresAt, maxAcc];
    } else {
      insertQuery = `
        INSERT INTO shares (
          share_token, otp_hash, share_type, text_content, 
          expires_at, max_accesses, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'active');
      `;
      params = [shareToken, otpHash, 'text', text, expiresAt, maxAcc];
    }

    // The QR only needs the share URL, which is already known from the
    // token generated above — it does not need to wait for the database
    // write to finish. Running them together removes one full round trip
    // from Create Share.
    const shareUrl = `${config.appUrl}/s/${shareToken}`;
    const [, qrCode] = await Promise.all([
      db.query(insertQuery, params),
      qrService.generateDataUrl(shareUrl)
    ]);

    return {
      shareToken,
      otp,
      qrCode,
      shareUrl,
      shareType: 'text',
      expiresAt,
      maxAccesses: maxAcc
    };
  },

  /**
   * Create a multi-file / folder share via backend upload
   */
  async createFilesShare({ files, paths = [], maxAccesses = 0, expiryMinutes }) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const otp = cryptoUtils.generateOtp();
    const otpHash = cryptoUtils.hashOtp(otp);
    const shareToken = cryptoUtils.generateShareToken();

    const expiresAt = shareExpiryDate(expiryMinutes);
    const maxAcc = parseInt(maxAccesses, 10) || 0;

    const prepared = files.map((f, i) => {
      const originalName = Buffer.from(f.originalname, 'latin1').toString('utf8');
      return {
        buffer: f.buffer,
        originalName,
        relativePath: Array.isArray(paths) && paths[i] ? paths[i] : originalName,
        storageKey: storageService.generateStorageKey(originalName, shareToken),
        mimeType: f.mimetype || 'application/octet-stream',
        fileSize: f.size || (f.buffer ? f.buffer.length : 0)
      };
    });

    // Per-file limit (Multer already aborts oversized files while parsing;
    // this is a second guard before anything is stored).
    storageQuota.assertFileSizes(prepared.map((p) => p.fileSize));
    const totalBytes = prepared.reduce((sum, p) => sum + p.fileSize, 0);

    // Phase 1: under the storage lock, verify current usage + this upload fits
    // the safe limit and insert the share + file rows (the reservation).
    // Nothing has been sent to storage yet.
    const { shareId, insertedFiles } = await storageQuota.withCapacity(totalBytes, async (tx) => {
      let id = null;

      if (db.isPostgres) {
        const res = await tx.query(`
          INSERT INTO shares (
            share_token, otp_hash, share_type, 
            expires_at, max_accesses, status
          ) VALUES ($1, $2, 'files', $3, $4, 'active')
          RETURNING id;
        `, [shareToken, otpHash, expiresAt, maxAcc]);
        id = res.rows[0].id;
      } else {
        const res = await tx.query(`
          INSERT INTO shares (
            share_token, otp_hash, share_type, 
            expires_at, max_accesses, status
          ) VALUES (?, ?, 'files', ?, ?, 'active');
        `, [shareToken, otpHash, expiresAt, maxAcc]);
        id = res.lastID;
      }

      const rows = [];

      for (const p of prepared) {
        if (db.isPostgres) {
          const fileRes = await tx.query(`
            INSERT INTO shared_files (
              share_id, original_filename, storage_key, mime_type, file_size, relative_path
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, original_filename, mime_type, file_size, relative_path;
          `, [id, p.originalName, p.storageKey, p.mimeType, p.fileSize, p.relativePath]);
          rows.push(fileRes.rows[0]);
        } else {
          const fileRes = await tx.query(`
            INSERT INTO shared_files (
              share_id, original_filename, storage_key, mime_type, file_size, relative_path
            ) VALUES (?, ?, ?, ?, ?, ?);
          `, [id, p.originalName, p.storageKey, p.mimeType, p.fileSize, p.relativePath]);
          rows.push({
            id: fileRes.lastID,
            original_filename: p.originalName,
            mime_type: p.mimeType,
            file_size: p.fileSize,
            relative_path: p.relativePath
          });
        }
      }

      return { shareId: id, insertedFiles: rows };
    });

    // Phase 2: upload to storage (outside the lock). Each file is an
    // independent network call to Supabase, so they run concurrently
    // instead of one after another — for N files this turns N round trips
    // into roughly one. The QR only needs the share URL (known already),
    // so it's generated at the same time rather than after every upload
    // finishes. If any upload fails, the reservation and any objects that
    // did finish uploading are removed.
    const shareUrl = `${config.appUrl}/s/${shareToken}`;
    const uploadedKeys = [];
    let qrCode;
    try {
      const uploads = prepared
        .filter((p) => p.buffer)
        .map((p) =>
          storageService.uploadBuffer(p.storageKey, p.buffer, p.mimeType).then(() => {
            uploadedKeys.push(p.storageKey);
          })
        );
      [qrCode] = await Promise.all([qrService.generateDataUrl(shareUrl), ...uploads]);
    } catch (err) {
      console.error('[Share] Storage upload failed; discarding share:', err.message);
      await discardShare(shareId, uploadedKeys);
      const failure = new Error('File upload failed. Please try again.');
      failure.statusCode = 502;
      throw failure;
    }

    return {
      shareToken,
      otp,
      qrCode,
      shareUrl,
      shareType: 'files',
      fileCount: insertedFiles.length,
      files: insertedFiles,
      expiresAt,
      maxAccesses: maxAcc
    };
  },

  /**
   * Request Presigned Direct Upload URLs for Cloudflare R2
   */
  async requestDirectUploadUrls({ fileMetadata = [], maxAccesses = 0, expiryMinutes }) {
    if (!fileMetadata || fileMetadata.length === 0) {
      throw new Error('No files provided');
    }

    // Sizes are client-declared on this route; they are still needed so the
    // per-file limit and the storage safe limit can be applied.
    const sizes = fileMetadata.map((item) => Number(item.size));
    if (sizes.some((size) => !Number.isFinite(size) || size < 0)) {
      throw new Error('A valid file size is required for every file.');
    }
    storageQuota.assertFileSizes(sizes);
    const totalBytes = sizes.reduce((sum, size) => sum + size, 0);

    const otp = cryptoUtils.generateOtp();
    const otpHash = cryptoUtils.hashOtp(otp);
    const shareToken = cryptoUtils.generateShareToken();

    const expiresAt = shareExpiryDate(expiryMinutes);
    const maxAcc = parseInt(maxAccesses, 10) || 0;

    const { shareId, items } = await storageQuota.withCapacity(totalBytes, async (tx) => {
      let id = null;

      if (db.isPostgres) {
        const res = await tx.query(`
          INSERT INTO shares (
            share_token, otp_hash, share_type, 
            expires_at, max_accesses, status
          ) VALUES ($1, $2, 'files', $3, $4, 'active')
          RETURNING id;
        `, [shareToken, otpHash, expiresAt, maxAcc]);
        id = res.rows[0].id;
      } else {
        const res = await tx.query(`
          INSERT INTO shares (
            share_token, otp_hash, share_type, 
            expires_at, max_accesses, status
          ) VALUES (?, ?, 'files', ?, ?, 'active');
        `, [shareToken, otpHash, expiresAt, maxAcc]);
        id = res.lastID;
      }

      const rows = [];

      for (let i = 0; i < fileMetadata.length; i++) {
        const item = fileMetadata[i];
        const originalName = item.filename;
        const relativePath = item.relativePath || originalName;
        const storageKey = storageService.generateStorageKey(originalName, shareToken);
        const mimeType = item.mimeType || 'application/octet-stream';

        let fileId = null;
        if (db.isPostgres) {
          const fileRes = await tx.query(`
            INSERT INTO shared_files (
              share_id, original_filename, storage_key, mime_type, file_size, relative_path
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
          `, [id, originalName, storageKey, mimeType, sizes[i], relativePath]);
          fileId = fileRes.rows[0].id;
        } else {
          const fileRes = await tx.query(`
            INSERT INTO shared_files (
              share_id, original_filename, storage_key, mime_type, file_size, relative_path
            ) VALUES (?, ?, ?, ?, ?, ?);
          `, [id, originalName, storageKey, mimeType, sizes[i], relativePath]);
          fileId = fileRes.lastID;
        }

        rows.push({ fileId, filename: originalName, storageKey, mimeType });
      }

      return { shareId: id, items: rows };
    });

    // Signed upload URLs are created outside the storage lock (network calls).
    const uploads = [];
    try {
      for (const item of items) {
        const presignedUrl = await storageService.getPresignedUploadUrl(item.storageKey, item.mimeType, 3600);
        uploads.push({
          fileId: item.fileId,
          filename: item.filename,
          storageKey: item.storageKey,
          uploadUrl: presignedUrl
        });
      }
    } catch (err) {
      console.error('[Share] Could not create signed upload URL; discarding share:', err.message);
      await discardShare(shareId);
      const failure = new Error('Could not prepare the upload. Please try again.');
      failure.statusCode = 502;
      throw failure;
    }

    const shareUrl = `${config.appUrl}/s/${shareToken}`;
    const qrCode = await qrService.generateDataUrl(shareUrl);

    return {
      shareToken,
      otp,
      qrCode,
      shareUrl,
      shareType: 'files',
      expiresAt,
      uploads
    };
  },

  /**
   * Verify 6-digit OTP
   */
  async verifyOtp(otp, ip, ua) {
    if (!validator.isValidOtp(otp)) {
      throw new Error('Invalid OTP format. Must be 6 digits.');
    }

    const otpHash = cryptoUtils.hashOtp(otp);
    const result = await db.query(`
      SELECT id, share_token, pin_hash, share_type, expires_at, 
             max_accesses, access_count, failed_attempts, status
      FROM shares
      WHERE otp_hash = $1
    `, [otpHash]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('The code you entered is incorrect or does not exist.');
    }

    const share = result.rows[0];

    // Check expiration
    if (new Date() > new Date(share.expires_at) || share.status === 'expired') {
      await db.query(`UPDATE shares SET status = 'expired' WHERE id = $1`, [share.id]);
      throw new Error('Share expired. This temporary share is no longer available.');
    }

    if (share.status === 'burned') {
      throw new Error('This share has burned and is no longer accessible.');
    }

    if (share.status !== 'active') {
      throw new Error('This share is no longer available.');
    }

    assertNoLegacyPin(share);

    // Check failed attempts lockout
    if (share.failed_attempts >= config.otpMaxAttempts) {
      throw new Error('Too many failed attempts on this share. It has been temporarily locked.');
    }

    // Check max accesses limit
    if (share.max_accesses > 0 && share.access_count >= share.max_accesses) {
      await db.query(`UPDATE shares SET status = 'expired' WHERE id = $1`, [share.id]);
      throw new Error('This share has reached its maximum access limit.');
    }

    // Log successful OTP verification
    const ipHash = cryptoUtils.hashIp(ip);
    const uaHash = cryptoUtils.hashUserAgent(ua);
    await db.query(`
      INSERT INTO access_logs (share_id, success, action, user_agent_hash, ip_hash)
      VALUES ($1, $2, 'otp_verify', $3, $4);
    `, [share.id, db.isPostgres ? true : 1, uaHash, ipHash]);

    return {
      shareToken: share.share_token,
      shareType: share.share_type,
      expiresAt: share.expires_at
    };
  },

  /**
   * Get share details and content by token
   */
  async getShareByToken(token, ip = '', ua = '') {
    const result = await db.query(`
      SELECT id, share_token, pin_hash, share_type, text_content, expires_at, 
             burn_after_read, max_accesses, access_count, failed_attempts, status, created_at
      FROM shares
      WHERE share_token = $1
    `, [token]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Share not found or has expired.');
    }

    const share = result.rows[0];

    // Check expiration
    if (new Date() > new Date(share.expires_at) || share.status === 'expired') {
      await db.query(`UPDATE shares SET status = 'expired' WHERE id = $1`, [share.id]);
      throw new Error('Share expired. This temporary share is no longer available.');
    }

    if (share.status === 'burned') {
      throw new Error('This share was burned after its previous access and is no longer available.');
    }

    if (share.status !== 'active') {
      throw new Error('This share is no longer active.');
    }

    assertNoLegacyPin(share);

    // Check access limits
    if (share.max_accesses > 0 && share.access_count >= share.max_accesses) {
      await db.query(`UPDATE shares SET status = 'expired' WHERE id = $1`, [share.id]);
      throw new Error('This share has reached its maximum access limit.');
    }

    // Increment access count atomically
    const newAccessCount = (share.access_count || 0) + 1;
    let newStatus = 'active';

    if (share.burn_after_read || (share.max_accesses > 0 && newAccessCount >= share.max_accesses)) {
      newStatus = share.burn_after_read ? 'burned' : 'expired';
    }

    await db.query(`
      UPDATE shares 
      SET access_count = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
    `, [newAccessCount, newStatus, share.id]);

    // Log access
    const ipHash = cryptoUtils.hashIp(ip);
    const uaHash = cryptoUtils.hashUserAgent(ua);
    await db.query(`
      INSERT INTO access_logs (share_id, success, action, user_agent_hash, ip_hash)
      VALUES ($1, $2, 'view', $3, $4);
    `, [share.id, db.isPostgres ? true : 1, uaHash, ipHash]);

    // If text share, return text content
    if (share.share_type === 'text') {
      return {
        shareToken: share.share_token,
        shareType: 'text',
        textContent: share.text_content,
        expiresAt: share.expires_at,
        isBurnedNow: newStatus === 'burned',
        createdAt: share.created_at
      };
    }

    // If files share, fetch files list
    const filesRes = await db.query(`
      SELECT id, original_filename, storage_key, mime_type, file_size, relative_path, created_at
      FROM shared_files
      WHERE share_id = $1
    `, [share.id]);

    const totalSize = filesRes.rows.reduce((sum, f) => sum + parseInt(f.file_size || 0, 10), 0);

    return {
      shareToken: share.share_token,
      shareType: 'files',
      files: filesRes.rows.map((f) => ({
        id: f.id,
        original_filename: f.original_filename,
        mime_type: f.mime_type,
        file_size: f.file_size,
        relative_path: f.relative_path,
        created_at: f.created_at
      })),
      fileCount: filesRes.rows.length,
      totalSize,
      expiresAt: share.expires_at,
      isBurnedNow: newStatus === 'burned',
      createdAt: share.created_at
    };
  },

  /**
   * Get single file stream or presigned download URL
   */
  async getFileForDownload(token, fileId) {
    const result = await db.query(`
      SELECT id, pin_hash, expires_at, status 
      FROM shares 
      WHERE share_token = $1
    `, [token]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Share not found.');
    }

    const share = result.rows[0];

    if (new Date() > new Date(share.expires_at) || share.status === 'expired') {
      throw new Error('Share expired.');
    }

    assertNoLegacyPin(share);

    const fileRes = await db.query(`
      SELECT id, original_filename, storage_key, mime_type, file_size, relative_path
      FROM shared_files
      WHERE share_id = $1 AND id = $2
    `, [share.id, fileId]);

    if (!fileRes.rows || fileRes.rows.length === 0) {
      throw new Error('File not found in this share.');
    }

    const file = fileRes.rows[0];
    
    // Check if presigned R2 download URL is available
    const presignedUrl = await storageService.getPresignedDownloadUrl(file.storage_key, file.original_filename, 900);
    if (presignedUrl) {
      return {
        presignedUrl,
        filename: file.original_filename,
        mimeType: file.mime_type,
        fileSize: file.file_size
      };
    }

    const stream = await storageService.getFileStream(file.storage_key);

    return {
      stream,
      filename: file.original_filename,
      mimeType: file.mime_type,
      fileSize: file.file_size
    };
  },

  /**
   * Get all files as a ZIP stream
   */
  async getAllFilesForDownload(token) {
    const result = await db.query(`
      SELECT id, pin_hash, expires_at, status 
      FROM shares 
      WHERE share_token = $1
    `, [token]);

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Share not found.');
    }

    const share = result.rows[0];

    if (new Date() > new Date(share.expires_at) || share.status === 'expired') {
      throw new Error('Share expired.');
    }

    assertNoLegacyPin(share);

    const filesRes = await db.query(`
      SELECT original_filename, storage_key, relative_path
      FROM shared_files
      WHERE share_id = $1
    `, [share.id]);

    if (!filesRes.rows || filesRes.rows.length === 0) {
      throw new Error('No files found in this share.');
    }

    const archive = storageService.createZipStream(filesRes.rows);
    return {
      archive,
      filename: `tempshare_${token.substring(0, 8)}.zip`
    };
  },

  /**
   * Manually delete / revoke a share immediately
   */
  async deleteShare(token) {
    const result = await db.query(`
      SELECT id, share_type 
      FROM shares 
      WHERE share_token = $1
    `, [token]);

    if (!result.rows || result.rows.length === 0) {
      return false;
    }

    const share = result.rows[0];

    if (share.share_type === 'files') {
      const filesRes = await db.query(`
        SELECT storage_key FROM shared_files WHERE share_id = $1
      `, [share.id]);
      if (filesRes.rows && filesRes.rows.length > 0) {
        await storageService.deleteFiles(filesRes.rows.map((f) => f.storage_key));
      }
    }

    await db.query(`DELETE FROM shares WHERE id = $1`, [share.id]);
    return true;
  }
};
