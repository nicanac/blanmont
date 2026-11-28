/**
 * Server-side sending of Firebase's "choose your password" email (password reset template).
 *
 * Why on the server: the browser call used to pass `${window.location.origin}/login` as continue URL.
 * blanmont.vercel.app is not an authorized domain of the Firebase project, so Firebase answered
 * UNAUTHORIZED_DOMAIN, the page swallowed the error and no member ever got the email.
 * Here every failure is visible to the caller (and logged), and a refused continue URL is
 * retried without one: the email always goes out, the link then opens Firebase's own page
 * (or the action URL set in the email template) instead of coming back to the site.
 *
 * Uses the public Identity Toolkit REST endpoint with the web API key, exactly like the
 * Firebase client SDK. Honours FIREBASE_AUTH_EMULATOR_HOST for local tests.
 */

export type PasswordEmailFailure = 'rate_limited' | 'not_configured' | 'failed';

export type PasswordEmailResult =
  | {
      sent: true;
      /** Continue URL Firebase accepted, or null when the email went out without one. */
      continueUrl: string | null;
      /** Firebase error code that made us drop the continue URL (domain not authorized). */
      continueUrlRefused?: string;
    }
  | { sent: false; reason: PasswordEmailFailure; code: string };

/** Firebase codes meaning "the continue URL is the problem, the email itself is fine". */
const CONTINUE_URL_REFUSED = /UNAUTHORIZED_DOMAIN|INVALID_CONTINUE_URI|MISSING_CONTINUE_URI|UNAUTHORIZED_CONTINUE_URI/;
/** Firebase codes meaning "too many emails for now". */
const RATE_LIMITED = /RESET_PASSWORD_EXCEED_LIMIT|TOO_MANY_ATTEMPTS_TRY_LATER|QUOTA_EXCEEDED/;

const REQUEST_TIMEOUT_MS = 10_000;

function identityToolkitBase(): string {
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  return emulator
    ? `http://${emulator}/identitytoolkit.googleapis.com/v1`
    : 'https://identitytoolkit.googleapis.com/v1';
}

async function requestResetEmail(
  apiKey: string,
  email: string,
  continueUrl: string | null
): Promise<{ ok: true } | { ok: false; code: string }> {
  const response = await fetch(`${identityToolkitBase()}/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email,
      ...(continueUrl ? { continueUrl } : {}),
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.ok) return { ok: true };
  const body = (await response.json().catch(() => null)) as { error?: { message?: unknown } } | null;
  const message = body?.error?.message;
  return { ok: false, code: typeof message === 'string' && message ? message : `HTTP_${response.status}` };
}

/**
 * Asks Firebase to email the password link to `email` (the account must exist).
 * Never throws: network errors come back as `{ sent: false, reason: 'failed' }`.
 */
export async function sendPasswordSetupEmail(
  email: string,
  continueUrl: string | null
): Promise<PasswordEmailResult> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return { sent: false, reason: 'not_configured', code: 'MISSING_API_KEY' };

  try {
    const first = await requestResetEmail(apiKey, email, continueUrl);
    if (first.ok) return { sent: true, continueUrl };

    let failure = first.code;
    if (continueUrl && CONTINUE_URL_REFUSED.test(first.code)) {
      // The site's domain is not in Firebase's authorized domains: send the email anyway.
      const retry = await requestResetEmail(apiKey, email, null);
      if (retry.ok) return { sent: true, continueUrl: null, continueUrlRefused: first.code };
      failure = retry.code;
    }
    return { sent: false, reason: RATE_LIMITED.test(failure) ? 'rate_limited' : 'failed', code: failure };
  } catch (error) {
    return { sent: false, reason: 'failed', code: error instanceof Error ? error.name : 'UNKNOWN' };
  }
}

/**
 * Login page URL used as continue URL of the email: NEXT_PUBLIC_SITE_URL, else the Vercel
 * production domain, else the request host (https only, http on localhost). Null when unknown.
 */
export function loginContinueUrl(host: string | null, forwardedProto: string | null): string | null {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : '');
  if (configured) {
    try {
      const url = new URL('/login', configured);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString();
    } catch {
      // Malformed env value: fall back to the request host.
    }
  }
  const cleanHost = host?.split(',')[0]?.trim().toLowerCase();
  if (!cleanHost || !/^[a-z0-9.-]+(:\d+)?$/.test(cleanHost)) return null;
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanHost);
  const proto = isLocal && forwardedProto?.split(',')[0]?.trim() === 'https' ? 'https' : isLocal ? 'http' : 'https';
  return `${proto}://${cleanHost}/login`;
}
