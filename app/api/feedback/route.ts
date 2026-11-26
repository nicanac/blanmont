import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/app/lib/auth/session';
import { extractClientIp } from '@/app/lib/logging/ipAnonymizer';
import { getVisualFeedbackSettings } from '@/app/lib/firebase/visual-feedback';
import { isAudienceAllowed } from '@/app/lib/feedback/settings';
import { feedbackSchema } from '@/app/lib/feedback/schema';
import { isGithubConfigured, submitFeedbackToGitHub } from '@/app/lib/feedback/github';

const MAX_BODY_BYTES = 6 * 1024 * 1024; // review writes only; other routes keep the platform default
const RATE_LIMIT = 5; // reports
const RATE_WINDOW_MS = 10 * 60 * 1000;

// shortcut: per-instance memory, so the limit is per serverless instance. Move to RTDB if abused.
const hits = new Map<string, number[]>();

function rateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const [settings, session] = await Promise.all([
    getVisualFeedbackSettings(),
    getSessionUserFromRequest(request),
  ]);

  if (!isAudienceAllowed(settings, session)) {
    const status = session ? 403 : settings.enabled ? 401 : 404;
    return NextResponse.json({ error: 'Les retours ne sont pas disponibles.' }, { status });
  }

  if (!isGithubConfigured()) {
    return NextResponse.json(
      { error: 'Les retours ne sont pas encore configurés côté serveur.' },
      { status: 503 }
    );
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Capture trop volumineuse.' }, { status: 413 });
  }

  if (rateLimited(session?.id ?? extractClientIp(request.headers) ?? 'anonymous')) {
    return NextResponse.json({ error: 'Trop de retours envoyés, réessayez plus tard.' }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Requête invalide.' },
      { status: 400 }
    );
  }

  try {
    // Public repo by default: only the first name goes into the issue.
    const author = session ? session.name.split(' ')[0] || 'Membre' : 'Visiteur';
    const issue = await submitFeedbackToGitHub(parsed.data, author);
    return NextResponse.json({ success: true, ...issue }, { status: 201 });
  } catch (error) {
    console.error('Error sending feedback to GitHub:', error);
    return NextResponse.json({ error: 'Envoi impossible pour le moment.' }, { status: 502 });
  }
}
