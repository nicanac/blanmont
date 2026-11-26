import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  getSessionSecret,
  signSessionToken,
  verifySessionToken,
  SessionSecretMissingError,
  SESSION_SECRET_MIN_LENGTH,
} from '@/app/lib/auth/session-token';

const user = { id: 'm1', email: 'm@example.com', name: 'Membre', role: ['Member'], isAdmin: false };
const STRONG = 'example_session_secret_for_tests_0123456789';

describe('session secret handling', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses SESSION_SECRET when long enough', () => {
    vi.stubEnv('SESSION_SECRET', STRONG);
    expect(getSessionSecret()).toBe(STRONG);
  });

  it('never falls back to the Firebase service-account key', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_KEY', '{"private_key":"example"}');
    expect(getSessionSecret()).toBeNull();
  });

  it('fails closed in production when SESSION_SECRET is missing or too short', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'x'.repeat(SESSION_SECRET_MIN_LENGTH - 1));
    expect(getSessionSecret()).toBeNull();
    await expect(signSessionToken(user)).rejects.toBeInstanceOf(SessionSecretMissingError);
  });

  it('rejects every token in production when the secret is missing', async () => {
    vi.stubEnv('SESSION_SECRET', STRONG);
    const token = await signSessionToken(user);
    expect(await verifySessionToken(token)).not.toBeNull();

    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    expect(await verifySessionToken(token)).toBeNull();
  });

  it('invalidates tokens signed with another secret', async () => {
    vi.stubEnv('SESSION_SECRET', STRONG);
    const token = await signSessionToken(user);
    vi.stubEnv('SESSION_SECRET', `${STRONG}-rotated`);
    expect(await verifySessionToken(token)).toBeNull();
  });

  it('uses a placeholder key outside production so local dev works without config', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SESSION_SECRET', '');
    expect(getSessionSecret()).toMatch(/^example_/);
  });
});
