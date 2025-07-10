import QRCode from 'qrcode';

export class QRCodeUtils {
  /**
   * Generate QR code for a model content ID
   */
  static async generateQRCode(contentId: string): Promise<string> {
    try {
      const arUrl = `${window.location.origin}/ar/model/${contentId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(arUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Extract model ID from URL parameters
   */
  static extractModelIdFromUrl(pathname: string): string | null {
    const match = pathname.match(/\/ar\/model\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Generate shareable AR URL for a model
   */
  static generateShareableUrl(contentId: string): string {
    return `${window.location.origin}/ar/model/${contentId}`;
  }

  /**
   * Validate if string is a valid UUID (for model IDs)
   */
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}