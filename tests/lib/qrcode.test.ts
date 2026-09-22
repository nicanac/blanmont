import { describe, it, expect } from 'vitest';
import { generateQrCodeSvg, generateQrCodeDataUrl } from '@/app/lib/qrcode';

describe('QR Code Generation Library (app/lib/qrcode.ts)', () => {
  it('generates a valid SVG string with default options', async () => {
    const text = 'https://blanmont.be/admin/pointage-express?memberId=123';
    const svg = await generateQrCodeSvg(text);

    expect(svg).toBeDefined();
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox');
  });

  it('generates a data URL for downloading QR codes', async () => {
    const text = 'tel:+32470123456';
    const dataUrl = await generateQrCodeDataUrl(text);

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('honors custom colors and error correction level', async () => {
    const text = 'CC Saint-Martin Blanmont';
    const svg = await generateQrCodeSvg(text, {
      margin: 2,
      width: 300,
      color: {
        dark: '#e03e3e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    expect(svg).toBeDefined();
    expect(svg).toContain('#e03e3e');
  });
});
