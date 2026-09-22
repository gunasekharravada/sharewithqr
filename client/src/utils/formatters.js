/**
 * Format bytes to human readable string (KB, MB, GB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format remaining time from an ISO date string to human readable string
 */
export function formatTimeRemaining(expiresAt) {
  if (!expiresAt) return '';
  const total = Date.parse(expiresAt) - Date.now();
  if (total <= 0) return 'Expired';

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s left`;
  }
  return `${minutes}m ${seconds}s left`;
}

/**
 * Countdown as m:ss (or h:mm:ss); "Expired" once the time is up.
 * Used by the Share Ready screen's compact timer badge.
 */
export function formatCountdown(expiresAt) {
  if (!expiresAt) return '';
  const total = Date.parse(expiresAt) - Date.now();
  if (total <= 0) return 'Expired';

  const totalSeconds = Math.floor(total / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/**
 * Format text stats (characters, words, lines)
 */
export function getTextStats(text = '') {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  return { chars, words, lines, remaining: Math.max(0, 100000 - chars) };
}
