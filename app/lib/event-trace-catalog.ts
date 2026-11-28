/**
 * Trace links typed on calendar rides join the club's trace catalogue (#263).
 *
 * When a ride is saved with a link (Garmin course, Strava route, Komoot tour, .gpx file) and no
 * catalog trace (`traceId`, #255), the ride is linked to the catalog trace of the same course,
 * or to a new one made from the link (name, distance, D+ and map read by `resolveTraceRoute`).
 * `backfillRideTraces` does the same for the rides saved before.
 *
 * Decision (2026-11-28, Nico): these traces are public like the rest of the catalogue. Ride
 * pages still serve a ride's own trace to members only (#252).
 *
 * Server only (Admin SDK).
 */
import { randomUUID } from 'node:crypto';
import { getAdminDatabase } from './firebase/admin';
import { traceLink } from './event-trace';
import { garminCourseId, resolveTraceRoute, type TraceRoute } from './trace-route';
import { isWebUiLink } from './urlUtils';
import { formatFrenchDate } from '../utils/date';
import type { CalendarEvent, Trace } from '../types';

/** What a ride needs to find or create its catalog trace. */
export type RideTraceSource = Partial<Pick<CalendarEvent, 'location' | 'isoDate' | 'group'>> & {
  gpxUrl?: unknown;
};

/** A catalog trace a ride can follow: its id and the link the ride takes (#255). */
export interface CatalogEntry {
  traceId: string;
  gpxUrl: string;
}

/** Catalog traces by course (`traceUrlKey`). */
export type CatalogIndex = Map<string, CatalogEntry>;

export interface CatalogLink extends CatalogEntry {
  /** True when the trace was added to the catalogue for this ride. */
  created: boolean;
}

/**
 * The course a trace link points to, so two spellings of one course match:
 * `connect.garmin.com/modern/course/1` = `/app/course/1`, `www.strava.com/routes/2` =
 * `strava.com/routes/2/`, `komoot.com/fr-fr/tour/3?share_token=x` = `komoot.com/tour/3`.
 * Any other web link: host (without www) + path (without trailing /) + query.
 * Null when the value is not a web link.
 */
export function traceUrlKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!/^https?:\/\/\S+$/i.test(url)) return null;

  const course = garminCourseId(url);
  if (course) return `garmin-course:${course}`;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const path = parsed.pathname.replace(/\/+$/, '');

  const strava = /(^|\.)strava\.com$/.test(host) && path.match(/^\/routes\/(\d+)$/);
  if (strava) return `strava-route:${strava[1]}`;
  const komoot = /(^|\.)komoot\.[a-z]+$/.test(host) && path.match(/^(?:\/[a-z]{2}-[a-z]{2})?\/tour\/(\d+)$/i);
  if (komoot) return `komoot-tour:${komoot[1]}`;

  return `${host}${path}${parsed.search}`;
}

/** Indexes catalog traces by course: both their GPX file and their map link. */
export function indexCatalog(traces: Record<string, Partial<Trace> | null>): CatalogIndex {
  const index: CatalogIndex = new Map();
  // Oldest id first: when two catalog traces share a course, rides follow the first one.
  for (const id of Object.keys(traces).sort()) {
    const trace = traces[id];
    const link = trace ? traceLink(trace) : null;
    if (!trace || !link) continue;
    for (const candidate of [trace.gpxUrl, trace.mapUrl]) {
      const key = traceUrlKey(candidate);
      if (key && !index.has(key)) index.set(key, { traceId: id, gpxUrl: link });
    }
  }
  return index;
}

/** The catalogue as it is now, indexed by course. */
export async function loadCatalogIndex(): Promise<CatalogIndex> {
  const snapshot = await getAdminDatabase().ref('traces').once('value');
  return indexCatalog((snapshot.val() ?? {}) as Record<string, Partial<Trace> | null>);
}

const NAME_MAX = 100;

/** "NordEst Tirlemont 105km", else "Fechère · samedi 28 novembre 2026". */
function traceName(ride: RideTraceSource, route: TraceRoute | null): string {
  const fromRoute = route?.name?.trim();
  if (fromRoute) return fromRoute.slice(0, NAME_MAX);
  const parts = [ride.location?.trim() || 'Sortie du club', formatFrenchDate(ride.isoDate)].filter(Boolean);
  return parts.join(' · ').slice(0, NAME_MAX);
}

/**
 * The catalog record of a new trace made from a ride's link, shaped like `createTrace`'s.
 * A Garmin/Strava/Komoot page is the trace's map link; a file is its GPX file.
 */
