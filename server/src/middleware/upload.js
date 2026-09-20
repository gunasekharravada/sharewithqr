import multer from 'multer';
import { config } from '../config/env.js';

// Memory storage allows direct streaming to Cloudflare R2 without depending on persistent disk in serverless/Vercel
const storage = multer.memoryStorage();
const maxBytes = config.maxFileSizeMb * 1024 * 1024;

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: maxBytes,
    files: 100 // up to 100 files / folder items
  }
});
