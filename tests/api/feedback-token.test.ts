import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, PUT } from '@/app/api/admin/feedback-token/route';
import * as sessionModule from '@/app/lib/auth/session';
import * as githubModule from '@/app/lib/feedback/github';
import * as storeModule from '@/app/lib/feedback/token-store';

const TOKEN = 'github_pat_abcdefghijklmnopqrstuvwxyz';
const put = (body: unknown) => new NextRequest('http://localhost:3000/api/admin/feedback-token', { method: 'PUT', body: JSON.stringify(body) });
const del = () => new NextRequest('http://localhost:3000/api/admin/feedback-token', { method: 'DELETE' });

describe('admin feedback token API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({ authorized: true, user: { id: 'admin-1' } } as never);
    vi.spyOn(storeModule, 'getTokenStatus').mockResolvedValue({ source: 'admin', last4: 'wxyz' });
  });

  it('requires an admin', async () => {
    vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({ authorized: false, response: new Response(null, { status: 403 }) } as never);
    expect((await PUT(put({ token: TOKEN }))).status).toBe(403);
    expect((await DELETE(del())).status).toBe(403);
  });

  it('rejects anything that does not look like a token, without calling GitHub', async () => {
    const verify = vi.spyOn(githubModule, 'verifyGithubToken');
    expect((await PUT(put({ token: 'short' }))).status).toBe(400);
    expect((await PUT(put({ token: 'has spaces and symbols !!!!!!!!!' }))).status).toBe(400);
    expect(verify).not.toHaveBeenCalled();
  });

  it('does not store a token GitHub refuses', async () => {
    vi.spyOn(githubModule, 'verifyGithubToken').mockResolvedValue({ ok: false, reason: 'GitHub refuse ce jeton (invalide ou expiré).' });
    const save = vi.spyOn(storeModule, 'saveFeedbackToken');
    const res = await PUT(put({ token: TOKEN }));
    expect(res.status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });

  it('stores a verified token and answers with the masked status only', async () => {
    vi.spyOn(githubModule, 'verifyGithubToken').mockResolvedValue({ ok: true });
    const save = vi.spyOn(storeModule, 'saveFeedbackToken').mockResolvedValue();
    const res = await PUT(put({ token: TOKEN }));
    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledWith(TOKEN, 'admin-1');
    expect(JSON.stringify(await res.json())).not.toContain('abcdefghijkl');
  });

  it('explains when storage is unavailable', async () => {
    vi.spyOn(githubModule, 'verifyGithubToken').mockResolvedValue({ ok: true });
    vi.spyOn(storeModule, 'saveFeedbackToken').mockRejectedValue(new storeModule.TokenStoreUnavailableError('x'));
    expect((await PUT(put({ token: TOKEN }))).status).toBe(503);
  });

  it('deletes the stored token', async () => {
    const remove = vi.spyOn(storeModule, 'deleteFeedbackToken').mockResolvedValue();
    expect((await DELETE(del())).status).toBe(200);
    expect(remove).toHaveBeenCalled();
  });
});
