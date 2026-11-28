import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import * as adminModule from '@/app/lib/firebase/admin';
import * as adminAccessModule from '@/app/lib/auth/admin-access';
import { resolveTraceRoute } from '@/app/lib/trace-route';
import {
  backfillRideTraces,
  catalogTraceForRide,
  indexCatalog,
  linkRideToCatalog,
  rideTraceRecord,
  traceUrlKey,
} from '@/app/lib/event-trace-catalog';
import { POST as backfillRoute } from '@/app/api/admin/events/trace-catalog/route';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/app/lib/trace-route', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/lib/trace-route')>()),
  resolveTraceRoute: vi.fn(),
}));

const GARMIN = 'https://connect.garmin.com/modern/course/532374522';

/** Admin SDK stub over a tree of `nodes` by path; writes are recorded and applied. */
function stubDatabase(nodes: Record<string, unknown>) {
  const set = vi.fn(async (path: string, value: unknown) => {
    nodes[path] = value;
  });
  const update = vi.fn(async (path: string, value: Record<string, unknown>) => {
    nodes[path] = { ...(nodes[path] as object), ...value };
  });
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({
    ref: (path: string) => ({
      once: async () => ({ exists: () => nodes[path] != null, val: () => nodes[path] ?? null }),
      set: (v: unknown) => set(path, v),
      update: (v: Record<string, unknown>) => update(path, v),
    }),
  } as never);
  return { set, update };
}

