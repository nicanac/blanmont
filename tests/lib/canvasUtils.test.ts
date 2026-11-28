/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import getCroppedImg, {
  getRadianAngle,
  rotateSize,
  createImage,
  getOutputSize,
  getCroppedImgWithin,
  isLowResolutionCrop,
  MEMBER_PHOTO_STEPS,
  MIN_SHARP_PHOTO_PX,
  SERVER_ACTION_PHOTO_BYTES,
} from '@/app/lib/canvasUtils';

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

  describe('getOutputSize', () => {
    it('keeps the crop size without maxSize', () => {
      expect(getOutputSize(3024, 3024)).toEqual({ width: 3024, height: 3024 });
    });

    it('scales a phone-sized crop down to maxSize on its longest side', () => {
      expect(getOutputSize(3024, 3024, 512)).toEqual({ width: 512, height: 512 });
      expect(getOutputSize(2400, 3000, 1600)).toEqual({ width: 1280, height: 1600 });
    });

    it('never upscales a crop smaller than maxSize', () => {
      expect(getOutputSize(300, 200, 512)).toEqual({ width: 300, height: 200 });
    });
  });

  describe('isLowResolutionCrop (#260)', () => {
    it('flags a crop whose shortest side is under the sharp-portrait minimum', () => {
      expect(isLowResolutionCrop({ width: 103, height: 137 })).toBe(true);
      expect(isLowResolutionCrop({ width: MIN_SHARP_PHOTO_PX - 1, height: 2000 })).toBe(true);
      expect(isLowResolutionCrop({ width: MIN_SHARP_PHOTO_PX, height: 1000 })).toBe(false);
      expect(isLowResolutionCrop({ width: 3000, height: 3000 })).toBe(false);
    });

    it('takes another minimum', () => {
      expect(isLowResolutionCrop({ width: 300, height: 300 }, 256)).toBe(false);
    });
  });

  describe('getCroppedImg', () => {
    let mockContext: Record<string, ReturnType<typeof vi.fn>>;
    let canvases: HTMLCanvasElement[];

    beforeEach(() => {
      canvases = [];
      // Always the unpatched DOM method, so spies from earlier tests never stack.
      const realCreate = Document.prototype.createElement;
      vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
        const el = realCreate.call(document, tag);
        if (tag === 'canvas') canvases.push(el as HTMLCanvasElement);
        return el;
      }) as typeof document.createElement);

      // Mock Canvas 2D context
      mockContext = {
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

    it('downscales an unrotated crop in one draw, without a full-size canvas', async () => {
      const cropPromise = getCroppedImg(
        'data:image/jpeg;base64,xx',
        { x: 500, y: 800, width: 3024, height: 3024 },
        0,
        undefined,
        { maxSize: 512, quality: 0.88 }
      );

      const imgInstance = (global as any).__lastCreatedImage;
      imgInstance.width = 3024;
      imgInstance.height = 4032;
      imgInstance.dispatchEvent(new Event('load'));

      const blob = await cropPromise;
      expect(blob).toBeInstanceOf(Blob);
      expect(canvases).toHaveLength(1);
      expect(canvases[0].width).toBe(512);
      expect(canvases[0].height).toBe(512);
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        imgInstance, 500, 800, 3024, 3024, 0, 0, 512, 512
      );
      expect(mockContext.getImageData).not.toHaveBeenCalled();
      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function), 'image/jpeg', 0.88
      );
    });

    it('downscales a rotated crop through an output-sized canvas', async () => {
      const cropPromise = getCroppedImg(
        'https://example.com/photo.jpg',
        { x: 0, y: 0, width: 2000, height: 2000 },
        90,
        { horizontal: false, vertical: false },
        { maxSize: 500 }
      );

      const imgInstance = (global as any).__lastCreatedImage;
      imgInstance.width = 2000;
      imgInstance.height = 3000;
      imgInstance.dispatchEvent(new Event('load'));

      await cropPromise;
      expect(canvases).toHaveLength(2);
      expect(canvases[1].width).toBe(500);
      expect(canvases[1].height).toBe(500);
      expect(mockContext.getImageData).not.toHaveBeenCalled();
    });

    describe('getCroppedImgWithin (#260)', () => {
      const crop = { x: 0, y: 500, width: 3000, height: 3000 };
      /** Blob sizes returned by successive toBlob calls. */
      const blobSizes = (...sizes: number[]): void => {
        let call = 0;
        HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback) => {
          callback(new Blob([new Uint8Array(sizes[Math.min(call++, sizes.length - 1)])]));
        });
      };

      beforeEach(() => {
        // Each encoding attempt loads the source again: fire `load` as soon as src is set.
        (global as any).Image = class extends EventTarget {
          width = 3000;
          height = 4000;
          private url = '';
          setAttribute(): void {}
          get src(): string {
            return this.url;
          }
          set src(value: string) {
            this.url = value;
            queueMicrotask(() => this.dispatchEvent(new Event('load')));
          }
        };
      });

      it('keeps the sharpest encoding when it fits the Server Action budget', async () => {
        blobSizes(400 * 1024);
        const blob = await getCroppedImgWithin('data:image/jpeg;base64,xx', crop, SERVER_ACTION_PHOTO_BYTES);

        expect(blob?.size).toBe(400 * 1024);
        expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledTimes(1);
        expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.9);
        expect(canvases[0].width).toBe(1600);
        expect(canvases[0].height).toBe(1600);
      });

      it('steps down quality, then size, until the JPEG fits', async () => {
        blobSizes(1500 * 1024, 1000 * 1024, 700 * 1024);
        const blob = await getCroppedImgWithin('data:image/jpeg;base64,xx', crop, SERVER_ACTION_PHOTO_BYTES);

        expect(blob?.size).toBe(700 * 1024);
        const qualities = vi.mocked(HTMLCanvasElement.prototype.toBlob).mock.calls.map((c) => c[2]);
        expect(qualities).toEqual([0.9, 0.82, 0.82]);
        expect(canvases.map((c) => c.width)).toEqual([1600, 1600, 1280]);
      });

      it('returns the smallest encoding when none fits, so the upload fails loudly', async () => {
        blobSizes(5000 * 1024);
        const blob = await getCroppedImgWithin('data:image/jpeg;base64,xx', crop, SERVER_ACTION_PHOTO_BYTES);

        expect(blob?.size).toBe(5000 * 1024);
        expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledTimes(MEMBER_PHOTO_STEPS.length);
        expect(canvases.at(-1)?.width).toBe(1024);
      });

      it('stops at once when the canvas cannot encode', async () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        expect(await getCroppedImgWithin('data:image/jpeg;base64,xx', crop, 1)).toBeNull();
      });
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
