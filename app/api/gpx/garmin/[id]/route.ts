import { NextRequest, NextResponse } from 'next/server';
import { fetchGarminCourseGpx } from '@/app/lib/trace-route';
import { gpxFileName } from '@/app/lib/gpx-build';

/**
 * Downloads a Garmin Connect course as a GPX file (#246), so riders get the file at once
 * instead of being sent to Garmin Connect. The course page Garmin publishes is public.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  if (!/^\d{1,20}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid course id' }, { status: 400 });
  }

  const course = await fetchGarminCourseGpx(id);
  if (!course) {
    // Garmin changed or refused its page: fall back to the course on Garmin Connect.
    return NextResponse.redirect(`https://connect.garmin.com/modern/course/${id}`, 302);
  }

  return new NextResponse(course.gpx, {
    headers: {
      'Content-Type': 'application/gpx+xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${gpxFileName(course.name)}"`,
      // The course may be edited until the ride (same hourly refresh as the previews).
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
