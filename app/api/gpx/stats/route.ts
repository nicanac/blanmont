import { NextRequest, NextResponse } from 'next/server';
import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';
import * as net from 'net';

function isAllowedUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname;

    // Check for localhost / loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }

    // Check for cloud metadata
    if (hostname === '169.254.169.254') {
      return false;
    }

    // Basic regex for private IPs (IPv4)
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
    // IPv6 private ranges (simplified check)
    if (net.isIPv6(hostname)) {
        if (hostname.toLowerCase().startsWith('fc') || hostname.toLowerCase().startsWith('fd') || hostname === '::1') {
            return false;
        }
    }

    return true;
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'Invalid or disallowed URL' }, { status: 400 });
  }

  // Basic check for Strava/Garmin/Komoot URLs which are html pages, not GPX files
  if (url.includes('strava.com') || url.includes('garmin.com') || url.includes('komoot')) {
      return NextResponse.json({ error: 'Cannot parse HTML pages, need direct GPX URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BlanmontBot/1.0)',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
        signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch GPX: ${res.status}` }, { status: res.status });
    }

    // Content length check (early rejection)
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('xml') && !contentType.includes('gpx') && !contentType.includes('application/octet-stream')) {
        console.warn(`Unexpected content type: ${contentType} for URL: ${url}`);
    }

    // Stream to limit payload size
    let gpxText = '';
    const reader = res.body?.getReader();
    if (reader) {
        let loaded = 0;
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            loaded += value.length;
            if (loaded > 10 * 1024 * 1024) {
                reader.cancel();
                return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
            }
            gpxText += decoder.decode(value, { stream: true });
        }
        gpxText += decoder.decode();
    } else {
        gpxText = await res.text();
        if (gpxText.length > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
        }
    }

    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, 'text/xml');

    const parserError = gpxDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
       return NextResponse.json({ error: 'Failed to parse XML' }, { status: 400 });
    }

    const geoJson = gpx(gpxDoc);

    let totalDistance = 0; // meters
    let totalElevation = 0; // meters

    const getDistance = (c1: number[], c2: number[]) => {
        const R = 6371e3;
        const lat1 = c1[1] * Math.PI/180;
        const lat2 = c2[1] * Math.PI/180;
        const dLat = (c2[1]-c1[1]) * Math.PI/180;
        const dLon = (c2[0]-c1[0]) * Math.PI/180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const processCoordinates = (coords: number[][]) => {
        for (let i = 0; i < coords.length - 1; i++) {
            const p1 = coords[i];
            const p2 = coords[i+1];

            totalDistance += getDistance(p1, p2);

            if (p1.length > 2 && p2.length > 2) {
                const diff = p2[2] - p1[2];
                if (diff > 0) {
                    totalElevation += diff;
                }
            }
        }
    };

    geoJson.features.forEach((feature: any) => {
        if (!feature.geometry) return;

        if (feature.geometry.type === 'LineString') {
            processCoordinates(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiLineString') {
            feature.geometry.coordinates.forEach((coords: number[][]) => {
                processCoordinates(coords);
            });
        }
    });

    const distanceKm = totalDistance / 1000;
    const elevationM = Math.round(totalElevation);

    const timeHours = (distanceKm / 25) + (elevationM / 1000);
    const totalMinutes = Math.round(timeHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const estimatedTime = `${h}h${m.toString().padStart(2, '0')}`;

    return NextResponse.json({
        distance: distanceKm.toFixed(1),
        elevation: elevationM,
        estimatedTime
    }, {
        headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
        }
    });

  } catch (error) {
    console.error('GPX parse error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
