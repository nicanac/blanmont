import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/app/lib/auth/session';
import { getCalendarEvents } from '@/app/lib/firebase/calendar';
import { fetchGarminCourseGpx, garminCourseId } from '@/app/lib/trace-route';
import { gpxFileName } from '@/app/lib/gpx-build';
import { rideTraces } from '@/app/lib/ride-traces';

/** Session-dependent: never cached by a CDN. */
const PRIVATE = { 'Cache-Control': 'private, no-store' };

/**
 * The trace of a calendar ride, for signed-in members only (#252). Guests go to the login
 * page and come back here. A Garmin course downloads as a GPX file (#246); any other source
 * (Strava, Komoot, a GPX file, or a Garmin page that cannot be read) is a redirect to it.
 * `?t=<n>` picks the n-th trace of a ride that has one per group or distance (0 = main).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse> {
  const { eventId } = await params;

  if (!(await getSessionUser())) {
    const login = new URL('/login', request.url);
    login.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login, { status: 302, headers: PRIVATE });
  }

  const event = (await getCalendarEvents()).find((e) => e.id === eventId);
  const index = Number(request.nextUrl.searchParams.get('t') ?? 0);
  const url = Number.isInteger(index) && index >= 0 ? rideTraces(event)[index]?.gpxUrl : undefined;
  // Only web links are served (admin input; never a javascript: or data: URL).
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Trace introuvable' }, { status: 404, headers: PRIVATE });
  }

  const courseId = garminCourseId(url);
  const course = courseId ? await fetchGarminCourseGpx(courseId) : null;
  if (course) {
    return new NextResponse(course.gpx, {
      headers: {
        ...PRIVATE,
        'Content-Type': 'application/gpx+xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${gpxFileName(course.name)}"`,
      },
    });
  }
  return NextResponse.redirect(url, { status: 302, headers: PRIVATE });
}
