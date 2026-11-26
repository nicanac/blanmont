import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdminRequest } from '@/app/lib/auth/session';
import {
  getVisualFeedbackSettings,
  updateVisualFeedbackSettings,
} from '@/app/lib/firebase/visual-feedback';
import { isFeedbackKilled } from '@/app/lib/feedback/settings';
import { getFeedbackRepo, isGithubConfigured } from '@/app/lib/feedback/github';

const bodySchema = z.object({
  enabled: z.boolean(),
  audience: z.enum(['admins', 'members', 'everyone']),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) return authCheck.response;

  return NextResponse.json({
    settings: await getVisualFeedbackSettings(),
    githubConfigured: isGithubConfigured(),
    repo: getFeedbackRepo(),
    killed: isFeedbackKilled(),
  });
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) return authCheck.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  }

  try {
    const settings = await updateVisualFeedbackSettings(parsed.data, authCheck.user.id);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating visual feedback settings:', error);
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }
}
