import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyOwnerRequest } from '@/app/lib/auth/session';
import { verifyGithubToken } from '@/app/lib/feedback/github';
import {
  deleteFeedbackToken,
  getTokenStatus,
  saveFeedbackToken,
  TokenStoreUnavailableError,
} from '@/app/lib/feedback/token-store';

// ghp_..., github_pat_..., gho_...: letters, digits, underscore only.
const bodySchema = z.object({ token: z.string().trim().min(20).max(255).regex(/^[A-Za-z0-9_]+$/) });

/** The owner pastes a GitHub token: it is tested against the repo, then stored encrypted. It is never sent back. */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyOwnerRequest(request);
  if (!authCheck.authorized) return authCheck.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ce n’est pas un jeton GitHub valide.' }, { status: 400 });
  }

  const check = await verifyGithubToken(parsed.data.token);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 422 });

  try {
    await saveFeedbackToken(parsed.data.token, authCheck.user.id);
    return NextResponse.json({ success: true, token: await getTokenStatus() });
  } catch (error) {
    if (error instanceof TokenStoreUnavailableError) {
      return NextResponse.json(
        { error: 'Stockage impossible : SESSION_SECRET ou la base de données ne sont pas configurés.' },
        { status: 503 }
      );
    }
    console.error('Error saving the feedback token');
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyOwnerRequest(request);
  if (!authCheck.authorized) return authCheck.response;

  try {
    await deleteFeedbackToken();
    return NextResponse.json({ success: true, token: await getTokenStatus() });
  } catch {
    console.error('Error deleting the feedback token');
    return NextResponse.json({ error: 'Suppression impossible.' }, { status: 500 });
  }
}
