import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/app/lib/auth/session';
import { getCalendarEvents } from '@/app/lib/firebase/calendar';
import { fetchGarminCourseGpx, garminCourseId } from '@/app/lib/trace-route';
import { gpxFileName } from '@/app/lib/gpx-build';

/** Session-dependent: never cached by a CDN. */
const PRIVATE = { 'Cache-Control': 'private, no-store' };

/**
 * The trace of a calendar ride, for signed-in members only (#252). Guests go to the login
 * page and come back here. A Garmin course downloads as a GPX file (#246); any other source
 * (Strava, Komoot, a GPX file, or a Garmin page that cannot be read) is a redirect to it.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse> {
  const { eventId } = await params;

  if (!(await getSessionUser())) {
    const login = new URL('/login', request.url);
    login.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(login, { status: 302, headers: PRIVATE });
  }

  const event = (await getCalendarEvents()).find((e) => e.id === eventId);
  // Only web links are served (admin input; never a javascript: or data: URL).
  if (!event?.gpxUrl || !/^https?:\/\//i.test(event.gpxUrl)) {
    return NextResponse.json({ error: 'Trace introuvable' }, { status: 404, headers: PRIVATE });
  }

  const courseId = garminCourseId(event.gpxUrl);
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
  return NextResponse.redirect(event.gpxUrl, { status: 302, headers: PRIVATE });
}
