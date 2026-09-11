import { NextRequest, NextResponse } from 'next/server';
import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
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
        next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch GPX: ${res.status}` }, { status: res.status });
    }

    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('xml') && !contentType.includes('gpx') && !contentType.includes('application/octet-stream')) {
        // Warning: Might not be a GPX file, but we will try anyway.
        console.warn(`Unexpected content type: ${contentType} for URL: ${url}`);
    }

    const gpxText = await res.text();
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, 'text/xml');

    // Check for parse errors
    const parserError = gpxDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
       return NextResponse.json({ error: 'Failed to parse XML' }, { status: 400 });
    }

    const geoJson = gpx(gpxDoc);

    // Calculate Stats
    let totalDistance = 0; // meters
    let totalElevation = 0; // meters

    // Helper: Haversine distance
    const getDistance = (c1: number[], c2: number[]) => {
        const R = 6371e3; // metres
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

    // Iterate features (usually LineStrings)
    geoJson.features.forEach((feature: { geometry: { type: string, coordinates: number[][] } }) => {
        if (feature.geometry.type === 'LineString') {
            const coords = feature.geometry.coordinates;
            for (let i = 0; i < coords.length - 1; i++) {
                const p1 = coords[i];
                const p2 = coords[i+1];

                // Distance
                totalDistance += getDistance(p1, p2);

                // Elevation (index 2 is altitude if present)
                if (p1.length > 2 && p2.length > 2) {
                    const diff = p2[2] - p1[2];
                    if (diff > 0) {
                        totalElevation += diff;
                    }
                }
            }
        }
        // Handle MultiLineString if necessary
    });

    const distanceKm = totalDistance / 1000;
    const elevationM = Math.round(totalElevation);

    // Time estimation formula: distance / 25km/h + 1h per 1000m D+
    const timeHours = (distanceKm / 25) + (elevationM / 1000);
    const h = Math.floor(timeHours);
    const m = Math.round((timeHours - h) * 60);

    const estimatedTime = `${h}h${m.toString().padStart(2, '0')}`;

    return NextResponse.json({
        distance: distanceKm.toFixed(1), // km
        elevation: elevationM, // m
        estimatedTime
    });

  } catch (error) {
    console.error('GPX parse error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
