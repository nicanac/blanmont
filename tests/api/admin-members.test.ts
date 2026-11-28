import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createMemberRoute } from '@/app/api/admin/members/route';
import {
  GET as getMemberByIdRoute,
  PUT as updateMemberByIdRoute,
  DELETE as deleteMemberByIdRoute,
} from '@/app/api/admin/members/[id]/route';
import { POST as resetPasswordRoute } from '@/app/api/admin/members/[id]/reset-password/route';
import * as adminModule from '@/app/lib/firebase/admin';
import * as adminAccessModule from '@/app/lib/auth/admin-access';
import * as activityLogger from '@/app/lib/logging/activityLogger';
import { fakeAdminAuth, fakeMembersDb } from '../lib/fake-firebase';

describe('Admin Members API Endpoints', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'mem-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/members', () => {
    it('creates member with default roles and fields in database', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const setMock = vi.fn().mockResolvedValue(undefined);
      const pushMock = vi.fn().mockReturnValue({
        key: 'new-mem-456',
        set: setMock,
      });
      const refMock = vi.fn().mockReturnValue({ push: pushMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Michel Cycliste',
          email: 'michel@blanmont.be',
          preferredGroup: 'B',
        }),
      });

      const res = await createMemberRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.id).toBe('new-mem-456');
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Michel Cycliste',
          email: 'michel@blanmont.be',
          role: ['Member'],
          preferredGroup: 'B',
        })
      );
    });
  });

  describe('GET, PUT, DELETE /api/admin/members/[id]', () => {
    it('GET returns 404 if member does not exist', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const onceMock = vi.fn().mockResolvedValue({ exists: () => false });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123');
      const res = await getMemberByIdRoute(req, mockContext);

      expect(res.status).toBe(404);
    });

    it('GET returns member details when found', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({ name: 'Michel', role: ['Admin'] }),
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123');
      const res = await getMemberByIdRoute(req, mockContext);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('Michel');
    });

    it('PUT updates member record', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123', {
        method: 'PUT',
        body: JSON.stringify({ cotisation2026Status: 'paid' }),
      });

      const res = await updateMemberByIdRoute(req, mockContext);
      expect(res.status).toBe(200);
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ cotisation2026Status: 'paid' })
      );
    });

    it('DELETE removes member record', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123', {
        method: 'DELETE',
      });

      const res = await deleteMemberByIdRoute(req, mockContext);
      expect(res.status).toBe(200);
      expect(removeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/admin/members/[id]/reset-password', () => {
    const asAdmin = (extra: Record<string, unknown> = {}) =>
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', name: 'Seb', isAdmin: true, ...extra },
      } as any);
    const post = (password: string) =>
      resetPasswordRoute(
        new NextRequest('http://localhost:3000/api/admin/members/mem-123/reset-password', {
          method: 'POST',
          body: JSON.stringify({ password }),
        }),
        mockContext
      );

    beforeEach(() => {
      vi.spyOn(activityLogger, 'recordActivity').mockResolvedValue('log_1');
    });

    it('returns 400 when password is too short', async () => {
      asAdmin();
      const res = await post('123');
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/au moins|entre 6/i);
    });

    it('returns 400 when the member has no email (it is the login identifier)', async () => {
      asAdmin();
      fakeAdminAuth();
      fakeMembersDb({ 'mem-123': { name: 'Sans Email' } });

      const res = await post('new-valid-pass');
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/pas d'adresse email/i);
    });

    it('creates and links the login account of a member who never logged in, then sets the password', async () => {
      asAdmin();
      const { api } = fakeAdminAuth();
      const db = fakeMembersDb({ 'mem-123': { name: 'Nouveau', email: 'Nouveau@Blanmont.be' } });

      const res = await post('secure-password-123');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true, loginEmail: 'nouveau@blanmont.be', accountCreated: true });
      // An admin-typed address proves nothing: the account stays unverified, linked by uid
      expect(api.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'nouveau@blanmont.be', emailVerified: false }));
      expect(db.members['mem-123'].authUid).toBe('uid-new-1');
      expect(api.updateUser).toHaveBeenCalledWith('uid-new-1', { password: 'secure-password-123' });
    });

    it('updates the password of the linked account', async () => {
      asAdmin();
      const { api } = fakeAdminAuth([{ uid: 'auth-user-999', email: 'avec@blanmont.be', emailVerified: true }]);
      fakeMembersDb({ 'mem-123': { name: 'Avec Auth', email: 'avec@blanmont.be', authUid: 'auth-user-999' } });

      const res = await post('secure-password-123');

      expect(res.status).toBe(200);
      expect((await res.json()).loginEmail).toBe('avec@blanmont.be');
      expect(api.createUser).not.toHaveBeenCalled();
      expect(api.updateUser).toHaveBeenCalledWith('auth-user-999', { password: 'secure-password-123' });
    });

    it('moves a linked account whose email is stale to the directory email', async () => {
      asAdmin();
      const { users } = fakeAdminAuth([{ uid: 'auth-user-999', email: 'ancienne@gmail.com', emailVerified: true }]);
      fakeMembersDb({ 'mem-123': { name: 'Changé', email: 'nouvelle@gmail.com', authUid: 'auth-user-999' } });

      const res = await post('secure-password-123');

      expect(res.status).toBe(200);
      expect(users.get('auth-user-999')).toMatchObject({ email: 'nouvelle@gmail.com', password: 'secure-password-123' });
    });

    it('links an existing unlinked account of that email (verified, e.g. made by a first-login request)', async () => {
      asAdmin();
      const { api } = fakeAdminAuth([{ uid: 'uid-orphan', email: 'membre@blanmont.be', emailVerified: true }]);
      const db = fakeMembersDb({ 'mem-123': { name: 'Membre', email: 'membre@blanmont.be' } });

      const res = await post('secure-password-123');

      expect(res.status).toBe(200);
      expect(db.members['mem-123'].authUid).toBe('uid-orphan');
      expect(api.updateUser).toHaveBeenCalledWith('uid-orphan', { password: 'secure-password-123' });
    });

    it('adopts a hand-made account from before the fix, replaces a newer unverified one', async () => {
      asAdmin();
      const legacy = fakeAdminAuth([
        { uid: 'uid-hand', email: 'membre@blanmont.be', metadata: { creationTime: 'Wed, 25 Nov 2026 10:00:00 GMT' } },
      ]);
      fakeMembersDb({ 'mem-123': { name: 'Membre', email: 'membre@blanmont.be' } });
      expect((await post('secure-password-123')).status).toBe(200);
      expect(legacy.api.updateUser).toHaveBeenCalledWith('uid-hand', { password: 'secure-password-123' });

      vi.restoreAllMocks();
      asAdmin();
      vi.spyOn(activityLogger, 'recordActivity').mockResolvedValue('log_1');
      const fresh = fakeAdminAuth([{ uid: 'uid-self-made', email: 'membre@blanmont.be', emailVerified: false }]);
      const db = fakeMembersDb({ 'mem-123': { name: 'Membre', email: 'membre@blanmont.be' } });
      expect((await post('secure-password-123')).status).toBe(200);
      expect(fresh.api.deleteUser).toHaveBeenCalledWith('uid-self-made');
      expect(db.members['mem-123'].authUid).toBe('uid-new-1');
    });

    it("a delegated officer cannot set a password on an email another record carries (an admin's)", async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'sec-1', name: 'Secrétaire', isAdmin: false, role: ['Secrétaire'] },
      } as any);
      const { api } = fakeAdminAuth();
      fakeMembersDb({
        'mem-123': { name: 'Copie', email: 'admin@blanmont.be', role: ['Member'] },
        'mem-admin': { name: 'Vrai Admin', email: 'admin@blanmont.be', role: ['Admin'] },
      });

      const res = await post('secure-password-123');

      expect(res.status).toBe(409);
      expect(api.createUser).not.toHaveBeenCalled();
      expect(api.updateUser).not.toHaveBeenCalled();
    });

    it("refuses to move the owner's account to another address", async () => {
      vi.stubEnv('OWNER_EMAILS', 'owner@blanmont.be');
      asAdmin({ verifiedEmail: 'other-admin@blanmont.be' });
      const { api, users } = fakeAdminAuth([{ uid: 'uid-owner', email: 'owner@blanmont.be', emailVerified: true }]);
      // An admin changed the owner's record email to an address they control.
      fakeMembersDb({ 'mem-123': { name: 'Owner', email: 'mine@attacker.test', authUid: 'uid-owner' } });

      expect((await post('secure-password-123')).status).toBe(403);
      expect(users.get('uid-owner')?.email).toBe('owner@blanmont.be');
      expect(api.updateUser).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it("refuses with 409 when the email is another member's login account", async () => {
      asAdmin();
      const { api } = fakeAdminAuth([{ uid: 'uid-partner', email: 'famille@blanmont.be', emailVerified: true }]);
      fakeMembersDb({
        'mem-123': { name: 'Second', email: 'famille@blanmont.be' },
        'mem-1': { name: 'Premier', email: 'famille@blanmont.be', authUid: 'uid-partner' },
      });

      const res = await post('secure-password-123');

      expect(res.status).toBe(409);
      expect((await res.json()).error).toMatch(/Premier/);
      expect(api.updateUser).not.toHaveBeenCalled();
    });

    it("refuses to set the site owner's password for anyone but the owner", async () => {
      vi.stubEnv('OWNER_EMAILS', 'owner@blanmont.be');
      const { api } = fakeAdminAuth([{ uid: 'uid-owner', email: 'owner@blanmont.be', emailVerified: true }]);
      fakeMembersDb({ 'mem-123': { name: 'Owner', email: 'owner@blanmont.be', authUid: 'uid-owner' } });

      asAdmin({ verifiedEmail: 'other-admin@blanmont.be' });
      expect((await post('secure-password-123')).status).toBe(403);
      expect(api.updateUser).not.toHaveBeenCalled();

      asAdmin({ verifiedEmail: 'owner@blanmont.be' });
      expect((await post('secure-password-123')).status).toBe(200);
      vi.unstubAllEnvs();
    });
  });
});
