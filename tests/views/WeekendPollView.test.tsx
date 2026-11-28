/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeekendPollView from '@/app/features/sondage/components/WeekendPollView';
import type { WeekendPoll, PollResponse, Member } from '@/app/types';
import { GroupLabelsProvider } from '@/app/context/GroupLabelsContext';
import { submitWeekendPollResponseAction, deleteWeekendPollResponseAction } from '@/app/actions';

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

// Leaflet is client-only: the trace map is replaced by a probe.
vi.mock('next/dynamic', () => ({
  default: () =>
    function MapProbe() {
      return <div data-testid="trace-map" />;
    },
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

    expect(screen.getByText(/Aucun sondage actif pour le moment/)).toBeDefined();
    expect(screen.getByText('Consulter le calendrier des sorties')).toBeDefined();
  });

  it('renders slot tally and participants when poll is active', () => {
    const { container } = render(
      <WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />
    );

    // The tally is the cartouche legend. Legacy dayChoice answers are read as slots:
    // samedi + les-deux → 2 on Saturday morning, dimanche + les-deux → 2 on Sunday.
    const legend = container.querySelector('header dl') as HTMLElement;
    for (const label of ['Samedi matin', 'Samedi après-midi', 'Dimanche matin', 'Absents']) {
      expect(within(legend).getByText(label)).toBeDefined();
    }
    expect(within(legend).getAllByText('2 membres').length).toBe(2);
    expect(within(legend).getByText('0 membre')).toBeDefined();
    expect(within(legend).getByText('1 membre')).toBeDefined();

    // Group breakdown sits in the cartouche legend column, under the slot tally.
    const breakdown = container.querySelector('header section[aria-labelledby="sondage-groupes"]');
    expect(breakdown?.textContent).toContain('Répartition par Groupe de niveau');
    expect(screen.getByText(/Liste des participants/i)).toBeDefined();
    expect(screen.getByText('Nicolas Bruyère')).toBeDefined();
    expect(screen.getByText('Samedi matin + Dimanche matin')).toBeDefined();
  });

  it('prints the weekend trace in the legend column, under the group breakdown (#244)', () => {
    const { container } = render(
      <WeekendPollView
        poll={mockPoll}
        responses={mockResponses}
        members={mockMembers}
        traces={[
          {
            eventId: 'evt-thyle',
            isoDate: '2026-09-26',
            url: 'https://connect.garmin.com/app/course/532374522',
            route: {
              name: 'Boucle de la Thyle',
              distanceKm: 72.4,
              elevationM: 610,
              polyline: 'abc',
            },
          },
        ]}
      />
    );

    const traces = container.querySelector(
      'header section[aria-labelledby="sondage-traces"]'
    ) as HTMLElement;
    expect(traces).not.toBeNull();
    // Same legend column as the group breakdown, printed after it.
    const breakdown = container.querySelector('header section[aria-labelledby="sondage-groupes"]')!;
    expect(
      breakdown.compareDocumentPosition(traces) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(within(traces).getByText('Boucle de la Thyle')).toBeDefined();
    expect(within(traces).getByTestId('trace-map')).toBeDefined();
    // Same GPX download as the home page (#259).
    expect(
      within(traces)
        .getByRole('link', { name: /Télécharger la trace GPX/ })
        .getAttribute('href')
    ).toBe('/api/trace/evt-thyle');
  });

  it('prints no trace block when the calendar has no trace for the weekend', () => {
    const { container } = render(
      <WeekendPollView
        poll={mockPoll}
        responses={mockResponses}
        members={mockMembers}
        traces={[]}
      />
    );
    expect(container.querySelector('section[aria-labelledby="sondage-traces"]')).toBeNull();
  });

  it('renders login required prompt for unauthenticated users', () => {
    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    // The sheet header carries the poll even before login.
    expect(screen.getByRole('heading', { level: 1, name: 'Votre week-end à vélo' })).toBeDefined();
    expect(screen.getByText(mockPoll.title)).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Se connecter pour répondre' }).getAttribute('href')
    ).toBe('/login?redirect=/sondage');
    expect(screen.queryAllByRole('checkbox').length).toBe(0);
  });

  it('shows the quick vote card with slots, groups and no submit button', () => {
    mockAuthState = {
      user: { id: 'm99', name: 'Nouveau Membre', avatarUrl: '' },
      isAuthenticated: true,
    };

    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Votre week-end à vélo' })).toBeDefined();
    for (const name of [
      'Samedi matin',
      'Samedi après-midi',
      'Dimanche matin',
      'Absent ce week-end',
    ]) {
      expect(screen.getByRole('checkbox', { name: new RegExp(name) })).toBeDefined();
    }
    expect(screen.getAllByRole('radio').length).toBe(6);
    expect(screen.queryByRole('button', { name: /Confirmer/i })).toBeNull();
  });

  it('names GR2+ / GR2− after the admin group names', () => {
    mockAuthState = {
      user: { id: 'm99', name: 'Nouveau Membre', avatarUrl: '' },
      isAuthenticated: true,
    };

    render(
      <GroupLabelsProvider
        initialSettings={{
          groups: [
            { code: 'A', label: 'GR1', aliases: ['A-'] },
            { code: 'B', label: 'GR2' },
            { code: 'BC', label: 'GR3' },
            { code: 'C', label: 'GR4' },
            { code: 'VTT', label: 'VTT' },
          ],
        }}
      >
        <WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />
      </GroupLabelsProvider>
    );

    const titles = screen
      .getAllByRole('radio')
      .map((radio) => radio.closest('label')?.querySelector('span span')?.textContent);
    expect(titles).toEqual(['GR1 · 1 membre', 'GR2+', 'GR2−', 'GR3', 'GR4', 'VTT']);
    expect(screen.getByText('25–28 km/h · même parcours que GR1')).toBeDefined();
  });

  it('auto-saves once a slot and a group are picked', async () => {
    mockAuthState = {
      user: { id: 'm99', name: 'Nouveau Membre', avatarUrl: '' },
      isAuthenticated: true,
    };
    window.localStorage.clear();

    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    fireEvent.click(screen.getByRole('checkbox', { name: /Samedi matin/ }));
    expect(submitWeekendPollResponseAction).not.toHaveBeenCalled();
    expect(screen.getByText('Choisissez votre groupe pour enregistrer.')).toBeDefined();

    fireEvent.click(screen.getByRole('radio', { name: /parcours plus court/ }));
    await waitFor(() =>
      expect(submitWeekendPollResponseAction).toHaveBeenCalledWith(
        expect.objectContaining({
          slots: ['samedi-matin'],
          groupChoice: 'Groupe B',
          groupVariant: 'moins',
        })
      )
    );
    expect(window.localStorage.getItem('blanmont:sondage-group')).toBe('B-');
  });

  it('prefills an existing answer and withdraws it when every slot is unticked', async () => {
    mockAuthState = {
      user: { id: 'm1', name: 'Nicolas Bruyère', avatarUrl: '' },
      isAuthenticated: true,
    };

    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    const saturday = screen.getByRole('checkbox', { name: /Samedi matin/ }) as HTMLInputElement;
    expect(saturday.checked).toBe(true);
    expect(screen.getByText('Samedi matin enregistré · modifiable à tout moment')).toBeDefined();

    fireEvent.click(saturday);
    await waitFor(() =>
      expect(deleteWeekendPollResponseAction).toHaveBeenCalledWith('poll-123', 'm1')
    );
  });

  it('filters participants by slot', () => {
    render(<WeekendPollView poll={mockPoll} responses={mockResponses} members={mockMembers} />);

    fireEvent.change(screen.getByLabelText(/Filtrer par créneau/i), {
      target: { value: 'dimanche-matin' },
    });

    // Laurent voted dimanche, Alain les-deux (includes Sunday morning)
    expect(screen.getByText('Laurent Cycliste')).toBeDefined();
    expect(screen.getByText('Alain D')).toBeDefined();
    expect(screen.queryByText('Nicolas Bruyère')).toBeNull();
  });
});
