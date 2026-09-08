import { describe, it, expect } from 'vitest';
import { stripSuffix } from '@/app/utils/string.utils';

describe('string.utils', () => {
  describe('stripSuffix', () => {
    it('removes default hash suffix', () => {
      expect(stripSuffix('Parcours 50km #1')).toBe('Parcours 50km ');
      expect(stripSuffix('Ride #v2')).toBe('Ride ');
    });

    it('removes custom separator suffix', () => {
      expect(stripSuffix('Tour du Brabant - Variant B', ' - ')).toBe('Tour du Brabant');
      expect(stripSuffix('File.backup.txt', '.backup')).toBe('File');
    });

    it('returns the same string if separator is not found', () => {
      expect(stripSuffix('Parcours sans suffixe')).toBe('Parcours sans suffixe');
    });

    it('handles null, undefined, or empty string gracefully', () => {
      expect(stripSuffix(null)).toBe('');
      expect(stripSuffix(undefined)).toBe('');
      expect(stripSuffix('')).toBe('');
    });
  });
});
