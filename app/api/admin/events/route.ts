import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { CalendarEvent } from '@/app/types';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { revalidateCalendarPages } from '@/app/lib/revalidate-calendar';
import { resolveEventTraceId } from '@/app/lib/event-trace';
import { linkRideToCatalog, resolveRideTraces } from '@/app/lib/event-trace-catalog';
import { rideTraceFields } from '@/app/lib/ride-traces';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'events');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const db = getAdminDatabase();

    const eventsRef = db.ref('calendar-events');
    const newEventRef = eventsRef.push();

    const eventData: Omit<CalendarEvent, 'id'> = {
      isoDate: data.isoDate,
      location: data.location || '',
      distances: data.distances || '',
      departure: data.departure || '',
      address: data.address || '',
      remarks: data.remarks || '',
      alternative: data.alternative || '',
      group: data.group || 'Blanmont',
      gpxUrl: data.gpxUrl || '',
    };

    if (data.traces !== undefined) {
      // One trace per group or distance (FFBC rides): the first is the main one (`gpxUrl`).
      const resolved = await resolveRideTraces(data.traces, eventData);
      if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
      }
      const fields = rideTraceFields(resolved.traces);
      // `set` stores no null: keys left empty are simply absent.
      eventData.gpxUrl = fields.gpxUrl;
      if (fields.traceId) eventData.traceId = fields.traceId;
      if (fields.traceLabel) eventData.traceLabel = fields.traceLabel;
      if (fields.extraTraces) eventData.extraTraces = fields.extraTraces;
    } else if (data.traceId) {
      // A ride created on a catalog trace takes the trace's link (#255).
      const resolved = await resolveEventTraceId(data.traceId);
      if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
      }
      Object.assign(eventData, resolved.fields);
    } else if (eventData.gpxUrl) {
      // A link typed on the ride joins the club catalogue and the ride follows that trace (#263).
      const linked = await linkRideToCatalog(eventData);
      if (linked) Object.assign(eventData, { traceId: linked.traceId, gpxUrl: linked.gpxUrl });
    }

    await newEventRef.set({
      ...eventData,
      createdAt: new Date().toISOString(),
    });
    revalidateCalendarPages();

    return NextResponse.json({ success: true, id: newEventRef.key });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
