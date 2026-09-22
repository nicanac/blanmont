import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as stravaCallbackRoute } from '@/app/api/auth/strava/callback/route';
import * as stravaLib from '@/app/lib/strava';

describe('Strava OAuth Callback API (/api/auth/strava/callback)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to import page with error parameter if error is in query', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/strava/callback?error=access_denied');
    const res = await stravaCallbackRoute(req);

    expect(res.status).toBe(307); // NextResponse.redirect
    expect(res.headers.get('Location')).toContain('/import/strava?error=access_denied');
  });

  it('redirects with no_code error when authorization code is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/strava/callback');
    const res = await stravaCallbackRoute(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toContain('/import/strava?error=no_code');
  });

  it('exchanges code for token and sets secure httpOnly cookie before redirecting', async () => {
    vi.spyOn(stravaLib, 'exchangeToken').mockResolvedValue({
      access_token: 'strava-access-token-123',
    } as any);

    const req = new NextRequest('http://localhost:3000/api/auth/strava/callback?code=auth-code-xyz');
    const res = await stravaCallbackRoute(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toContain('/import/strava');

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toContain('strava_access_token=strava-access-token-123');
    expect(cookieHeader).toContain('Path=/');
    expect(cookieHeader).toContain('HttpOnly');
  });

  it('redirects with token_exchange_failed when exchangeToken throws', async () => {
    vi.spyOn(stravaLib, 'exchangeToken').mockRejectedValue(new Error('Invalid grant'));

    const req = new NextRequest('http://localhost:3000/api/auth/strava/callback?code=bad-code');
    const res = await stravaCallbackRoute(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toContain('/import/strava?error=token_exchange_failed');
  });
});
