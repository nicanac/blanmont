import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST as createMember } from '@/app/api/admin/members/route';
import { GET as getMember, PUT as updateMember, DELETE as deleteMember } from '@/app/api/admin/members/[id]/route';
import { POST as resetPassword } from '@/app/api/admin/members/[id]/reset-password/route';
import { clearAdminAccessCache } from '@/app/lib/auth/admin-access';
import * as adminModule from '@/app/lib/firebase/admin';
import { USERS, fakeDb, requestAs } from '../lib/rbac-fixtures';

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const members = {
  'members/plain': { name: 'Rider', role: ['Member'], email: 'rider@example.test', authUid: 'uid-rider' },
  'members/boss': { name: 'Boss', role: ['Admin'] },
  'members/tres': { name: 'Tres', role: ['Trésorier'], authUid: 'uid-tres' },
};

describe('members API: role assignment stays admin-only (Secrétaire has the members section)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    clearAdminAccessCache();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('lets the Secrétaire edit a plain member without touching roles', async () => {
    const db = fakeDb(members);
    const res = await updateMember(
      await requestAs('/api/admin/members/plain', USERS.secretaire, {
        method: 'PUT',
        body: { cotisation2026Status: 'paid', role: ['Member'] },
      }),
      ctx('plain')
    );
    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalledWith('members/plain', expect.objectContaining({ cotisation2026Status: 'paid' }));
  });

  it('saves a member whose stored roles repeat, and writes each role once (#262)', async () => {
    const db = fakeDb({
      ...members,
      'members/cm': { name: 'CM', role: ['Member', 'Capitaine de Route', 'Membre du comité', 'Membre du comité'] },
    });
    // The edit form sends the roles back as loaded (repeat included), or already deduplicated.
    for (const role of [
      ['Member', 'Capitaine de Route', 'Membre du comité', 'Membre du comité'],
      ['Member', 'Capitaine de Route', 'Membre du comité'],
    ]) {
      const res = await updateMember(
        await requestAs('/api/admin/members/cm', USERS.secretaire, { method: 'PUT', body: { bio: 'x', role } }),
        ctx('cm')
      );
      expect(res.status).toBe(200);
    }
    expect(db.update).toHaveBeenLastCalledWith(
      'members/cm',
      expect.objectContaining({ role: ['Member', 'Capitaine de Route', 'Membre du comité'] })
    );
  });

  it('still refuses a real role change hidden behind a repeat (#262)', async () => {
    const db = fakeDb(members);
    const res = await updateMember(
      await requestAs('/api/admin/members/plain', USERS.secretaire, {
        method: 'PUT',
        body: { role: ['Member', 'Member', 'Capitaine de Route'] },
      }),
      ctx('plain')
    );
    expect(res.status).toBe(403);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('refuses a role change to the Secrétaire, even with the members section', async () => {
    const db = fakeDb(members);
    const res = await updateMember(
      await requestAs('/api/admin/members/plain', USERS.secretaire, { method: 'PUT', body: { role: ['Admin'] } }),
      ctx('plain')
    );
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/attribuer des rôles/);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('refuses to the Secrétaire: own role change, admin accounts, ADMIN_EMAILS email, login link', async () => {
    vi.stubEnv('ADMIN_EMAILS', 'boss@example.test');
    const db = fakeDb({ ...members, 'members/sec-1': { name: 'Sec', role: ['Secrétaire'] } });
    const cases: [string, Record<string, unknown>][] = [
      ['sec-1', { role: ['Secrétaire', 'Président'] }],
      ['boss', { bio: 'hello' }],
      ['plain', { email: 'boss@example.test' }],
      ['plain', { authUid: 'uid-sec' }],
    ];
    for (const [id, body] of cases) {
      const res = await updateMember(await requestAs(`/api/admin/members/${id}`, USERS.secretaire, { method: 'PUT', body }), ctx(id));
      expect(res.status).toBe(403);
    }
    const del = await deleteMember(await requestAs('/api/admin/members/boss', USERS.secretaire, { method: 'DELETE' }), ctx('boss'));
    expect(del.status).toBe(403);
    expect(db.update).not.toHaveBeenCalled();
    expect(db.remove).not.toHaveBeenCalled();
  });

  it('lets the Secrétaire create a plain member but not one with a role', async () => {
    fakeDb(members);
    const push = vi.fn(() => ({ key: 'new-1', set: vi.fn() }));
    const getDb = vi.mocked(adminModule.getAdminDatabase);
    const base = getDb();
    getDb.mockReturnValue({ ref: (p: string) => (p === 'members' ? { push } : base.ref(p)) } as never);

    const denied = await createMember(
      await requestAs('/api/admin/members', USERS.secretaire, { method: 'POST', body: { name: 'X', role: ['Président'] } })
    );
    expect(denied.status).toBe(403);
    expect(push).not.toHaveBeenCalled();

    const ok = await createMember(await requestAs('/api/admin/members', USERS.secretaire, { method: 'POST', body: { name: 'X' } }));
    expect(ok.status).toBe(200);
  });

  it('refuses RTDB path keys ("role/1") to everyone, so nested writes cannot bypass the role check', async () => {
    const db = fakeDb({ ...members, 'members/sec-1': { name: 'Sec', role: ['Secrétaire'] } });
    for (const user of [USERS.secretaire, USERS.admin]) {
      for (const body of [{ 'role/1': 'Admin' }, { 'authUid/x': 'u' }, { 'a.b': 1 }]) {
        const res = await updateMember(await requestAs('/api/admin/members/sec-1', user, { method: 'PUT', body }), ctx('sec-1'));
        expect(res.status).toBe(400);
      }
    }
    expect(db.update).not.toHaveBeenCalled();
  });

  it("refuses to the Secrétaire a change of an officer's login email", async () => {
    const db = fakeDb(members);
    const res = await updateMember(
      await requestAs('/api/admin/members/tres', USERS.secretaire, { method: 'PUT', body: { email: 'attacker@example.test' } }),
      ctx('tres')
    );
    expect(res.status).toBe(403);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('lets an admin assign roles', async () => {
    const db = fakeDb(members);
    const res = await updateMember(
      await requestAs('/api/admin/members/plain', USERS.admin, { method: 'PUT', body: { role: ['Trésorier'] } }),
      ctx('plain')
    );
    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalledWith('members/plain', expect.objectContaining({ role: ['Trésorier'] }));
  });

  it('keeps a role without the members section out (Trésorier → 403)', async () => {
    fakeDb(members);
    expect((await getMember(await requestAs('/api/admin/members/plain', USERS.tresorier), ctx('plain'))).status).toBe(403);
  });

  it('lets only an admin reset the password of an officer', async () => {
    fakeDb(members);
    const updateUser = vi.fn();
    vi.spyOn(adminModule, 'getAdminAuth').mockReturnValue({ updateUser } as never);
    const body = { password: 'long-enough-1' };
    const officer = await resetPassword(await requestAs('/api/admin/members/tres/reset-password', USERS.secretaire, { method: 'POST', body }), ctx('tres'));
    expect(officer.status).toBe(403);
    const plain = await resetPassword(await requestAs('/api/admin/members/plain/reset-password', USERS.secretaire, { method: 'POST', body }), ctx('plain'));
    expect(plain.status).toBe(200);
    const byAdmin = await resetPassword(await requestAs('/api/admin/members/tres/reset-password', USERS.admin, { method: 'POST', body }), ctx('tres'));
    expect(byAdmin.status).toBe(200);
    expect(updateUser).toHaveBeenCalledTimes(2);
  });
});
