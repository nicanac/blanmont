import { NextRequest, NextResponse } from 'next/server';
import { requireReviewer } from '@/app/lib/feedback/guard';
import { listReports } from '@/app/lib/feedback/reports';
import { getFeedbackRepo } from '@/app/lib/feedback/github';

/** All feedback reports, for admins and club officers. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const guard = await requireReviewer(request);
  if (!guard.ok) return guard.response;

  try {
    return NextResponse.json(
      { reports: await listReports(), repo: getFeedbackRepo() },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Error listing feedback reports:', error);
    return NextResponse.json({ error: 'Impossible de charger les retours.' }, { status: 502 });
  }
}
