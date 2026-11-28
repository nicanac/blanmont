import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginContinueUrl, sendPasswordSetupEmail } from '@/app/lib/auth/password-email';
import { LOGIN_FAILURE_MESSAGES, loginFailureFromFirebaseCode } from '@/app/lib/auth/login-messages';

const ok = () => new Response(JSON.stringify({ kind: 'identitytoolkit#GetOobConfirmationCodeResponse' }), { status: 200 });
const firebaseError = (message: string) =>
  new Response(JSON.stringify({ error: { code: 400, message } }), { status: 400 });

describe('sendPasswordSetupEmail', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'web-key');
    vi.stubEnv('FIREBASE_AUTH_EMULATOR_HOST', '');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const bodyOf = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body as string);

  it('asks Firebase for a PASSWORD_RESET email with the site login page as continue URL', async () => {
    fetchMock.mockResolvedValueOnce(ok());

    const result = await sendPasswordSetupEmail('m@blanmont.be', 'https://blanmont.vercel.app/login');

    expect(result).toEqual({ sent: true, continueUrl: 'https://blanmont.vercel.app/login' });
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=web-key'
    );
    expect(bodyOf(0)).toEqual({
      requestType: 'PASSWORD_RESET',
      email: 'm@blanmont.be',
      continueUrl: 'https://blanmont.vercel.app/login',
    });
  });

  it('still sends the email when the site domain is not authorized in Firebase (the production bug)', async () => {
    fetchMock
      .mockResolvedValueOnce(firebaseError('UNAUTHORIZED_DOMAIN : Domain not allowlisted by project'))
      .mockResolvedValueOnce(ok());

    const result = await sendPasswordSetupEmail('m@blanmont.be', 'https://blanmont.vercel.app/login');

    expect(result).toEqual({
      sent: true,
      continueUrl: null,
      continueUrlRefused: 'UNAUTHORIZED_DOMAIN : Domain not allowlisted by project',
    });
    expect(bodyOf(1)).toEqual({ requestType: 'PASSWORD_RESET', email: 'm@blanmont.be' });
  });

  it('reports a rate limit, and other refusals, instead of hiding them', async () => {
    fetchMock.mockResolvedValueOnce(firebaseError('RESET_PASSWORD_EXCEED_LIMIT'));
    expect(await sendPasswordSetupEmail('m@blanmont.be', null)).toEqual({
      sent: false,
      reason: 'rate_limited',
      code: 'RESET_PASSWORD_EXCEED_LIMIT',
    });

    fetchMock.mockResolvedValueOnce(firebaseError('EMAIL_NOT_FOUND'));
    expect(await sendPasswordSetupEmail('m@blanmont.be', null)).toMatchObject({ sent: false, reason: 'failed' });

    fetchMock.mockRejectedValueOnce(Object.assign(new Error('timeout'), { name: 'TimeoutError' }));
    expect(await sendPasswordSetupEmail('m@blanmont.be', null)).toEqual({
      sent: false,
      reason: 'failed',
      code: 'TimeoutError',
    });
  });

  it('does not retry without continue URL for an unrelated error', async () => {
    fetchMock.mockResolvedValueOnce(firebaseError('INVALID_EMAIL'));
    expect(await sendPasswordSetupEmail('m@blanmont.be', 'https://blanmont.vercel.app/login')).toMatchObject({
      sent: false,
      code: 'INVALID_EMAIL',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('talks to the Auth emulator when FIREBASE_AUTH_EMULATOR_HOST is set', async () => {
    vi.stubEnv('FIREBASE_AUTH_EMULATOR_HOST', '127.0.0.1:9099');
    fetchMock.mockResolvedValueOnce(ok());
    await sendPasswordSetupEmail('m@blanmont.be', null);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=web-key'
    );
  });

  it('fails clearly without a web API key', async () => {
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', '');
    expect(await sendPasswordSetupEmail('m@blanmont.be', null)).toEqual({
      sent: false,
      reason: 'not_configured',
      code: 'MISSING_API_KEY',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('loginContinueUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('uses the request host over https, http only on localhost', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(loginContinueUrl('blanmont.vercel.app', 'https')).toBe('https://blanmont.vercel.app/login');
    expect(loginContinueUrl('blanmont.vercel.app', 'http')).toBe('https://blanmont.vercel.app/login');
    expect(loginContinueUrl('localhost:3000', 'http')).toBe('http://localhost:3000/login');
    expect(loginContinueUrl('a.example, b.example', null)).toBe('https://a.example/login');
  });

  it('rejects a malformed host and prefers NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(loginContinueUrl('evil.example/path?x', 'https')).toBeNull();
    expect(loginContinueUrl(null, null)).toBeNull();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.cyclo-blanmont.be');
    expect(loginContinueUrl('blanmont.vercel.app', 'https')).toBe('https://www.cyclo-blanmont.be/login');
  });
});

describe('login failure messages', () => {
  it('maps Firebase codes to reasons and never sends a wrong password back to "first login" alone', () => {
    expect(loginFailureFromFirebaseCode('auth/invalid-credential')).toBe('invalid_credentials');
    expect(loginFailureFromFirebaseCode('auth/too-many-requests')).toBe('too_many_attempts');
    expect(loginFailureFromFirebaseCode('auth/user-disabled')).toBe('account_disabled');
    expect(loginFailureFromFirebaseCode(undefined)).toBe('unavailable');
    expect(LOGIN_FAILURE_MESSAGES.invalid_credentials).toMatch(/incorrect/);
    expect(LOGIN_FAILURE_MESSAGES.too_many_attempts).toMatch(/Trop de tentatives/);
  });
});
