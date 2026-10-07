/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatsCharts from '@/app/admin/statistics/components/StatsCharts';
import StatsAgSummary from '@/app/admin/statistics/components/StatsAgSummary';
import {
  TelemetryTimelineChart,
  GroupCompositionChart,
  getGroupColor,
  resolveGroupColors,
} from '@/app/admin/statistics/components/StatsChartsVisualizations';
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

  it('renders CSV export buttons in the season header', () => {
    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
      />
    );

    const csvCarreVertBtn = screen.getByRole('button', { name: /CSV Carré Vert/i });
    const csvBilanAgBtn = screen.getByRole('button', { name: /CSV Bilan AG/i });

    expect(csvCarreVertBtn).toBeInTheDocument();
    expect(csvBilanAgBtn).toBeInTheDocument();
  });
});

describe('TelemetryTimelineChart component', () => {
  const mockWeeklyData = [
    { week: '04/04/2026', count: 18, isoDate: '2026-04-04', month: 4, distance: 85, elevation: 600, pelotonKm: 1530 },
    { week: '11/04/2026', count: 22, isoDate: '2026-04-11', month: 4, distance: 90, elevation: 650, pelotonKm: 1980 },
    { week: '18/04/2026', count: 15, isoDate: '2026-04-18', month: 4, distance: 80, elevation: 550, pelotonKm: 1200 },
    { week: '25/04/2026', count: 25, isoDate: '2026-04-25', month: 4, distance: 95, elevation: 700, pelotonKm: 2375 },
  ];

  const mockMonthlyData = [
    { monthIndex: 1, monthName: 'Janvier', totalAttendance: 40, eventCount: 4, pelotonKm: 3200, pelotonElevation: 25000 },
    { monthIndex: 2, monthName: 'Février', totalAttendance: 55, eventCount: 4, pelotonKm: 4400, pelotonElevation: 35000 },
  ];

  it('renders chart title, telemetry KPI strip, and mode buttons', () => {
    render(
      <TelemetryTimelineChart
        selectedYear="2026"
        weeklyDistribution={mockWeeklyData}
        monthlyData={mockMonthlyData}
      />
    );

    expect(screen.getByText(/Affluence & Volume Kilométrique du Peloton/i)).toBeInTheDocument();
    expect(screen.getByText(/Peloton Moyen/i)).toBeInTheDocument();
    expect(screen.getByText(/Pic de la Saison/i)).toBeInTheDocument();
    expect(screen.getByText(/^Effort Collectif$/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^Sortie$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Mois$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Km-Peloton$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cumul$/i })).toBeInTheDocument();
  });

  it('switches between chart modes and toggles trendline', () => {
    render(
      <TelemetryTimelineChart
        selectedYear="2026"
        weeklyDistribution={mockWeeklyData}
        monthlyData={mockMonthlyData}
      />
    );

    // Initial mode is sortie with line chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Toggle trendline button
    const trendBtn = screen.getByRole('button', { name: /Tendance/i });
    expect(trendBtn).toBeInTheDocument();
    fireEvent.click(trendBtn);

    // Switch to Mois mode (renders Bar chart)
    const moisBtn = screen.getByRole('button', { name: /^Mois$/i });
    fireEvent.click(moisBtn);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    // Switch to Km-Peloton mode
    const kmBtn = screen.getByRole('button', { name: /^Km-Peloton$/i });
    fireEvent.click(kmBtn);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Switch to Cumul mode
    const cumulBtn = screen.getByRole('button', { name: /^Cumul$/i });
    fireEvent.click(cumulBtn);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
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

describe('clubStatistics computation and edge-case formatting', () => {
  it('correctly maps English and duplicate directions to Belgian regional denominations', () => {
    const tracesWithVariousDirections: Trace[] = [
      { id: 't1', name: 'Trace 1', distance: 80, elevation: 500, direction: 'North' as any },
      { id: 't2', name: 'Trace 2', distance: 90, elevation: 600, direction: 'South' as any },
      { id: 't3', name: 'Trace 3', distance: 100, elevation: 700, direction: 'Nord (Dyle / Flandre)' },
    ];

    const stats = computeClubStatistics({
      entries: [],
      events: [],
      allAttendance: [],
      traces: tracesWithVariousDirections,
      members: [],
      saturdayRides: [],
      votes: [],
      feedback: [],
      selectedYear: '2026',
    });

    const northDirection = stats.traces.directionDistribution.find(
      (d) => d.direction === 'Nord (Dyle / Flandre)'
    );
    expect(northDirection).toBeDefined();
    expect(northDirection?.count).toBe(2);

    const southDirection = stats.traces.directionDistribution.find(
      (d) => d.direction === 'Sud (Condroz / Meuse)'
    );
    expect(southDirection).toBeDefined();
    expect(southDirection?.count).toBe(1);
  });

  it('rounds totalCatalogKm and totalCatalogElevation integers without floating decimals', () => {
    const tracesWithFloats: Trace[] = [
      { id: 't1', name: 'Trace 1', distance: 90.460185011756, elevation: 500.8 },
      { id: 't2', name: 'Trace 2', distance: 45.3, elevation: 250.4 },
    ];

    const stats = computeClubStatistics({
      entries: [],
      events: [],
      allAttendance: [],
      traces: tracesWithFloats,
      members: [],
      saturdayRides: [],
      votes: [],
      feedback: [],
      selectedYear: '2026',
    });

    expect(Number.isInteger(stats.traces.totalCatalogKm)).toBe(true);
    expect(Number.isInteger(stats.traces.totalCatalogElevation)).toBe(true);
    expect(stats.traces.totalCatalogKm).toBe(136); // 90.46... + 45.3 = 135.76... -> 136
  });

  it('renders top rated traces in Tab 3 without unescaped &bull; entity literal', () => {
    const mockFeedback = [
      { id: 'f1', traceId: 't1', rating: 5, comment: 'Superbe', createdAt: '2026-04-04' },
    ];

    render(
      <StatsCharts
        entries={mockEntries}
        events={mockEvents}
        allAttendance={mockAttendance}
        traces={mockTraces}
        members={mockMembers}
        feedback={mockFeedback}
      />
    );

    const tracesTabBtn = screen.getByRole('button', { name: /3\. Traces & Parcours GPS/i });
    fireEvent.click(tracesTabBtn);

    expect(screen.getByText('Boucle Méhaigne')).toBeInTheDocument();
    // Must NOT contain literal '&bull;' string
    expect(screen.queryByText(/&bull;/)).not.toBeInTheDocument();
  });
});

describe('GroupCompositionChart and group color resolution', () => {
  it('assigns unique, distinct colors to all standard club groups without duplicates', () => {
    const clubGroups = [
      'A',
      'Groupe B (Bleu / Allure C)',
      'C',
      'Groupe V (Vert / Allure A)',
      'A-',
      'BC',
    ];

    const colors = clubGroups.map((g) => getGroupColor(g));
    const uniqueColors = new Set(colors);

    // Each of the 6 groups must have a completely distinct color
    expect(uniqueColors.size).toBe(clubGroups.length);

    // Specific spot ink expectations according to cartographic design tokens
    expect(getGroupColor('A')).toBe('#d63535'); // Route Red
    expect(getGroupColor('Groupe B (Bleu / Allure C)')).toBe('#1f6fbf'); // Hydro Blue
    expect(getGroupColor('C')).toBe('#7c3aed'); // Geodetic Violet
    expect(getGroupColor('Groupe V (Vert / Allure A)')).toBe('#2e7d45'); // Woodland Green
    expect(getGroupColor('A-')).toBe('#b0703b'); // Relief Bistre
    expect(getGroupColor('BC')).toBe('#e8962a'); // Amber Caution
  });

  it('guarantees unique colors across resolveGroupColors even if arbitrary or repeated groups are provided', () => {
    const rawGroups = [
      { group: 'Groupe A' },
      { group: 'A' },
      { group: 'Groupe B' },
      { group: 'Groupe B (Bleu / Allure C)' },
      { group: 'Autre 1' },
      { group: 'Autre 2' },
    ];

    const colorMap = resolveGroupColors(rawGroups);
    const assignedColors = Array.from(colorMap.values());
    const uniqueAssigned = new Set(assignedColors);

    expect(uniqueAssigned.size).toBe(rawGroups.length);
  });

  it('renders group composition legend with colored indicators for all groups', () => {
    const mockGroupDynamics = {
      groupStats: [
        { group: 'A', count: 20, totalAttendances: 461, avgRides: 23, percentOfTotal: 42 },
        { group: 'Groupe B (Bleu / Allure C)', count: 15, totalAttendances: 270, avgRides: 18, percentOfTotal: 24 },
        { group: 'C', count: 10, totalAttendances: 147, avgRides: 15, percentOfTotal: 13 },
        { group: 'Groupe V (Vert / Allure A)', count: 8, totalAttendances: 131, avgRides: 16, percentOfTotal: 12 },
        { group: 'A-', count: 5, totalAttendances: 86, avgRides: 17, percentOfTotal: 8 },
        { group: 'BC', count: 2, totalAttendances: 9, avgRides: 5, percentOfTotal: 1 },
      ],
    };

    const { container } = render(<GroupCompositionChart groupDynamics={mockGroupDynamics} />);

    expect(screen.getByText('Répartition de l\'Affluence par Groupe')).toBeInTheDocument();
    expect(screen.getByText('1104')).toBeInTheDocument(); // Total attendances
    expect(screen.getByText('Présences')).toBeInTheDocument();

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Groupe B (Bleu / Allure C)')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Groupe V (Vert / Allure A)')).toBeInTheDocument();
    expect(screen.getByText('A-')).toBeInTheDocument();
    expect(screen.getByText('BC')).toBeInTheDocument();

    // Verify all 6 dots have distinct background colors
    const dots = container.querySelectorAll('span.rounded-full.shrink-0');
    expect(dots.length).toBe(6);
    const dotColors = Array.from(dots).map((dot) => (dot as HTMLElement).style.backgroundColor);
    const uniqueDotColors = new Set(dotColors);
    expect(uniqueDotColors.size).toBe(6);
  });
});

