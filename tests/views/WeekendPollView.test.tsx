/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeekendPollView from '@/app/features/sondage/components/WeekendPollView';
import type { WeekendPoll, PollResponse, Member } from '@/app/types';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock AuthContext
let mockAuthState = {
  user: null as any,
  isAuthenticated: false,
};

vi.mock('@/app/context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

// Mock server actions
vi.mock('@/app/actions', () => ({
  submitWeekendPollResponseAction: vi.fn(),
  deleteWeekendPollResponseAction: vi.fn(),
}));

const mockPoll: WeekendPoll = {
  id: 'poll-123',
  title: 'Sorties du week-end du 26-27 Septembre',
  description: 'Votez pour vos disponibilités et vos groupes préférés.',
  startDate: '2026-09-26',
  endDate: '2026-09-27',
  status: 'open',
  createdAt: '2026-09-22T10:00:00Z',
};

const mockResponses: PollResponse[] = [
  {
    id: 'res-1',
    pollId: 'poll-123',
    memberId: 'm1',
    memberName: 'Nicolas Bruyère',
    dayChoice: 'samedi',
    groupChoice: 'Groupe A',
    comment: 'Départ 8h30 à la Place.',
    createdAt: '2026-09-23T12:00:00Z',
  },
  {
    id: 'res-2',
    pollId: 'poll-123',
    memberId: 'm2',
    memberName: 'Laurent Cycliste',
    dayChoice: 'dimanche',
    groupChoice: 'Groupe B',
    createdAt: '2026-09-23T13:00:00Z',
  },
  {
    id: 'res-3',
    pollId: 'poll-123',
    memberId: 'm3',
    memberName: 'Alain D',
    dayChoice: 'les-deux',
    groupChoice: 'Groupe B',
    createdAt: '2026-09-23T14:00:00Z',
  },
  {
    id: 'res-4',
    pollId: 'poll-123',
    memberId: 'm4',
    memberName: 'Bernard C',
    dayChoice: 'absent',
    groupChoice: 'Autre',
    createdAt: '2026-09-23T15:00:00Z',
  },
];

const mockMembers: Member[] = [
  { id: 'm1', name: 'Nicolas Bruyère', email: 'nicolas@blanmont.be' } as any,
  { id: 'm2', name: 'Laurent Cycliste', email: 'laurent@blanmont.be' } as any,
];

describe('WeekendPollView Component (app/features/sondage/components/WeekendPollView.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: null,
      isAuthenticated: false,
    };
  });

  it('renders empty state when no poll is active', () => {
    render(<WeekendPollView poll={null} responses={[]} members={[]} />);

    expect(screen.getByText('Aucun sondage actif pour le moment')).toBeDefined();
    expect(screen.getByText('Consulter le calendrier des sorties')).toBeDefined();
  });

  it('renders poll stats tally and participants when poll is active', () => {
    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    // Tally metrics
    const tallySection = screen.getByLabelText('Télémétrie des pelotons');
    expect(within(tallySection).getByText('Samedi matin')).toBeDefined();
    expect(within(tallySection).getByText('Dimanche matin')).toBeDefined();
    expect(within(tallySection).getByText('Les 2 jours')).toBeDefined();
    expect(within(tallySection).getByText('Absents')).toBeDefined();

    // Group breakdown
    expect(screen.getByText('Répartition par Groupe de niveau')).toBeDefined();

    // Participants list
    expect(screen.getByText(/Liste des participants/i)).toBeDefined();
    expect(screen.getByText('Nicolas Bruyère')).toBeDefined();
    expect(screen.getByText('Laurent Cycliste')).toBeDefined();
    expect(screen.getByText('Alain D')).toBeDefined();
  });

  it('renders login required prompt for unauthenticated users', () => {
    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    expect(screen.getByText('Connexion requise')).toBeDefined();
    expect(screen.getByText('Se connecter pour répondre')).toBeDefined();
  });

  it('renders voting form for authenticated user who has not voted yet', () => {
    mockAuthState = {
      user: { id: 'm99', name: 'Nouveau Membre', avatarUrl: '' },
      isAuthenticated: true,
    };

    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    expect(screen.getByText('Votre réponse au sondage')).toBeDefined();
    expect(screen.getByText('Connecté en tant que')).toBeDefined();
    expect(screen.getByText('1. Quel(s) jour(s) roulez-vous ce week-end ? *')).toBeDefined();
    expect(screen.getByText('2. Dans quel groupe souhaitez-vous rouler ? *')).toBeDefined();
    expect(screen.getByRole('button', { name: /Confirmer ma participation/i })).toBeDefined();
  });

  it('renders summary card when logged-in user has already voted, and toggles edit mode', () => {
    mockAuthState = {
      user: { id: 'm1', name: 'Nicolas Bruyère', avatarUrl: '' },
      isAuthenticated: true,
    };

    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    // Summary card shown
    expect(screen.getByText('Votre participation est confirmée')).toBeDefined();
    expect(screen.getByText('Annuler ma participation')).toBeDefined();

    // Click modifier
    const editBtn = screen.getByRole('button', { name: /Modifier mon choix/i });
    fireEvent.click(editBtn);

    // Form now visible
    expect(screen.getByText('Modifier votre réponse')).toBeDefined();
    expect(screen.getByRole('button', { name: /Mettre à jour ma réponse/i })).toBeDefined();
  });

  it('filters participants list by day choice and group choice', () => {
    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    const daySelect = screen.getByLabelText(/Filtrer par jour/i);
    fireEvent.change(daySelect, { target: { value: 'dimanche' } });

    // Laurent Cycliste voted dimanche, Alain D voted les-deux (includes dimanche)
    expect(screen.getByText('Laurent Cycliste')).toBeDefined();
    expect(screen.getByText('Alain D')).toBeDefined();
    expect(screen.queryByText('Nicolas Bruyère')).toBeNull(); // Saturday only
  });
});
