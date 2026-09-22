import QRCode from 'qrcode';

export interface GenerateQrOptions {
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates an SVG string representation of a QR code.
 * Optimized for crisp rendering, print, and mobile scanning in daylight.
 */
export async function generateQrCodeSvg(
  text: string,
  options?: GenerateQrOptions
): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: options?.margin ?? 1,
    width: options?.width ?? 240,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    color: {
      dark: options?.color?.dark ?? '#101216',
      light: options?.color?.light ?? '#ffffff',
    },
  });
}

/**
 * Generates a Data URL (image/png) for a QR code.
 * Useful for downloading or saving as an image file.
 */
export async function generateQrCodeDataUrl(
  text: string,
  options?: GenerateQrOptions
): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: options?.margin ?? 2,
    width: options?.width ?? 400,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    color: {
      dark: options?.color?.dark ?? '#101216',
      light: options?.color?.light ?? '#ffffff',
    },
  });
}
