/**
 * GPX helpers of the server-side trace resolver
 * (`trace-route.ts`): URL guard, capped download, parsing and track metrics.
 */
import * as net from 'net';
import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';

/** Largest GPX (or Garmin embed page) read into memory. */
export const MAX_GPX_BYTES = 10 * 1024 * 1024;

/** A track segment: [lon, lat, ele?] points, GeoJSON order. */
export type TrackLine = number[][];

/** SSRF guard: only public https hosts (no loopback, private ranges or cloud metadata). */
export function isAllowedGpxUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;
    if (hostname === '169.254.169.254') return false;

    if (net.isIPv4(hostname)) {
      const parts = hostname.split('.').map(Number);
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168)
      ) {
        return false;
      }
    }
    if (net.isIPv6(hostname)) {
      const h = hostname.toLowerCase();
      if (h.startsWith('fc') || h.startsWith('fd') || h === '::1') return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads a fetch response as text, stopping past `maxBytes`.
 * Returns null when the body (announced or streamed) is too large.
 */
export async function readTextCapped(
  res: Response,
  maxBytes = MAX_GPX_BYTES
): Promise<string | null> {
  const contentLength = res.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) return null;

  const reader = res.body?.getReader();
  if (!reader) {
    const text = await res.text();
    return text.length > maxBytes ? null : text;
  }

  let text = '';
  let loaded = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.length;
    if (loaded > maxBytes) {
      reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export interface ParsedGpx {
  lines: TrackLine[];
  /** Name of the first track or route, when the file has one. */
  name?: string;
}

/** Parses GPX text into its track lines. Returns null when the XML does not parse. */
export function parseGpx(gpxText: string): ParsedGpx | null {
  const doc = new DOMParser().parseFromString(gpxText, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) return null;

  const lines: TrackLine[] = [];
  let name: string | undefined;
  gpx(doc).features.forEach((feature) => {
    if (!feature.geometry) return;
    if (feature.geometry.type === 'LineString') {
      lines.push(feature.geometry.coordinates as TrackLine);
    } else if (feature.geometry.type === 'MultiLineString') {
      lines.push(...(feature.geometry.coordinates as TrackLine[]));
    } else {
      return;
    }
    const featureName = feature.properties?.name;
    if (!name && typeof featureName === 'string' && featureName.trim()) name = featureName.trim();
  });
  return { lines, name };
}

/** Great-circle distance in metres between two [lon, lat] points. */
function haversine(c1: number[], c2: number[]): number {
  const R = 6371e3;
  const lat1 = (c1[1] * Math.PI) / 180;
  const lat2 = (c2[1] * Math.PI) / 180;
  const dLat = ((c2[1] - c1[1]) * Math.PI) / 180;
  const dLon = ((c2[0] - c1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Total length (metres) and positive elevation gain (metres) of the track lines. */
export function trackStats(lines: readonly TrackLine[]): { distanceM: number; elevationM: number } {
  let distanceM = 0;
  let elevationM = 0;
  lines.forEach((coords) => {
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      distanceM += haversine(p1, p2);
      if (p1.length > 2 && p2.length > 2) {
        const diff = p2[2] - p1[2];
        if (diff > 0) elevationM += diff;
      }
    }
  });
  return { distanceM, elevationM };
}
