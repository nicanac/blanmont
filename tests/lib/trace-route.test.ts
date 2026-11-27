import { describe, it, expect, vi, afterEach } from 'vitest';
import polylineCodec from '@mapbox/polyline';
import {
  decimate,
  garminCourseId,
  gpxRoute,
  MAX_PREVIEW_POINTS,
  parseGarminCourse,
  resolveTraceRoute,
  withTraceRoutes,
} from '@/app/lib/trace-route';

/** A Garmin course embed page: the course sits in the Next.js flight payload, JSON-escaped. */
function garminEmbed(course: Record<string, unknown> | null): string {
  const flight = course
    ? `6:["$","$L13",null,{"course":${JSON.stringify(course)},"locale":"fr-FR"}]\n`
    : '6:["$","$L13",null,{"error":"not found"}]\n';
  return [
    '<!DOCTYPE html><html><head><title>Garmin Connect</title></head><body>',
    `<script>self.__next_f.push([1,${JSON.stringify('1:"$Sreact.fragment"\n')}])</script>`,
    `<script>self.__next_f.push([1,${JSON.stringify(flight)}])</script>`,
    '</body></html>',
  ].join('');
}

const COURSE = {
  courseId: 532374522,
  courseName: 'NordEst_Tirlemont_105km',
  firstName: 'owner-first-name',
  displayName: 'owner-handle',
  distanceMeter: 104694.88,
  elevationGainMeter: 523.28,
  description: 'Text with "quotes" and {braces}',
  geoPoints: [
    { latitude: 50.6232, longitude: 4.6424, elevation: 123.7 },
    { latitude: 50.7, longitude: 4.8, elevation: 110 },
    { latitude: 50.6232, longitude: 4.6424, elevation: 123.7 },
  ],
};

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Blanmont">
  <trk><name>Boucle de la Thyle</name>
    <trkseg>
      <trkpt lat="50.6094" lon="4.6833"><ele>100</ele></trkpt>
      <trkpt lat="50.6194" lon="4.6833"><ele>150</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const textResponse = (body: string, ok = true): Response =>
  ({
    ok,
    status: ok ? 200 : 404,
    headers: new Headers(),
    body: null,
    text: () => Promise.resolve(body),
  }) as unknown as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('garminCourseId', () => {
  it('reads the id of every Garmin Connect course link shape', () => {
    expect(garminCourseId('https://connect.garmin.com/modern/course/474346489')).toBe('474346489');
    expect(garminCourseId('https://connect.garmin.com/app/course/532374522')).toBe('532374522');
    expect(garminCourseId('https://connect.garmin.com/app/course/532374522/')).toBe('532374522');
    expect(garminCourseId('https://connect.garmin.com/modern/course/embed/12')).toBe('12');
    expect(garminCourseId('https://connect.garmin.com/embed/course/34?x=1')).toBe('34');
  });

  it('ignores other hosts, activities and broken URLs', () => {
    expect(garminCourseId('https://connect.garmin.com/modern/activity/123')).toBeNull();
    expect(garminCourseId('https://evil.example/connect.garmin.com/course/1')).toBeNull();
    expect(garminCourseId('https://connect.garmin.com.evil.example/app/course/1')).toBeNull();
    expect(garminCourseId('https://www.strava.com/routes/1')).toBeNull();
    expect(garminCourseId('not a url')).toBeNull();
  });
});

describe('decimate', () => {
  it('keeps short tracks as they are', () => {
    expect(decimate([1, 2, 3], 5)).toEqual([1, 2, 3]);
  });

  it('keeps at most max points, first and last included', () => {
    const points = Array.from({ length: 3916 }, (_, i) => i);
    const kept = decimate(points);
    expect(kept).toHaveLength(MAX_PREVIEW_POINTS);
    expect(kept[0]).toBe(0);
    expect(kept.at(-1)).toBe(3915);
  });
});

