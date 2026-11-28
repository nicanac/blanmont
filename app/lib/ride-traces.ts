/**
 * Several traces per calendar ride: one per group or distance, like FFBC rides
 * ("GR1 · 110 km", "GR2− · 85 km", "Petit parcours · 60 km").
 *
 * Storage (`calendar-events/<id>`): the first trace stays in `gpxUrl` / `traceId`, with its
 * label in `traceLabel`, so every reader written for a single trace (ICS feed, next-ride card,
 * catalogue backfill #263, trace linker #255) keeps working; the others are `extraTraces`.
 * Read them with `rideTraces()`; write them with `rideTraceFields()`.
 *
 * Client-safe: no server imports.
 */
import type { CalendarEvent, RideTrace } from '../types';

/** At most this many traces per ride (main trace included). */
export const MAX_RIDE_TRACES = 6;
/** Longest label an admin can give a trace. */
export const RIDE_TRACE_LABEL_MAX = 60;

/** The trace fields of a ride, as stored or as a page receives them. */
export type RideTraceHolder = Partial<
  Pick<CalendarEvent, 'gpxUrl' | 'traceId' | 'traceLabel' | 'extraTraces'>
>;

/** A ride trace with its position: `/api/trace/<eventId>?t=<index>` serves it. */
export interface IndexedRideTrace extends RideTrace {
  index: number;
}

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** A stored trace without empty fields (RTDB rejects `undefined`). */
function cleanTrace(value: unknown): RideTrace | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const gpxUrl = text(raw.gpxUrl);
  if (!gpxUrl) return null;
  const trace: RideTrace = { gpxUrl };
  const label = text(raw.label).slice(0, RIDE_TRACE_LABEL_MAX);
  if (label) trace.label = label;
  const traceId = text(raw.traceId);
  if (traceId) trace.traceId = traceId;
  return trace;
}

/**
 * Every trace of a ride, main trace first, without the empty ones. The index of a trace is
 * its position in this list: the server and the pages compute it with this same function.
 */
export function rideTraces(ride: RideTraceHolder | null | undefined): IndexedRideTrace[] {
  if (!ride) return [];
  // RTDB may hand an array back as an object keyed "0", "1"… when it has holes.
  const extras = ride.extraTraces
    ? Array.isArray(ride.extraTraces)
      ? ride.extraTraces
      : Object.values(ride.extraTraces as Record<string, unknown>)
    : [];
  return [
    { gpxUrl: ride.gpxUrl, label: ride.traceLabel, traceId: ride.traceId },
    ...extras,
  ]
    .map(cleanTrace)
    .filter((t): t is RideTrace => t !== null)
    .map((t, index) => ({ ...t, index }));
}

/** True when the ride has at least one trace. */
export const hasRideTrace = (ride: RideTraceHolder | null | undefined): boolean =>
  rideTraces(ride).length > 0;

/**
 * What a trace is called on a page: its label, else "Trace 2" when the ride has several,
 * else '' (a single trace needs no name).
 */
export function rideTraceTitle(trace: Pick<IndexedRideTrace, 'label' | 'index'>, total: number): string {
  const label = text(trace.label);
  if (label) return label;
  return total > 1 ? `Trace ${trace.index + 1}` : '';
}

/** A trace as a page links it: `href` is the ride's (member) link, `title` its group or distance. */
export interface RideTraceLink {
  index: number;
  href: string;
  title: string;
}

/** The download links of a ride, main trace first (pass events through `withMemberTraceLinks`). */
export function rideTraceLinks(ride: RideTraceHolder | null | undefined): RideTraceLink[] {
  const traces = rideTraces(ride);
  return traces.map((t) => ({ index: t.index, href: t.gpxUrl, title: rideTraceTitle(t, traces.length) }));
}

/** "Télécharger la trace GPX", or "Télécharger la trace GPX · GR1" for one trace among several. */
export const traceDownloadLabel = (title: string): string =>
  title ? `Télécharger la trace GPX · ${title}` : 'Télécharger la trace GPX';

/** The stored trace fields of a ride for a list of traces; `null` removes a key in an RTDB update. */
export interface RideTraceFields {
  gpxUrl: string;
  traceId: string | null;
  traceLabel: string | null;
  extraTraces: RideTrace[] | null;
}

/** Splits a list of traces into the stored fields: the first one is the main trace. */
export function rideTraceFields(traces: readonly RideTrace[]): RideTraceFields {
  const [first, ...rest] = traces
    .map(cleanTrace)
    .filter((t): t is RideTrace => t !== null);
  return {
    gpxUrl: first?.gpxUrl ?? '',
    traceId: first?.traceId ?? null,
    traceLabel: first?.label ?? null,
    extraTraces: rest.length > 0 ? rest : null,
  };
}

/** A trace row of the event forms, as the admin edits it. */
export interface RideTraceRow {
  /** Group or distance ("GR1", "110 km"); '' when the ride has a single trace. */
  label: string;
  /** Catalog trace id, '' for a link typed by hand (or none). */
  traceId: string;
  gpxUrl: string;
}

export const emptyRideTraceRow = (): RideTraceRow => ({ label: '', traceId: '', gpxUrl: '' });

/** The form rows of a stored ride: one per trace, and at least one (empty) row. */
export function rideTraceRows(ride: RideTraceHolder | null | undefined): RideTraceRow[] {
  const rows = rideTraces(ride).map((t) => ({
    label: t.label ?? '',
    traceId: t.traceId ?? '',
    gpxUrl: t.gpxUrl,
  }));
  return rows.length > 0 ? rows : [emptyRideTraceRow()];
}

/**
 * Labels offered while naming a trace: the club's group names, then the distances the
 * calendar announces for the ride ("65-85-105" → "65 km", "85 km", "105 km").
 */
export function traceLabelSuggestions(groupNames: readonly string[], distances?: string): string[] {
  const km = (distances?.match(/\b\d{2,3}\b/g) ?? [])
    .map(Number)
    .filter((n) => n >= 20 && n <= 350)
    .map((n) => `${n} km`);
  return [...new Set([...groupNames.map((g) => g.trim()).filter(Boolean), ...km])];
}

/** `ride` with its traces replaced by `traces` (keys that become empty are left out). */
export function withRideTraces<T extends RideTraceHolder>(ride: T, traces: readonly RideTrace[]): T {
  const fields = rideTraceFields(traces);
  const next: T = { ...ride, gpxUrl: fields.gpxUrl };
  for (const key of ['traceId', 'traceLabel', 'extraTraces'] as const) {
    const value = fields[key];
    if (value === null) delete next[key];
    else (next as RideTraceHolder)[key] = value as never;
  }
  return next;
}
