import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const message = `The selected file is larger than the maximum allowed size of ${config.maxFileSizeMb} MB.`;
      return res.status(413).json({
        success: false,
        code: 'FILE_TOO_LARGE',
        message,
        error: message
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files uploaded in a single share.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }

  const statusCode = err.statusCode || 500;

  // Structured, client-safe errors (STORAGE_LIMIT_REACHED, FILE_TOO_LARGE)
  if (err.publicCode) {
    return res.status(statusCode).json({
      success: false,
      code: err.publicCode,
      message: err.message,
      error: err.message
    });
  }
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}