describe('parseGarminCourse', () => {
  it('reads the name, distance, elevation gain and track of the course', () => {
    const route = parseGarminCourse(garminEmbed(COURSE));
    expect(route).not.toBeNull();
    expect(route!.name).toBe('NordEst Tirlemont 105km');
    expect(route!.distanceKm).toBeCloseTo(104.69488);
    expect(route!.elevationM).toBe(523);
    expect(polylineCodec.decode(route!.polyline)).toEqual([
      [50.6232, 4.6424],
      [50.7, 4.8],
      [50.6232, 4.6424],
    ]);
  });

  it('never exposes the course owner', () => {
    const route = parseGarminCourse(garminEmbed(COURSE));
    expect(JSON.stringify(route)).not.toMatch(/owner/);
  });

  it('returns null for a private or unknown course', () => {
    expect(parseGarminCourse(garminEmbed(null))).toBeNull();
    expect(parseGarminCourse('<html><body>Sign in</body></html>')).toBeNull();
  });

  it('returns null when the course has no usable track or distance', () => {
    expect(parseGarminCourse(garminEmbed({ ...COURSE, geoPoints: [] }))).toBeNull();
    expect(parseGarminCourse(garminEmbed({ ...COURSE, distanceMeter: null }))).toBeNull();
  });

  it('leaves the elevation out when Garmin has none', () => {
    const route = parseGarminCourse(garminEmbed({ ...COURSE, elevationGainMeter: null }));
    expect(route!.elevationM).toBeUndefined();
  });
});

describe('gpxRoute', () => {
  it('reads the track name, length, elevation gain and points', () => {
    const route = gpxRoute(GPX);
    expect(route!.name).toBe('Boucle de la Thyle');
    expect(route!.distanceKm).toBeCloseTo(1.112, 2);
    expect(route!.elevationM).toBe(50);
    expect(polylineCodec.decode(route!.polyline)).toEqual([
      [50.6094, 4.6833],
      [50.6194, 4.6833],
    ]);
  });

  it('leaves the elevation out of a track without <ele>', () => {
    const route = gpxRoute(GPX.replace(/<ele>\d+<\/ele>/g, ''));
    expect(route!.elevationM).toBeUndefined();
  });

  it('returns null for a file without track or that does not parse', () => {
    expect(gpxRoute('<gpx version="1.1"></gpx>')).toBeNull();
    expect(gpxRoute('<gpx><trk>')).toBeNull();
  });
});

describe('resolveTraceRoute', () => {
  it('reads a Garmin course from its public embed page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(textResponse(garminEmbed(COURSE)));
    vi.stubGlobal('fetch', fetchMock);

    const route = await resolveTraceRoute('https://connect.garmin.com/app/course/532374522');
    expect(route!.name).toBe('NordEst Tirlemont 105km');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://connect.garmin.com/embed/course/532374522');
  });

  it('downloads and parses a direct GPX file', async () => {
    const fetchMock = vi.fn().mockResolvedValue(textResponse(GPX));
    vi.stubGlobal('fetch', fetchMock);

    const route = await resolveTraceRoute('https://example.org/thyle.gpx');
    expect(route!.distanceKm).toBeCloseTo(1.112, 2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.org/thyle.gpx');
  });

  it('does not fetch Strava or Komoot pages, nor private hosts', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await resolveTraceRoute('https://www.strava.com/routes/1')).toBeNull();
    expect(await resolveTraceRoute('https://www.komoot.com/fr-fr/tour/1234567')).toBeNull();
    expect(await resolveTraceRoute('https://192.168.1.1/x.gpx')).toBeNull();
    expect(await resolveTraceRoute('http://example.org/x.gpx')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls back to the link (null) when the source fails, without throwing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(textResponse('', false)));
    expect(await resolveTraceRoute('https://connect.garmin.com/app/course/1')).toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    expect(await resolveTraceRoute('https://connect.garmin.com/app/course/1')).toBeNull();
    expect(await resolveTraceRoute('https://example.org/x.gpx')).toBeNull();
  });
});

describe('withTraceRoutes', () => {
  it('adds the route to each trace, null when it cannot be drawn', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(textResponse(garminEmbed(COURSE))));
    const traces = await withTraceRoutes([
      { isoDate: '2026-11-28', url: 'https://connect.garmin.com/app/course/532374522' },
      { isoDate: '2026-11-29', url: 'https://www.strava.com/routes/1' },
    ]);
    expect(traces[0].isoDate).toBe('2026-11-28');
    expect(traces[0].route?.name).toBe('NordEst Tirlemont 105km');
    expect(traces[1].route).toBeNull();
  });
});
