import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateQRCode = async (
  modelId: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  const baseUrl = window.location.origin;
  const arUrl = `${baseUrl}/ar/model/${modelId}`;
  
  const defaultOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(arUrl, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const downloadQRCode = (dataURL: string, filename: string = 'qr-code.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  link.click();
};

export const getARUrl = (modelId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/ar/model/${modelId}`;
};