describe('event trace catalogue (#263)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(resolveTraceRoute).mockReset().mockResolvedValue(null);
  });

  describe('traceUrlKey', () => {
    it('matches the spellings of one Garmin course, Strava route or Komoot tour', () => {
      expect(traceUrlKey(GARMIN)).toBe('garmin-course:532374522');
      expect(traceUrlKey('https://connect.garmin.com/app/course/532374522/')).toBe('garmin-course:532374522');
      expect(traceUrlKey('  https://www.strava.com/routes/42/ ')).toBe('strava-route:42');
      expect(traceUrlKey('https://strava.com/routes/42')).toBe('strava-route:42');
      expect(traceUrlKey('https://www.komoot.com/fr-fr/tour/77?share_token=abc')).toBe('komoot-tour:77');
      expect(traceUrlKey('https://www.komoot.de/tour/77')).toBe('komoot-tour:77');
    });

    it('keys any other web link by host, path and query', () => {
      expect(traceUrlKey('https://www.F.io/Thyle.gpx/')).toBe('f.io/Thyle.gpx');
      expect(traceUrlKey('https://f.io/get?id=1')).toBe('f.io/get?id=1');
      expect(traceUrlKey('https://f.io/get?id=2')).not.toBe(traceUrlKey('https://f.io/get?id=1'));
    });

    it('is null for anything but a web link', () => {
      for (const value of ['', '   ', 'javascript:alert(1)', 'ftp://f.io/a.gpx', '/api/trace/1', null, 42]) {
        expect(traceUrlKey(value)).toBeNull();
      }
    });
  });

  describe('indexCatalog', () => {
    it('finds a trace by its GPX file or its map link; the oldest id wins a shared course', () => {
      const index = indexCatalog({
        trace_2: { name: 'Copie', mapUrl: 'https://connect.garmin.com/app/course/532374522' },
        trace_1: { name: 'Tirlemont', mapUrl: GARMIN, gpxUrl: 'https://f.io/tirlemont.gpx' },
        bare: { name: 'Sans lien' },
        gone: null,
      });
      expect(index.get('garmin-course:532374522')).toEqual({ traceId: 'trace_1', gpxUrl: 'https://f.io/tirlemont.gpx' });
      expect(index.get('f.io/tirlemont.gpx')?.traceId).toBe('trace_1');
      expect(index.size).toBe(2);
    });
  });

  describe('rideTraceRecord', () => {
    const now = new Date('2026-11-28T09:00:00Z');

    it('takes name, distance, D+ and map from the course; a page link is the map link', () => {
      const record = rideTraceRecord(
        GARMIN,
        { location: 'Fechère', isoDate: '2026-11-28' },
        { name: ' NordEst Tirlemont 105km ', distanceKm: 104.69488, elevationM: 523, polyline: 'abc' },
        now
      );
      expect(record).toMatchObject({
        name: 'NordEst Tirlemont 105km',
        distance: 104.7,
        elevation: 523,
        polyline: 'abc',
        mapUrl: GARMIN,
        gpxUrl: '',
        surface: 'Road',
        quality: 3,
        createdAt: '2026-11-28T09:00:00.000Z',
      });
      expect(record.description).toBe('Trace de la sortie du Samedi 28 novembre 2026 (Fechère), ajoutée depuis le calendrier.');
    });

    it('names a trace without a readable course after the ride; a file is the GPX file', () => {
      expect(rideTraceRecord('https://f.io/a.gpx', { location: 'Chastre', isoDate: '2026-12-06', group: 'VTT' }, null, now)).toMatchObject({
        name: 'Chastre · Dimanche 6 décembre 2026',
        distance: 0,
        elevation: 0,
        gpxUrl: 'https://f.io/a.gpx',
        mapUrl: '',
        surface: 'MTB',
      });
      expect(rideTraceRecord('https://f.io/a.gpx', {}, null, now)).toMatchObject({
        name: 'Sortie du club',
        description: 'Trace de la sortie, ajoutée depuis le calendrier.',
      });
    });
  });

  describe('catalogTraceForRide', () => {
    it('reuses the trace of the same course, then creates one per new course', async () => {
      const { set } = stubDatabase({});
      const index = indexCatalog({ dyle: { name: 'Dyle', gpxUrl: 'https://f.io/dyle.gpx' } });

      expect(await catalogTraceForRide({ gpxUrl: 'https://www.f.io/dyle.gpx/' }, index)).toEqual({
        traceId: 'dyle',
        gpxUrl: 'https://f.io/dyle.gpx',
        created: false,
      });
      expect(set).not.toHaveBeenCalled();

      const first = await catalogTraceForRide({ gpxUrl: GARMIN, location: 'A', isoDate: '2026-11-28' }, index);
      const again = await catalogTraceForRide({ gpxUrl: 'https://connect.garmin.com/app/course/532374522' }, index);
      expect(first).toMatchObject({ created: true, gpxUrl: GARMIN });
      expect(again).toEqual({ traceId: first?.traceId, gpxUrl: GARMIN, created: false });
      expect(set).toHaveBeenCalledTimes(1);
      expect(set.mock.calls[0][0]).toBe(`traces/${first?.traceId}`);
      expect(resolveTraceRoute).toHaveBeenCalledTimes(1);
    });

    it('is null for a ride without a web link', async () => {
      expect(await catalogTraceForRide({ gpxUrl: '' }, new Map())).toBeNull();
    });
  });

  describe('linkRideToCatalog', () => {
    it('never throws: an unreadable catalogue leaves the ride unlinked', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('no credentials');
      });
      await expect(linkRideToCatalog({ gpxUrl: GARMIN })).resolves.toBeNull();
    });
  });

  describe('backfillRideTraces', () => {
    const rides = (): Record<string, unknown> => ({
      'calendar-events': {
        b: { isoDate: '2026-10-04', location: 'Perwez', gpxUrl: GARMIN },
        a: { isoDate: '2026-09-27', location: 'Chastre', gpxUrl: 'https://connect.garmin.com/app/course/532374522' },
        linked: { isoDate: '2026-09-20', gpxUrl: 'https://f.io/x.gpx', traceId: 'dyle' },
        none: { isoDate: '2026-09-13', gpxUrl: '' },
        typed: { isoDate: '2026-11-01', gpxUrl: 'https://f.io/dyle.gpx' },
      },
      traces: { dyle: { name: 'Dyle', gpxUrl: 'https://f.io/dyle.gpx' } },
    });

    it('links every ride with a link and no catalog trace, one new trace per course', async () => {
      const nodes = rides();
      const { set, update } = stubDatabase(nodes);

      const report = await backfillRideTraces();

      expect(report).toEqual({ linked: 3, created: 1, failed: 0, remaining: 0 });
      expect(set).toHaveBeenCalledTimes(1);
      const newId = String(set.mock.calls[0][0]).slice('traces/'.length);
      // Oldest first: Chastre's spelling names the course's link.
      expect(update).toHaveBeenCalledWith('calendar-events/a', expect.objectContaining({ traceId: newId }));
      expect(update).toHaveBeenCalledWith('calendar-events/b', expect.objectContaining({ traceId: newId }));
      expect(update).toHaveBeenCalledWith(
        'calendar-events/typed',
        expect.objectContaining({ traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' })
      );
      expect(update).not.toHaveBeenCalledWith('calendar-events/linked', expect.anything());
      expect(update).not.toHaveBeenCalledWith('calendar-events/none', expect.anything());
    });

    it('is safe to run again: nothing left, nothing written', async () => {
      const nodes = rides();
      stubDatabase(nodes);
      await backfillRideTraces();
      // The second run reads what the first wrote.
      const events = nodes['calendar-events'] as Record<string, Record<string, unknown>>;
      for (const id of ['a', 'b', 'typed']) Object.assign(events[id], nodes[`calendar-events/${id}`]);
      nodes.traces = Object.fromEntries(
        Object.entries(nodes).filter(([k]) => k.startsWith('traces/')).map(([k, v]) => [k.slice(7), v])
      );
      Object.assign(nodes.traces as object, { dyle: { name: 'Dyle', gpxUrl: 'https://f.io/dyle.gpx' } });

      const { set, update } = stubDatabase(nodes);
      expect(await backfillRideTraces()).toEqual({ linked: 0, created: 0, failed: 0, remaining: 0 });
      expect(set).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it('stops when its time budget is spent and reports the rides left', async () => {
      stubDatabase(rides());
      let t = 0;
      // Each clock read moves 5 s: the start, then one ride, then the budget is spent.
      const report = await backfillRideTraces({ budgetMs: 8000, clock: () => (t += 5000) });
      expect(report).toEqual({ linked: 1, created: 1, failed: 0, remaining: 2 });
    });

    it('counts a ride the catalogue refused as failed and still pending', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { set } = stubDatabase(rides());
      set.mockRejectedValue(new Error('PERMISSION_DENIED'));

      const report = await backfillRideTraces();
      // Both Garmin rides fail (no trace could be written); the Dyle ride still links.
      expect(report).toEqual({ linked: 1, created: 0, failed: 2, remaining: 2 });
    });
  });

  describe('POST /api/admin/events/trace-catalog', () => {
    const call = (): Promise<Response> =>
      backfillRoute(new NextRequest('http://localhost:3000/api/admin/events/trace-catalog', { method: 'POST' }));

    it('is guarded by the Événements section', async () => {
      const guard = vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      } as never);
      const { set } = stubDatabase({});

      expect((await call()).status).toBe(403);
      expect(guard).toHaveBeenCalledWith(expect.anything(), 'events');
      expect(set).not.toHaveBeenCalled();
    });

    it('answers the report, never cached, and refreshes the pages when rides changed', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as never);
      stubDatabase({
        'calendar-events': { a: { isoDate: '2026-09-27', gpxUrl: GARMIN } },
        traces: {},
      });

      const res = await call();

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('private, no-store');
      expect(await res.json()).toEqual({ linked: 1, created: 1, failed: 0, remaining: 0 });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('refreshes nothing when every ride is already linked', async () => {
      vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as never);
      stubDatabase({ 'calendar-events': {}, traces: {} });

      expect(await (await call()).json()).toEqual({ linked: 0, created: 0, failed: 0, remaining: 0 });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
