import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireReviewer } from '@/app/lib/feedback/guard';
import { reviewerRoleLabel } from '@/app/lib/feedback/access';
import { actOnReport, getReportDetail, ReportNotFoundError } from '@/app/lib/feedback/reports';

interface Context {
  params: Promise<{ number: string }>;
}

const parseNumber = (raw: string): number | null => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const bodySchema = z
  .object({
    action: z.enum(['comment', 'resolve', 'dismiss', 'reopen']),
    text: z.string().trim().max(2000).optional(),
  })
  .refine((b) => b.action !== 'comment' || Boolean(b.text), { message: 'Écrivez un message.' });

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
  const guard = await requireReviewer(request);
  if (!guard.ok) return guard.response;
  const number = parseNumber((await context.params).number);
  if (!number) return NextResponse.json({ error: 'Retour introuvable.' }, { status: 404 });

  try {
    return NextResponse.json(await getReportDetail(number), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      return NextResponse.json({ error: 'Retour introuvable.' }, { status: 404 });
    }
    console.error('Error loading feedback report:', error);
    return NextResponse.json({ error: 'Impossible de charger ce retour.' }, { status: 502 });
  }
}

/** Reply, resolve, dismiss or reopen a report. */
export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  const guard = await requireReviewer(request);
  if (!guard.ok) return guard.response;
  const number = parseNumber((await context.params).number);
  if (!number) return NextResponse.json({ error: 'Retour introuvable.' }, { status: 404 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requête invalide.' }, { status: 400 });
  }

  try {
    const actor = {
      name: guard.user.name.split(' ')[0] || 'Responsable',
      role: reviewerRoleLabel(guard.user),
    };
    const report = await actOnReport(number, parsed.data.action, parsed.data.text, actor);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      return NextResponse.json({ error: 'Retour introuvable.' }, { status: 404 });
    }
    console.error('Error updating feedback report:', error);
    return NextResponse.json({ error: 'Action impossible pour le moment.' }, { status: 502 });
  }
}
