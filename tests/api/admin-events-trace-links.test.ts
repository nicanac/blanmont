import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { GET as traceLinksRoute } from '@/app/api/admin/events/trace-links/route';
import { POST as createEventRoute } from '@/app/api/admin/events/route';
import { PUT as updateEventRoute } from '@/app/api/admin/events/[id]/route';
import * as adminModule from '@/app/lib/firebase/admin';
import * as adminAccessModule from '@/app/lib/auth/admin-access';
import * as calendarModule from '@/app/lib/firebase/calendar';
import * as dateModule from '@/app/utils/date';
import type { CalendarEvent } from '@/app/types';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const authorize = (): void => {
  vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
    authorized: true,
    user: { id: 'admin-1', isAdmin: true },
  } as any);
};

/** Admin SDK stub: reads answer from `data` by path; writes are recorded. */
function stubDatabase(data: Record<string, unknown>) {
  const update = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn().mockResolvedValue(undefined);
  const ref = vi.fn((path?: string) => ({
    once: vi.fn().mockResolvedValue({
      exists: () => path !== undefined && data[path] != null,
      val: () => (path !== undefined ? (data[path] ?? null) : null),
    }),
    update,
    push: vi.fn().mockReturnValue({ key: 'new-event', set }),
  }));
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref } as any);
  return { ref, update, set };
}

const event = (e: Partial<CalendarEvent> & { id: string; isoDate: string }): CalendarEvent => ({
  location: '',
  distances: '',
  departure: '',
  address: '',
  remarks: '',
  alternative: '',
  group: 'Blanmont',
  ...e,
});

const put = (body: unknown): Promise<Response> =>
  updateEventRoute(
    new NextRequest('http://localhost:3000/api/admin/events/event-1', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: 'event-1' }) }
  );

describe('Linking catalog traces to calendar rides (#255)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(revalidatePath).mockClear();
  });

  describe('GET /api/admin/events/trace-links', () => {
    it('is guarded by the Événements section', async () => {
      const guard = vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      } as any);

      const res = await traceLinksRoute(new NextRequest('http://localhost:3000/api/admin/events/trace-links'));

      expect(res.status).toBe(403);
      expect(guard).toHaveBeenCalledWith(expect.anything(), 'events');
    });

    it('lists the catalog traces and the upcoming rides only, never cached', async () => {
      authorize();
      stubDatabase({
        traces: {
          dyle: { name: 'Dyle', distance: 85, gpxUrl: 'https://f.io/dyle.gpx' },
          bare: { name: 'Sans lien', distance: 40 },
        },
      });
      vi.spyOn(dateModule, 'getTodayIso').mockReturnValue('2026-11-27');
      vi.spyOn(calendarModule, 'getCalendarEvents').mockResolvedValue([
        event({ id: 'past', isoDate: '2026-11-21', location: 'Chastre' }),
        event({ id: 'today', isoDate: '2026-11-27', location: 'Blanmont', traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' }),
        event({ id: 'next', isoDate: '2026-11-29', location: 'Gembloux', group: 'Gravel' }),
      ]);

      const res = await traceLinksRoute(new NextRequest('http://localhost:3000/api/admin/events/trace-links'));

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('private, no-store');
      const body = await res.json();
      expect(body.traces).toEqual([{ id: 'dyle', name: 'Dyle', distance: 85, link: 'https://f.io/dyle.gpx' }]);
      expect(body.events).toEqual([
        {
          id: 'today',
          isoDate: '2026-11-27',
          location: 'Blanmont',
          group: 'Blanmont',
          traceId: 'dyle',
          gpxUrl: 'https://f.io/dyle.gpx',
        },
        { id: 'next', isoDate: '2026-11-29', location: 'Gembloux', group: 'Gravel' },
      ]);
    });
  });

  describe('PUT /api/admin/events/[id] with traceId', () => {
    it('stores the trace id and its link, over any gpxUrl sent', async () => {
      authorize();
      const { update } = stubDatabase({ 'traces/dyle': { name: 'Dyle', gpxUrl: 'https://f.io/dyle.gpx' } });

      const res = await put({ traceId: 'dyle', gpxUrl: 'https://evil.example/other.gpx', departure: '9h00' });

      expect(res.status).toBe(200);
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx', departure: '9h00' })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('unlinks with an empty id, keeping the gpxUrl the caller sends', async () => {
      authorize();
      const { update } = stubDatabase({});

      expect((await put({ traceId: '', gpxUrl: '' })).status).toBe(200);
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ traceId: null, gpxUrl: '' }));
    });

    it('drops the catalog link when a link is typed by hand', async () => {
      authorize();
      const { update } = stubDatabase({});

      expect((await put({ gpxUrl: 'https://www.strava.com/routes/1' })).status).toBe(200);
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ traceId: null, gpxUrl: 'https://www.strava.com/routes/1' })
      );
    });

    it('leaves the link alone on an edit that touches neither', async () => {
      authorize();
      const { update } = stubDatabase({});

      await put({ departure: '8h30' });
      expect(update.mock.calls[0][0]).not.toHaveProperty('traceId');
    });

    it.each([
      [{ traceId: 'missing' }, 404],
      [{ traceId: 'bare' }, 422],
      [{ traceId: '../members' }, 400],
      [['not', 'an', 'object'], 400],
    ])('refuses %j with %i and writes nothing', async (body, status) => {
      authorize();
      const { update } = stubDatabase({ 'traces/bare': { name: 'Sans lien' } });

      const res = await put(body);

      expect(res.status).toBe(status);
      expect((await res.json()).error).toEqual(expect.any(String));
      expect(update).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/admin/events with traceId', () => {
    const post = (body: unknown): Promise<Response> =>
      createEventRoute(
        new NextRequest('http://localhost:3000/api/admin/events', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      );

    it('creates the ride on the catalog trace', async () => {
      authorize();
      const { set } = stubDatabase({ 'traces/dyle': { name: 'Dyle', mapUrl: 'https://www.komoot.com/tour/9' } });

      const res = await post({ isoDate: '2026-12-05', location: 'Blanmont', traceId: 'dyle' });

      expect(res.status).toBe(200);
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ traceId: 'dyle', gpxUrl: 'https://www.komoot.com/tour/9' })
      );
    });

    it('stores no traceId key without a trace', async () => {
      authorize();
      const { set } = stubDatabase({});

      await post({ isoDate: '2026-12-05', location: 'Blanmont', traceId: '' });
      expect(set.mock.calls[0][0]).not.toHaveProperty('traceId');
    });

    it('creates nothing for an unknown trace', async () => {
      authorize();
      const { set } = stubDatabase({});

      expect((await post({ isoDate: '2026-12-05', traceId: 'missing' })).status).toBe(404);
      expect(set).not.toHaveBeenCalled();
    });
  });
});
