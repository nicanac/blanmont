import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { pollRespondentsForRide, getMembers, recordActivity } = vi.hoisted(() => ({
  pollRespondentsForRide: vi.fn(),
  getMembers: vi.fn(),
  recordActivity: vi.fn(),
}));
vi.mock('@/app/lib/poll-attendance-loader', () => ({ pollRespondentsForRide }));
vi.mock('@/app/lib/firebase/members', () => ({ getMembers }));
vi.mock('@/app/lib/logging/activityLogger', () => ({ recordActivity }));

import { POST } from '@/app/api/admin/attendance/route';
import * as adminAccessModule from '@/app/lib/auth/admin-access';
import * as adminModule from '@/app/lib/firebase/admin';

type Tree = Record<string, any>;

/** In-memory RTDB: the calls the attendance route makes (once, update, set, remove, child, transaction). */
function fakeDb(initial: Tree) {
  const tree: Tree = structuredClone(initial);
  const read = (path: string): any => path.split('/').reduce((node: any, key) => node?.[key], tree) ?? null;
  const write = (path: string, value: unknown): void => {
    const keys = path.split('/');
    const last = keys.pop() as string;
    let node = tree;
    for (const key of keys) node = node[key] ??= {};
    if (value === null) delete node[last];
    else node[last] = structuredClone(value);
  };
  const ref = (path: string): any => ({
    once: async () => {
      const value = read(path);
      return { exists: () => value !== null, val: () => structuredClone(value) };
    },
    update: async (fields: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(fields)) write(`${path}/${key}`, value);
    },
    set: async (value: unknown) => write(path, value),
    remove: async () => write(path, null),
    child: (key: string) => ref(`${path}/${key}`),
    transaction: async (update: (current: unknown) => unknown) => {
      const current = read(path);
      const next = update(current === null ? null : structuredClone(current));
      if (next === undefined) return { committed: false, snapshot: { val: () => current } };
      write(path, next);
      return { committed: true, snapshot: { val: () => next } };
    },
  });
  return { ref, tree };
}

