import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as configRoute } from '@/app/api/feedback/config/route';
import { POST as feedbackRoute } from '@/app/api/feedback/route';
import { GET as adminGet, PUT as adminPut } from '@/app/api/admin/feedback-settings/route';
import * as sessionModule from '@/app/lib/auth/session';
import * as settingsModule from '@/app/lib/firebase/visual-feedback';
import * as githubModule from '@/app/lib/feedback/github';

const valid = {
  title: 'Titre',
  comment: 'Un commentaire',
  category: 'ui',
  priority: 'important',
  context: {
    url: 'https://x.test/a',
    routePath: '/a',
    viewport: { width: 1, height: 1, devicePixelRatio: 1 },
    userAgent: 'UA',
    captureMode: 'none',
    consoleErrors: [],
  },
};

const post = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/feedback', { method: 'POST', body: JSON.stringify(body) });
const req = () => new NextRequest('http://localhost:3000/api/feedback/config');

function settings(enabled: boolean, audience: 'admins' | 'members' | 'everyone') {
  vi.spyOn(settingsModule, 'getVisualFeedbackSettings').mockResolvedValue({ enabled, audience, updatedAt: '' });
}
function session(user: { id: string; name: string; isAdmin: boolean } | null) {
  vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockResolvedValue(user as never);
}

describe('feedback API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'tok');
  });

  it('config: only exposes a boolean for the caller', async () => {
    settings(true, 'members');
    session({ id: 'u1', name: 'A B', isAdmin: false });
    expect(await (await configRoute(req())).json()).toEqual({ allowed: true });
    session(null);
    expect(await (await configRoute(req())).json()).toEqual({ allowed: false });
  });

  it('POST: 404 when disabled, 401 anonymous on members, 403 non-admin on admins', async () => {
    settings(false, 'everyone');
    session(null);
    expect((await feedbackRoute(post(valid))).status).toBe(404);
    settings(true, 'members');
    expect((await feedbackRoute(post(valid))).status).toBe(401);
    settings(true, 'admins');
    session({ id: 'u1', name: 'A', isAdmin: false });
    expect((await feedbackRoute(post(valid))).status).toBe(403);
  });

  it('POST: 503 without a token, 400 on invalid body', async () => {
    settings(true, 'everyone');
    session({ id: 'u2', name: 'A', isAdmin: false });
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', '');
    expect((await feedbackRoute(post(valid))).status).toBe(503);
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'tok');
    expect((await feedbackRoute(post({ ...valid, category: 'nope' }))).status).toBe(400);
  });

  it('POST: creates the issue and only forwards the first name', async () => {
    settings(true, 'members');
    session({ id: 'u3', name: 'Nicolas Bruyère', isAdmin: false });
    const submit = vi
      .spyOn(githubModule, 'submitFeedbackToGitHub')
      .mockResolvedValue({ id: 'REV-1', issueNumber: 9, issueUrl: 'https://github.com/o/r/issues/9' });
    const res = await feedbackRoute(post(valid));
    expect(res.status).toBe(201);
    expect(submit.mock.calls[0][1]).toBe('Nicolas');
    expect((await res.json()).issueNumber).toBe(9);
  });

  it('POST: 502 when GitHub fails, 429 after the rate limit', async () => {
    settings(true, 'members');
    session({ id: 'u4', name: 'A', isAdmin: false });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(githubModule, 'submitFeedbackToGitHub').mockRejectedValue(new Error('boom'));
    expect((await feedbackRoute(post(valid))).status).toBe(502);
    for (let i = 0; i < 4; i++) await feedbackRoute(post(valid));
    expect((await feedbackRoute(post(valid))).status).toBe(429);
  });

  it('admin settings: requires the owner, validates, persists', async () => {
    const denied = new Response(null, { status: 403 });
    vi.spyOn(sessionModule, 'verifyOwnerRequest').mockResolvedValueOnce({ authorized: false, response: denied } as never);
    expect((await adminGet(req())).status).toBe(403);

    vi.spyOn(sessionModule, 'verifyOwnerRequest').mockResolvedValue({ authorized: true, user: { id: 'admin-1' } } as never);
    const update = vi
      .spyOn(settingsModule, 'updateVisualFeedbackSettings')
      .mockResolvedValue({ enabled: true, audience: 'everyone', updatedAt: 'now' });
    const bad = new NextRequest('http://localhost:3000/api/admin/feedback-settings', { method: 'PUT', body: JSON.stringify({ enabled: 'x' }) });
    expect((await adminPut(bad)).status).toBe(400);
    const ok = new NextRequest('http://localhost:3000/api/admin/feedback-settings', { method: 'PUT', body: JSON.stringify({ enabled: true, audience: 'everyone' }) });
    const res = await adminPut(ok);
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ enabled: true, audience: 'everyone' }, 'admin-1');
  });
});
