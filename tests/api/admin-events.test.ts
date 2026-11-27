import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { POST as createEventRoute } from '@/app/api/admin/events/route';
import {
  GET as getEventByIdRoute,
  PUT as updateEventByIdRoute,
  DELETE as deleteEventByIdRoute,
} from '@/app/api/admin/events/[id]/route';
import * as adminModule from '@/app/lib/firebase/admin';
import * as adminAccessModule from '@/app/lib/auth/admin-access';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

/** #245: every successful write refreshes the pages that print events (root layout). */
const expectCalendarPagesRefreshed = (): void => {
  expect(revalidatePath).toHaveBeenCalledTimes(1);
  expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
};

describe('Admin Calendar Events API Endpoints', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'event-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(revalidatePath).mockClear();
  });

  describe('POST /api/admin/events', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({ isoDate: '2026-06-01' }),
      });

      const res = await createEventRoute(req);
      expect(res.status).toBe(401);
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('creates calendar event in Realtime Database', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
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
      expectCalendarPagesRefreshed();
    });
  });

  describe('GET /api/admin/events/[id]', () => {
    it('returns 404 when event does not exist', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
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
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
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
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
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
      expectCalendarPagesRefreshed();
    });

    it('shows a trace added to an event without waiting for the cache (#245)', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);
      const updateMock = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({
        ref: vi.fn().mockReturnValue({ update: updateMock }),
      } as any);

      const res = await updateEventByIdRoute(
        new NextRequest('http://localhost:3000/api/admin/events/event-123', {
          method: 'PUT',
          body: JSON.stringify({ gpxUrl: 'https://connect.garmin.com/app/course/532374522' }),
        }),
        mockContext
      );

      expect(res.status).toBe(200);
      // The write lands before the refresh, so the regenerated pages read the new trace.
      expect(updateMock.mock.invocationCallOrder[0]).toBeLessThan(
        vi.mocked(revalidatePath).mock.invocationCallOrder[0]
      );
      expectCalendarPagesRefreshed();
    });

    it('refreshes nothing when the write fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({
        ref: vi.fn().mockReturnValue({ update: vi.fn().mockRejectedValue(new Error('down')) }),
      } as any);

      const res = await updateEventByIdRoute(
        new NextRequest('http://localhost:3000/api/admin/events/event-123', {
          method: 'PUT',
          body: JSON.stringify({ departure: '9h00' }),
        }),
        mockContext
      );

      expect(res.status).toBe(500);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/admin/events/[id]', () => {
    it('removes event from database', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
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
      expectCalendarPagesRefreshed();
    });
  });
});
