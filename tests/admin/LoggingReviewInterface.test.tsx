/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLogsPage from '@/app/admin/logs/page';
import ReviewTriageTab from '@/app/admin/logs/components/ReviewTriageTab';
import ReviewAnalyticsTab from '@/app/admin/logs/components/ReviewAnalyticsTab';
import UserJourneyExplorerTab from '@/app/admin/logs/components/UserJourneyExplorerTab';
import AuditReportsTab from '@/app/admin/logs/components/AuditReportsTab';
import { ActivityLog } from '@/app/types/logging';

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockSampleLogs: ActivityLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-10-08T09:00:00Z',
    timestampMs: new Date('2026-10-08T09:00:00Z').getTime(),
    yearMonth: '2026-10',
    category: 'navigation',
    action: 'traces:gpx_download',
    title: 'Téléchargement GPX : Namur Citadelle',
    severity: 'info',
    user: {
      isAuthenticated: false,
      visitorId: 'anon_citadelle',
      userName: 'Visiteur anonyme',
    },
    context: {
      path: '/traces/namur-citadelle',
      ip: '194.154.20.xxx',
      deviceType: 'desktop',
    },
    metadata: { traceName: 'Namur Citadelle', distanceKm: 85 },
    review: { status: 'unreviewed' },
  },
  {
    id: 'log_2',
    timestamp: '2026-10-08T09:02:15Z',
    timestampMs: new Date('2026-10-08T09:02:15Z').getTime(),
    yearMonth: '2026-10',
    category: 'auth',
    action: 'auth:login_success',
    title: 'Connexion réussie',
    severity: 'info',
    user: {
      isAuthenticated: true,
      userId: 'm_laurent',
      userName: 'Laurent Cyclo',
      userEmail: 'laurent@blanmont.be',
      role: ['Member'],
    },
    context: {
      path: '/auth/login',
      ip: '81.240.10.xxx',
      deviceType: 'mobile',
    },
    review: { status: 'reviewed', reviewedBy: 'Admin Nicolas' },
  },
  {
    id: 'log_3',
    timestamp: '2026-10-08T09:05:00Z',
    timestampMs: new Date('2026-10-08T09:05:00Z').getTime(),
    yearMonth: '2026-10',
    category: 'security',
    action: 'security:unauthorized_admin_api',
    title: 'Tentative d’accès panneau sans privilèges',
    severity: 'security',
    user: {
      isAuthenticated: false,
      visitorId: 'intruder_1',
      userName: 'Visiteur anonyme',
    },
    context: {
      path: '/admin/settings',
      ip: '45.132.88.xxx',
      deviceType: 'desktop',
    },
    review: { status: 'flagged', notes: 'Attaque brute-force suspectée' },
  },
];

