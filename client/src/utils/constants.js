// Shared UI limits. Keep in sync with the backend:
//  - MAX_FILE_SIZE_MB      -> server MAX_FILE_SIZE_MB (Supabase Free plan: 50 MB per file)
//  - EXPIRY_OPTIONS        -> server config.shareExpiryOptionsMinutes
//  - DEFAULT_EXPIRY_MINUTES-> server config.shareExpiryDefaultMinutes
export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 50;
export const EXPIRY_OPTIONS = [5, 10];
export const DEFAULT_EXPIRY_MINUTES = 10;
export const MAX_TEXT_CHARS = 100000;
