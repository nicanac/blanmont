import { NextRequest, NextResponse } from 'next/server';
import { isAllowedGpxUrl, parseGpx, readTextCapped, trackStats } from '@/app/lib/gpx-track';
import { isWebUiLink } from '@/app/lib/urlUtils';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  if (!isAllowedGpxUrl(url)) {
    return NextResponse.json({ error: 'Invalid or disallowed URL' }, { status: 400 });
  }

  // Strava/Garmin/Komoot URLs are HTML pages, not GPX files
  if (isWebUiLink(url)) {
    return NextResponse.json(
      { error: 'Cannot parse HTML pages, need direct GPX URL' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlanmontBot/1.0)' },
      next: { revalidate: 86400 }, // Cache for 24 hours
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch GPX: ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get('content-type');
    if (
      contentType &&
      !contentType.includes('xml') &&
      !contentType.includes('gpx') &&
      !contentType.includes('application/octet-stream')
    ) {
      console.warn(`Unexpected content type: ${contentType} for URL: ${url}`);
    }

    const gpxText = await readTextCapped(res);
    if (gpxText === null) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const parsed = parseGpx(gpxText);
    if (!parsed) {
      return NextResponse.json({ error: 'Failed to parse XML' }, { status: 400 });
    }

    const { distanceM, elevationM: rawElevation } = trackStats(parsed.lines);
    const distanceKm = distanceM / 1000;
    const elevationM = Math.round(rawElevation);

    const timeHours = distanceKm / 25 + elevationM / 1000;
    const totalMinutes = Math.round(timeHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const estimatedTime = `${h}h${m.toString().padStart(2, '0')}`;

    return NextResponse.json(
      {
        distance: distanceKm.toFixed(1),
        elevation: elevationM,
        estimatedTime,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('GPX parse error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
