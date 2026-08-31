import { NextRequest } from 'next/server';
import { getCalendarEvents } from '@/app/lib/firebase/calendar';
import { generateICalendarFeed } from '@/app/lib/calendar-ics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const events = await getCalendarEvents();
    const host = request.headers.get('host') || 'blanmont.be';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host}`;

    const icsContent = generateICalendarFeed(events, siteUrl);

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="calendrier-cc-blanmont.ics"',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate iCalendar feed:', error);
    return new Response('Error generating calendar feed', { status: 500 });
  }
}
