import { describe, it, expect } from 'vitest';
import polylineCodec from '@mapbox/polyline';
import {
  decimate,
  encodeTrackPolyline,
  MAX_PREVIEW_POINTS,
  MAX_TRACE_POLYLINE_CHARS,
} from '@/app/lib/polyline';
import * as traceRoute from '@/app/lib/trace-route';

/** A 1 Hz-like recording: `n` points ~10 m apart around Blanmont, with a little noise. */
function denseTrack(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => [
    50.62 + i * 0.00009 + (i % 7) * 0.00001,
    4.64 + Math.sin(i / 50) * 0.01,
  ]);
}

describe('decimate', () => {
  it('is the helper trace-route re-exports', () => {
    expect(traceRoute.decimate).toBe(decimate);
    expect(traceRoute.MAX_PREVIEW_POINTS).toBe(MAX_PREVIEW_POINTS);
  });
});

describe('encodeTrackPolyline', () => {
  it('keeps every point of a track that fits', () => {
    const track = denseTrack(2000);
    const encoded = encodeTrackPolyline(track);

    expect(encoded).toBe(polylineCodec.encode(track));
    expect(polylineCodec.decode(encoded)).toHaveLength(2000);
  });

  it('thins a dense recording until it fits what a trace may store (#254)', () => {
    // A long day recorded at 1 Hz: ~2.4 chars per point once encoded.
    const track = denseTrack(60000);
    expect(polylineCodec.encode(track).length).toBeGreaterThan(MAX_TRACE_POLYLINE_CHARS);

    const encoded = encodeTrackPolyline(track);
    const decoded = polylineCodec.decode(encoded);

    expect(encoded.length).toBeLessThanOrEqual(MAX_TRACE_POLYLINE_CHARS);
    // Still a detailed track (navigable GPX download), first and last point kept.
    expect(decoded.length).toBeGreaterThan(20000);
    expect(decoded[0]).toEqual([50.62, 4.64]);
    const last = track.at(-1)!;
    expect(decoded.at(-1)![0]).toBeCloseTo(last[0], 5);
    expect(decoded.at(-1)![1]).toBeCloseTo(last[1], 5);
  });

  it('honours a custom budget', () => {
    const encoded = encodeTrackPolyline(denseTrack(500), 200);
    expect(encoded.length).toBeLessThanOrEqual(200);
    expect(polylineCodec.decode(encoded).length).toBeGreaterThanOrEqual(2);
  });
});
