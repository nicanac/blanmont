import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { getSessionUser, getCalendarEvents, fetchGarminCourseGpx } = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  getCalendarEvents: vi.fn(),
  fetchGarminCourseGpx: vi.fn(),
}));
vi.mock('@/app/lib/auth/session', () => ({ getSessionUser }));
vi.mock('@/app/lib/firebase/calendar', () => ({ getCalendarEvents }));
vi.mock('@/app/lib/trace-route', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/lib/trace-route')>()),
  fetchGarminCourseGpx,
}));

import { GET } from '@/app/api/trace/[eventId]/route';

const GARMIN = 'https://connect.garmin.com/app/course/532374522';
const call = (eventId: string, query = '') =>
  GET(new NextRequest(`http://localhost/api/trace/${eventId}${query}`), {
    params: Promise.resolve({ eventId }),
  });

describe('GET /api/trace/[eventId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionUser.mockResolvedValue({ uid: 'u1' });
    getCalendarEvents.mockResolvedValue([
      { id: 'garmin', gpxUrl: GARMIN },
      { id: 'strava', gpxUrl: 'https://www.strava.com/routes/999' },
      { id: 'script', gpxUrl: 'javascript:alert(1)' },
      { id: 'none', gpxUrl: '' },
      {
        id: 'ffbc',
        gpxUrl: 'https://www.strava.com/routes/110',
        traceLabel: '110 km',
        extraTraces: [
          { label: '80 km', gpxUrl: 'https://www.strava.com/routes/80' },
          { label: 'bad', gpxUrl: 'javascript:alert(1)' },
        ],
      },
    ]);
  });

  it('sends a guest to the login page, then back here, without reading the trace (#252)', async () => {
    getSessionUser.mockResolvedValue(null);
    const res = await call('garmin');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('http://localhost/login?redirect=%2Fapi%2Ftrace%2Fgarmin');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(getCalendarEvents).not.toHaveBeenCalled();
  });

  it('downloads a Garmin course as a GPX file for a member (#246)', async () => {
    fetchGarminCourseGpx.mockResolvedValue({ name: 'NordEst Tirlemont 105km', gpx: '<gpx/>' });
    const res = await call('garmin');
    expect(res.status).toBe(200);
    expect(fetchGarminCourseGpx).toHaveBeenCalledWith('532374522');
    expect(res.headers.get('content-type')).toContain('application/gpx+xml');
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="nordest-tirlemont-105km.gpx"'
    );
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(await res.text()).toBe('<gpx/>');
  });

  it('redirects to Garmin Connect when the course page cannot be read', async () => {
    fetchGarminCourseGpx.mockResolvedValue(null);
    const res = await call('garmin');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(GARMIN);
  });

  it('redirects a member to any other source', async () => {
    const res = await call('strava');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://www.strava.com/routes/999');
    expect(fetchGarminCourseGpx).not.toHaveBeenCalled();
  });

  it('serves the n-th trace of a ride with one per group or distance', async () => {
    expect((await call('ffbc')).headers.get('location')).toBe('https://www.strava.com/routes/110');
    expect((await call('ffbc', '?t=0')).headers.get('location')).toBe('https://www.strava.com/routes/110');
    expect((await call('ffbc', '?t=1')).headers.get('location')).toBe('https://www.strava.com/routes/80');
    for (const t of ['?t=2', '?t=3', '?t=-1', '?t=1.5', '?t=x']) expect((await call('ffbc', t)).status).toBe(404);
  });

  it('brings a guest back to the same trace after login', async () => {
    getSessionUser.mockResolvedValue(null);
    const res = await call('ffbc', '?t=1');
    expect(res.headers.get('location')).toBe('http://localhost/login?redirect=%2Fapi%2Ftrace%2Fffbc%3Ft%3D1');
  });

  it('is 404 for an unknown event, an event without trace or a non-web link', async () => {
    for (const id of ['missing', 'none', 'script']) expect((await call(id)).status).toBe(404);
  });
});
