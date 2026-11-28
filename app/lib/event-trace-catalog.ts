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
import { resolveEventTraceId, traceLink } from './event-trace';
import { MAX_RIDE_TRACES, RIDE_TRACE_LABEL_MAX } from './ride-traces';
import { garminCourseId, resolveTraceRoute, type TraceRoute } from './trace-route';
import { isWebUiLink } from './urlUtils';
import { formatFrenchDate } from '../utils/date';
import type { CalendarEvent, RideTrace, Trace } from '../types';

/** What a ride needs to find or create its catalog trace. */
export type RideTraceSource = Partial<Pick<CalendarEvent, 'location' | 'isoDate' | 'group'>> & {
  gpxUrl?: unknown;
  /** Group or distance of this trace when the ride has several ("GR1", "110 km"). */
  label?: string;
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
  const parts = [
    ride.location?.trim() || 'Sortie du club',
    formatFrenchDate(ride.isoDate),
    ride.label?.trim(),
  ].filter(Boolean);
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

export type RideTracesResolution =
  | { ok: true; traces: RideTrace[] }
  | { ok: false; status: 400 | 404 | 422; error: string };

const WEB_LINK = /^https?:\/\/\S+$/i;

/**
 * The traces a ride stores for the list an event form sent (one per group or distance):
 * - a row with a catalog `traceId` takes that trace's link (#255);
 * - a row with a link typed by hand joins the catalogue like the single trace did (#263);
 * - empty rows are dropped; the first row left becomes the ride's main trace (`gpxUrl`).
 * Rows are resolved one after the other, so two rows on one new course share its catalog trace.
 */
export async function resolveRideTraces(
  value: unknown,
  ride: RideTraceSource
): Promise<RideTracesResolution> {
  if (!Array.isArray(value)) return { ok: false, status: 400, error: 'Liste de traces invalide' };

  const rows = value.filter((row): row is Record<string, unknown> => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const r = row as Record<string, unknown>;
    return Boolean(
      (typeof r.traceId === 'string' && r.traceId.trim()) || (typeof r.gpxUrl === 'string' && r.gpxUrl.trim())
    );
  });
  if (rows.length > MAX_RIDE_TRACES) {
    return { ok: false, status: 400, error: `Une sortie compte au plus ${MAX_RIDE_TRACES} traces` };
  }

  const traces: RideTrace[] = [];
  for (const row of rows) {
    if (row.label !== undefined && row.label !== null && typeof row.label !== 'string') {
      return { ok: false, status: 400, error: 'Libellé de trace invalide' };
    }
    const label = typeof row.label === 'string' ? row.label.trim() : '';
    if (label.length > RIDE_TRACE_LABEL_MAX) {
      return {
        ok: false,
        status: 400,
        error: `Libellé de trace trop long (${RIDE_TRACE_LABEL_MAX} caractères au plus)`,
      };
    }

    let trace: RideTrace;
    if (typeof row.traceId === 'string' && row.traceId.trim()) {
      const resolved = await resolveEventTraceId(row.traceId.trim());
      if (!resolved.ok) return resolved;
      if (!resolved.fields.traceId) return { ok: false, status: 400, error: 'Identifiant de trace invalide' };
      trace = { traceId: resolved.fields.traceId, gpxUrl: resolved.fields.gpxUrl };
    } else {
      const url = String(row.gpxUrl).trim();
      // Admin input: only web links, never a javascript: or data: URL.
      if (!WEB_LINK.test(url)) {
        return { ok: false, status: 400, error: `Lien de trace invalide : ${url.slice(0, 80)}` };
      }
      const linked = await linkRideToCatalog({ ...ride, gpxUrl: url, ...(label ? { label } : {}) });
      trace = linked ? { traceId: linked.traceId, gpxUrl: linked.gpxUrl } : { gpxUrl: url };
    }
    traces.push(label ? { label, ...trace } : trace);
  }
  return { ok: true, traces };
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
