import { describe, it, expect } from 'vitest';
import {
  parseDateInfo,
  isWeekendDate,
  getWeekendKey,
  calculateMemberCarres,
  getPossibleCarresCount,
  calculateLeaderboardFromAttendance,
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

    it('parses full ISO datetime strings without timezone shift', () => {
      const info = parseDateInfo('2026-02-04T15:55:59.124Z');
      expect(info).not.toBeNull();
      expect(info?.year).toBe(2026);
      expect(info?.month).toBe(2);
      expect(info?.day).toBe(4);
      expect(info?.isoDate).toBe('2026-02-04');
    });

    it('guarantees weekend detection consistent with UTC', () => {
      // 2026-10-25 is DST shift Sunday in Europe
      const info = parseDateInfo('2026-10-25');
      expect(info).not.toBeNull();
      expect(info?.dayOfWeek).toBe(0); // Sunday
      expect(info?.isWeekend).toBe(true);
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

  describe('getPossibleCarresCount', () => {
    const mockEvents: any[] = [
      { id: 'ev-1', isoDate: '2026-03-14' }, // Sat (Weekend 1)
      { id: 'ev-2', isoDate: '2026-03-15' }, // Sun (Weekend 1) -> 1 possible carre total
      { id: 'ev-3', isoDate: '2026-03-18' }, // Wed -> 1 possible carre
      { id: 'ev-4', isoDate: '2026-03-21' }, // Sat (Weekend 2) -> 1 possible carre
      { id: 'ev-5', isoDate: '2025-05-10' }, // Previous year
    ];

    it('counts possible carres for a given year consolidating weekends', () => {
      const count = getPossibleCarresCount(mockEvents, 2026);
      // Weekend 1 (14+15) + Wed (18) + Weekend 2 (21) = 3
      expect(count).toBe(3);
    });

    it('returns 0 for a year with no events', () => {
      expect(getPossibleCarresCount(mockEvents, 2024)).toBe(0);
    });

    it('respects maxIsoDate cut-off option', () => {
      const count = getPossibleCarresCount(mockEvents, 2026, { maxIsoDate: '2026-03-16' });
      // Only Weekend 1 (14+15) is <= 2026-03-16
      expect(count).toBe(1);
    });
  });

  describe('calculateLeaderboardFromAttendance', () => {
    const mockEvents: any[] = [
      { id: 'ev-1', isoDate: '2026-03-14' }, // Sat
      { id: 'ev-2', isoDate: '2026-03-15' }, // Sun
      { id: 'ev-3', isoDate: '2026-03-18' }, // Wed
    ];

    const mockEntries: any[] = [
      { id: 'mem-1', memberId: 'mem-1', name: 'Alice', group: 'A', carres: 0, physicalRides: 0, dates: [], year: 2026 },
      { id: 'mem-2', memberId: 'mem-2', name: 'Bob', group: 'B', carres: 0, physicalRides: 0, dates: [], year: 2026 },
    ];

    const mockAttendance: any[] = [
      {
        eventId: 'ev-1',
        isoDate: '2026-03-14',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice', group: 'A', markedAt: '2026-03-14T08:00:00Z' },
          'mem-2': { memberId: 'mem-2', name: 'Bob', group: 'B', markedAt: '2026-03-14T08:00:00Z' },
        },
      },
      {
        eventId: 'ev-2',
        isoDate: '2026-03-15',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice', group: 'A', markedAt: '2026-03-15T08:00:00Z' },
        },
      },
      {
        eventId: 'ev-3',
        isoDate: '2026-03-18',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice', group: 'A', markedAt: '2026-03-18T08:00:00Z' },
        },
      },
    ];

    it('calculates points and sorts members with highest points at the top', () => {
      const results = calculateLeaderboardFromAttendance(mockEntries, mockEvents, mockAttendance, 2026);

      expect(results.length).toBe(2);

      // Alice: attended Sat + Sun (1 point) + Wed (1 point) = 2 points, 3 physical dates
      const alice = results.find((r) => r.name === 'Alice');
      expect(alice).toBeDefined();
      expect(alice?.rides).toBe(2);
      expect(alice?.dates.length).toBe(3);

      // Bob: attended Sat (1 point) = 1 point, 1 physical date
      const bob = results.find((r) => r.name === 'Bob');
      expect(bob).toBeDefined();
      expect(bob?.rides).toBe(1);
      expect(bob?.dates.length).toBe(1);

      // Alice is first, Bob is second
      expect(results[0].name).toBe('Alice');
      expect(results[1].name).toBe('Bob');
    });
  });
});

