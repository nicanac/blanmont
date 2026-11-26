import { NextRequest, NextResponse } from 'next/server';
import { requireReviewer } from '@/app/lib/feedback/guard';
import { listReports } from '@/app/lib/feedback/reports';
import { getFeedbackRepo } from '@/app/lib/feedback/github';
import { readVotes, tallyVotes, type VoteMap } from '@/app/lib/feedback/votes';

/** All feedback reports, for admins and club officers. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const guard = await requireReviewer(request);
  if (!guard.ok) return guard.response;

  try {
    const [reports, votes] = await Promise.all([
      listReports(),
      // Votes are an extra: an RTDB hiccup must not hide the board.
      readVotes().catch((error) => {
        console.error('Error reading feedback votes:', error);
        return {} as VoteMap;
      }),
    ]);
    const withVotes = reports.map((r) => ({ ...r, ...tallyVotes(votes[r.number], guard.user.id) }));
    return NextResponse.json(
      { reports: withVotes, repo: getFeedbackRepo() },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Error listing feedback reports:', error);
    return NextResponse.json({ error: 'Impossible de charger les retours.' }, { status: 502 });
  }
}
