import QRCode from 'qrcode';

export const qrService = {
  /**
   * Generates a base64 Data URL for a given URL or share string
   */
  async generateDataUrl(text) {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('[QR] Error generating QR code:', err);
      return null;
    }
  },

  /**
   * Generates an SVG string for a given URL
   */
  async generateSvg(text) {
    try {
      return await QRCode.toString(text, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('[QR] Error generating QR SVG:', err);
      return null;
    }
  }
};
