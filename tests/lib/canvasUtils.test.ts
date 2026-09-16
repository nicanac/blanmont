import { describe, it, expect } from 'vitest';
import { getRadianAngle, rotateSize } from '@/app/lib/canvasUtils';

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
});
