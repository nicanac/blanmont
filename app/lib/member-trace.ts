/**
 * Calendar traces are for signed-in members (#252). Public pages hand the browser this
 * link instead of the source URL (Garmin, Strava, Komoot, GPX file): `/api/trace/<id>`
 * checks the session before it serves the trace, so a guest never sees where it lives.
 */
export const memberTraceHref = (eventId: string): string =>
  `/api/trace/${encodeURIComponent(eventId)}`;

/** Replaces each event's `gpxUrl` with its member link. Use before events reach a page. */
export function withMemberTraceLinks<T extends { id: string; gpxUrl?: string }>(events: T[]): T[] {
  return events.map((e) => (e.gpxUrl ? { ...e, gpxUrl: memberTraceHref(e.id) } : e));
}
