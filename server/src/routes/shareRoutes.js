import express from 'express';
import { shareController } from '../controllers/shareController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { uploadLimiter, verificationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Create shares
router.post('/text', uploadLimiter, shareController.createTextShare);
router.post('/files', uploadLimiter, uploadMiddleware.array('files', 100), shareController.createFilesShare);
router.post('/presign-upload', uploadLimiter, shareController.requestDirectUploadUrls);

// Verify OTP
router.post('/verify-otp', verificationLimiter, shareController.verifyOtp);

// Get Share details
router.get('/:token', shareController.getShare);

// Download files
router.get('/:token/files/:fileId/download', shareController.downloadFile);
router.get('/:token/download-all', shareController.downloadAllFiles);

// Revoke / Delete share
router.delete('/:token', shareController.deleteShare);

export default router;
