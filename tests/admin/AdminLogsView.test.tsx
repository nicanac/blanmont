/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogsHeader from '@/app/admin/logs/components/LogsHeader';
import LogsTable from '@/app/admin/logs/components/LogsTable';
import { ActivityLog, ActivityStats } from '@/app/types/logging';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockStats: ActivityStats = {
  total: 54,
  byCategory: { auth: 12, navigation: 25, participation: 10, admin: 5, security: 2 },
  bySeverity: { info: 48, warn: 4, error: 1, security: 1 },
  uniqueVisitors: 19,
  activeMembers: 14,
  adminActionsCount: 5,
  securityAlertsCount: 2,
};

const mockLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-08T10:15:00Z',
    timestampMs: new Date('2026-10-08T10:15:00Z').getTime(),
    yearMonth: '2026-10',
    category: 'auth',
    action: 'auth:login_success',
    title: 'Connexion réussie : Laurent Vanbelle',
    severity: 'info',
    user: {
      isAuthenticated: true,
      userId: 'mem-1',
      userName: 'Laurent Vanbelle',
      userEmail: 'laurent@blanmont.be',
      role: ['Member'],
    },
    context: {
      path: '/login',
      ip: '194.154.20.xxx',
      deviceType: 'desktop',
    },
    metadata: { memberId: 'mem-1' },
  },
  {
    id: 'log-2',
    timestamp: '2026-10-08T09:30:00Z',
    timestampMs: new Date('2026-10-08T09:30:00Z').getTime(),
    yearMonth: '2026-10',
    category: 'navigation',
    action: 'traces:gpx_download',
    title: 'Téléchargement GPX : Boucle Méhaigne',
    severity: 'info',
    user: {
      isAuthenticated: false,
      userName: 'Visiteur anonyme',
      visitorId: 'anon_12345',
    },
    context: {
      path: '/traces/trace_mehaigne',
      ip: '81.240.12.xxx',
      deviceType: 'mobile',
    },
    metadata: { traceName: 'Boucle Méhaigne' },
  },
];

describe('Admin Logs View Components', () => {
  it('renders LogsHeader with Carte IGN cartouche, legend facts, and action buttons', () => {
    const onExportCsv = vi.fn();
    const onOpenPurge = vi.fn();

    render(
      <LogsHeader
        stats={mockStats}
        onExportCsv={onExportCsv}
        onOpenPurge={onOpenPurge}
      />
    );

    // Title and badge
    expect(screen.getByText("Journal d'Activité & Audit")).toBeInTheDocument();
    expect(screen.getByText('Observabilité')).toBeInTheDocument();

    // Legend stats
    expect(screen.getByText('54 événements')).toBeInTheDocument();
    expect(screen.getByText('19 distincts')).toBeInTheDocument();
    expect(screen.getByText('14 cyclos')).toBeInTheDocument();
    expect(screen.getByText('2 alertes')).toBeInTheDocument();

    // Action buttons
    const exportBtn = screen.getByRole('button', { name: /exporter csv/i });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
    expect(onExportCsv).toHaveBeenCalledTimes(1);

    const purgeBtn = screen.getByRole('button', { name: /purger/i });
    expect(purgeBtn).toBeInTheDocument();
    fireEvent.click(purgeBtn);
    expect(onOpenPurge).toHaveBeenCalledTimes(1);
  });

  it('opens tutorial modal when clicking Guide button in header', () => {
    render(
      <LogsHeader
        stats={mockStats}
        onExportCsv={vi.fn()}
        onOpenPurge={vi.fn()}
      />
    );

    const guideBtn = screen.getByRole('button', { name: /guide/i });
    fireEvent.click(guideBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Guide du Journal d'Activité/i)).toBeInTheDocument();
  });

  it('renders LogsTable rows and filters entries when typing in search input', () => {
    render(
      <LogsTable
        logs={mockLogs}
        isLoading={false}
        isLive={true}
        onToggleLive={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    // Rows should be present
    expect(screen.getByText('Connexion réussie : Laurent Vanbelle')).toBeInTheDocument();
    expect(screen.getByText('Téléchargement GPX : Boucle Méhaigne')).toBeInTheDocument();

    // Type in search bar to filter
    const searchInput = screen.getByPlaceholderText(/rechercher par action/i);
    fireEvent.change(searchInput, { target: { value: 'Méhaigne' } });

    // Laurent should be filtered out, Boucle Méhaigne remains
    expect(screen.queryByText('Connexion réussie : Laurent Vanbelle')).not.toBeInTheDocument();
    expect(screen.getByText('Téléchargement GPX : Boucle Méhaigne')).toBeInTheDocument();
  });

  it('opens LogDetailModal when clicking Détail button on a log row', () => {
    render(
      <LogsTable
        logs={mockLogs}
        isLoading={false}
        isLive={true}
        onToggleLive={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    const detailButtons = screen.getAllByRole('button', { name: /détail/i });
    fireEvent.click(detailButtons[0]);

    // Detail modal dialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Identité Utilisateur')).toBeInTheDocument();
    expect(screen.getByText('Contexte Réseau & Appareil')).toBeInTheDocument();
    expect(screen.getByText('194.154.20.xxx')).toBeInTheDocument();
  });
});
