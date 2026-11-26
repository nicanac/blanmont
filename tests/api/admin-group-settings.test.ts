import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { GET, PUT } from '@/app/api/admin/group-settings/route';
import * as groupSettingsModule from '@/app/lib/firebase/group-settings';
import * as adminAccessModule from '@/app/lib/auth/admin-access';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

const asAdmin = (): void => {
  vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
    authorized: true,
    user: { id: 'admin-1', isAdmin: true },
  } as never);
};

const putRequest = (body: unknown): NextRequest =>
  new NextRequest('http://localhost:3000/api/admin/group-settings', {
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('Admin group settings API (/api/admin/group-settings)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(revalidateTag).mockClear();
  });

  it('GET refuses non-admins', async () => {
    vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const res = await GET(new NextRequest('http://localhost:3000/api/admin/group-settings'));
    expect(res.status).toBe(401);
  });

  it('GET returns settings and usage counts', async () => {
    asAdmin();
    vi.spyOn(groupSettingsModule, 'getGroupSettings').mockResolvedValue({
      groups: [{ code: 'A', label: 'GR1' }],
    });
    vi.spyOn(groupSettingsModule, 'getGroupUsage').mockResolvedValue({
      A: { code: 'A', count: 12 },
      'A-': { code: 'A-', count: 3 },
    });
    const res = await GET(new NextRequest('http://localhost:3000/api/admin/group-settings'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.settings.groups[0].label).toBe('GR1');
    expect(data.usage['A-'].count).toBe(3);
  });

  it('PUT refuses non-admins without writing', async () => {
    vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
    const update = vi.spyOn(groupSettingsModule, 'updateGroupSettings');
    const res = await PUT(putRequest({ groups: [{ code: 'A', label: 'GR1' }] }));
    expect(res.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it('PUT saves renamed groups and revalidates every page', async () => {
    asAdmin();
    const groups = [
      { code: 'A', label: 'GR1' },
      { code: 'A-', label: 'A-' },
      { code: 'B', label: 'gr2' },
      { code: 'C', label: 'gr3' },
    ];
    const update = vi
      .spyOn(groupSettingsModule, 'updateGroupSettings')
      .mockResolvedValue({ groups, updatedAt: '2026-11-25T10:00:00.000Z' });

    const res = await PUT(putRequest({ groups }));
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ groups });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.settings.groups[0].label).toBe('GR1');
    expect(revalidateTag).toHaveBeenCalledWith('group-settings', { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('PUT rejects duplicate labels with a 400 and French messages', async () => {
    asAdmin();
    const update = vi.spyOn(groupSettingsModule, 'updateGroupSettings');
    const res = await PUT(
      putRequest({
        groups: [
          { code: 'A', label: 'GR1' },
          { code: 'B', label: 'gr1' },
        ],
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('déjà utilisé');
    expect(update).not.toHaveBeenCalled();
  });

  it('PUT rejects malformed JSON', async () => {
    asAdmin();
    const res = await PUT(putRequest('{not json'));
    expect(res.status).toBe(400);
  });
});
