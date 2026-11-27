import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { fetchGarminCourseGpx } = vi.hoisted(() => ({ fetchGarminCourseGpx: vi.fn() }));
vi.mock('@/app/lib/trace-route', () => ({ fetchGarminCourseGpx }));

import { GET } from '@/app/api/gpx/garmin/[id]/route';

const call = (id: string) =>
  GET(new NextRequest(`http://localhost/api/gpx/garmin/${id}`), {
    params: Promise.resolve({ id }),
  });

describe('GET /api/gpx/garmin/[id] (#246)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the course as a GPX attachment', async () => {
    fetchGarminCourseGpx.mockResolvedValue({ name: 'NordEst Tirlemont 105km', gpx: '<gpx/>' });
    const res = await call('532374522');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/gpx+xml');
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="nordest-tirlemont-105km.gpx"'
    );
    expect(await res.text()).toBe('<gpx/>');
    expect(fetchGarminCourseGpx).toHaveBeenCalledWith('532374522');
  });

  it('falls back to Garmin Connect when the course cannot be read', async () => {
    fetchGarminCourseGpx.mockResolvedValue(null);
    const res = await call('532374522');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://connect.garmin.com/modern/course/532374522');
  });

  it('refuses an id that is not a number, without calling Garmin', async () => {
    const res = await call('..%2Fsecret');
    expect(res.status).toBe(400);
    expect(fetchGarminCourseGpx).not.toHaveBeenCalled();
  });
});
