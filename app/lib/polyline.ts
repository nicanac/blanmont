/**
 * Client-safe polyline helpers (no Node built-ins): point decimation and encoding
 * within the size a trace may store. Shared by the GPX import page (browser) and
 * the server-side trace resolver (`trace-route.ts`).
 */
import polylineCodec from '@mapbox/polyline';

/** Points kept for the preview: plenty for a 300px map of a 150 km loop. */
export const MAX_PREVIEW_POINTS = 300;

/** Longest encoded polyline a trace may store (`CreateTraceSchema.polyline`). */
export const MAX_TRACE_POLYLINE_CHARS = 100_000;

/** Keeps at most `max` points, evenly spaced, always with the first and last one. */
export function decimate<T>(points: readonly T[], max = MAX_PREVIEW_POINTS): T[] {
  if (points.length <= max) return [...points];
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

/**
 * Encodes [lat, lon] points as a Google polyline (precision 5) that fits in `maxChars`.
 * Every point is kept when it fits; a dense recording (1 Hz Garmin activity) is thinned
 * evenly until it does, so the import never fails on the polyline length.
 */
export function encodeTrackPolyline(
  latLngs: readonly [number, number][],
  maxChars = MAX_TRACE_POLYLINE_CHARS
): string {
  let kept = latLngs.length;
  let encoded = polylineCodec.encode([...latLngs]);
  while (encoded.length > maxChars && kept > 2) {
    // Shrink by the overshoot ratio with a 10 % margin; fewer points means larger deltas
    // per point, so the loop re-checks until the result fits.
    kept = Math.max(2, Math.floor(kept * (maxChars / encoded.length) * 0.9));
    encoded = polylineCodec.encode(decimate(latLngs, kept));
  }
  return encoded;
}
