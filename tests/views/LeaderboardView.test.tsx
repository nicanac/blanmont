/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LeaderboardView from '@/app/leaderboard/LeaderboardView';
import { HallOfFameMember } from '@/app/lib/carreVert';

vi.mock('next/link', () => ({
  default: ({ children, href, prefetch, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('LeaderboardView Component (app/leaderboard/LeaderboardView.tsx)', () => {
  const mockAvailableYears = [2024, 2025, 2026, 2027];

  const mockSeasonalEntries = [
    { id: 'm1', name: 'Luciano Szustak', group: 'A-', rides: 24, dates: ['2026-04-04', '2026-04-11'] },
    { id: 'm2', name: 'Michaël Moreaux', group: 'A', rides: 22, dates: ['2026-04-04'] },
    { id: 'm3', name: 'Ludovic Gustin', group: 'A', rides: 19, dates: ['2026-04-11'] },
    { id: 'm4', name: 'Alain D', group: 'B', rides: 15, dates: ['2026-04-04'] },
    { id: 'm5', name: 'Bernard C', group: 'C', rides: 10, dates: ['2026-04-11'] },
  ];

  const mockEvents = [
    { id: 'ev-1', isoDate: '2026-04-04', location: 'Blanmont - Place', distances: '85' } as any,
    { id: 'ev-2', isoDate: '2026-04-11', location: 'Villers-la-Ville', distances: '92' } as any,
  ];

  const mockHallOfFame: HallOfFameMember[] = [
    {
      id: 'm1',
      name: 'Luciano Szustak',
      group: 'A-',
      totalCarres: 78,
      totalPhysicalRides: 85,
      activeSeasons: [2024, 2025, 2026],
      seasonBreakdown: {
        2024: { year: 2024, carres: 28, physicalRides: 30, dates: ['2024-04-06'], isChampion: true },
        2025: { year: 2025, carres: 26, physicalRides: 28, dates: ['2025-05-03'], isPodium: true },
        2026: { year: 2026, carres: 24, physicalRides: 27, dates: ['2026-04-04'], isChampion: true },
        2027: { year: 2027, carres: 0, physicalRides: 0, dates: [] },
      },
      allDates: ['2024-04-06', '2025-05-03', '2026-04-04'],
      honors: ['Champion 2024', 'Champion 2026'],
      fidelityGrade: 'legend',
      fidelityGradeLabel: 'Légende du Club',
    },
    {
      id: 'm2',
      name: 'Michaël Moreaux',
      group: 'A',
      totalCarres: 72,
      totalPhysicalRides: 79,
      activeSeasons: [2024, 2025, 2026],
      seasonBreakdown: {
        2024: { year: 2024, carres: 25, physicalRides: 27, dates: ['2024-04-06'], isPodium: true },
        2025: { year: 2025, carres: 25, physicalRides: 27, dates: ['2025-05-03'], isChampion: true },
        2026: { year: 2026, carres: 22, physicalRides: 25, dates: ['2026-04-04'], isPodium: true },
        2027: { year: 2027, carres: 0, physicalRides: 0, dates: [] },
      },
      allDates: ['2024-04-06', '2025-05-03', '2026-04-04'],
      honors: ['Champion 2025'],
      fidelityGrade: 'legend',
      fidelityGradeLabel: 'Légende du Club',
    },
    {
      id: 'm3',
      name: 'Ludovic Gustin',
      group: 'A',
      totalCarres: 48,
      totalPhysicalRides: 52,
      activeSeasons: [2025, 2026],
      seasonBreakdown: {
        2024: { year: 2024, carres: 0, physicalRides: 0, dates: [] },
        2025: { year: 2025, carres: 29, physicalRides: 31, dates: ['2025-05-03'], isPodium: true },
        2026: { year: 2026, carres: 19, physicalRides: 21, dates: ['2026-04-11'] },
        2027: { year: 2027, carres: 0, physicalRides: 0, dates: [] },
      },
      allDates: ['2025-05-03', '2026-04-11'],
      honors: ['Podium 2025'],
      fidelityGrade: 'pillar',
      fidelityGradeLabel: 'Pilier du Peloton',
    },
    {
      id: 'm4',
      name: 'Alain D',
      group: 'B',
      totalCarres: 22,
      totalPhysicalRides: 24,
      activeSeasons: [2025, 2026],
      seasonBreakdown: {
        2024: { year: 2024, carres: 0, physicalRides: 0, dates: [] },
        2025: { year: 2025, carres: 7, physicalRides: 8, dates: [] },
        2026: { year: 2026, carres: 15, physicalRides: 16, dates: ['2026-04-04'] },
        2027: { year: 2027, carres: 0, physicalRides: 0, dates: [] },
      },
      allDates: ['2026-04-04'],
      honors: [],
      fidelityGrade: 'veteran',
      fidelityGradeLabel: 'Sociétaire Émérite',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multi-Season Navigation', () => {
    it('renders navigation links for all available seasons (2024, 2025, 2026, 2027) and Hall of Fame', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={false}
          hallOfFame={mockHallOfFame}
        />
      );

      // Verify each season link exists
      mockAvailableYears.forEach((year) => {
        const link = screen.getByRole('link', { name: String(year) });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', `/leaderboard?year=${year}`);
      });

      // Verify Hall of Fame link exists
      const hofLink = screen.getByRole('link', { name: /hall of fame/i });
      expect(hofLink).toBeInTheDocument();
      expect(hofLink).toHaveAttribute('href', '/leaderboard?year=all');

      // Selected year 2026 should have aria-current="page"
      const selectedYearLink = screen.getByRole('link', { name: '2026' });
      expect(selectedYearLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Seasonal Leaderboard View', () => {
    it('displays the title and stat strip for season 2026', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={false}
          hallOfFame={mockHallOfFame}
        />
      );

      // Headline
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Le Carré Vert 2026/);

      // Top leader in stat strip
      expect(screen.getByText(/Leader \(24 sorties\)/i)).toBeInTheDocument();

      // Number of ranked members
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Membres classés')).toBeInTheDocument();

      // Total possible rides
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Sorties éligibles')).toBeInTheDocument();
    });

    it('renders the top 3 podium with vector medals and remaining riders in the table', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={false}
          hallOfFame={mockHallOfFame}
        />
      );

      // 1st place Champion
      expect(screen.getByText('Champion')).toBeInTheDocument();
      expect(screen.getAllByText('Luciano Szustak').length).toBe(2);
      expect(screen.getByText('24')).toBeInTheDocument();

      // 2nd place
      expect(screen.getByText('2ème Place')).toBeInTheDocument();
      expect(screen.getByText('Michaël Moreaux')).toBeInTheDocument();
      expect(screen.getByText('22')).toBeInTheDocument();

      // 3rd place
      expect(screen.getByText('3ème Place')).toBeInTheDocument();
      expect(screen.getByText('Ludovic Gustin')).toBeInTheDocument();
      expect(screen.getByText('19')).toBeInTheDocument();

      // Table riders (#4 and #5)
      expect(screen.getByText('#4')).toBeInTheDocument();
      expect(screen.getByText('Alain D')).toBeInTheDocument();
      expect(screen.getByText('#5')).toBeInTheDocument();
      expect(screen.getByText('Bernard C')).toBeInTheDocument();
    });

    it('renders empty state when season has no recorded rides', () => {
      render(
        <LeaderboardView
          entries={[]}
          events={[]}
          totalPossibleRides={0}
          selectedYear={2027}
          availableYears={mockAvailableYears}
          isHallOfFame={false}
          hallOfFame={mockHallOfFame}
        />
      );

      expect(screen.getByText(/Aucun classement pour la saison 2027/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /voir le calendrier/i })).toHaveAttribute('href', '/calendrier');
      expect(screen.getByRole('link', { name: /consulter le hall of fame/i })).toHaveAttribute('href', '/leaderboard?year=all');
    });
  });

  describe('Hall of Fame View', () => {
    it('displays the Hall of Fame title, career stat strip, and fidelity badges', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={true}
          hallOfFame={mockHallOfFame}
        />
      );

      // Headline
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hall of Fame/);

      // Hero Stat Strip
      expect(screen.getByText(/Grand Pilier \(78 carrés\)/i)).toBeInTheDocument();
      expect(screen.getByText('Membres au palmarès')).toBeInTheDocument();
      expect(screen.getByText(/Saisons \(2024 – 2027\)/i)).toBeInTheDocument();

      // Podium Top 3 All-Time
      expect(screen.getByText('Grand Pilier')).toBeInTheDocument();
      expect(screen.getByText('2ème Légende')).toBeInTheDocument();
      expect(screen.getByText('3ème Légende')).toBeInTheDocument();

      // Cumulative stats & Fidelity badges
      expect(screen.getAllByText('Légende du Club').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Pilier du Peloton')).toBeInTheDocument();

      // Honors badges
      expect(screen.getByText('Champion 2024')).toBeInTheDocument();
      expect(screen.getByText('Champion 2025')).toBeInTheDocument();
    });
  });

  describe('Slide-Over Member Drawer', () => {
    it('opens drawer on podium card click, displays attendances and closes on close button', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={false}
          hallOfFame={mockHallOfFame}
        />
      );

      // Find Luciano card
      const championCard = screen.getByRole('button', { name: /voir les présences de luciano szustak/i });
      fireEvent.click(championCard);

      // Drawer dialog should appear
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/Saison 2026/)).toBeInTheDocument();

      // Dates should be visible in drawer
      expect(screen.getByText(/Présences 2026 \(2\)/)).toBeInTheDocument();

      // Close button
      const closeBtn = screen.getByRole('button', { name: /fermer le panneau de détails/i });
      fireEvent.click(closeBtn);

      // Drawer should disappear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens drawer for Hall of Fame member showing multi-season breakdown', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={true}
          hallOfFame={mockHallOfFame}
        />
      );

      // Click Luciano in Hall of Fame
      const hofCard = screen.getByRole('button', { name: /voir le palmarès de luciano szustak/i });
      fireEvent.click(hofCard);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Dossier Palmarès')).toBeInTheDocument();
      expect(screen.getByText('Ventilation par saison')).toBeInTheDocument();
      expect(screen.getByText('Saison 2024')).toBeInTheDocument();
      expect(screen.getByText('28 Carrés Verts')).toBeInTheDocument();
      expect(screen.getByText('Saison 2025')).toBeInTheDocument();
      expect(screen.getByText('26 Carrés Verts')).toBeInTheDocument();
    });

    it('closes drawer on Escape key', () => {
      render(
        <LeaderboardView
          entries={mockSeasonalEntries}
          events={mockEvents}
          totalPossibleRides={30}
          selectedYear={2026}
          availableYears={mockAvailableYears}
          isHallOfFame={false}
          hallOfFame={mockHallOfFame}
          initialMemberId="m1"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
