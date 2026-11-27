import { NextRequest, NextResponse } from 'next/server';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { getCalendarEvents } from '@/app/lib/firebase/calendar';
import {
  listCatalogTraceOptions,
  type EventTraceRow,
  type TraceLinksPayload,
} from '@/app/lib/event-trace';
import { getTodayIso } from '@/app/utils/date';

/** Admin data, read fresh on every call. */
const PRIVATE = { 'Cache-Control': 'private, no-store' };

/**
 * What the admin needs to link a catalog trace to a calendar ride (#255): the catalog
 * traces that have a link, and the upcoming rides with the trace each one follows.
 * Writes go through `PUT /api/admin/events/[id]` with `{ traceId }`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'events');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const [traces, events] = await Promise.all([listCatalogTraceOptions(), getCalendarEvents()]);
    const today = getTodayIso();
    const upcoming: EventTraceRow[] = events
      .filter((e) => e.isoDate >= today)
      .map((e) => ({
        id: e.id,
        isoDate: e.isoDate,
        location: e.location || '',
        group: e.group || '',
        ...(e.traceId ? { traceId: e.traceId } : {}),
        ...(e.gpxUrl ? { gpxUrl: e.gpxUrl } : {}),
      }));

    const payload: TraceLinksPayload = { traces, events: upcoming };
    return NextResponse.json(payload, { headers: PRIVATE });
  } catch (error) {
    console.error('Error loading trace links:', error);
    return NextResponse.json(
      { error: 'Failed to load trace links' },
      { status: 500, headers: PRIVATE }
    );
  }
}
