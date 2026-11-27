/**
 * Server-side resolution of a calendar trace link into a drawable route:
 * name, distance, elevation gain and a simplified polyline for `MapPreview`.
 *
 * Sources:
 * - Garmin Connect course links (what the club uses): the public course embed
 *   (`connect.garmin.com/embed/course/<id>`) carries the course in its Next.js
 *   flight payload. Undocumented, so any change on Garmin's side only drops the
 *   preview: callers fall back to the plain link.
 * - Direct `.gpx` files: downloaded and parsed like `/api/gpx/stats`.
 * - Strava / Komoot pages: no public geometry, link only (null).
 */
import polylineCodec from '@mapbox/polyline';
import { isAllowedGpxUrl, parseGpx, readTextCapped, trackStats, type TrackLine } from './gpx-track';
import { isWebUiLink } from './urlUtils';

export interface TraceRoute {
  /** Course or track name, when the source has one. */
  name?: string;
  /** Total length, km. */
  distanceKm: number;
  /** Positive elevation gain, m (absent when the source has no elevation). */
  elevationM?: number;
  /** Simplified track, Google encoded polyline (precision 5), for `MapPreview`. */
  polyline: string;
}

/** Points kept for the preview: plenty for a 300px map of a 150 km loop. */
export const MAX_PREVIEW_POINTS = 300;
const FETCH_TIMEOUT_MS = 6000;
/** The course may be edited until the ride: refresh at most hourly. */
const REVALIDATE_SECONDS = 3600;
const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; BlanmontBot/1.0)' };

/** Garmin Connect course id from a course link (`/modern/course/1`, `/app/course/1`, embeds). */
export function garminCourseId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'connect.garmin.com') return null;
    const match = parsed.pathname.match(/\/course\/(?:embed\/)?(\d+)(?:\/|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/** Keeps at most `max` points, evenly spaced, always with the first and last one. */
export function decimate<T>(points: readonly T[], max = MAX_PREVIEW_POINTS): T[] {
  if (points.length <= max) return [...points];
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

/** Encodes [lat, lon] points for `MapPreview` (`summaryPolyline`). */
function encode(latLngs: [number, number][]): string {
  return polylineCodec.encode(decimate(latLngs));
}

/** Concatenated strings pushed by `self.__next_f.push([1, "…"])` in a Next.js page. */
function nextFlightPayload(html: string): string {
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let flight = '';
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      flight += JSON.parse(match[1]) as string;
    } catch {
      // A chunk that is not a plain JSON string: skip it.
    }
  }
  return flight;
}

/** The JSON object that starts at `start` (a `{`), or null when it is unbalanced. */
function sliceObject(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

interface GarminCourse {
  courseName?: unknown;
  distanceMeter?: unknown;
  elevationGainMeter?: unknown;
  geoPoints?: unknown;
}

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Extracts the course from a Garmin Connect course embed page.
 * Only the name, distance, elevation gain and points are read (never the owner).
 */
export function parseGarminCourse(html: string): TraceRoute | null {
  const flight = nextFlightPayload(html);
  const key = '"course":{';
  const at = flight.indexOf(key);
  if (at < 0) return null;
  const json = sliceObject(flight, at + key.length - 1);
  if (!json) return null;

  let course: GarminCourse;
  try {
    course = JSON.parse(json) as GarminCourse;
  } catch {
    return null;
  }

  const points: [number, number][] = Array.isArray(course.geoPoints)
    ? course.geoPoints
        .map((p: { latitude?: unknown; longitude?: unknown }) => [p?.latitude, p?.longitude])
        .filter((p): p is [number, number] => isFiniteNumber(p[0]) && isFiniteNumber(p[1]))
    : [];
  if (points.length < 2 || !isFiniteNumber(course.distanceMeter)) return null;

  const name =
    typeof course.courseName === 'string' ? course.courseName.replace(/_/g, ' ').trim() : '';
  return {
    name: name || undefined,
    distanceKm: course.distanceMeter / 1000,
    elevationM: isFiniteNumber(course.elevationGainMeter)
      ? Math.round(course.elevationGainMeter)
      : undefined,
    polyline: encode(points),
  };
}

/** Route of a parsed GPX file, or null when it has no usable track. */
export function gpxRoute(gpxText: string): TraceRoute | null {
  const parsed = parseGpx(gpxText);
  if (!parsed) return null;
  const lines = parsed.lines.filter((l: TrackLine) => l.length > 0);
  const latLngs = lines.flat().map((c) => [c[1], c[0]] as [number, number]);
  if (latLngs.length < 2) return null;

  const { distanceM, elevationM } = trackStats(lines);
  const hasElevation = lines.some((l) => l.some((c) => c.length > 2));
  return {
    name: parsed.name,
    distanceKm: distanceM / 1000,
    elevationM: hasElevation ? Math.round(elevationM) : undefined,
    polyline: encode(latLngs),
  };
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: FETCH_HEADERS,
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  return readTextCapped(res);
}

/** Drawable route behind a calendar trace link, or null (link only). Never throws. */
export async function resolveTraceRoute(url: string): Promise<TraceRoute | null> {
  try {
    const courseId = garminCourseId(url);
    if (courseId) {
      const html = await fetchText(`https://connect.garmin.com/embed/course/${courseId}`);
      return html ? parseGarminCourse(html) : null;
    }
    if (isWebUiLink(url) || !isAllowedGpxUrl(url)) return null;
    const gpxText = await fetchText(url);
    return gpxText ? gpxRoute(gpxText) : null;
  } catch (err) {
    console.warn('Trace preview unavailable:', err instanceof Error ? err.message : err);
    return null;
  }
}

/** Adds the resolved route to each trace (null when it cannot be drawn). */
export async function withTraceRoutes<T extends { url: string }>(
  traces: readonly T[]
): Promise<(T & { route: TraceRoute | null })[]> {
  return Promise.all(traces.map(async (t) => ({ ...t, route: await resolveTraceRoute(t.url) })));
}
