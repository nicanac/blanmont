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
import { resolveTraceRoute } from '@/app/lib/trace-route';
import type { CalendarEvent } from '@/app/types';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
// No network: the course a link points to is read by `resolveTraceRoute` (#263).
vi.mock('@/app/lib/trace-route', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/lib/trace-route')>()),
  resolveTraceRoute: vi.fn(),
}));

const authorize = (): void => {
  vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
    authorized: true,
    user: { id: 'admin-1', isAdmin: true },
  } as any);
};

/**
 * Admin SDK stub: reads answer from `data` by path; writes are recorded. `set` is the new
 * event's write (push), `setAt(path, value)` a write at a path (a new catalog trace).
 */
function stubDatabase(data: Record<string, unknown>) {
  const update = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn().mockResolvedValue(undefined);
  const setAt = vi.fn().mockResolvedValue(undefined);
  const ref = vi.fn((path?: string) => ({
    once: vi.fn().mockResolvedValue({
      exists: () => path !== undefined && data[path] != null,
      val: () => (path !== undefined ? (data[path] ?? null) : null),
    }),
    update,
    set: (value: unknown) => setAt(path, value),
    push: vi.fn().mockReturnValue({ key: 'new-event', set }),
  }));
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref } as any);
  return { ref, update, set, setAt };
}

/** Id of a catalog trace made for a ride (#263). */
const NEW_TRACE_ID = /^trace_\d+_[0-9a-f]{8}$/;

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
    vi.mocked(resolveTraceRoute).mockReset().mockResolvedValue(null);
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

    it('adds a link typed by hand to the catalogue and links the ride to it (#263)', async () => {
      authorize();
      const { update, setAt } = stubDatabase({
        // A partial edit: the stored ride names the new trace.
        'calendar-events/event-1': { location: 'Fechère', isoDate: '2026-11-28', group: 'Blanmont' },
      });

      expect((await put({ gpxUrl: 'https://www.strava.com/routes/1' })).status).toBe(200);

      expect(setAt).toHaveBeenCalledTimes(1);
      const [path, record] = setAt.mock.calls[0];
      expect(path).toMatch(/^traces\/trace_\d+_[0-9a-f]{8}$/);
      expect(record).toMatchObject({
        name: 'Fechère · Samedi 28 novembre 2026',
        mapUrl: 'https://www.strava.com/routes/1',
        gpxUrl: '',
        surface: 'Road',
      });
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: path.slice('traces/'.length),
          gpxUrl: 'https://www.strava.com/routes/1',
        })
      );
    });

    it('names and measures a Garmin course from the course itself (#263)', async () => {
      authorize();
      vi.mocked(resolveTraceRoute).mockResolvedValue({
        name: 'NordEst Tirlemont 105km',
        distanceKm: 104.69488,
        elevationM: 523,
        polyline: '_p~iF~ps|U',
      });
      const { update, setAt } = stubDatabase({});
      const garmin = 'https://connect.garmin.com/modern/course/532374522';

      await put({ gpxUrl: garmin, location: 'Fechère', isoDate: '2026-11-28' });

      expect(resolveTraceRoute).toHaveBeenCalledWith(garmin);
      expect(setAt.mock.calls[0][1]).toMatchObject({
        name: 'NordEst Tirlemont 105km',
        distance: 104.7,
        elevation: 523,
        polyline: '_p~iF~ps|U',
        mapUrl: garmin,
      });
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ traceId: expect.stringMatching(NEW_TRACE_ID) }));
    });

    it('links a typed link to the catalog trace of the same course, adding nothing (#263)', async () => {
      authorize();
      const { update, setAt } = stubDatabase({
        traces: {
          dyle: { name: 'Dyle', gpxUrl: 'https://f.io/dyle.gpx' },
          tirlemont: { name: 'Tirlemont', mapUrl: 'https://connect.garmin.com/app/course/532374522' },
        },
      });

      await put({ traceId: '', gpxUrl: 'https://connect.garmin.com/modern/course/532374522/', location: 'x', isoDate: '2026-11-28' });

      expect(setAt).not.toHaveBeenCalled();
      expect(resolveTraceRoute).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ traceId: 'tirlemont', gpxUrl: 'https://connect.garmin.com/app/course/532374522' })
      );
    });

    it('saves the ride with its link when the catalogue cannot be written (#263)', async () => {
      authorize();
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { update, setAt } = stubDatabase({});
      setAt.mockRejectedValue(new Error('PERMISSION_DENIED'));

      expect((await put({ gpxUrl: 'https://f.io/new.gpx', location: 'x', isoDate: '2026-11-28' })).status).toBe(200);
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ traceId: null, gpxUrl: 'https://f.io/new.gpx' }));
    });

    it('adds nothing for a link that is not a web link', async () => {
      authorize();
      const { update, setAt } = stubDatabase({});

      await put({ gpxUrl: 'javascript:alert(1)', location: 'x', isoDate: '2026-11-28' });
      expect(setAt).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ traceId: null }));
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

    it('adds the link of a new ride to the catalogue and links the ride (#263)', async () => {
      authorize();
      const { set, setAt } = stubDatabase({});

      const res = await post({ isoDate: '2026-12-05', location: 'Blanmont', group: 'VTT', gpxUrl: 'https://f.io/vtt.gpx' });

      expect(res.status).toBe(200);
      expect(setAt.mock.calls[0][1]).toMatchObject({
        name: 'Blanmont · Samedi 5 décembre 2026',
        gpxUrl: 'https://f.io/vtt.gpx',
        mapUrl: '',
        surface: 'MTB',
      });
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ traceId: expect.stringMatching(NEW_TRACE_ID), gpxUrl: 'https://f.io/vtt.gpx' })
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
