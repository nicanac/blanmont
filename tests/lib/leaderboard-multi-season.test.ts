import { describe, it, expect } from 'vitest';
import {
  getAvailableYears,
  calculateLeaderboardFromAttendance,
  calculateHallOfFameLeaderboard,
  getPossibleCarresCount,
} from '@/app/lib/carreVert';

describe('Multi-Season Dynamic Engine & Hall of Fame', () => {
  describe('Season Discovery: getAvailableYears', () => {
    it('always provides 2024, 2025, 2026, 2027 even with no input data', () => {
      const years = getAvailableYears([], [], []);
      expect(years).toEqual([2024, 2025, 2026, 2027]);
    });

    it('dynamically discovers additional past and future seasons', () => {
      const events: any[] = [
        { id: 'ev-1', isoDate: '2023-09-02' },
        { id: 'ev-2', isoDate: '2028-05-14' },
      ];
      const attendance: any[] = [
        { eventId: 'ev-1', isoDate: '2023-09-02', members: {} },
      ];
      const entries: any[] = [
        { id: 'm1', name: 'Rider', dates: ['14/04/2025', '2029-06-20'] },
      ];

      const years = getAvailableYears(events, attendance, entries);
      expect(years).toEqual([2023, 2024, 2025, 2026, 2027, 2028, 2029]);
    });
  });

  describe('Seasonal Filtering: calculateLeaderboardFromAttendance', () => {
    const mockEvents: any[] = [
      { id: 'e-2024', isoDate: '2024-05-11' }, // Sat
      { id: 'e-2025', isoDate: '2025-05-10' }, // Sat
      { id: 'e-2026', isoDate: '2026-05-09' }, // Sat
    ];

    const mockAttendance: any[] = [
      {
        eventId: 'e-2024',
        isoDate: '2024-05-11',
        members: {
          m1: { memberId: 'm1', name: 'Jean', group: 'A', markedAt: '2024-05-11' },
        },
      },
      {
        eventId: 'e-2025',
        isoDate: '2025-05-10',
        members: {
          m2: { memberId: 'm2', name: 'Pierre', group: 'B', markedAt: '2025-05-10' },
        },
      },
      {
        eventId: 'e-2026',
        isoDate: '2026-05-09',
        members: {
          m1: { memberId: 'm1', name: 'Jean', group: 'A', markedAt: '2026-05-09' },
          m2: { memberId: 'm2', name: 'Pierre', group: 'B', markedAt: '2026-05-09' },
        },
      },
    ];

    const mockEntries: any[] = [
      { id: 'm1', name: 'Jean', group: 'A', rides: 0, dates: [] },
      { id: 'm2', name: 'Pierre', group: 'B', rides: 0, dates: [] },
    ];

    it('isolates 2024 season participations', () => {
      const results2024 = calculateLeaderboardFromAttendance(mockEntries, mockEvents, mockAttendance, 2024);
      const jean = results2024.find((r) => r.id === 'm1');
      const pierre = results2024.find((r) => r.id === 'm2');

      expect(jean?.rides).toBe(1);
      expect(pierre?.rides).toBe(0);
    });

    it('isolates 2025 season participations', () => {
      const results2025 = calculateLeaderboardFromAttendance(mockEntries, mockEvents, mockAttendance, 2025);
      const jean = results2025.find((r) => r.id === 'm1');
      const pierre = results2025.find((r) => r.id === 'm2');

      expect(jean?.rides).toBe(0);
      expect(pierre?.rides).toBe(1);
    });

    it('isolates 2026 season participations', () => {
      const results2026 = calculateLeaderboardFromAttendance(mockEntries, mockEvents, mockAttendance, 2026);
      const jean = results2026.find((r) => r.id === 'm1');
      const pierre = results2026.find((r) => r.id === 'm2');

      expect(jean?.rides).toBe(1);
      expect(pierre?.rides).toBe(1);
    });

    it('returns empty/zero rides for upcoming season 2027 with no rides', () => {
      const results2027 = calculateLeaderboardFromAttendance(mockEntries, mockEvents, mockAttendance, 2027);
      expect(results2027.every((r) => r.rides === 0)).toBe(true);
      expect(getPossibleCarresCount(mockEvents, 2027)).toBe(0);
    });
  });

  describe('Hall of Fame: calculateHallOfFameLeaderboard', () => {
    const mockEntries: any[] = [
      { id: 'u1', name: 'Luciano Szustak', group: 'A-', rides: 0, dates: [] },
      { id: 'u2', name: 'Michaël Moreaux', group: 'A', rides: 0, dates: [] },
      { id: 'u3', name: 'Ludovic Gustin', group: 'A', rides: 0, dates: [] },
      { id: 'u4', name: 'New Rider', group: 'C', rides: 0, dates: [] },
    ];

    const mockEvents: any[] = [
      // 2024: 2 weekends
      { id: 'e24-1', isoDate: '2024-04-06' }, // Sat
      { id: 'e24-2', isoDate: '2024-04-13' }, // Sat
      // 2025: 3 weekends
      { id: 'e25-1', isoDate: '2025-05-03' },
      { id: 'e25-2', isoDate: '2025-05-10' },
      { id: 'e25-3', isoDate: '2025-05-17' },
      // 2026: 2 weekends
      { id: 'e26-1', isoDate: '2026-06-06' },
      { id: 'e26-2', isoDate: '2026-06-13' },
    ];

    const mockAttendance: any[] = [
      // 2024: Luciano (2), Michaël (1), Ludovic (0)
      { eventId: 'e24-1', isoDate: '2024-04-06', members: { u1: { memberId: 'u1', name: 'Luciano', group: 'A-', markedAt: '' }, u2: { memberId: 'u2', name: 'Michaël', group: 'A', markedAt: '' } } },
      { eventId: 'e24-2', isoDate: '2024-04-13', members: { u1: { memberId: 'u1', name: 'Luciano', group: 'A-', markedAt: '' } } },

      // 2025: Luciano (2), Michaël (3), Ludovic (1)
      { eventId: 'e25-1', isoDate: '2025-05-03', members: { u1: { memberId: 'u1', name: 'Luciano', group: 'A-', markedAt: '' }, u2: { memberId: 'u2', name: 'Michaël', group: 'A', markedAt: '' }, u3: { memberId: 'u3', name: 'Ludovic', group: 'A', markedAt: '' } } },
      { eventId: 'e25-2', isoDate: '2025-05-10', members: { u1: { memberId: 'u1', name: 'Luciano', group: 'A-', markedAt: '' }, u2: { memberId: 'u2', name: 'Michaël', group: 'A', markedAt: '' } } },
      { eventId: 'e25-3', isoDate: '2025-05-17', members: { u2: { memberId: 'u2', name: 'Michaël', group: 'A', markedAt: '' } } },

      // 2026: Luciano (2), Michaël (2), Ludovic (2)
      { eventId: 'e26-1', isoDate: '2026-06-06', members: { u1: { memberId: 'u1', name: 'Luciano', group: 'A-', markedAt: '' }, u2: { memberId: 'u2', name: 'Michaël', group: 'A', markedAt: '' }, u3: { memberId: 'u3', name: 'Ludovic', group: 'A', markedAt: '' } } },
      { eventId: 'e26-2', isoDate: '2026-06-13', members: { u1: { memberId: 'u1', name: 'Luciano', group: 'A-', markedAt: '' }, u2: { memberId: 'u2', name: 'Michaël', group: 'A', markedAt: '' }, u3: { memberId: 'u3', name: 'Ludovic', group: 'A', markedAt: '' } } },
    ];

    it('correctly aggregates multi-year career points and determines season titles', () => {
      const years = [2024, 2025, 2026, 2027];
      const hof = calculateHallOfFameLeaderboard(mockEntries, mockEvents, mockAttendance, years);

      expect(hof).toHaveLength(4);

      // Luciano: 2 (2024) + 2 (2025) + 2 (2026) = 6 carres, Champion 2024
      const luciano = hof.find((m) => m.id === 'u1')!;
      expect(luciano.totalCarres).toBe(6);
      expect(luciano.activeSeasons).toEqual([2024, 2025, 2026]);
      expect(luciano.honors).toContain('Champion 2024');

      // Michaël: 1 (2024) + 3 (2025) + 2 (2026) = 6 carres, Champion 2025
      const michael = hof.find((m) => m.id === 'u2')!;
      expect(michael.totalCarres).toBe(6);
      expect(michael.activeSeasons).toEqual([2024, 2025, 2026]);
      expect(michael.honors).toContain('Champion 2025');

      // Ludovic: 0 (2024) + 1 (2025) + 2 (2026) = 3 carres, active in 2025 & 2026
      const ludovic = hof.find((m) => m.id === 'u3')!;
      expect(ludovic.totalCarres).toBe(3);
      expect(ludovic.activeSeasons).toEqual([2025, 2026]);

      // New rider: 0 carres
      const newRider = hof.find((m) => m.id === 'u4')!;
      expect(newRider.totalCarres).toBe(0);
      expect(newRider.activeSeasons).toEqual([]);
      expect(newRider.fidelityGrade).toBe('newcomer');
    });

    it('assigns fidelity grades according to career engagement and titles', () => {
      // 80 unique valid dates across months 1 to 10
      const dates: string[] = [];
      for (let m = 1; m <= 10; m++) {
        for (let d = 1; d <= 8; d++) {
          dates.push(`2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }
      }
      const veteranEntry: any[] = [
        { id: 'v1', name: 'Veteran Legend', group: 'A', rides: 80, dates },
      ];
      const hof = calculateHallOfFameLeaderboard(veteranEntry, [], [], [2025]);
      expect(hof[0].totalCarres).toBe(70);
      expect(hof[0].fidelityGrade).toBe('legend');
      expect(hof[0].fidelityGradeLabel).toBe('Légende du Club');
    });
  });
});
