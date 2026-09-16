import { describe, it, expect } from 'vitest';
import {
  parseVerticalPosition,
  formatVerticalPosition,
  VERTICAL_PRESETS,
} from '@/app/lib/imagePosition';

describe('imagePosition utilities', () => {
  describe('VERTICAL_PRESETS', () => {
    it('defines standard presets for top, center, and bottom', () => {
      expect(VERTICAL_PRESETS.length).toBe(3);
      const ids = VERTICAL_PRESETS.map((p) => p.id);
      expect(ids).toEqual(['top', 'center', 'bottom']);

      const topPreset = VERTICAL_PRESETS.find((p) => p.id === 'top');
      expect(topPreset?.percent).toBe(15);

      const centerPreset = VERTICAL_PRESETS.find((p) => p.id === 'center');
      expect(centerPreset?.percent).toBe(50);

      const bottomPreset = VERTICAL_PRESETS.find((p) => p.id === 'bottom');
      expect(bottomPreset?.percent).toBe(85);
    });
  });

  describe('parseVerticalPosition', () => {
    it('parses preset keywords correctly', () => {
      expect(parseVerticalPosition('top')).toBe(15);
      expect(parseVerticalPosition('center top')).toBe(15);
      expect(parseVerticalPosition('bottom')).toBe(85);
      expect(parseVerticalPosition('center bottom')).toBe(85);
      expect(parseVerticalPosition('center')).toBe(50);
      expect(parseVerticalPosition('center center')).toBe(50);
    });

    it('extracts custom percentage values from string', () => {
      expect(parseVerticalPosition('center 25%')).toBe(25);
      expect(parseVerticalPosition('center 72%')).toBe(72);
      expect(parseVerticalPosition('100%')).toBe(100);
      expect(parseVerticalPosition('0%')).toBe(0);
    });

    it('falls back to 50% for missing or unrecognized values', () => {
      expect(parseVerticalPosition(undefined)).toBe(50);
      expect(parseVerticalPosition('')).toBe(50);
      expect(parseVerticalPosition('unknown-alignment')).toBe(50);
    });
  });

  describe('formatVerticalPosition', () => {
    it('formats percentage into standard CSS object-position string', () => {
      expect(formatVerticalPosition(15)).toBe('center 15%');
      expect(formatVerticalPosition(50)).toBe('center 50%');
      expect(formatVerticalPosition(85)).toBe('center 85%');
    });

    it('clamps negative values to 0%', () => {
      expect(formatVerticalPosition(-20)).toBe('center 0%');
    });

    it('clamps values above 100 to 100%', () => {
      expect(formatVerticalPosition(150)).toBe('center 100%');
    });

    it('rounds floating point percentage values', () => {
      expect(formatVerticalPosition(33.7)).toBe('center 34%');
      expect(formatVerticalPosition(66.2)).toBe('center 66%');
    });
  });
});
