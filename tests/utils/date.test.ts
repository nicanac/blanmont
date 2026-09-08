import { describe, it, expect } from 'vitest';
import {
  parseIsoDate,
  formatFrenchDate,
  formatShortDate,
  getTodayIso,
  isPastDate,
  compareIsoDates,
} from '@/app/utils/date';

describe('date utils', () => {
  describe('parseIsoDate', () => {
    it('correctly parses standard YYYY-MM-DD strings', () => {
      const parsed = parseIsoDate('2026-03-14');
      expect(parsed).not.toBeNull();
      expect(parsed?.year).toBe(2026);
      expect(parsed?.month).toBe(3);
      expect(parsed?.day).toBe(14);
      expect(parsed?.date).toBeInstanceOf(Date);
      expect(parsed?.date.getFullYear()).toBe(2026);
      expect(parsed?.date.getMonth()).toBe(2); // 0-indexed
      expect(parsed?.date.getDate()).toBe(14);
    });

    it('handles ISO timestamps with time component', () => {
      const parsed = parseIsoDate('2026-07-20T14:30:00.000Z');
      expect(parsed).not.toBeNull();
      expect(parsed?.year).toBe(2026);
      expect(parsed?.month).toBe(7);
      expect(parsed?.day).toBe(20);
    });

    it('returns null for empty, null, or malformed date strings', () => {
      expect(parseIsoDate(null)).toBeNull();
      expect(parseIsoDate(undefined)).toBeNull();
      expect(parseIsoDate('')).toBeNull();
      expect(parseIsoDate('invalid-date')).toBeNull();
      expect(parseIsoDate('2026-abc-12')).toBeNull();
    });
  });

  describe('formatFrenchDate', () => {
    it('formats a date into idiomatic capitalized French', () => {
      const formatted = formatFrenchDate('2026-03-14');
      // "Samedi 14 mars 2026"
      expect(formatted).toMatch(/Samedi 14 mars 2026/i);
      expect(formatted.charAt(0)).toBe(formatted.charAt(0).toUpperCase());
    });

    it('returns original string if invalid or empty', () => {
      expect(formatFrenchDate('')).toBe('');
      expect(formatFrenchDate(null)).toBe('');
      expect(formatFrenchDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatShortDate', () => {
    it('formats short date without weekday', () => {
      const formatted = formatShortDate('2026-03-14');
      expect(formatted).toMatch(/14 mars 2026|14\/03\/2026|14 mars/i);
    });
  });

  describe('getTodayIso', () => {
    it('returns date formatted as YYYY-MM-DD', () => {
      const today = getTodayIso();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isPastDate', () => {
    it('identifies past dates correctly', () => {
      expect(isPastDate('2000-01-01')).toBe(true);
      expect(isPastDate('2099-12-31')).toBe(false);
      expect(isPastDate(null)).toBe(false);
    });
  });

  describe('compareIsoDates', () => {
    it('sorts ISO dates chronologically', () => {
      expect(compareIsoDates('2026-01-01', '2026-02-01')).toBeLessThan(0);
      expect(compareIsoDates('2026-05-10', '2026-05-10')).toBe(0);
      expect(compareIsoDates('2026-10-01', '2026-02-01')).toBeGreaterThan(0);
    });

    it('handles empty or null date values', () => {
      expect(compareIsoDates(null, '2026-01-01')).toBeLessThan(0);
      expect(compareIsoDates('2026-01-01', undefined)).toBeGreaterThan(0);
    });
  });
});
