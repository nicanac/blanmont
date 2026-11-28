/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PointageExpressClient from '@/app/admin/pointage-express/PointageExpressClient';
import type { CalendarEvent, Member } from '@/app/types';
import type { PollRespondent } from '@/app/lib/poll-attendance';
import { toast } from 'sonner';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('sonner', () => ({
  toast: { loading: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
// "Today" is the Saturday ride.
vi.mock('@/app/utils/date', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/utils/date')>()),
  getTodayIso: () => '2026-11-28',
}));

const ride = (id: string, isoDate: string): CalendarEvent =>
  ({ id, isoDate, location: 'Blanmont', departure: '8h30', distances: '', address: '', remarks: '', alternative: '', group: '' }) as CalendarEvent;
const member = (id: string, name: string, preferredGroup: Member['preferredGroup'] = 'B'): Member =>
  ({ id, name, role: ['Membre'], bio: '', photoUrl: '', preferredGroup }) as Member;
const respondent = (memberId: string, name: string, group: PollRespondent['group'] = 'A'): PollRespondent => ({
  memberId,
  name,
  group,
  slotsLabel: 'Samedi matin',
});

const EVENTS = [ride('sat', '2026-11-28'), ride('next-sat', '2026-12-05')];
const MEMBERS = [member('ana', 'Ana Velo'), member('bob', 'Bob Sprint'), member('dan', 'Dan Plat')];
const RESPONDENTS = {
  sat: [respondent('ana', 'Ana Velo'), respondent('bob', 'Bob Sprint', 'C')],
  'next-sat': [respondent('dan', 'Dan Plat')],
};

/** fetch stub: the prefill answer ticks ana and bob; other calls succeed. */
function stubFetch() {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    if (body.action === 'prefill-poll') {
      const added = [
        { memberId: 'ana', name: 'Ana Velo', group: 'A', markedAt: 'now' },
        { memberId: 'bob', name: 'Bob Sprint', group: 'C', markedAt: 'now' },
      ];
      return Response.json({
        success: true,
        added,
        prefilled: ['ana', 'bob'],
        members: Object.fromEntries(added.map((m) => [m.memberId, m])),
      });
    }
    if (body.action === 'undo-prefill') {
      return Response.json({ success: true, removed: body.memberIds, prefilled: [] });
    }
    return Response.json({ success: true });
  });
  global.fetch = fetchMock as any;
  return fetchMock;
}

const bodies = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map(([, init]) => JSON.parse(String((init as RequestInit).body)));

const rowOf = (name: string) => screen.getByText(name).closest('div.flex.items-center.justify-between') as HTMLElement;

describe('Pointage Express: weekend poll respondents start ticked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = new URL('https://blanmont.be/admin/pointage-express');
  });

  it("ticks the respondents on the ride's day, once, and offers to undo", async () => {
    const fetchMock = stubFetch();
    render(
      <PointageExpressClient
        initialEvents={EVENTS}
        members={MEMBERS}
        initialAttendanceMap={{}}
        pollRespondents={RESPONDENTS}
      />
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(bodies(fetchMock)[0]).toEqual({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true });
    await waitFor(() => expect(screen.getByText('Pointés (2)')).toBeInTheDocument());
    expect(within(rowOf('Ana Velo')).getByText('Sondage')).toBeInTheDocument();
    expect(within(rowOf('Dan Plat')).queryByText('Sondage')).not.toBeInTheDocument();

    // The toast carries an "Annuler" that unticks what the poll ticked.
    const [message, options] = vi.mocked(toast.success).mock.calls[0] as [string, any];
    expect(message).toMatch(/2 répondants du sondage pré-cochés/);
    options.action.onClick();
    await waitFor(() => expect(bodies(fetchMock)[1]).toEqual({ eventId: 'sat', action: 'undo-prefill', memberIds: ['ana', 'bob'] }));
    await waitFor(() => expect(screen.getByText('Pointés (0)')).toBeInTheDocument());
    // No second automatic pre-check after the undo.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not pre-check a ride the poll already pre-checked', async () => {
    const fetchMock = stubFetch();
    render(
      <PointageExpressClient
        initialEvents={EVENTS}
        members={MEMBERS}
        initialAttendanceMap={{ sat: { bob: { name: 'Bob Sprint', group: 'C', markedAt: 'x' } } }}
        pollRespondents={RESPONDENTS}
        initialPollPrefilled={{ sat: ['ana', 'bob'] }}
      />
    );

    // ana was unticked by the captain: no button, no automatic tick.
    expect(await screen.findByText(/Décochez les absents/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cocher/ })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ticks late respondents with the button', async () => {
    const fetchMock = stubFetch();
    render(
      <PointageExpressClient
        initialEvents={EVENTS}
        members={MEMBERS}
        initialAttendanceMap={{ sat: { ana: { name: 'Ana Velo', group: 'A', markedAt: 'x' } } }}
        pollRespondents={RESPONDENTS}
        initialPollPrefilled={{ sat: ['ana'] }}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cocher le répondant' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(bodies(fetchMock)[0]).toEqual({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: false });
  });

  it('only announces the respondents of an upcoming ride', async () => {
    const fetchMock = stubFetch();
    window.location.search = '?eventId=next-sat';
    render(
      <PointageExpressClient
        initialEvents={EVENTS}
        members={MEMBERS}
        initialAttendanceMap={{ sat: { ana: { name: 'Ana Velo', group: 'A', markedAt: 'x' } } }}
        pollRespondents={RESPONDENTS}
        initialPollPrefilled={{ sat: ['ana', 'bob'] }}
      />
    );

    expect(await screen.findByText(/Ils seront pré-cochés le jour de la sortie/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cocher/ })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    // The "Sondage" filter lists that ride's respondents.
    fireEvent.click(screen.getByRole('button', { name: 'Sondage (1)' }));
    expect(screen.getByText('Dan Plat')).toBeInTheDocument();
    expect(screen.queryByText('Ana Velo')).not.toBeInTheDocument();
  });

  it('keeps the other ticks when one tick fails', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'));
      return body.memberId === 'dan' ? new Response('down', { status: 500 }) : Response.json({ success: true });
    });
    global.fetch = fetchMock as any;
    render(
      <PointageExpressClient
        initialEvents={EVENTS}
        members={MEMBERS}
        initialAttendanceMap={{ sat: { ana: { name: 'Ana Velo', group: 'A', markedAt: 'x' } } }}
        initialPollPrefilled={{ sat: ['ana'] }}
      />
    );

    fireEvent.click(within(rowOf('Bob Sprint')).getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getByText('Pointés (2)')).toBeInTheDocument());
    fireEvent.click(within(rowOf('Dan Plat')).getAllByRole('button')[0]);
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    // Only Dan's tick is rolled back.
    await waitFor(() => expect(screen.getByText('Pointés (2)')).toBeInTheDocument());
  });
});
