/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getCroppedImg, { getRadianAngle, rotateSize, createImage } from '@/app/lib/canvasUtils';

describe('canvasUtils', () => {
  describe('getRadianAngle', () => {
    it('converts degrees to radians accurately', () => {
      expect(getRadianAngle(0)).toBe(0);
      expect(getRadianAngle(90)).toBeCloseTo(Math.PI / 2);
      expect(getRadianAngle(180)).toBeCloseTo(Math.PI);
      expect(getRadianAngle(270)).toBeCloseTo((3 * Math.PI) / 2);
      expect(getRadianAngle(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('rotateSize', () => {
    it('preserves dimensions at 0 degrees rotation', () => {
      const { width, height } = rotateSize(200, 100, 0);
      expect(width).toBeCloseTo(200);
      expect(height).toBeCloseTo(100);
    });

    it('swaps width and height at 90 degrees rotation', () => {
      const { width, height } = rotateSize(200, 100, 90);
      expect(width).toBeCloseTo(100);
      expect(height).toBeCloseTo(200);
    });

    it('preserves dimensions at 180 degrees rotation', () => {
      const { width, height } = rotateSize(200, 100, 180);
      expect(width).toBeCloseTo(200);
      expect(height).toBeCloseTo(100);
    });

    it('calculates bounding box expansion at 45 degrees rotation', () => {
      // For square 100x100 at 45 deg, bounding box is diagonal = 100 * sqrt(2) ≈ 141.42
      const { width, height } = rotateSize(100, 100, 45);
      expect(width).toBeCloseTo(100 * Math.SQRT2);
      expect(height).toBeCloseTo(100 * Math.SQRT2);
    });
  });

  describe('createImage', () => {
    it('resolves image when load event fires', async () => {
      const imgPromise = createImage('https://example.com/test.jpg');
      
      // Simulate Image load
      const imgInstance = (global as any).__lastCreatedImage;
      expect(imgInstance).toBeDefined();
      expect(imgInstance.src).toBe('https://example.com/test.jpg');
      expect(imgInstance.getAttribute('crossOrigin')).toBe('anonymous');

      imgInstance.dispatchEvent(new Event('load'));
      const result = await imgPromise;
      expect(result).toBe(imgInstance);
    });

    it('rejects when error event fires', async () => {
      const imgPromise = createImage('https://example.com/fail.jpg');
      const imgInstance = (global as any).__lastCreatedImage;
      
      imgInstance.dispatchEvent(new Event('error'));
      await expect(imgPromise).rejects.toBeDefined();
    });
  });

  describe('getCroppedImg', () => {
    beforeEach(() => {
      // Mock Canvas 2D context
      const mockContext = {
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
        putImageData: vi.fn(),
      };

      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((contextId: string) => {
        if (contextId === '2d') return mockContext as any;
        return null;
      });

      HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
        const mockBlob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
        callback(mockBlob);
      });
    });

    it('returns cropped Blob successfully with rotation and flipping', async () => {
      // Start crop process
      const cropPromise = getCroppedImg(
        'https://example.com/photo.jpg',
        { x: 10, y: 10, width: 100, height: 100 },
        90,
        { horizontal: true, vertical: false }
      );

      // Trigger image load
      const imgInstance = (global as any).__lastCreatedImage;
      imgInstance.width = 400;
      imgInstance.height = 300;
      imgInstance.dispatchEvent(new Event('load'));

      const blob = await cropPromise;
      expect(blob).toBeInstanceOf(Blob);
    });

    it('returns null if 2d context is unavailable', async () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

      const cropPromise = getCroppedImg(
        'https://example.com/photo.jpg',
        { x: 0, y: 0, width: 50, height: 50 }
      );

      const imgInstance = (global as any).__lastCreatedImage;
      imgInstance.dispatchEvent(new Event('load'));

      const result = await cropPromise;
      expect(result).toBeNull();
    });
  });
});

// Setup image mock hook
beforeEach(() => {
  class MockImage extends EventTarget {
    src = '';
    width = 100;
    height = 100;
    private attrs: Record<string, string> = {};
    setAttribute(name: string, val: string) {
      this.attrs[name] = val;
    }
    getAttribute(name: string) {
      return this.attrs[name];
    }
  }

  (global as any).Image = class extends MockImage {
    constructor() {
      super();
      (global as any).__lastCreatedImage = this;
    }
  };
});
