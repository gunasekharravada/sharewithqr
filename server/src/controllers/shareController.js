import { shareService } from '../services/shareService.js';
import { cleanupService } from '../services/cleanupService.js';
import { db } from '../db/database.js';
import { config } from '../config/env.js';

export const shareController = {
  /**
   * POST /api/shares/text
   */
  async createTextShare(req, res, next) {
    try {
      const { text, maxAccesses, expiryMinutes } = req.body;
      const result = await shareService.createTextShare({
        text,
        maxAccesses,
        expiryMinutes
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/shares/files
   */
  async createFilesShare(req, res, next) {
    try {
      const files = req.files;
      const { paths, maxAccesses, expiryMinutes } = req.body;

      let parsedPaths = [];
      if (typeof paths === 'string') {
        try {
          parsedPaths = JSON.parse(paths);
        } catch {
          parsedPaths = [paths];
        }
      } else if (Array.isArray(paths)) {
        parsedPaths = paths;
      }

      const result = await shareService.createFilesShare({
        files,
        paths: parsedPaths,
        maxAccesses,
        expiryMinutes
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/shares/presign-upload (For Direct Browser-to-R2 uploads)
   */
  async requestDirectUploadUrls(req, res, next) {
    try {
      const { fileMetadata, maxAccesses, expiryMinutes } = req.body;
      const result = await shareService.requestDirectUploadUrls({
        fileMetadata,
        maxAccesses,
        expiryMinutes
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/shares/verify-otp
   */
  async verifyOtp(req, res, next) {
    try {
      const { otp } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      const ua = req.headers['user-agent'] || '';

      const result = await shareService.verifyOtp(otp, ip, ua);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Verification failed'
      });
    }
  },

  /**
   * GET /api/shares/:token
   */
  async getShare(req, res, next) {
    try {
      const { token } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      const ua = req.headers['user-agent'] || '';

      const result = await shareService.getShareByToken(token, ip, ua);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      const status = err.message.includes('expired') || err.message.includes('burned') ? 410 : 400;
      return res.status(status).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * GET /api/shares/:token/files/:fileId/download
   */
  async downloadFile(req, res, next) {
    try {
      const { token, fileId } = req.params;

      const fileData = await shareService.getFileForDownload(token, fileId);

      if (fileData.presignedUrl) {
        // Direct signed R2 download redirect
        return res.redirect(302, fileData.presignedUrl);
      }

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.filename)}"`);
      res.setHeader('Content-Type', fileData.mimeType || 'application/octet-stream');
      if (fileData.fileSize) {
        res.setHeader('Content-Length', fileData.fileSize);
      }

      fileData.stream.pipe(res);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * GET /api/shares/:token/download-all
   */
  async downloadAllFiles(req, res, next) {
    try {
      const { token } = req.params;

      const zipData = await shareService.getAllFilesForDownload(token);

      res.setHeader('Content-Disposition', `attachment; filename="${zipData.filename}"`);
      res.setHeader('Content-Type', 'application/zip');

      zipData.archive.pipe(res);
      // archiver will be finalized by service or pipe
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * DELETE /api/shares/:token
   */
  async deleteShare(req, res, next) {
    try {
      const { token } = req.params;
      const deleted = await shareService.deleteShare(token);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Share not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Share deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/stats (Privacy-conscious anonymous counts)
   */
  async getStats(req, res, next) {
    try {
      const sharesRes = await db.query(`SELECT COUNT(*) as count FROM shares WHERE status = 'active'`);
      const filesRes = await db.query(`SELECT COUNT(*) as count FROM shared_files`);

      return res.status(200).json({
        success: true,
        stats: {
          activeShares: parseInt(sharesRes.rows[0]?.count || 0, 10),
          totalFilesShared: parseInt(filesRes.rows[0]?.count || 0, 10)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/cleanup & POST /api/cleanup (Vercel Cron & manual scheduler)
   */
  async handleCronCleanup(req, res) {
    const authHeader = req.headers['authorization'] || '';
    const querySecret = req.query.secret || req.query.key || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    const providedSecret = bearerToken || querySecret;

    // In production, require CRON_SECRET authorization
    if (config.nodeEnv === 'production' && config.cronSecret) {
      if (providedSecret !== config.cronSecret) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Invalid or missing cron secret.'
        });
      }
    }

    const result = await cleanupService.runCleanup();
    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  }
};
