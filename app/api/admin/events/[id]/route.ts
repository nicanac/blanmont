import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { revalidateCalendarPages } from '@/app/lib/revalidate-calendar';
import { resolveEventTraceId } from '@/app/lib/event-trace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'events');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const db = getAdminDatabase();
    const snapshot = await db.ref(`calendar-events/${id}`).once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ id, ...snapshot.val() });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'events');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const data = await request.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    const fields: Record<string, unknown> = { ...data };

    if ('traceId' in data) {
      // Link to a catalog trace (its link becomes gpxUrl) or unlink (#255).
      const resolved = await resolveEventTraceId(data.traceId);
      if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
      }
      Object.assign(fields, resolved.fields);
    } else if ('gpxUrl' in data) {
      // A link typed by hand replaces the catalog trace the ride followed.
      fields.traceId = null;
    }

    const db = getAdminDatabase();
    await db.ref(`calendar-events/${id}`).update({
      ...fields,
      updatedAt: new Date().toISOString(),
    });
    revalidateCalendarPages();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'events');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const db = getAdminDatabase();

    await db.ref(`calendar-events/${id}`).remove();
    revalidateCalendarPages();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
