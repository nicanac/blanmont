import { describe, it, expect } from 'vitest';
import { getRadianAngle, rotateSize } from '@/app/lib/canvasUtils';

describe('canvasUtils', () => {
  describe('getRadianAngle', () => {
    it('should correctly convert degrees to radians', () => {
      expect(getRadianAngle(0)).toBe(0);
      expect(getRadianAngle(90)).toBe(Math.PI / 2);
      expect(getRadianAngle(180)).toBe(Math.PI);
      expect(getRadianAngle(270)).toBe(1.5 * Math.PI);
      expect(getRadianAngle(360)).toBe(2 * Math.PI);
    });

    it('should handle negative degrees correctly', () => {
      expect(getRadianAngle(-90)).toBe(-Math.PI / 2);
      expect(getRadianAngle(-180)).toBe(-Math.PI);
    });
  });

  describe('rotateSize', () => {
    it('should correctly calculate the bounding box for 0 degree rotation', () => {
      const result = rotateSize(100, 50, 0);
      expect(result.width).toBe(100);
      expect(result.height).toBe(50);
    });

    it('should correctly calculate the bounding box for 90 degree rotation', () => {
      const result = rotateSize(100, 50, 90);
      expect(result.width).toBeCloseTo(50);
      expect(result.height).toBeCloseTo(100);
    });

    it('should correctly calculate the bounding box for 180 degree rotation', () => {
      const result = rotateSize(100, 50, 180);
      expect(result.width).toBeCloseTo(100);
      expect(result.height).toBeCloseTo(50);
    });

    it('should correctly calculate the bounding box for 270 degree rotation', () => {
      const result = rotateSize(100, 50, 270);
      expect(result.width).toBeCloseTo(50);
      expect(result.height).toBeCloseTo(100);
    });

    it('should correctly calculate the bounding box for 45 degree rotation', () => {
      const result = rotateSize(100, 50, 45);
      expect(result.width).toBeCloseTo(150 * Math.SQRT1_2);
      expect(result.height).toBeCloseTo(150 * Math.SQRT1_2);
    });

    it('should correctly calculate the bounding box for -90 degree rotation', () => {
      const result = rotateSize(100, 50, -90);
      expect(result.width).toBeCloseTo(50);
      expect(result.height).toBeCloseTo(100);
    });
  });
});
