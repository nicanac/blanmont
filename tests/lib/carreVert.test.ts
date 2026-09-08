import { describe, it, expect } from 'vitest';
import {
  parseDateInfo,
  isWeekendDate,
  getWeekendKey,
  calculateMemberCarres,
} from '@/app/lib/carreVert';

describe('carreVert calculations', () => {
  describe('parseDateInfo', () => {
    it('parses ISO format YYYY-MM-DD correctly', () => {
      // 2026-03-14 is a Saturday (dayOfWeek = 6)
      const info = parseDateInfo('2026-03-14');
      expect(info).not.toBeNull();
      expect(info?.year).toBe(2026);
      expect(info?.month).toBe(3);
      expect(info?.day).toBe(14);
      expect(info?.dayOfWeek).toBe(6);
      expect(info?.isWeekend).toBe(true);
      expect(info?.isoDate).toBe('2026-03-14');
      expect(info?.weekendKey).toBe('2026-03-14');
      expect(info?.rideKey).toBe('weekend:2026-03-14');
    });

    it('parses French format DD/MM/YYYY correctly', () => {
      // 15/03/2026 is a Sunday (dayOfWeek = 0)
      const info = parseDateInfo('15/03/2026');
      expect(info).not.toBeNull();
      expect(info?.year).toBe(2026);
      expect(info?.month).toBe(3);
      expect(info?.day).toBe(15);
      expect(info?.dayOfWeek).toBe(0);
      expect(info?.isWeekend).toBe(true);
      // Sunday shares the weekend key with the Saturday before (2026-03-14)
      expect(info?.weekendKey).toBe('2026-03-14');
      expect(info?.rideKey).toBe('weekend:2026-03-14');
    });

    it('parses weekday dates with unique weekday ride keys', () => {
      // 2026-03-18 is Wednesday (dayOfWeek = 3)
      const info = parseDateInfo('2026-03-18');
      expect(info).not.toBeNull();
      expect(info?.isWeekend).toBe(false);
      expect(info?.weekendKey).toBe('');
      expect(info?.rideKey).toBe('weekday:2026-03-18');
    });

    it('handles short French format DD/MM using defaultYear', () => {
      const info = parseDateInfo('14/03', 2026);
      expect(info).not.toBeNull();
      expect(info?.year).toBe(2026);
      expect(info?.month).toBe(3);
      expect(info?.day).toBe(14);
    });

    it('returns null for invalid date strings', () => {
      expect(parseDateInfo('')).toBeNull();
      expect(parseDateInfo('invalid-string')).toBeNull();
      expect(parseDateInfo(null as unknown as string)).toBeNull();
    });
  });

  describe('isWeekendDate and getWeekendKey', () => {
    it('accurately identifies weekend dates', () => {
      expect(isWeekendDate('2026-03-14')).toBe(true); // Saturday
      expect(isWeekendDate('2026-03-15')).toBe(true); // Sunday
      expect(isWeekendDate('2026-03-16')).toBe(false); // Monday
      expect(isWeekendDate('2026-03-20')).toBe(false); // Friday
    });

    it('returns the same Saturday weekend key for both Saturday and Sunday', () => {
      const satKey = getWeekendKey('2026-03-14');
      const sunKey = getWeekendKey('2026-03-15');
      expect(satKey).toBe('2026-03-14');
      expect(sunKey).toBe('2026-03-14');
      expect(satKey).toBe(sunKey);
    });

    it('returns null for weekdays in getWeekendKey', () => {
      expect(getWeekendKey('2026-03-16')).toBeNull();
    });
  });

  describe('calculateMemberCarres consolidation logic', () => {
    it('consolidates Saturday and Sunday of the same weekend into 1 Carré Vert, but 2 physical rides', () => {
      // Attended both Saturday 14 March and Sunday 15 March 2026
      const dates = ['2026-03-14', '2026-03-15'];
      const stats = calculateMemberCarres(dates);

      expect(stats.carres).toBe(1);
      expect(stats.physicalRides).toBe(2);
      expect(stats.weekendCarres).toBe(1);
      expect(stats.weekdayCarres).toBe(0);
      expect(stats.isoDates).toEqual(['2026-03-14', '2026-03-15']);
    });

    it('gives 1 Carré Vert for each weekday ride attended', () => {
      // Wednesday 18 March and Friday 20 March 2026
      const dates = ['2026-03-18', '2026-03-20'];
      const stats = calculateMemberCarres(dates);

      expect(stats.carres).toBe(2);
      expect(stats.physicalRides).toBe(2);
      expect(stats.weekendCarres).toBe(0);
      expect(stats.weekdayCarres).toBe(2);
    });

    it('aggregates mixed weekend and weekday attendances across multiple weeks', () => {
      const dates = [
        '2026-03-14', // Weekend 1 (Sat)
        '2026-03-15', // Weekend 1 (Sun) -> 1 carres total for weekend 1
        '2026-03-18', // Weekday (Wed) -> 1 carres
        '2026-03-21', // Weekend 2 (Sat) -> 1 carres
      ];

      const stats = calculateMemberCarres(dates);
      // Total carres = 1 (Wknd 1) + 1 (Wknd 2) + 1 (Wed) = 3
      expect(stats.carres).toBe(3);
      expect(stats.physicalRides).toBe(4);
      expect(stats.weekendCarres).toBe(2);
      expect(stats.weekdayCarres).toBe(1);
    });

    it('filters by year when year parameter is specified', () => {
      const dates = [
        '2025-10-10',
        '2026-03-14',
      ];

      const stats2026 = calculateMemberCarres(dates, 2026);
      expect(stats2026.physicalRides).toBe(1);
      expect(stats2026.carres).toBe(1);
      expect(stats2026.isoDates).toEqual(['2026-03-14']);
    });

    it('returns zeroes for empty or invalid input arrays', () => {
      const empty = calculateMemberCarres([]);
      expect(empty.carres).toBe(0);
      expect(empty.physicalRides).toBe(0);
      expect(empty.dates).toEqual([]);
    });
  });
});
