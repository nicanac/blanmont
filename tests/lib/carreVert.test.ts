import { describe, it, expect } from 'vitest';
import {
  parseDateInfo,
  isWeekendDate,
  getWeekendKey,
  calculateMemberCarres,
  getPossibleCarresCount,
  calculateLeaderboardFromAttendance,
  getAvailableYears,
  calculateHallOfFameLeaderboard,
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

  describe('getAvailableYears', () => {
    it('returns default base years (2024, 2025, 2026, 2027) when empty inputs are provided', () => {
      const years = getAvailableYears([], [], []);
      expect(years).toEqual([2024, 2025, 2026, 2027]);
    });

    it('extracts years dynamically from events, attendance, and member dates and deduplicates them', () => {
      const mockEvents: any[] = [
        { id: 'ev-1', isoDate: '2023-06-15' },
        { id: 'ev-2', isoDate: '2025-08-20' },
      ];
      const mockAttendance: any[] = [
        { id: 'att-1', isoDate: '2026-04-10' },
        { id: 'att-2', isoDate: '2028-09-02' },
      ];
      const mockEntries: any[] = [
        { id: 'mem-1', dates: ['10/05/2024', '12/07/2025', '2029-01-15'] },
      ];

      const years = getAvailableYears(mockEvents, mockAttendance, mockEntries);
      expect(years).toContain(2023);
      expect(years).toContain(2024);
      expect(years).toContain(2025);
      expect(years).toContain(2026);
      expect(years).toContain(2027);
      expect(years).toContain(2028);
      expect(years).toContain(2029);
      // Ensure sorted order
      expect(years).toEqual([...years].sort((a, b) => a - b));
    });
  });

  describe('calculateHallOfFameLeaderboard', () => {
    const mockEntries: any[] = [
      { id: 'mem-1', name: 'Alice Légende', group: 'A', dates: [] },
      { id: 'mem-2', name: 'Bob Pilier', group: 'B', dates: [] },
      { id: 'mem-3', name: 'Charlie Vétéran', group: 'C', dates: [] },
      { id: 'mem-4', name: 'David Nouveau', group: 'A', dates: [] },
    ];

    const mockEvents: any[] = [
      // 2024
      { id: 'ev-24-1', isoDate: '2024-04-13' }, // Sat
      { id: 'ev-24-2', isoDate: '2024-04-14' }, // Sun
      // 2025
      { id: 'ev-25-1', isoDate: '2025-05-17' }, // Sat
      { id: 'ev-25-2', isoDate: '2025-05-21' }, // Wed
      // 2026
      { id: 'ev-26-1', isoDate: '2026-06-06' }, // Sat
      { id: 'ev-26-2', isoDate: '2026-06-07' }, // Sun
      { id: 'ev-26-3', isoDate: '2026-06-10' }, // Wed
    ];

    const mockAttendance: any[] = [
      // 2024: Alice attends Sat+Sun (1 pt), Bob attends Sat (1 pt)
      {
        eventId: 'ev-24-1',
        isoDate: '2024-04-13',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice Légende', group: 'A', markedAt: '2024-04-13' },
          'mem-2': { memberId: 'mem-2', name: 'Bob Pilier', group: 'B', markedAt: '2024-04-13' },
        },
      },
      {
        eventId: 'ev-24-2',
        isoDate: '2024-04-14',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice Légende', group: 'A', markedAt: '2024-04-14' },
        },
      },
      // 2025: Alice attends Sat+Wed (2 pts), Charlie attends Sat (1 pt)
      {
        eventId: 'ev-25-1',
        isoDate: '2025-05-17',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice Légende', group: 'A', markedAt: '2025-05-17' },
          'mem-3': { memberId: 'mem-3', name: 'Charlie Vétéran', group: 'C', markedAt: '2025-05-17' },
        },
      },
      {
        eventId: 'ev-25-2',
        isoDate: '2025-05-21',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice Légende', group: 'A', markedAt: '2025-05-21' },
        },
      },
      // 2026: Bob attends Sat+Sun+Wed (2 pts), Alice attends Wed (1 pt)
      {
        eventId: 'ev-26-1',
        isoDate: '2026-06-06',
        members: {
          'mem-2': { memberId: 'mem-2', name: 'Bob Pilier', group: 'B', markedAt: '2026-06-06' },
        },
      },
      {
        eventId: 'ev-26-2',
        isoDate: '2026-06-07',
        members: {
          'mem-2': { memberId: 'mem-2', name: 'Bob Pilier', group: 'B', markedAt: '2026-06-07' },
        },
      },
      {
        eventId: 'ev-26-3',
        isoDate: '2026-06-10',
        members: {
          'mem-1': { memberId: 'mem-1', name: 'Alice Légende', group: 'A', markedAt: '2026-06-10' },
          'mem-2': { memberId: 'mem-2', name: 'Bob Pilier', group: 'B', markedAt: '2026-06-10' },
        },
      },
    ];

    it('aggregates multi-season career stats, active seasons, and orders riders correctly', () => {
      const years = [2024, 2025, 2026, 2027];
      const hof = calculateHallOfFameLeaderboard(mockEntries, mockEvents, mockAttendance, years);

      expect(hof.length).toBe(4);

      // Alice: 1 (2024) + 2 (2025) + 1 (2026) = 4 carres, active in 3 seasons [2024, 2025, 2026]
      const alice = hof.find((m) => m.id === 'mem-1');
      expect(alice).toBeDefined();
      expect(alice?.totalCarres).toBe(4);
      expect(alice?.activeSeasons).toEqual([2024, 2025, 2026]);
      expect(alice?.seasonBreakdown[2024].carres).toBe(1);
      expect(alice?.seasonBreakdown[2025].carres).toBe(2);
      expect(alice?.seasonBreakdown[2026].carres).toBe(1);
      expect(alice?.seasonBreakdown[2027].carres).toBe(0);

      // Bob: 1 (2024) + 0 (2025) + 2 (2026) = 3 carres, active in 2 seasons [2024, 2026]
      const bob = hof.find((m) => m.id === 'mem-2');
      expect(bob).toBeDefined();
      expect(bob?.totalCarres).toBe(3);
      expect(bob?.activeSeasons).toEqual([2024, 2026]);

      // Charlie: 1 (2025) = 1 carre, active in [2025]
      const charlie = hof.find((m) => m.id === 'mem-3');
      expect(charlie).toBeDefined();
      expect(charlie?.totalCarres).toBe(1);
      expect(charlie?.activeSeasons).toEqual([2025]);

      // David: 0 carres, active in []
      const david = hof.find((m) => m.id === 'mem-4');
      expect(david).toBeDefined();
      expect(david?.totalCarres).toBe(0);
      expect(david?.activeSeasons).toEqual([]);

      // Top of leaderboard is Alice, then Bob, then Charlie, then David
      expect(hof[0].id).toBe('mem-1');
      expect(hof[1].id).toBe('mem-2');
      expect(hof[2].id).toBe('mem-3');
      expect(hof[3].id).toBe('mem-4');
    });

    it('awards championship and podium honors to season leaders', () => {
      const years = [2024, 2025, 2026];
      const hof = calculateHallOfFameLeaderboard(mockEntries, mockEvents, mockAttendance, years);

      const alice = hof.find((m) => m.id === 'mem-1')!;
      const bob = hof.find((m) => m.id === 'mem-2')!;

      // 2024: Alice & Bob tied at 1 pt -> both champions
      expect(alice.honors).toContain('Champion 2024');
      expect(bob.honors).toContain('Champion 2024');

      // 2025: Alice (2 pts) was Champion 2025
      expect(alice.honors).toContain('Champion 2025');

      // 2026: Bob (2 pts) was Champion 2026
      expect(bob.honors).toContain('Champion 2026');
    });
  });
});

