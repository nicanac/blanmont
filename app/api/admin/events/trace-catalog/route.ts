import { NextRequest, NextResponse } from 'next/server';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { backfillRideTraces } from '@/app/lib/event-trace-catalog';
import { revalidateCalendarPages } from '@/app/lib/revalidate-calendar';

/** Admin action, never cached. */
const PRIVATE = { 'Cache-Control': 'private, no-store' };

/**
 * Adds to the club catalogue the trace links already typed on calendar rides, and links each
 * ride to its catalog trace (#263). One call works for a few seconds: the admin page calls again
 * while `remaining > 0` and the last call linked something. Safe to repeat.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'events');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const report = await backfillRideTraces();
    if (report.linked > 0) revalidateCalendarPages();
    return NextResponse.json(report, { headers: PRIVATE });
  } catch (error) {
    console.error('Error adding ride traces to the catalogue:', error);
    return NextResponse.json(
      { error: "Impossible d'ajouter les traces des sorties au catalogue" },
      { status: 500, headers: PRIVATE }
    );
  }
}
