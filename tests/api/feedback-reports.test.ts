import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as listRoute } from '@/app/api/feedback/reports/route';
import { GET as detailRoute, POST as actRoute } from '@/app/api/feedback/reports/[number]/route';
import { POST as voteRoute } from '@/app/api/feedback/reports/[number]/vote/route';
import * as sessionModule from '@/app/lib/auth/session';
import * as reportsModule from '@/app/lib/feedback/reports';
import * as votesModule from '@/app/lib/feedback/votes';

const user = (over: object) => ({ id: 'u1', name: 'Paul Dupont', role: ['Member'], isAdmin: false, ...over });
const session = (u: object | null) => vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockResolvedValue(u as never);
const req = (body?: unknown) =>
  new NextRequest('http://localhost:3000/api/feedback/reports/7', body === undefined ? undefined : { method: 'POST', body: JSON.stringify(body) });
const ctx = (n: string) => ({ params: Promise.resolve({ number: n }) });

describe('feedback reports API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'tok');
  });

  it('401 anonymous, 403 plain member, 503 without token', async () => {
    session(null);
    expect((await listRoute(req())).status).toBe(401);
    session(user({}));
    expect((await listRoute(req())).status).toBe(403);
    session(user({ role: ['Trésorier'] }));
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', '');
    expect((await listRoute(req())).status).toBe(503);
  });

  it('lets an officer and an admin list reports', async () => {
    vi.spyOn(reportsModule, 'listReports').mockResolvedValue([{ number: 1 } as never]);
    session(user({ role: ['Capitaine de Route'] }));
    expect((await (await listRoute(req())).json()).reports).toHaveLength(1);
    session(user({ isAdmin: true }));
    expect((await listRoute(req())).status).toBe(200);
  });

  it('detail: 404 on a bad number or a non-report issue', async () => {
    session(user({ role: ['Secrétaire'] }));
    expect((await detailRoute(req(), ctx('abc'))).status).toBe(404);
    vi.spyOn(reportsModule, 'getReportDetail').mockRejectedValue(new reportsModule.ReportNotFoundError());
    expect((await detailRoute(req(), ctx('7'))).status).toBe(404);
  });

  it('actions: validates, signs with first name and role, hides GitHub errors', async () => {
    session(user({ role: ['Trésorier'] }));
    const act = vi.spyOn(reportsModule, 'actOnReport').mockResolvedValue({ number: 7, status: 'resolved' } as never);
    expect((await actRoute(req({ action: 'nuke' }), ctx('7'))).status).toBe(400);
    expect((await actRoute(req({ action: 'comment' }), ctx('7'))).status).toBe(400);

    const ok = await actRoute(req({ action: 'resolve', text: 'Fait' }), ctx('7'));
    expect(ok.status).toBe(200);
    expect(act).toHaveBeenCalledWith(7, 'resolve', 'Fait', { name: 'Paul', role: 'Trésorier' });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    act.mockRejectedValue(new Error('boom'));
    expect((await actRoute(req({ action: 'reopen' }), ctx('7'))).status).toBe(502);
  });

  it('a plain member cannot act', async () => {
    session(user({}));
    expect((await actRoute(req({ action: 'resolve' }), ctx('7'))).status).toBe(403);
  });

  it('list: adds the vote count and the viewer own vote', async () => {
    vi.spyOn(reportsModule, 'listReports').mockResolvedValue([{ number: 1 }, { number: 2 }] as never);
    vi.spyOn(votesModule, 'readVotes').mockResolvedValue({ 1: { u1: 't', u2: 't' }, 2: { u2: 't' } });
    session(user({ role: ['Trésorier'] }));
    const { reports } = await (await listRoute(req())).json();
    expect(reports).toEqual([
      { number: 1, votes: 2, voted: true },
      { number: 2, votes: 1, voted: false },
    ]);
  });

  it('vote: same access as the board, voter taken from the session only', async () => {
    const toggle = vi.spyOn(votesModule, 'toggleVote').mockResolvedValue({ votes: 1, voted: true });
    const check = vi.spyOn(reportsModule, 'assertReport').mockResolvedValue();
    session(null);
    expect((await voteRoute(req({}), ctx('7'))).status).toBe(401);
    session(user({}));
    expect((await voteRoute(req({}), ctx('7'))).status).toBe(403);
    expect(toggle).not.toHaveBeenCalled();

    session(user({ role: ['Capitaine de Route'] }));
    const res = await voteRoute(req({ memberId: 'someone-else' }), ctx('7'));
    expect(await res.json()).toEqual({ votes: 1, voted: true });
    expect(check).toHaveBeenCalledWith(7);
    expect(toggle).toHaveBeenCalledWith(7, 'u1');
  });

  it('vote: 404 on a bad number or a non-report issue, 502 on storage errors', async () => {
    const toggle = vi.spyOn(votesModule, 'toggleVote').mockResolvedValue({ votes: 1, voted: true });
    session(user({ isAdmin: true }));
    expect((await voteRoute(req({}), ctx('0'))).status).toBe(404);
    expect((await voteRoute(req({}), ctx('1.5'))).status).toBe(404);
    vi.spyOn(reportsModule, 'assertReport').mockRejectedValue(new reportsModule.ReportNotFoundError());
    expect((await voteRoute(req({}), ctx('7'))).status).toBe(404);
    expect(toggle).not.toHaveBeenCalled();

    vi.spyOn(reportsModule, 'assertReport').mockResolvedValue();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    toggle.mockRejectedValue(new Error('rtdb down'));
    expect((await voteRoute(req({}), ctx('7'))).status).toBe(502);
  });
});
