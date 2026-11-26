import { isMockMode } from '@/app/lib/firebase/client';

/** RTDB node /visual-feedback-votes/<issueNumber>/<memberId>: ISO time of the vote. Server-only (rules deny clients). */
const NODE = 'visual-feedback-votes';

type Voters = Record<string, string>;
export type VoteMap = Record<string, Voters | null | undefined>;

export interface VoteTally {
  votes: number;
  voted: boolean;
}

/** Count of "+1" on one report, and whether this member is one of them. Voter ids never leave the server. */
export function tallyVotes(voters: Voters | null | undefined, memberId: string): VoteTally {
  const list = voters ?? {};
  return { votes: Object.keys(list).length, voted: Object.hasOwn(list, memberId) };
}

/** Adds the member's vote, or removes it if it is already there (one vote per member). */
export function toggleVoter(current: Voters | null, memberId: string, now: string): Voters | null {
  const next = { ...(current ?? {}) };
  if (Object.hasOwn(next, memberId)) delete next[memberId];
  else next[memberId] = now;
  return Object.keys(next).length ? next : null;
}

const mockVotes: Record<string, Voters> = {};

/** Every vote, keyed by issue number (server only). */
export async function readVotes(): Promise<VoteMap> {
  if (isMockMode) return mockVotes;
  const { getAdminDatabase } = await import('@/app/lib/firebase/admin');
  return ((await getAdminDatabase().ref(NODE).once('value')).val() ?? {}) as VoteMap;
}

/** Toggles the member's vote on a report atomically and returns the new tally. */
export async function toggleVote(issueNumber: number, memberId: string): Promise<VoteTally> {
  const now = new Date().toISOString();
  if (isMockMode) {
    const next = toggleVoter(mockVotes[issueNumber] ?? null, memberId, now);
    if (next) mockVotes[issueNumber] = next;
    else delete mockVotes[issueNumber];
    return tallyVotes(next, memberId);
  }
  const { getAdminDatabase } = await import('@/app/lib/firebase/admin');
  const { snapshot } = await getAdminDatabase()
    .ref(NODE + '/' + issueNumber)
    .transaction((current: Voters | null) => toggleVoter(current, memberId, now));
  return tallyVotes(snapshot.val() as Voters | null, memberId);
}
