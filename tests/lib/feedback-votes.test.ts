import { describe, it, expect } from 'vitest';
import { tallyVotes, toggleVote, toggleVoter, readVotes } from '@/app/lib/feedback/votes';

describe('feedback votes', () => {
  it('toggles one vote per member', () => {
    const one = toggleVoter(null, 'm1', 't1');
    expect(one).toEqual({ m1: 't1' });
    const two = toggleVoter(one, 'm2', 't2');
    expect(two).toEqual({ m1: 't1', m2: 't2' });
    expect(toggleVoter(two, 'm1', 't3')).toEqual({ m2: 't2' });
    expect(toggleVoter({ m1: 't1' }, 'm1', 't2')).toBeNull(); // empty node is deleted
  });

  it('tallies without exposing who voted', () => {
    expect(tallyVotes({ m1: 't', m2: 't' }, 'm2')).toEqual({ votes: 2, voted: true });
    expect(tallyVotes(undefined, 'm1')).toEqual({ votes: 0, voted: false });
    expect(tallyVotes({ m1: 't' }, 'toString')).toEqual({ votes: 1, voted: false });
  });

  it('stores votes per issue and toggles them back (mock store)', async () => {
    expect(await toggleVote(41, 'a')).toEqual({ votes: 1, voted: true });
    expect(await toggleVote(41, 'b')).toEqual({ votes: 2, voted: true });
    expect(await toggleVote(41, 'a')).toEqual({ votes: 1, voted: false });
    expect(Object.keys((await readVotes())[41] ?? {})).toEqual(['b']);
    await toggleVote(41, 'b');
    expect((await readVotes())[41]).toBeUndefined();
  });
});
