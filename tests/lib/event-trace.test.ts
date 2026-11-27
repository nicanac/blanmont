import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as adminModule from '@/app/lib/firebase/admin';
import { listCatalogTraceOptions, resolveEventTraceId, traceLink } from '@/app/lib/event-trace';

/** An Admin SDK stub whose `ref(path).once('value')` answers from `data` (keyed by path). */
function stubDatabase(data: Record<string, unknown>): ReturnType<typeof vi.fn> {
  const ref = vi.fn((path: string) => ({
    once: vi.fn().mockResolvedValue({
      exists: () => data[path] !== undefined && data[path] !== null,
      val: () => data[path] ?? null,
    }),
  }));
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref } as any);
  return ref;
}

describe('event-trace (#255)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('traceLink', () => {
    it('prefers the GPX file, then the map page', () => {
      expect(traceLink({ gpxUrl: 'https://x.io/a.gpx', mapUrl: 'https://komoot.com/tour/1' })).toBe(
        'https://x.io/a.gpx'
      );
      expect(traceLink({ gpxUrl: '', mapUrl: ' https://komoot.com/tour/1 ' })).toBe(
        'https://komoot.com/tour/1'
      );
    });

    it('keeps web links only', () => {
      expect(traceLink({ gpxUrl: 'javascript:alert(1)', mapUrl: 'data:text/html,x' })).toBeNull();
      expect(traceLink({ gpxUrl: 'javascript:alert(1)', mapUrl: 'https://ok.be/r' })).toBe('https://ok.be/r');
      expect(traceLink({})).toBeNull();
    });
  });

  describe('listCatalogTraceOptions', () => {
    it('lists the traces that have a link, sorted by name', async () => {
      stubDatabase({
        traces: {
          t2: { name: 'Vallée de la Dyle', distance: 84.6, elevation: 912.4, surface: 'Road', gpxUrl: 'https://f.io/dyle.gpx' },
          t1: { name: 'Abbaye de Villers', distance: 62, mapUrl: 'https://www.komoot.com/tour/9' },
          t3: { name: 'Sans lien', distance: 50 },
          t4: null,
        },
      });

      const options = await listCatalogTraceOptions();

      expect(options).toEqual([
        { id: 't1', name: 'Abbaye de Villers', distance: 62, link: 'https://www.komoot.com/tour/9' },
        {
          id: 't2',
          name: 'Vallée de la Dyle',
          distance: 85,
          elevation: 912,
          surface: 'Road',
          link: 'https://f.io/dyle.gpx',
        },
      ]);
    });

    it('answers an empty list for an empty catalogue', async () => {
      stubDatabase({});
      expect(await listCatalogTraceOptions()).toEqual([]);
    });
  });

  describe('resolveEventTraceId', () => {
    it('takes the link of the catalog trace', async () => {
      const ref = stubDatabase({ 'traces/trace_dyle': { name: 'Dyle', gpxUrl: 'https://f.io/dyle.gpx' } });

      expect(await resolveEventTraceId('trace_dyle')).toEqual({
        ok: true,
        fields: { traceId: 'trace_dyle', gpxUrl: 'https://f.io/dyle.gpx' },
      });
      expect(ref).toHaveBeenCalledWith('traces/trace_dyle');
    });

    it('unlinks on an empty id without touching the database', async () => {
      const ref = stubDatabase({});
      expect(await resolveEventTraceId('')).toEqual({ ok: true, fields: { traceId: null } });
      expect(await resolveEventTraceId(null)).toEqual({ ok: true, fields: { traceId: null } });
      expect(ref).not.toHaveBeenCalled();
    });

    it('refuses an id that is not an RTDB key, before any read', async () => {
      const ref = stubDatabase({});
      for (const bad of ['../members', 'a/b', 'x.y', 42, {}]) {
        expect(await resolveEventTraceId(bad)).toMatchObject({ ok: false, status: 400 });
      }
      expect(ref).not.toHaveBeenCalled();
    });

    it('answers 404 for an unknown trace and 422 for a trace without link', async () => {
      stubDatabase({ 'traces/no_link': { name: 'Sans lien' } });
      expect(await resolveEventTraceId('missing')).toMatchObject({ ok: false, status: 404 });
      expect(await resolveEventTraceId('no_link')).toMatchObject({ ok: false, status: 422 });
    });
  });
});
