import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createEvent } from '@/app/api/admin/events/route';
import { PUT as updateEvent } from '@/app/api/admin/events/[id]/route';
import * as adminModule from '@/app/lib/firebase/admin';
import * as adminAccessModule from '@/app/lib/auth/admin-access';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const CATALOG = {
  dyle: { name: 'Vallée de la Dyle', gpxUrl: 'https://f.io/dyle.gpx', distance: 110 },
  villers: { name: 'Abbaye de Villers', gpxUrl: '', mapUrl: 'https://www.komoot.com/tour/9', distance: 62 },
};

/** RTDB stub: the catalogue under `traces`, a stored ride under `calendar-events/ride-1`. */
function stubDb() {
  const setMock = vi.fn().mockResolvedValue(undefined);
  const updateMock = vi.fn().mockResolvedValue(undefined);
  const ref = vi.fn((path: string) => {
    if (path === 'calendar-events') return { push: () => ({ key: 'new-ride', set: setMock }) };
    if (path === 'traces') return { once: async () => ({ val: () => CATALOG }) };
    if (path.startsWith('traces/')) {
      const trace = CATALOG[path.slice('traces/'.length) as keyof typeof CATALOG];
      return { once: async () => ({ exists: () => Boolean(trace), val: () => trace ?? null }), set: vi.fn() };
    }
    if (path === 'calendar-events/ride-1') {
      return {
        update: updateMock,
        once: async () => ({ val: () => ({ isoDate: '2026-11-28', location: 'Blanmont' }) }),
      };
    }
    throw new Error(`unexpected path ${path}`);
  });
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref } as any);
  return { setMock, updateMock };
}

const json = (method: string, url: string, body: unknown) =>
  new NextRequest(`http://localhost:3000${url}`, { method, body: JSON.stringify(body) });
const ctx = { params: Promise.resolve({ id: 'ride-1' }) };

describe('Ride traces: one per group or distance (event API)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(adminAccessModule, 'verifySectionRequest').mockResolvedValue({
      authorized: true,
      user: { id: 'admin-1', isAdmin: true },
    } as any);
  });

  it('creates a ride with a trace per group: catalog traces and links typed by hand', async () => {
    const { setMock } = stubDb();
    const res = await createEvent(
      json('POST', '/api/admin/events', {
        isoDate: '2026-11-28',
        location: 'Blanmont',
        traces: [
          { label: 'GR1 · 110 km', traceId: 'dyle', gpxUrl: 'ignored: the catalog wins' },
          // Another spelling of a catalog course joins that trace (#263).
          { label: 'GR3', traceId: '', gpxUrl: 'https://www.komoot.com/fr-fr/tour/9?share_token=x' },
          { label: '', traceId: '', gpxUrl: '' }, // empty row: dropped
        ],
      })
    );

    expect(res.status).toBe(200);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gpxUrl: 'https://f.io/dyle.gpx',
        traceId: 'dyle',
        traceLabel: 'GR1 · 110 km',
        extraTraces: [{ label: 'GR3', traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' }],
      })
    );
  });

  it('stores a single unnamed trace exactly like before', async () => {
    const { setMock } = stubDb();
    await createEvent(
      json('POST', '/api/admin/events', { isoDate: '2026-11-28', traces: [{ label: '', traceId: 'dyle', gpxUrl: '' }] })
    );
    const stored = setMock.mock.calls[0][0];
    expect(stored).toMatchObject({ gpxUrl: 'https://f.io/dyle.gpx', traceId: 'dyle' });
    expect(stored).not.toHaveProperty('traceLabel');
    expect(stored).not.toHaveProperty('extraTraces');
  });

  it('replaces the whole list on update, removing the keys left empty', async () => {
    const { updateMock } = stubDb();
    const res = await updateEvent(
      json('PUT', '/api/admin/events/ride-1', { departure: '8h30', traces: [{ label: '', traceId: 'dyle', gpxUrl: '' }] }),
      ctx
    );

    expect(res.status).toBe(200);
    const fields = updateMock.mock.calls[0][0];
    expect(fields).toMatchObject({
      departure: '8h30',
      gpxUrl: 'https://f.io/dyle.gpx',
      traceId: 'dyle',
      traceLabel: null,
      extraTraces: null,
    });
    expect(fields).not.toHaveProperty('traces');
  });

  it('refuses a link that is not a web link, an unknown catalog trace and too many traces', async () => {
    const { updateMock } = stubDb();
    const bad = await updateEvent(
      json('PUT', '/api/admin/events/ride-1', { traces: [{ label: 'GR1', gpxUrl: 'javascript:alert(1)' }] }),
      ctx
    );
    expect(bad.status).toBe(400);

    const missing = await updateEvent(
      json('PUT', '/api/admin/events/ride-1', { traces: [{ label: 'GR1', traceId: 'gone' }] }),
      ctx
    );
    expect(missing.status).toBe(404);

    const many = Array.from({ length: 7 }, (_, i) => ({ label: `${i}`, traceId: 'dyle' }));
    const tooMany = await updateEvent(json('PUT', '/api/admin/events/ride-1', { traces: many }), ctx);
    expect(tooMany.status).toBe(400);
    expect((await tooMany.json()).error).toMatch(/6 traces/);

    const longLabel = await updateEvent(
      json('PUT', '/api/admin/events/ride-1', { traces: [{ label: 'x'.repeat(61), traceId: 'dyle' }] }),
      ctx
    );
    expect(longLabel.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('never stores other traces sent outside the list (unchecked links)', async () => {
    const { updateMock } = stubDb();
    await updateEvent(
      json('PUT', '/api/admin/events/ride-1', {
        departure: '9h',
        traceLabel: 'x',
        extraTraces: [{ gpxUrl: 'javascript:alert(1)' }],
      }),
      ctx
    );
    const fields = updateMock.mock.calls[0][0];
    expect(fields).not.toHaveProperty('extraTraces');
    expect(fields).not.toHaveProperty('traceLabel');
  });
});
