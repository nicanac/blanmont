import { rideTraces, withRideTraces, type RideTraceHolder } from './ride-traces';

/**
 * Calendar traces are for signed-in members (#252). Public pages hand the browser this
 * link instead of the source URL (Garmin, Strava, Komoot, GPX file): `/api/trace/<id>`
 * checks the session before it serves the trace, so a guest never sees where it lives.
 * A ride with several traces (one per group or distance) serves the others at `?t=<index>`.
 */
export const memberTraceHref = (eventId: string, index = 0): string =>
  `/api/trace/${encodeURIComponent(eventId)}${index > 0 ? `?t=${index}` : ''}`;

/**
 * Replaces each event's trace links (`gpxUrl` and `extraTraces`) with their member links.
 * Use before events reach a page.
 */
export function withMemberTraceLinks<T extends { id: string } & RideTraceHolder>(events: T[]): T[] {
  return events.map((e) => {
    const traces = rideTraces(e);
    if (traces.length === 0) return e;
    return withRideTraces(
      e,
      traces.map(({ index, ...t }) => ({ ...t, gpxUrl: memberTraceHref(e.id, index) }))
    );
  });
}