const post = (body: Record<string, unknown>) =>
  POST(
    new NextRequest('http://localhost:3000/api/admin/attendance', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );

const RESPONDENTS = [
  { memberId: 'ana', name: 'Ana', group: 'A', slotsLabel: 'Samedi matin' },
  { memberId: 'bob', name: 'Bob', group: null, slotsLabel: 'Samedi matin' },
  { memberId: 'cid', name: 'Cid', group: 'C', slotsLabel: 'Samedi après-midi' },
  { memberId: 'gone', name: 'Ancien membre', group: 'B', slotsLabel: 'Samedi matin' },
];
const MEMBERS = [
  { id: 'ana', name: 'Ana Velo', preferredGroup: 'B' },
  { id: 'bob', name: 'Bob Sprint', preferredGroup: 'BC' },
  { id: 'cid', name: 'Cid Côte' },
  { id: 'dan', name: 'Dan Plat' },
];

describe('Pointage Express: pre-check from the weekend poll', () => {
  let db: ReturnType<typeof fakeDb>;

  const useDb = (tree: Tree) => {
    db = fakeDb(tree);
    vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: db.ref } as any);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
      authorized: true,
      user: { id: 'cap-1', name: 'Capitaine', email: 'cap@club.be', isAdmin: false },
    } as any);
    pollRespondentsForRide.mockResolvedValue(RESPONDENTS);
    getMembers.mockResolvedValue(MEMBERS);
    recordActivity.mockResolvedValue(undefined);
    useDb({
      'calendar-events': { sat: { isoDate: '2026-11-28', location: 'Blanmont' } },
      leaderboard: { ana: { dates: ['21/11/2026'] } },
    });
  });

  it('is refused without the Pointage Express section', async () => {
    vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    } as any);
    expect((await post({ eventId: 'sat', action: 'prefill-poll' })).status).toBe(403);
    expect(pollRespondentsForRide).not.toHaveBeenCalled();
  });

  it('ticks the respondents of the ride day with the group answered in the poll', async () => {
    const res = await post({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true });
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(pollRespondentsForRide).toHaveBeenCalledWith('2026-11-28');
    // "gone" answered but is no longer a club member: skipped.
    expect(json.added.map((m: any) => [m.memberId, m.name, m.group])).toEqual([
      ['ana', 'Ana Velo', 'A'],
      ['bob', 'Bob Sprint', 'BC'], // "Autre" in the poll: their usual group
      ['cid', 'Cid Côte', 'C'],
    ]);
    expect(json.prefilled.sort()).toEqual(['ana', 'bob', 'cid']);

    const attendance = db.tree.attendance.sat;
    expect(attendance.isoDate).toBe('2026-11-28');
    expect(Object.keys(attendance.members).sort()).toEqual(['ana', 'bob', 'cid']);
    expect(attendance.pollPrefill).toMatchObject({ by: 'Capitaine', memberIds: { ana: true, bob: true, cid: true } });
    // The Carré Vert leaderboard counts the day, like a tick by hand.
    expect(db.tree.leaderboard.ana.dates).toEqual(['21/11/2026', '28/11/2026']);
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin:attendance_prefilled' })
    );
  });

  it('never ticks again a member the captain unticked, and leaves ticks by hand alone', async () => {
    useDb({
      'calendar-events': { sat: { isoDate: '2026-11-28' } },
      attendance: {
        sat: {
          isoDate: '2026-11-28',
          members: { cid: { memberId: 'cid', name: 'Cid Côte', group: 'B', markedAt: 'earlier' } },
          // ana was pre-checked, then unticked at the start.
          pollPrefill: { at: 'earlier', memberIds: { ana: true } },
        },
      },
    });

    const json = await (await post({ eventId: 'sat', action: 'prefill-poll' })).json();

    expect(json.added.map((m: any) => m.memberId)).toEqual(['bob']);
    expect(Object.keys(db.tree.attendance.sat.members).sort()).toEqual(['bob', 'cid']);
    expect(db.tree.attendance.sat.members.cid.markedAt).toBe('earlier');
    expect(json.prefilled.sort()).toEqual(['ana', 'bob']);
    expect(Object.keys(json.members).sort()).toEqual(['bob', 'cid']);
  });

  it('runs the automatic pre-check once per ride, whatever the phone', async () => {
    await post({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true });
    delete db.tree.attendance.sat.members.ana; // unticked by the captain

    const json = await (await post({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true })).json();

    expect(json.added).toEqual([]);
    expect(db.tree.attendance.sat.members.ana).toBeUndefined();
    // The answer still carries the ride's ticks, so a second phone shows them.
    expect(Object.keys(json.members).sort()).toEqual(['bob', 'cid']);
    expect(recordActivity).toHaveBeenCalledTimes(1);
  });

  it('writes nothing when there is nobody to tick', async () => {
    pollRespondentsForRide.mockResolvedValue([]);
    const json = await (await post({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true })).json();
    expect(json).toMatchObject({ success: true, added: [], prefilled: [] });
    // No marker: the automatic pre-check can still run once the poll has answers.
    expect(db.tree.attendance).toBeUndefined();
  });

  it('is 404 for an unknown ride and 400 for a bad id', async () => {
    expect((await post({ eventId: 'nope', action: 'prefill-poll' })).status).toBe(404);
    expect((await post({ eventId: 'a/b', action: 'prefill-poll' })).status).toBe(400);
    expect((await post({ eventId: 'sat', action: 'undo-prefill', memberIds: ['a/b'] })).status).toBe(400);
    expect((await post({ eventId: 'sat', action: 'undo-prefill', memberIds: 'ana' })).status).toBe(400);
  });

  it('undoes a pre-check: only the members it ticked, and the leaderboard day with them', async () => {
    await post({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true });
    // dan was ticked by hand meanwhile.
    db.tree.attendance.sat.members.dan = { memberId: 'dan', name: 'Dan Plat', group: 'B', markedAt: 'now' };

    const res = await post({ eventId: 'sat', action: 'undo-prefill', memberIds: ['ana', 'bob', 'cid', 'dan'] });
    const json = await res.json();

    expect(json.removed.sort()).toEqual(['ana', 'bob', 'cid']);
    expect(json.prefilled).toEqual([]);
    expect(Object.keys(db.tree.attendance.sat.members)).toEqual(['dan']);
    expect(db.tree.leaderboard.ana.dates).toEqual(['21/11/2026']);
    // The marker stays: the automatic pre-check does not come back after an undo.
    expect(db.tree.attendance.sat.pollPrefill.at).toBeTruthy();
    expect((await (await post({ eventId: 'sat', action: 'prefill-poll', onlyIfFirst: true })).json()).added).toEqual([]);
    // The manual button can tick them again.
    const again = await (await post({ eventId: 'sat', action: 'prefill-poll' })).json();
    expect(again.added.map((m: any) => m.memberId).sort()).toEqual(['ana', 'bob', 'cid']);
  });
});
