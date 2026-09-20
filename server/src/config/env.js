import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),

  nodeEnv: process.env.NODE_ENV || 'development',

  clientUrl:
    process.env.CLIENT_URL || 'http://localhost:5173',

  databaseUrl:
    process.env.DATABASE_URL || '',

  // Storage driver
  storageDriver:
    process.env.STORAGE_DRIVER ||
    (process.env.R2_BUCKET_NAME ? 'r2' : 'local'),

  uploadDir:
    process.env.UPLOAD_DIR ||
    path.resolve(__dirname, '../../uploads'),

  // Cloudflare R2
  r2: {
    accountId:
      process.env.R2_ACCOUNT_ID || '',

    accessKeyId:
      process.env.R2_ACCESS_KEY_ID || '',

    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY || '',

    bucketName:
      process.env.R2_BUCKET_NAME || '',

    endpoint:
      process.env.R2_ENDPOINT ||
      (
        process.env.R2_ACCOUNT_ID
          ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
          : ''
      ),

    publicUrl:
      process.env.R2_PUBLIC_URL || ''
  },

  // Supabase Storage
  supabase: {
    url:
      process.env.SUPABASE_URL || '',

    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    bucketName:
      process.env.SUPABASE_BUCKET_NAME ||
      'tempshare-storage'
  },

  // Security & Limits
  maxFileSizeMb:
    parseInt(
      process.env.MAX_FILE_SIZE_MB || '50',
      10
    ),

  // Storage safe-limit protection (Supabase Free plan is ~1 GB).
  // New uploads are rejected once current usage + upload size would
  // exceed the safe limit.
  storageLimitMb:
    parseInt(
      process.env.STORAGE_LIMIT_MB || '1024',
      10
    ),

  storageSafeLimitMb:
    parseInt(
      process.env.STORAGE_SAFE_LIMIT_MB || '900',
      10
    ),

  // Share lifetime is fixed at 10 minutes and enforced by the backend.
  // Intentionally NOT configurable via environment variables or client input.
  shareExpiryMinutes: 10,

  otpMaxAttempts:
    parseInt(
      process.env.OTP_MAX_ATTEMPTS || '5',
      10
    ),

  cronSecret:
    process.env.CRON_SECRET ||
    'tempshare_default_cron_secret',

  // Cleanup scheduler
  cleanupCronSchedule:
    process.env.CLEANUP_CRON ||
    '*/1 * * * *',

  // Rate limiting
  rateLimitWindowMs:
    parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '900000',
      10
    ),

  rateLimitMax:
    parseInt(
      process.env.RATE_LIMIT_MAX || '100',
      10
    ),

  appUrl:
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    'http://localhost:5173'
};
