import { describe, it, expect } from 'vitest';
import {
  inPollPrefillWindow,
  pollGroupCode,
  pollPrefillCandidates,
  pollRespondentsForDay,
  pollWeekendFor,
  prefilledMemberIds,
} from '@/app/lib/poll-attendance';
import type { PollResponse } from '@/app/types';

const answer = (memberId: string, over: Partial<PollResponse> = {}): PollResponse => ({
  id: memberId,
  pollId: 'poll-1',
  memberId,
  memberName: memberId.toUpperCase(),
  updatedAt: '2026-11-25T10:00:00Z',
  ...over,
});

describe('poll respondents → Pointage Express', () => {
  it('finds the poll weekend of a ride: its Saturday', () => {
    expect(pollWeekendFor('2026-11-28')).toBe('2026-11-28'); // Saturday
    expect(pollWeekendFor('2026-11-29')).toBe('2026-11-28'); // Sunday
    expect(pollWeekendFor('2026-11-01')).toBe('2026-10-31'); // Sunday across a month end
    expect(pollWeekendFor('2026-11-25')).toBeNull(); // Wednesday: no poll
    expect(pollWeekendFor('not-a-date')).toBeNull();
  });

  it('reads the group answered in the poll', () => {
    expect(pollGroupCode({ groupChoice: 'Groupe BC' })).toBe('BC');
    expect(pollGroupCode({ groupChoice: 'Groupe A' })).toBe('A');
    expect(pollGroupCode({ groupChoice: 'Autre' })).toBeNull();
    expect(pollGroupCode({})).toBeNull();
  });

  it('keeps the members riding on the ride day: any Saturday slot, or Sunday morning', () => {
    const responses = [
      answer('zoe', { slots: ['samedi-matin'], groupChoice: 'Groupe A' }),
      answer('ana', { slots: ['samedi-apres-midi', 'dimanche-matin'], groupChoice: 'Groupe C' }),
      answer('bob', { slots: ['dimanche-matin'] }),
      answer('abs', { slots: [] }), // absent
      answer('old', { dayChoice: 'samedi' }), // answer saved before slots
    ];

    expect(pollRespondentsForDay(responses, '2026-11-28')).toEqual([
      { memberId: 'ana', name: 'ANA', group: 'C', slotsLabel: 'Samedi après-midi' },
      { memberId: 'old', name: 'OLD', group: null, slotsLabel: 'Samedi matin' },
      { memberId: 'zoe', name: 'ZOE', group: 'A', slotsLabel: 'Samedi matin' },
    ]);
    expect(pollRespondentsForDay(responses, '2026-11-29').map((r) => r.memberId)).toEqual(['ana', 'bob']);
    expect(pollRespondentsForDay(responses, '2026-11-25')).toEqual([]);
  });

  it('pre-checks only members not present and never pre-checked before', () => {
    const respondents = ['a', 'b', 'c', 'd'].map((memberId) => ({ memberId }));
    // b is already ticked; c was pre-checked then unticked by the captain: both stay as they are.
    expect(pollPrefillCandidates(respondents, new Set(['b']), ['c'])).toEqual(['a', 'd']);
    expect(pollPrefillCandidates(respondents, [], [])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('reads the members a pre-check ticked', () => {
    expect(prefilledMemberIds({ at: 'x', memberIds: { a: true, b: true } })).toEqual(['a', 'b']);
    expect(prefilledMemberIds({ at: 'x' })).toEqual([]);
    expect(prefilledMemberIds(null)).toEqual([]);
  });

  it('loads the polls of the rides from two weeks back to a week ahead', () => {
    expect(inPollPrefillWindow('2026-11-28', '2026-11-28')).toBe(true);
    expect(inPollPrefillWindow('2026-11-14', '2026-11-28')).toBe(true);
    expect(inPollPrefillWindow('2026-11-13', '2026-11-28')).toBe(false);
    expect(inPollPrefillWindow('2026-12-05', '2026-11-28')).toBe(true);
    expect(inPollPrefillWindow('2026-12-06', '2026-11-28')).toBe(false);
    expect(inPollPrefillWindow('', '2026-11-28')).toBe(false);
  });
});
