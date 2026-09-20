export const validator = {
  isValidOtp(otp) {
    return typeof otp === 'string' && /^\d{6}$/.test(otp.trim());
  },

  isValidText(text) {
    if (!text || typeof text !== 'string') return false;
    const len = text.length;
    return len > 0 && len <= 100000;
  },

  isValidMaxAccesses(maxAccesses) {
    const val = parseInt(maxAccesses, 10);
    return !isNaN(val) && val >= 0 && val <= 1000;
  }
};
