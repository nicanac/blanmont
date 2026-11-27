/**
 * Catalog traces on calendar rides (#255). An admin links a ride to a trace of the
 * catalogue (`/traces`); the ride stores the trace's id (`traceId`) and takes the trace's
 * link as its `gpxUrl`, so every place that shows a ride's trace (calendar, poll previews,
 * next-ride card, ICS feed, member link of #252) works unchanged.
 *
 * Server only (Admin SDK). Client code imports the types alone (`import type`).
 */
import { getAdminDatabase } from './firebase/admin';
import { RecordIdSchema } from './validation';
import type { Trace } from '../types';

/** A catalog trace as the admin pickers list it. */
export interface CatalogTraceOption {
  id: string;
  name: string;
  /** Kilometres (0 when unknown). */
  distance: number;
  /** Metres of climbing, when known. */
  elevation?: number;
  surface?: string;
  /** What the ride's `gpxUrl` becomes when it takes this trace. */
  link: string;
}

/** An upcoming ride as the /admin/traces linker lists it. */
export interface EventTraceRow {
  id: string;
  isoDate: string;
  location: string;
  group: string;
  traceId?: string;
  gpxUrl?: string;
}

/** Answer of `GET /api/admin/events/trace-links`. */
export interface TraceLinksPayload {
  traces: CatalogTraceOption[];
  events: EventTraceRow[];
}

/** The link a ride takes from a trace: its GPX file, else its map page; null without a web link. */
export function traceLink(trace: Partial<Pick<Trace, 'gpxUrl' | 'mapUrl'>>): string | null {
  for (const candidate of [trace.gpxUrl, trace.mapUrl]) {
    const url = typeof candidate === 'string' ? candidate.trim() : '';
    // Admin input: only web links, never a javascript: or data: URL.
    if (/^https?:\/\/\S+$/i.test(url)) return url;
  }
  return null;
}

/** Every catalog trace a ride can take (those with a web link), sorted by name. */
export async function listCatalogTraceOptions(): Promise<CatalogTraceOption[]> {
  const snapshot = await getAdminDatabase().ref('traces').once('value');
  const raw = (snapshot.val() ?? {}) as Record<string, Partial<Trace> | null>;

  return Object.entries(raw)
    .flatMap(([id, trace]): CatalogTraceOption[] => {
      const link = trace ? traceLink(trace) : null;
      if (!trace || !link) return [];
      const elevation = Number(trace.elevation);
      return [
        {
          id,
          name: (typeof trace.name === 'string' && trace.name.trim()) || 'Trace sans nom',
          distance: Math.round(Number(trace.distance) || 0),
          ...(elevation > 0 ? { elevation: Math.round(elevation) } : {}),
          ...(trace.surface ? { surface: String(trace.surface) } : {}),
          link,
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
}

export type TraceIdResolution =
  | { ok: true; fields: { traceId: string; gpxUrl: string } | { traceId: null } }
  | { ok: false; status: 400 | 404 | 422; error: string };

/**
 * What an event write stores for the `traceId` it was sent:
 * - a catalog trace id: `traceId` and `gpxUrl` = the trace's link (the trace wins over a
 *   `gpxUrl` sent with it);
 * - `''` or `null`: unlinks (`traceId: null` removes the key in an RTDB update); `gpxUrl`
 *   stays whatever the caller sends, so unlinking never drops a link on its own.
 */
export async function resolveEventTraceId(value: unknown): Promise<TraceIdResolution> {
  if (value === null || value === '') return { ok: true, fields: { traceId: null } };

  const parsed = RecordIdSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, status: 400, error: 'Identifiant de trace invalide' };
  }

  const snapshot = await getAdminDatabase().ref(`traces/${parsed.data}`).once('value');
  if (!snapshot.exists()) {
    return { ok: false, status: 404, error: 'Trace introuvable dans le catalogue' };
  }

  const link = traceLink(snapshot.val() ?? {});
  if (!link) {
    return { ok: false, status: 422, error: "Cette trace n'a ni fichier GPX ni lien de carte" };
  }
  return { ok: true, fields: { traceId: parsed.data, gpxUrl: link } };
}
