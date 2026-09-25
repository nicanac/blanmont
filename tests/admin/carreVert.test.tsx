/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CarreVertView from '@/app/admin/carre-vert/components/CarreVertView';
import CarreVertHeader from '@/app/admin/carre-vert/components/CarreVertHeader';
import SyncCarreVertButton from '@/app/admin/carre-vert/components/SyncCarreVertButton';
import { toast } from 'sonner';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock tours
vi.mock('@/app/admin/components/tours/adminTours', () => ({
  useAdminTours: () => ({
    startCarreVertTour: vi.fn(),
  }),
}));

const mockEvents = [
  {
    id: 'evt-1',
    title: 'Sortie Gembloux',
    location: 'Gembloux',
    isoDate: '2026-09-20',
    departure: '8h30',
    distances: '60',
    type: 'weekend',
  },
  {
    id: 'evt-2',
    title: 'Sortie Blanmont',
    location: 'Blanmont',
    isoDate: '2026-09-30',
    departure: '9h00',
    distances: '75',
    type: 'weekend',
  },
] as any[];

const mockMembers = [
  {
    id: 'mem-1',
    name: 'Benoît Michels',
    group: 'V',
    carres: 5,
  },
  {
    id: 'mem-2',
    name: 'Pascal Jacquemin',
    group: 'V',
    carres: 4,
  },
  {
    id: 'mem-3',
    name: 'Adrien Delforge',
    group: 'B',
    carres: 3,
  },
] as any[];

const mockAttendanceMap = {
  'evt-1': {
    'mem-1': { name: 'Benoît Michels', group: 'V', markedAt: '2026-09-20T09:00:00Z' },
  },
  'evt-2': {},
};

describe('Carré Vert Admin Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CarreVertHeader', () => {
    it('renders title, cartouche legend facts, and consolidated header actions', () => {
      render(<CarreVertHeader eventCount={2} memberCount={3} />);

      // Title & badge
      expect(screen.getByText('Carré Vert')).toBeInTheDocument();
      expect(screen.getByText("Challenge d'Assiduité")).toBeInTheDocument();

      // Topographic cartouche legend facts
      expect(screen.getByText('Challenge Club 2026')).toBeInTheDocument();
      expect(screen.getByText('Google Sheets & Cron')).toBeInTheDocument();
      expect(screen.getByText('3 membres')).toBeInTheDocument();

      // Tour anchor button
      const syncBtn = document.getElementById('carre-vert-sync-btn');
      expect(syncBtn).toBeInTheDocument();
      expect(syncBtn).toHaveTextContent(/synchroniser/i);

      // Pointage Express Mobile link
      const expressLink = screen.getByRole('link', { name: /pointage express mobile/i });
      expect(expressLink).toBeInTheDocument();
      expect(expressLink).toHaveAttribute('href', '/admin/pointage-express');

      // Tutorial guide button
      expect(screen.getByRole('button', { name: /guide/i })).toBeInTheDocument();
    });
  });

  describe('SyncCarreVertButton', () => {
    it('calls API and triggers toast on sync', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          stats: { eventsProcessed: 12, membersUpdated: 45 },
        }),
      } as any);

      render(<SyncCarreVertButton />);

      const button = screen.getByRole('button', { name: /synchroniser/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admin/import-csv');
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('12 sorties traitées, 45 membres mis à jour')
        );
      });
    });
  });

  describe('CarreVertView', () => {
    it('does NOT contain the duplicate sync banner and renders the 2-column layout', () => {
      render(
        <CarreVertView
          events={mockEvents}
          members={mockMembers}
          attendanceMap={mockAttendanceMap}
        />
      );

      // Verify absence of duplicate sync banner
      expect(screen.queryByText('Synchroniser depuis Google Sheets')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Synchronise automatiquement les présences et recalcule les Carrés Verts/i)
      ).not.toBeInTheDocument();

      // Left panel elements
      expect(screen.getByPlaceholderText(/rechercher un lieu ou une date/i)).toBeInTheDocument();
      expect(screen.getByText('Passés')).toBeInTheDocument();
      expect(screen.getByText('À venir')).toBeInTheDocument();
      expect(screen.getByText('Tous')).toBeInTheDocument();

      // Initial empty right panel message
      expect(
        screen.getByText(/Sélectionnez un événement pour gérer les présences/i)
      ).toBeInTheDocument();
    });

    it('displays event details and attendance panel when an event is clicked', () => {
      render(
        <CarreVertView
          events={mockEvents}
          members={mockMembers}
          attendanceMap={mockAttendanceMap}
        />
      );

      // Switch to 'Tous' to see both events
      fireEvent.click(screen.getByText('Tous'));

      // Click on Gembloux
      const gemblouxBtn = screen.getByRole('button', { name: /gembloux/i });
      fireEvent.click(gemblouxBtn);

      // Attendance panel should now show Gembloux details
      expect(screen.getByRole('heading', { name: 'Gembloux' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/rechercher un membre/i)).toBeInTheDocument();
      expect(screen.getByText('Benoît Michels')).toBeInTheDocument();
      expect(screen.getByText('Pascal Jacquemin')).toBeInTheDocument();
    });

    it('filters events by search query', () => {
      render(
        <CarreVertView
          events={mockEvents}
          members={mockMembers}
          attendanceMap={mockAttendanceMap}
        />
      );

      fireEvent.click(screen.getByText('Tous'));
      expect(screen.getByRole('button', { name: /gembloux/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /blanmont/i })).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/rechercher un lieu ou une date/i);
      fireEvent.change(searchInput, { target: { value: 'Gembloux' } });

      expect(screen.getByRole('button', { name: /gembloux/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /blanmont/i })).not.toBeInTheDocument();
    });
  });
});
