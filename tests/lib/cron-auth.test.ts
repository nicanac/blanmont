import { describe, it, expect, afterEach, vi } from 'vitest';
import { verifyCronRequest } from '@/app/lib/auth/cron';

const SECRET = 'example_cron_secret_for_tests_only';
const req = (authorization?: string) =>
  new Request('http://localhost:3000/api/cron/x', {
    headers: authorization ? { authorization } : {},
  });

describe('verifyCronRequest', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows requests carrying the exact bearer token', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronRequest(req(`Bearer ${SECRET}`))).toBeNull();
  });

  it('rejects a missing or wrong token with 401', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronRequest(req())?.status).toBe(401);
    expect(verifyCronRequest(req(`Bearer ${SECRET}x`))?.status).toBe(401);
    expect(verifyCronRequest(req(SECRET))?.status).toBe(401);
    expect(verifyCronRequest(undefined)?.status).toBe(401);
  });

  it('fails closed with 503 in production when CRON_SECRET is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CRON_SECRET', '');
    expect(verifyCronRequest(req())?.status).toBe(503);
  });

  it('treats a too-short CRON_SECRET as missing in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CRON_SECRET', 'short');
    expect(verifyCronRequest(req('Bearer short'))?.status).toBe(503);
  });

  it('allows unauthenticated local runs outside production when no secret is set', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CRON_SECRET', '');
    expect(verifyCronRequest(req())).toBeNull();
  });
});
