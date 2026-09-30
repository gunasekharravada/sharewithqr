import QRCode from 'qrcode';

export const qrService = {
  /**
   * Generates a base64 Data URL for a given URL or share string
   */
  async generateDataUrl(text) {
    try {
      return await QRCode.toDataURL(text, {
        // High error correction (~30% of the code can be damaged/obscured
        // and still scan) and a full 4-module quiet zone, per the QR
        // standard's recommended minimum - both improve reliability across
        // real-world scanners (Google Lens, iOS/Android camera apps, etc.).
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 320,
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
        errorCorrectionLevel: 'H',
        margin: 4,
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
