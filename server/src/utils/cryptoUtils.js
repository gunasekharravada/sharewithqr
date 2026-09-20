import crypto from 'crypto';

const PEPPER = process.env.OTP_PEPPER || 'tempshare_secure_pepper_2026';

export const cryptoUtils = {
  /**
   * Generates a cryptographically secure 6-digit numeric OTP (100000 - 999999)
   */
  generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  },

  /**
   * Computes SHA-256 hash of OTP with server pepper
   */
  hashOtp(otp) {
    return crypto.createHash('sha256').update(`${otp}:${PEPPER}`).digest('hex');
  },

  /**
   * Generates a 32-character cryptographically random token for URL & QR
   */
  generateShareToken() {
    return crypto.randomBytes(16).toString('hex');
  },

  /**
   * Generates a privacy-conscious SHA-256 hash of an IP address
   */
  hashIp(ip) {
    if (!ip) return null;
    return crypto.createHash('sha256').update(`${ip}:${PEPPER}`).digest('hex').substring(0, 16);
  },

  /**
   * Generates SHA-256 hash of user agent
   */
  hashUserAgent(ua) {
    if (!ua) return null;
    return crypto.createHash('sha256').update(ua).digest('hex').substring(0, 16);
  }
};
