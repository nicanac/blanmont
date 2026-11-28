import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getAllWeekendPolls, getPollResponses } = vi.hoisted(() => ({
  getAllWeekendPolls: vi.fn(),
  getPollResponses: vi.fn(),
}));
vi.mock('@/app/lib/firebase/polls', () => ({ getAllWeekendPolls, getPollResponses }));

import { pollRespondentsByEvent, pollRespondentsForRide } from '@/app/lib/poll-attendance-loader';

const answer = (memberId: string, slots: string[]) => ({
  id: memberId,
  pollId: 'x',
  memberId,
  memberName: memberId,
  slots,
  updatedAt: '',
});

describe('poll respondents of the rides (server)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllWeekendPolls.mockResolvedValue([
      { id: 'p-dec', weekendIsoDate: '2026-12-05', status: 'active' },
      { id: 'p-nov', weekendIsoDate: '2026-11-28', status: 'closed' },
      { id: 'p-old', weekendIsoDate: '2026-10-03', status: 'closed' },
    ]);
    getPollResponses.mockImplementation(async (id: string) =>
      id === 'p-nov'
        ? [answer('ana', ['samedi-matin']), answer('bob', ['dimanche-matin'])]
        : [answer('dan', ['samedi-matin'])]
    );
  });

  it('reads the respondents of a Saturday and a Sunday ride from their weekend poll', async () => {
    expect((await pollRespondentsForRide('2026-11-28')).map((r) => r.memberId)).toEqual(['ana']);
    expect((await pollRespondentsForRide('2026-11-29')).map((r) => r.memberId)).toEqual(['bob']);
    expect(await pollRespondentsForRide('2026-11-25')).toEqual([]);
    expect(await pollRespondentsForRide('2026-11-21')).toEqual([]); // weekend without poll
  });

  it('loads each poll once for the rides around today, and none for older rides', async () => {
    const byEvent = await pollRespondentsByEvent(
      [
        { id: 'sat', isoDate: '2026-11-28' },
        { id: 'sun', isoDate: '2026-11-29' },
        { id: 'wed', isoDate: '2026-12-02' },
        { id: 'next', isoDate: '2026-12-05' },
        { id: 'old', isoDate: '2026-10-03' },
      ],
      '2026-11-28'
    );

    expect(Object.fromEntries(Object.entries(byEvent).map(([id, r]) => [id, r.map((x) => x.memberId)]))).toEqual({
      sat: ['ana'],
      sun: ['bob'],
      next: ['dan'],
    });
    expect(getAllWeekendPolls).toHaveBeenCalledTimes(1);
    expect(getPollResponses.mock.calls.map(([id]) => id).sort()).toEqual(['p-dec', 'p-nov']);
  });
});
