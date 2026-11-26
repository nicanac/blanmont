import { NextRequest, NextResponse } from 'next/server';
import { requireReviewer } from '@/app/lib/feedback/guard';
import { assertReport, parseReportNumber, ReportNotFoundError } from '@/app/lib/feedback/reports';
import { toggleVote } from '@/app/lib/feedback/votes';

interface Context {
  params: Promise<{ number: string }>;
}

/** Adds or removes the signed-in reviewer's "+1" on a report. The voter is always the session, never the body. */
export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  const guard = await requireReviewer(request);
  if (!guard.ok) return guard.response;
  const number = parseReportNumber((await context.params).number);
  if (!number) return NextResponse.json({ error: 'Retour introuvable.' }, { status: 404 });

  try {
    await assertReport(number);
    return NextResponse.json(await toggleVote(number, guard.user.id));
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      return NextResponse.json({ error: 'Retour introuvable.' }, { status: 404 });
    }
    console.error('Error toggling feedback vote:', error);
    return NextResponse.json({ error: 'Vote impossible pour le moment.' }, { status: 502 });
  }
}
