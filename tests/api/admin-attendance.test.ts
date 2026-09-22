import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/admin/attendance/route';
import * as sessionModule from '@/app/lib/auth/session';
import * as adminModule from '@/app/lib/firebase/admin';

describe('Admin Attendance API (/api/admin/attendance)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authorization checks', () => {
    it('returns 401/403 when verifyAdminRequest rejects the request', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/attendance');
      const res = await GET(req);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/attendance', () => {
    it('fetches attendance for a specific event', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const mockVal = {
        isoDate: '2026-05-16',
        members: {
          'mem-1': { name: 'Alice', group: 'A' },
        },
      };

      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => mockVal,
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/attendance?eventId=ev-123');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.eventId).toBe('ev-123');
      expect(json.members['mem-1'].name).toBe('Alice');
      expect(refMock).toHaveBeenCalledWith('attendance/ev-123');
    });
  });

  describe('POST /api/admin/attendance', () => {
    it('adds member attendance and keeps record in sync', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const setMock = vi.fn().mockResolvedValue(undefined);
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({ dates: ['10/05/2026'] }),
      });

      const refMock = vi.fn().mockImplementation((_path: string) => {
        return {
          set: setMock,
          update: updateMock,
          once: onceMock,
        };
      });

      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/attendance', {
        method: 'POST',
        body: JSON.stringify({
          eventId: 'ev-123',
          isoDate: '2026-05-16',
          memberId: 'mem-1',
          name: 'Alice',
          group: 'A',
          action: 'add',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('attendance/ev-123/members/mem-1');
    });

    it('removes member attendance when action is remove', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const removeMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockResolvedValue(undefined);
      const onceMock = vi.fn().mockResolvedValue({
        exists: () => false,
      });

      const refMock = vi.fn().mockImplementation(() => ({
        remove: removeMock,
        set: setMock,
        once: onceMock,
      }));
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/attendance', {
        method: 'POST',
        body: JSON.stringify({
          eventId: 'ev-123',
          memberId: 'mem-1',
          action: 'remove',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(removeMock).toHaveBeenCalledTimes(1);
    });
  });
});
