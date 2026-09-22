/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatsCharts from '@/app/admin/statistics/components/StatsCharts';
import StatsAgSummary from '@/app/admin/statistics/components/StatsAgSummary';
import { computeClubStatistics } from '@/app/lib/clubStatistics';
import type { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import type { CalendarEvent, Member, Trace } from '@/app/types';
import type { EventAttendance } from '@/app/lib/firebase/attendance';

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

vi.mock('@/app/admin/statistics/components/Peloton3DShowcase', () => ({
  default: () => <div data-testid="peloton-3d">Peloton 3D</div>,
}));

const mockEntries: LeaderboardEntry[] = [
  { id: 'm1', name: 'Laurent Cyclo', totalRides: 10, dates: ['04/04/2026'], group: 'A' },
  { id: 'm2', name: 'Alice Grimpeur', totalRides: 8, dates: ['04/04/2026'], group: 'B' },
];

const mockEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    isoDate: '2026-04-04',
    location: 'Boucle Méhaigne',
    distances: '90',
    departure: '09h00',
    address: 'Blanmont',
    remarks: '',
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
    },
  },
];

const mockMembers: Member[] = [
  { id: 'm1', name: 'Laurent Cyclo', role: ['President'], bio: '', photoUrl: '', cotisation2026Status: 'paid' },
  { id: 'm2', name: 'Alice Grimpeur', role: ['Member'], bio: '', photoUrl: '', cotisation2026Status: 'pending' },
];

const mockTraces: Trace[] = [
  { id: 't1', name: 'Boucle Méhaigne', distance: 90, elevation: 650, surface: 'Road', quality: 5, description: '' },
];

describe('StatsCharts component', () => {
  it('renders all 5 tab navigation buttons', () => {
    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
      />
    );

    expect(screen.getByRole('button', { name: /1\. Télémétrie & Affluence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2\. Carré Vert & Assiduité/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3\. Traces & Parcours GPS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4\. Groupes & Démocratie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5\. Bilan AG & Synthèse/i })).toBeInTheDocument();
  });

  it('switches to Carré Vert tab and displays rankings and search filter', () => {
    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
      />
    );

    const carreVertTabBtn = screen.getByRole('button', { name: /2\. Carré Vert & Assiduité/i });
    fireEvent.click(carreVertTabBtn);

    expect(screen.getByText(/Paliers d'Honneur du Carré Vert/i)).toBeInTheDocument();
    expect(screen.getByText(/Classement Officiel du Carré Vert/i)).toBeInTheDocument();
    expect(screen.getByText('Laurent Cyclo')).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Rechercher un cycliste/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Grimpeur')).toBeInTheDocument();
    expect(screen.queryByText('Laurent Cyclo')).not.toBeInTheDocument();
  });

  it('switches to Traces tab and displays catalog KPIs', () => {
    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
      />
    );

    const tracesTabBtn = screen.getByRole('button', { name: /3\. Traces & Parcours GPS/i });
    fireEvent.click(tracesTabBtn);

    expect(screen.getByText(/Catalogue des Traces/i)).toBeInTheDocument();
    expect(screen.getByText(/Distance Totale Répertoire/i)).toBeInTheDocument();
  });

  it('switches to Groupes & Démocratie tab and displays administrative health', () => {
    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
      />
    );

    const democracyTabBtn = screen.getByRole('button', { name: /4\. Groupes & Démocratie/i });
    fireEvent.click(democracyTabBtn);

    expect(screen.getByText(/Santé Administrative & Adhésions/i)).toBeInTheDocument();
    expect(screen.getByText(/Cotisations 2026 en Règle/i)).toBeInTheDocument();
  });

  it('switches to Bilan AG tab and displays summary document', () => {
    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
      />
    );

    const agTabBtn = screen.getByRole('button', { name: /5\. Bilan AG & Synthèse/i });
    fireEvent.click(agTabBtn);

    expect(screen.getByText(/Synthèse de l'Assemblée Générale/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Activité Sportive & Kilométrage du Peloton/i)).toBeInTheDocument();
  });
});

describe('StatsAgSummary component', () => {
  it('renders AG report and triggers print/download callbacks', () => {
    const computed = computeClubStatistics({
      entries: mockEntries,
      events: mockEvents,
      allAttendance: mockAttendance,
      traces: mockTraces,
      members: mockMembers,
      saturdayRides: [],
      votes: [],
      feedback: [],
      selectedYear: '2026',
    });

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<StatsAgSummary stats={computed} />);

    expect(screen.getByText(/Rapport Statistique d'Activité & Bilan Sportif/i)).toBeInTheDocument();

    const printBtn = screen.getByRole('button', { name: /Imprimer/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });
});
