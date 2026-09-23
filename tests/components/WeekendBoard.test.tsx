/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WeekendBoard from '@/app/components/home/WeekendBoard';
import type { WeekendPoll } from '@/app/types';
import type { PollTally } from '@/app/components/home/homeData';

const samplePoll: WeekendPoll = {
  id: 'poll-123',
  title: 'Sortie du week-end · 26 septembre (Blanmont)',
  weekendIsoDate: '2026-09-26',
  status: 'active',
  createdAt: '2026-09-21T08:00:00Z',
  createdBy: 'admin',
};

const sampleTally: PollTally = {
  total: 5,
  saturday: 4,
  sunday: 2,
  both: 1,
  absent: 0,
  riders: 5,
  byGroup: {
    A: 2,
    B: 2,
    C: 1,
    VTT: 0,
  },
};

describe('WeekendBoard Component (app/components/home/WeekendBoard.tsx)', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders open poll banner, title, and call-to-actions', () => {
    render(<WeekendBoard poll={samplePoll} tally={sampleTally} />);

    expect(screen.getByText('Sondage ouvert')).toBeInTheDocument();
    expect(screen.getByText('Week-end du 26 septembre')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Qui roule ce week-end/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Répondre au sondage/i })).toHaveAttribute(
      'href',
      '/sondage'
    );
    expect(screen.getByRole('link', { name: /Calendrier de la saison/i })).toHaveAttribute(
      'href',
      '/calendrier'
    );
  });

  it('renders attendance tally breakdown for days and groups', () => {
    render(<WeekendBoard poll={samplePoll} tally={sampleTally} />);

    expect(screen.getByText('Relevé des présences')).toBeInTheDocument();
    expect(screen.getByText('Samedi')).toBeInTheDocument();
    expect(screen.getByText('Dimanche')).toBeInTheDocument();
    expect(screen.getByText(/5 cyclistes annoncés/i)).toBeInTheDocument();
    expect(screen.getByText(/dont 1 les deux jours/i)).toBeInTheDocument();

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('VTT')).toBeInTheDocument();
  });

  it('renders empty state message when no riders responded yet', () => {
    const emptyTally: PollTally = {
      total: 0,
      saturday: 0,
      sunday: 0,
      both: 0,
      absent: 0,
      riders: 0,
      byGroup: { A: 0, B: 0, C: 0, VTT: 0 },
    };

    render(<WeekendBoard poll={samplePoll} tally={emptyTally} />);

    expect(
      screen.getByText(/Aucune réponse pour l'instant/i)
    ).toBeInTheDocument();
  });
});
