import { describe, it, expect } from 'vitest';
import {
  signSessionToken,
  verifySessionToken,
  SessionUser,
} from '@/app/lib/auth/session';

describe('auth session tokens', () => {
  const mockUser: Omit<SessionUser, 'iat' | 'exp'> = {
    id: 'user-blanmont-99',
    email: 'member@blanmont.be',
    name: 'Jean Cycliste',
    role: ['Member'],
    isAdmin: false,
  };

  it('signs and verifies a valid session token', async () => {
    const token = await signSessionToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(2);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(mockUser.id);
    expect(verified?.email).toBe(mockUser.email);
    expect(verified?.name).toBe(mockUser.name);
    expect(verified?.isAdmin).toBe(false);
    expect(verified?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects tampered tokens', async () => {
    const validToken = await signSessionToken(mockUser);
    const [payload, signature] = validToken.split('.');

    // Tamper with payload
    const tamperedPayload = payload.slice(0, -4) + 'AAAA';
    const tamperedToken = `${tamperedPayload}.${signature}`;

    const verified = await verifySessionToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it('rejects tampered signature', async () => {
    const validToken = await signSessionToken(mockUser);
    const [payload, signature] = validToken.split('.');

    const tamperedSignature = signature.slice(0, -4) + 'ZZZZ';
    const tamperedToken = `${payload}.${tamperedSignature}`;

    const verified = await verifySessionToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it('returns null for empty or invalid token formats', async () => {
    expect(await verifySessionToken('')).toBeNull();
    expect(await verifySessionToken(null)).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken('invalid-token-without-dots')).toBeNull();
    expect(await verifySessionToken('a.b.c.too.many.dots')).toBeNull();
  });
});
