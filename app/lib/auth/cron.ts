import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

/** Minimum length for CRON_SECRET (Vercel recommends a random string of 16+ chars). */
export const CRON_SECRET_MIN_LENGTH = 16;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Guards a cron route handler.
 *
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET
 * environment variable is set on the project.
 *
 * - CRON_SECRET set: the request must carry exactly that bearer token (401 otherwise).
 * - CRON_SECRET missing in production (NODE_ENV=production, incl. Vercel previews):
 *   fail closed with 503, so the job never runs unauthenticated.
 * - CRON_SECRET missing outside production: allowed, for local runs and tests.
 *
 * @returns null when the request may proceed, or the error response to return.
 */
export function verifyCronRequest(request: Request | undefined | null): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret || secret.length < CRON_SECRET_MIN_LENGTH) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[cron] CRON_SECRET is missing or too short; refusing to run.');
      return NextResponse.json(
        { error: 'Cron disabled: CRON_SECRET is not configured.' },
        { status: 503 }
      );
    }
    return null;
  }

  const header = request?.headers.get('authorization') ?? '';
  if (!safeEqual(header, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
