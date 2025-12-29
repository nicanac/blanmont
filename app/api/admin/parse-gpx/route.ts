
import { NextRequest, NextResponse } from 'next/server';
import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SiderealBot/1.0)',
        }
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch GPX: ${res.status}` }, { status: res.status });
    }

    const gpxText = await res.text();
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, 'text/xml');
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
    geoJson.features.forEach((feature: any) => {
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

    return NextResponse.json({
        distance: (totalDistance / 1000).toFixed(1), // km
        elevation: Math.round(totalElevation), // m
        geoJson // Return full GeoJSON for map rendering
    });

  } catch (error: any) {
    console.error('GPX parse error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
