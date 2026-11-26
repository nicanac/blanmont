import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/app/lib/auth/session';
import { getVisualFeedbackSettings } from '@/app/lib/firebase/visual-feedback';
import { isAudienceAllowed, isFeedbackKilled } from '@/app/lib/feedback/settings';

/**
 * Tells the client whether THIS caller may see the feedback tool.
 * Only a boolean is exposed: the audience rule itself stays server-side.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const headers = { 'Cache-Control': 'private, max-age=60' };
  if (isFeedbackKilled()) return NextResponse.json({ allowed: false }, { headers });

  const [settings, session] = await Promise.all([
    getVisualFeedbackSettings(),
    getSessionUserFromRequest(request),
  ]);
  return NextResponse.json({ allowed: isAudienceAllowed(settings, session) }, { headers });
}
