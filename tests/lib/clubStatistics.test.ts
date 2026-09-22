import { describe, it, expect } from 'vitest';
import {
  parseEventDistance,
  getCarreVertTier,
  computeClubStatistics,
  generateCarreVertCsv,
  generateClubAgSummaryCsv,
} from '@/app/lib/clubStatistics';
import type { CalendarEvent, Member, Trace, Feedback, SaturdayRide, Vote } from '@/app/types';
import type { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import type { EventAttendance } from '@/app/lib/firebase/attendance';

describe('clubStatistics library', () => {
  describe('parseEventDistance', () => {
    it('parses distance range and computes average', () => {
      expect(parseEventDistance('80-110')).toBe(95);
      expect(parseEventDistance('70 – 90 km')).toBe(80);
      expect(parseEventDistance('85 / 115')).toBe(100);
    });

    it('parses single distance string', () => {
      expect(parseEventDistance('92 km')).toBe(92);
      expect(parseEventDistance('105')).toBe(105);
    });

    it('falls back to 80 km for invalid or empty strings', () => {
      expect(parseEventDistance('')).toBe(80);
      expect(parseEventDistance(undefined)).toBe(80);
      expect(parseEventDistance('unknown')).toBe(80);
    });
  });

  describe('getCarreVertTier', () => {
    it('correctly maps percentages to merit tiers', () => {
      expect(getCarreVertTier(85)).toBe('or');
      expect(getCarreVertTier(80)).toBe('or');
      expect(getCarreVertTier(79)).toBe('argent');
      expect(getCarreVertTier(60)).toBe('argent');
      expect(getCarreVertTier(59)).toBe('bronze');
      expect(getCarreVertTier(40)).toBe('bronze');
      expect(getCarreVertTier(39)).toBe('peloton');
      expect(getCarreVertTier(20)).toBe('peloton');
      expect(getCarreVertTier(19)).toBe('occasionnel');
      expect(getCarreVertTier(0)).toBe('occasionnel');
    });
  });

  describe('computeClubStatistics', () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: 'evt-1',
        isoDate: '2026-04-04', // Saturday
        location: 'Boucle Méhaigne',
        distances: '80-100',
        departure: '09h00',
        address: 'Blanmont',
        remarks: 'Sortie printanière',
        alternative: '',
        group: '',
      },
      {
        id: 'evt-2',
        isoDate: '2026-04-11', // Saturday
        location: 'Tour du Brabant',
        distances: '90',
        departure: '09h00',
        address: 'Blanmont',
        remarks: 'Vent d’ouest',
        alternative: '',
        group: '',
      },
    ];

    const mockAttendance: EventAttendance[] = [
      {
        id: 'evt-1',
        isoDate: '2026-04-04',
        members: {
          m1: { memberId: 'm1', name: 'Laurent Cyclo', group: 'A', markedAt: '2026-04-04T10:00:00Z' },
          m2: { memberId: 'm2', name: 'Alice Grimpeur', group: 'A', markedAt: '2026-04-04T10:00:00Z' },
          m3: { memberId: 'm3', name: 'Bob Sprinter', group: 'B', markedAt: '2026-04-04T10:00:00Z' },
        },
      },
      {
        id: 'evt-2',
        isoDate: '2026-04-11',
        members: {
          m1: { memberId: 'm1', name: 'Laurent Cyclo', group: 'A', markedAt: '2026-04-11T10:00:00Z' },
          m2: { memberId: 'm2', name: 'Alice Grimpeur', group: 'A', markedAt: '2026-04-11T10:00:00Z' },
        },
      },
    ];

    const mockEntries: LeaderboardEntry[] = [
      { id: 'm1', name: 'Laurent Cyclo', totalRides: 2, dates: ['04/04/2026', '11/04/2026'], group: 'A' },
      { id: 'm2', name: 'Alice Grimpeur', totalRides: 2, dates: ['04/04/2026', '11/04/2026'], group: 'A' },
      { id: 'm3', name: 'Bob Sprinter', totalRides: 1, dates: ['04/04/2026'], group: 'B' },
      { id: 'm4', name: 'Charlie Rando', totalRides: 0, dates: [], group: 'C' },
    ];

    const mockMembers: Member[] = [
      { id: 'm1', name: 'Laurent Cyclo', role: ['President'], bio: '', photoUrl: '', cotisation2026Status: 'paid', stravaId: '123' },
      { id: 'm2', name: 'Alice Grimpeur', role: ['Admin'], bio: '', photoUrl: '', cotisation2026Status: 'paid', ffbcLicenseNumber: 'B1234' },
      { id: 'm3', name: 'Bob Sprinter', role: ['Member'], bio: '', photoUrl: '', cotisation2026Status: 'pending' },
      { id: 'm4', name: 'Charlie Rando', role: ['Member'], bio: '', photoUrl: '', cotisation2026Status: 'exempt' },
    ];

    const mockTraces: Trace[] = [
      { id: 't1', name: 'Boucle Méhaigne', distance: 90, elevation: 650, surface: 'Road', quality: 5, description: '' },
      { id: 't2', name: 'Tour du Brabant', distance: 90, elevation: 720, surface: 'Road', quality: 4, description: '' },
      { id: 't3', name: 'Gravel Hesbaye', distance: 65, elevation: 420, surface: 'Gravel', quality: 4, description: '' },
    ];

    const mockSaturdayRides: SaturdayRide[] = [
      { id: 'ride-1', date: '2026-04-04', candidateTraceIds: ['t1', 't2'], status: 'Closed', selectedTraceId: 't1' },
      { id: 'ride-2', date: '2026-04-11', candidateTraceIds: ['t2', 't3'], status: 'Closed', selectedTraceId: 't2' },
    ];

    const mockVotes: Vote[] = [
      { id: 'v1', rideId: 'ride-1', memberId: 'm1', traceId: 't1' },
      { id: 'v2', rideId: 'ride-1', memberId: 'm2', traceId: 't1' },
      { id: 'v3', rideId: 'ride-2', memberId: 'm1', traceId: 't2' },
    ];

    const mockFeedback: Feedback[] = [
      { id: 'f1', traceId: 't1', rating: 5, comment: 'Superbe', memberName: 'Laurent' },
      { id: 'f2', traceId: 't1', rating: 4, comment: 'Très bien', memberName: 'Alice' },
    ];

    it('computes accurate peloton kilometers, elevation, and attendance', () => {
      const stats = computeClubStatistics({
        entries: mockEntries,
        events: mockEvents,
        allAttendance: mockAttendance,
        traces: mockTraces,
        members: mockMembers,
        saturdayRides: mockSaturdayRides,
        votes: mockVotes,
        feedback: mockFeedback,
        selectedYear: '2026',
      });

      // Event 1 has 3 riders * 90 km = 270 km
      // Event 2 has 2 riders * 90 km = 180 km
      // Total Peloton Km = 450 km
      expect(stats.telemetry.totalPelotonKm).toBe(450);
      expect(stats.telemetry.totalAttendances).toBe(5);
      expect(stats.telemetry.officialRidesCount).toBe(2);
      expect(stats.telemetry.avgPelotonSize).toBe(2.5);

      // Carré Vert
      expect(stats.carreVert.totalMembers).toBe(4);
      expect(stats.carreVert.activeMembers).toBe(3);
      expect(stats.carreVert.dormantMembers).toBe(1);
      expect(stats.carreVert.activityRate).toBe(75);
      expect(stats.carreVert.podium.length).toBeGreaterThanOrEqual(2);

      // Traces
      expect(stats.traces.totalTraces).toBe(3);
      expect(stats.traces.totalCatalogKm).toBe(245);
      expect(stats.traces.feedbackStats.totalReviews).toBe(2);
      expect(stats.traces.feedbackStats.averageRating).toBe(4.5);

      // Democracy
      expect(stats.democracy.totalSaturdayRides).toBe(2);
      expect(stats.democracy.totalVotes).toBe(3);
      expect(stats.democracy.popularTraces[0].traceName).toBe('Boucle Méhaigne');

      // Administration
      expect(stats.administration.cotisationComplianceRate).toBe(75); // 2 paid + 1 exempt out of 4 = 75%
      expect(stats.administration.stravaAdoptionRate).toBe(25); // 1 out of 4 = 25%
    });

    it('generates valid CSV strings', () => {
      const stats = computeClubStatistics({
        entries: mockEntries,
        events: mockEvents,
        allAttendance: mockAttendance,
        traces: mockTraces,
        members: mockMembers,
        saturdayRides: mockSaturdayRides,
        votes: mockVotes,
        feedback: mockFeedback,
        selectedYear: '2026',
      });

      const carreVertCsv = generateCarreVertCsv(stats);
      expect(carreVertCsv).toContain('Rang;Membre;Groupe;Carres_Valides');
      expect(carreVertCsv).toContain('Laurent Cyclo');

      const agSummaryCsv = generateClubAgSummaryCsv(stats);
      expect(agSummaryCsv).toContain('BILAN OFFICIEL DE LA SAISON CYCLISTE 2026');
      expect(agSummaryCsv).toContain('Kilometres-peloton cumules;450 km');
    });
  });
});