describe('Logging Review Interface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('stats=true')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              stats: {
                total: 3,
                byCategory: { navigation: 1, auth: 1, participation: 0, admin: 0, security: 1 },
                bySeverity: { info: 2, warn: 0, error: 0, security: 1 },
                byReviewStatus: { unreviewed: 1, reviewed: 1, flagged: 1 },
                uniqueVisitors: 2,
                activeMembers: 1,
                adminActionsCount: 0,
                securityAlertsCount: 1,
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ logs: mockSampleLogs }),
      });
    });
  });

  describe('AdminLogsPage Tab Navigation', () => {
    it('renders all 4 review tabs and defaults to Tri & Modération', async () => {
      render(<AdminLogsPage />);

      expect(screen.getByText('Tri & Modération')).toBeInTheDocument();
      expect(screen.getByText('Analyse & Chronologie')).toBeInTheDocument();
      expect(screen.getByText('Parcours de Session')).toBeInTheDocument();
      expect(screen.getByText('Rapports Comité')).toBeInTheDocument();

      // Default tab displays triage table
      await waitFor(() => {
        expect(screen.getByText('Téléchargement GPX : Namur Citadelle')).toBeInTheDocument();
      });
    });

    it('switches to Analyse & Chronologie tab on click', async () => {
      render(<AdminLogsPage />);

      const analyticsTabBtn = screen.getByText('Analyse & Chronologie');
      fireEvent.click(analyticsTabBtn);

      await waitFor(() => {
        expect(screen.getByText(/Fréquentation Quotidienne/i)).toBeInTheDocument();
        expect(screen.getByText(/Créneaux Horaires de Consultation/i)).toBeInTheDocument();
        expect(screen.getByText(/Répartition Week-end vs Semaine/i)).toBeInTheDocument();
      });
    });

    it('switches to Parcours de Session tab on click', async () => {
      render(<AdminLogsPage />);

      const journeysTabBtn = screen.getByText('Parcours de Session');
      fireEvent.click(journeysTabBtn);

      await waitFor(() => {
        expect(screen.getByText(/Laurent Cyclo/i)).toBeInTheDocument();
        expect(screen.getAllByText(/50°37′23″ N · 4°38′32″ E/i).length).toBeGreaterThan(0);
      });
    });

    it('switches to Rapports Comité tab on click', async () => {
      render(<AdminLogsPage />);

      const reportsTabBtn = screen.getByText('Rapports Comité');
      fireEvent.click(reportsTabBtn);

      await waitFor(() => {
        expect(screen.getByText(/Compte-Rendu d'Audit Officiel/i)).toBeInTheDocument();
        expect(screen.getByText(/Copier Markdown/i)).toBeInTheDocument();
      });
    });
  });

  describe('ReviewTriageTab Component', () => {
    it('filters logs by reviewStatus pill (À examiner, Examinés, Signalés)', () => {
      const onUpdateReview = vi.fn();
      const onBatchReview = vi.fn();

      render(
        <ReviewTriageTab
          logs={mockSampleLogs}
          isLoading={false}
          isLive={false}
          onToggleLive={vi.fn()}
          onRefresh={vi.fn()}
          onUpdateReview={onUpdateReview}
          onBatchReview={onBatchReview}
        />
      );

      // Initially shows all 3
      expect(screen.getByText('Téléchargement GPX : Namur Citadelle')).toBeInTheDocument();
      expect(screen.getByText('Connexion réussie')).toBeInTheDocument();
      expect(screen.getByText('Tentative d’accès panneau sans privilèges')).toBeInTheDocument();

      // Click "Examinés" pill
      const reviewedPill = screen.getByRole('button', { name: /Examinés/i });
      fireEvent.click(reviewedPill);

      expect(screen.queryByText('Téléchargement GPX : Namur Citadelle')).not.toBeInTheDocument();
      expect(screen.getByText('Connexion réussie')).toBeInTheDocument();

      // Click "Signalés" pill
      const flaggedPill = screen.getByRole('button', { name: /Signalés/i });
      fireEvent.click(flaggedPill);

      expect(screen.queryByText('Connexion réussie')).not.toBeInTheDocument();
      expect(screen.getByText('Tentative d’accès panneau sans privilèges')).toBeInTheDocument();
    });

    it('triggers quick review action button on row', () => {
      const onUpdateReview = vi.fn().mockResolvedValue(undefined);
      const onBatchReview = vi.fn();

      render(
        <ReviewTriageTab
          logs={mockSampleLogs}
          isLoading={false}
          isLive={false}
          onToggleLive={vi.fn()}
          onRefresh={vi.fn()}
          onUpdateReview={onUpdateReview}
          onBatchReview={onBatchReview}
        />
      );

      const checkButtons = screen.getAllByTitle('Marquer comme examiné');
      fireEvent.click(checkButtons[0]);

      expect(onUpdateReview).toHaveBeenCalledWith('log_1', 'reviewed');
    });

    it('handles batch selection and bulk status marking', async () => {
      const onUpdateReview = vi.fn();
      const onBatchReview = vi.fn().mockResolvedValue(undefined);

      render(
        <ReviewTriageTab
          logs={mockSampleLogs}
          isLoading={false}
          isLive={false}
          onToggleLive={vi.fn()}
          onRefresh={vi.fn()}
          onUpdateReview={onUpdateReview}
          onBatchReview={onBatchReview}
        />
      );

      // Click Select All checkbox
      const selectAllCheckbox = screen.getByLabelText('Sélectionner tout');
      fireEvent.click(selectAllCheckbox);

      // Bulk action bar appears
      expect(screen.getByText(/3 événement\(s\) sélectionné\(s\)/i)).toBeInTheDocument();

      const markAllReviewedBtn = screen.getByText('Marquer examinés');
      fireEvent.click(markAllReviewedBtn);

      expect(onBatchReview).toHaveBeenCalledWith(['log_1', 'log_2', 'log_3'], 'reviewed');
    });
  });

  describe('ReviewAnalyticsTab Component', () => {
    it('renders 14-day histogram, hourly distribution, and top GPX leaderboard', () => {
      render(<ReviewAnalyticsTab logs={mockSampleLogs} />);

      expect(screen.getByText(/Fréquentation Quotidienne/i)).toBeInTheDocument();
      expect(screen.getByText(/Matin \(06h - 12h\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Palmarès Traces & Téléchargements GPX/i)).toBeInTheDocument();
      expect(screen.getByText('Namur Citadelle')).toBeInTheDocument();
    });
  });

  describe('UserJourneyExplorerTab Component', () => {
    it('groups logs into user journeys and renders intent badges and vertical steps', () => {
      const onUpdateReview = vi.fn();

      render(
        <UserJourneyExplorerTab
          logs={mockSampleLogs}
          onUpdateReview={onUpdateReview}
        />
      );

      // Check intent badges rendered in sessions list
      expect(screen.getByText(/Téléchargeur GPX/i)).toBeInTheDocument();
      expect(screen.getByText(/Cyclo Membre/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Alerte Sécurité/i).length).toBeGreaterThan(0);

      // Timeline has coordinate cartouche
      expect(screen.getAllByText(/50°37′23″ N · 4°38′32″ E/).length).toBeGreaterThan(0);
      // Step indicator rendered
      expect(screen.getByText('Départ (0s)')).toBeInTheDocument();
    });
  });

  describe('AuditReportsTab Component', () => {
    it('renders period selection, KPI metrics, and allows copying markdown synthesis', () => {
      // Mock clipboard
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<AuditReportsTab logs={mockSampleLogs} />);

      // Period pills
      expect(screen.getByText('7 jours')).toBeInTheDocument();
      expect(screen.getByText('30 jours')).toBeInTheDocument();
      expect(screen.getByText('Trimestre (90j)')).toBeInTheDocument();

      // KPI metrics rendered
      expect(screen.getByText('Couverture de Modération du Journal')).toBeInTheDocument();

      // Copy Markdown button
      const copyBtn = screen.getByText('Copier Markdown');
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalled();
      expect(writeTextMock.mock.calls[0][0]).toContain('Synthèse du Comité — Journal d\'Activité & Audit');
    });
  });
});