export function rideTraceRecord(
  url: string,
  ride: RideTraceSource,
  route: TraceRoute | null,
  now: Date = new Date()
): Record<string, unknown> {
  const day = formatFrenchDate(ride.isoDate);
  const where = ride.location?.trim();
  return {
    name: traceName(ride, route),
    distance: route ? Math.round(route.distanceKm * 10) / 10 : 0,
    elevation: route?.elevationM ?? 0,
    surface: /vtt/i.test(ride.group ?? '') ? 'MTB' : 'Road',
    quality: 3,
    rating: '',
    description: `Trace de la sortie${day ? ` du ${day}` : ''}${where ? ` (${where})` : ''}, ajoutée depuis le calendrier.`,
    mapUrl: isWebUiLink(url) ? url : '',
    gpxUrl: isWebUiLink(url) ? '' : url,
    photoUrl: '',
    photoAlbumUrl: '',
    direction: '',
    start: '',
    end: '',
    polyline: route?.polyline ?? '',
    createdAt: now.toISOString(),
  };
}

/**
 * The catalog trace a ride's link belongs to: the one of the same course, else a new one added
 * to the catalogue (and to `index`, so the next ride on that course reuses it).
 * Null when the ride has no web link. Throws when the catalogue cannot be written.
 */
export async function catalogTraceForRide(
  ride: RideTraceSource,
  index: CatalogIndex
): Promise<CatalogLink | null> {
  const key = traceUrlKey(ride.gpxUrl);
  if (!key) return null;
  const existing = index.get(key);
  if (existing) return { ...existing, created: false };

  const url = String(ride.gpxUrl).trim();
  const route = await resolveTraceRoute(url);
  const traceId = `trace_${Date.now()}_${randomUUID().slice(0, 8)}`;
  await getAdminDatabase().ref(`traces/${traceId}`).set(rideTraceRecord(url, ride, route));

  const entry = { traceId, gpxUrl: url };
  index.set(key, entry);
  return { ...entry, created: true };
}

/**
 * `catalogTraceForRide` for a single ride being saved: never throws, so a catalogue that cannot
 * be read or written never blocks the ride (it keeps its link, without `traceId`).
 */
export async function linkRideToCatalog(ride: RideTraceSource): Promise<CatalogLink | null> {
  if (!traceUrlKey(ride.gpxUrl)) return null;
  try {
    return await catalogTraceForRide(ride, await loadCatalogIndex());
  } catch (error) {
    console.warn('Ride trace not added to the catalogue:', error instanceof Error ? error.message : error);
    return null;
  }
}

export interface BackfillReport {
  /** Rides linked to a catalog trace in this run. */
  linked: number;
  /** Catalog traces created in this run. */
  created: number;
  /** Rides that could not be linked (catalogue write failed). */
  failed: number;
  /** Rides with a link and no catalog trace still left after this run. */
  remaining: number;
}

/**
 * Links every ride that has a trace link but no catalog trace (#263), oldest first, until
 * `budgetMs` is spent (a Garmin course is read once per new trace, up to 6 s): call again while
 * `remaining > 0` and the last run linked something. Safe to run twice: linked rides are skipped.
 */
export async function backfillRideTraces(
  { budgetMs = 8000, clock = Date.now }: { budgetMs?: number; clock?: () => number } = {}
): Promise<BackfillReport> {
  const started = clock();
  const db = getAdminDatabase();
  const [eventsSnap, index] = await Promise.all([db.ref('calendar-events').once('value'), loadCatalogIndex()]);
  const events = (eventsSnap.val() ?? {}) as Record<string, Partial<CalendarEvent> | null>;

  const pending = Object.entries(events)
    .filter(([, e]) => e && !e.traceId && traceUrlKey(e.gpxUrl))
    .sort(([a, x], [b, y]) => String(x?.isoDate).localeCompare(String(y?.isoDate)) || a.localeCompare(b));

  const report: BackfillReport = { linked: 0, created: 0, failed: 0, remaining: 0 };
  for (let i = 0; i < pending.length; i++) {
    if (clock() - started >= budgetMs) {
      report.remaining += pending.length - i;
      break;
    }
    const [id, ride] = pending[i];
    try {
      const link = await catalogTraceForRide(ride as RideTraceSource, index);
      if (!link) continue;
      await db.ref(`calendar-events/${id}`).update({
        traceId: link.traceId,
        gpxUrl: link.gpxUrl,
        updatedAt: new Date().toISOString(),
      });
      report.linked++;
      if (link.created) report.created++;
    } catch (error) {
      console.warn(`Ride ${id} not linked to the catalogue:`, error instanceof Error ? error.message : error);
      report.failed++;
      report.remaining++;
    }
  }
  return report;
}
