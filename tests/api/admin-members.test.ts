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
import * as sessionModule from '@/app/lib/auth/session';

describe('Admin Members API Endpoints', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'mem-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/members', () => {
    it('creates member with default roles and fields in database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
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
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
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
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
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
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
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
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
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
    it('returns 400 when password is too short', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password: '123' }),
      });

      const res = await resetPasswordRoute(req, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/at least 6 characters/i);
    });

    it('returns 400 when member has no Firebase Auth authUid linked', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({ name: 'Sans Auth', authUid: null }),
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password: 'new-valid-pass' }),
      });

      const res = await resetPasswordRoute(req, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/pas de compte authentifié/i);
    });

    it('updates password via Firebase Admin Auth when authUid exists', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({ name: 'Avec Auth', authUid: 'auth-user-999' }),
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const updateUserMock = vi.fn().mockResolvedValue({} as any);
      vi.spyOn(adminModule, 'getAdminAuth').mockReturnValue({ updateUser: updateUserMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/members/mem-123/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password: 'secure-password-123' }),
      });

      const res = await resetPasswordRoute(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(updateUserMock).toHaveBeenCalledWith('auth-user-999', {
        password: 'secure-password-123',
      });
    });
  });
});
