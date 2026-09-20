import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import archiver from 'archiver';
import { config } from '../../config/env.js';

class R2Storage {
  constructor() {
    this.bucket = config.r2.bucketName;
    this.s3Client = null;

    if (config.r2.accessKeyId && config.r2.secretAccessKey && config.r2.endpoint) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: config.r2.endpoint,
        credentials: {
          accessKeyId: config.r2.accessKeyId,
          secretAccessKey: config.r2.secretAccessKey
        }
      });
      console.log(`[Storage] Cloudflare R2 Client initialized (Bucket: ${this.bucket})`);
    } else {
      console.warn('[Storage] Cloudflare R2 credentials not fully set. R2 operations will fail unless configured.');
    }
  }

  ensureClient() {
    if (!this.s3Client) {
      throw new Error('Cloudflare R2 storage is not configured properly in environment variables.');
    }
  }

  /**
   * Upload buffer directly to R2
   */
  async uploadBuffer(storageKey, buffer, mimeType = 'application/octet-stream') {
    this.ensureClient();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType
    });
    return await this.s3Client.send(command);
  }

  /**
   * Check if file exists in R2
   */
  async fileExists(storageKey) {
    this.ensureClient();
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: storageKey
      });
      await this.s3Client.send(command);
      return true;
    } catch (err) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Get readable stream for downloading from R2
   */
  async getFileStream(storageKey) {
    this.ensureClient();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey
    });
    const response = await this.s3Client.send(command);
    return response.Body;
  }

  /**
   * Generate short-lived presigned upload URL (for direct browser-to-R2 upload)
   */
  async getPresignedUploadUrl(storageKey, mimeType = 'application/octet-stream', expiresInSeconds = 3600) {
    this.ensureClient();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: mimeType
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Generate short-lived presigned download URL (for direct browser download from R2)
   */
  async getPresignedDownloadUrl(storageKey, originalFilename, expiresInSeconds = 900) {
    this.ensureClient();
    const safeFilename = encodeURIComponent(originalFilename || 'download');
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ResponseContentDisposition: `attachment; filename="${safeFilename}"`
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Delete single file from R2
   */
  async deleteFile(storageKey) {
    if (!this.s3Client) return;
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey
      });
      await this.s3Client.send(command);
    } catch (err) {
      console.error(`[Storage:R2] Failed to delete file ${storageKey}:`, err.message);
    }
  }

  /**
   * Delete multiple files from R2 in batch
   */
  async deleteFiles(storageKeys) {
    if (!this.s3Client || !Array.isArray(storageKeys) || storageKeys.length === 0) return;
    
    // AWS S3 DeleteObjects supports up to 1000 keys per call
    const chunks = [];
    for (let i = 0; i < storageKeys.length; i += 1000) {
      chunks.push(storageKeys.slice(i, i + 1000));
    }

    for (const chunk of chunks) {
      try {
        const command = new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: chunk.map((k) => ({ Key: k })),
            Quiet: true
          }
        });
        await this.s3Client.send(command);
      } catch (err) {
        console.error('[Storage:R2] Batch deletion error:', err.message);
      }
    }
  }

  /**
   * Create streaming ZIP archive from R2 files
   */
  async createZipStream(files) {
    this.ensureClient();
    const archive = archiver('zip', {
      zlib: { level: 6 }
    });

    // Asynchronously append files into the zip stream
    (async () => {
      for (const file of files) {
        try {
          const stream = await this.getFileStream(file.storage_key);
          const entryName = file.relative_path || file.original_filename;
          archive.append(stream, { name: entryName });
        } catch (err) {
          console.warn(`[Storage:R2] Could not append file ${file.storage_key} to zip:`, err.message);
        }
      }
      archive.finalize();
    })().catch((err) => {
      archive.emit('error', err);
    });

    return archive;
  }
}

export const r2Storage = new R2Storage();
