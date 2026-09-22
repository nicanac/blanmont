import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as createEventRoute } from '@/app/api/admin/events/route';
import {
  GET as getEventByIdRoute,
  PUT as updateEventByIdRoute,
  DELETE as deleteEventByIdRoute,
} from '@/app/api/admin/events/[id]/route';
import * as adminModule from '@/app/lib/firebase/admin';
import * as sessionModule from '@/app/lib/auth/session';

describe('Admin Calendar Events API Endpoints', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'event-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/events', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({ isoDate: '2026-06-01' }),
      });

      const res = await createEventRoute(req);
      expect(res.status).toBe(401);
    });

    it('creates calendar event in Realtime Database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const setMock = vi.fn().mockResolvedValue(undefined);
      const pushMock = vi.fn().mockReturnValue({
        key: 'new-event-789',
        set: setMock,
      });
      const refMock = vi.fn().mockReturnValue({ push: pushMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          isoDate: '2026-06-06',
          location: 'Mont-Saint-Guibert',
          distances: '80-100',
          departure: '8h30',
        }),
      });

      const res = await createEventRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.id).toBe('new-event-789');
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          isoDate: '2026-06-06',
          location: 'Mont-Saint-Guibert',
        })
      );
    });
  });

  describe('GET /api/admin/events/[id]', () => {
    it('returns 404 when event does not exist', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const onceMock = vi.fn().mockResolvedValue({ exists: () => false });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events/event-123');
      const res = await getEventByIdRoute(req, mockContext);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Event not found');
    });

    it('returns event details when found', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({
          location: 'Chastre',
          isoDate: '2026-05-30',
        }),
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events/event-123');
      const res = await getEventByIdRoute(req, mockContext);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('event-123');
      expect(data.location).toBe('Chastre');
    });
  });

  describe('PUT /api/admin/events/[id]', () => {
    it('updates event fields in database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events/event-123', {
        method: 'PUT',
        body: JSON.stringify({ departure: '9h00' }),
      });

      const res = await updateEventByIdRoute(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('calendar-events/event-123');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ departure: '9h00' })
      );
    });
  });

  describe('DELETE /api/admin/events/[id]', () => {
    it('removes event from database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events/event-123', {
        method: 'DELETE',
      });

      const res = await deleteEventByIdRoute(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('calendar-events/event-123');
      expect(removeMock).toHaveBeenCalledTimes(1);
    });
  });
});
