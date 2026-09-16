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

import { NextRequest } from 'next/server';
import {
  isSessionAdmin,
  getSessionUserFromRequest,
  verifyAdminRequest,
  SESSION_COOKIE_NAME,
} from '@/app/lib/auth/session';

describe('isSessionAdmin helper', () => {
  it('returns false for null or undefined session', () => {
    expect(isSessionAdmin(null)).toBe(false);
  });

  it('returns true when isAdmin property is true', () => {
    const session: SessionUser = {
      id: 'admin-1',
      email: 'admin@blanmont.be',
      name: 'Admin User',
      role: ['Member'],
      isAdmin: true,
      iat: 1000,
      exp: 9999999999,
    };
    expect(isSessionAdmin(session)).toBe(true);
  });

  it('checks role array when isAdmin property is false', () => {
    const presidentSession: SessionUser = {
      id: 'pres-1',
      email: 'pres@blanmont.be',
      name: 'President User',
      role: ['Président'],
      isAdmin: false,
      iat: 1000,
      exp: 9999999999,
    };
    expect(isSessionAdmin(presidentSession)).toBe(true);

    const regularSession: SessionUser = {
      id: 'reg-1',
      email: 'member@blanmont.be',
      name: 'Regular Member',
      role: ['Member'],
      isAdmin: false,
      iat: 1000,
      exp: 9999999999,
    };
    expect(isSessionAdmin(regularSession)).toBe(false);
  });
});

describe('getSessionUserFromRequest', () => {
  const user: Omit<SessionUser, 'iat' | 'exp'> = {
    id: 'user-req-1',
    email: 'user@blanmont.be',
    name: 'Req User',
    role: ['Member'],
    isAdmin: false,
  };

  it('extracts session user from Cookie', async () => {
    const token = await signSessionToken(user);
    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });

    const session = await getSessionUserFromRequest(req);
    expect(session).not.toBeNull();
    expect(session?.id).toBe(user.id);
  });

  it('extracts session user from Authorization Bearer header', async () => {
    const token = await signSessionToken(user);
    const req = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: `Bearer ${token}` },
    });

    const session = await getSessionUserFromRequest(req);
    expect(session).not.toBeNull();
    expect(session?.id).toBe(user.id);
  });

  it('returns null when neither cookie nor Bearer token is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/test');
    const session = await getSessionUserFromRequest(req);
    expect(session).toBeNull();
  });
});

describe('verifyAdminRequest', () => {
  const admin: Omit<SessionUser, 'iat' | 'exp'> = {
    id: 'admin-1',
    email: 'admin@blanmont.be',
    name: 'Admin',
    role: ['Admin'],
    isAdmin: true,
  };

  const member: Omit<SessionUser, 'iat' | 'exp'> = {
    id: 'member-1',
    email: 'member@blanmont.be',
    name: 'Member',
    role: ['Member'],
    isAdmin: false,
  };

  it('returns authorized: true for admin session', async () => {
    const token = await signSessionToken(admin);
    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });

    const result = await verifyAdminRequest(req);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.user.id).toBe(admin.id);
    }
  });

  it('returns 401 when no session exists', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/test');
    const result = await verifyAdminRequest(req);

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
      const data = await result.response.json();
      expect(data.error).toMatch(/non authentifié/i);
    }
  });

  it('returns 403 when session exists but user is not admin', async () => {
    const token = await signSessionToken(member);
    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });

    const result = await verifyAdminRequest(req);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(403);
      const data = await result.response.json();
      expect(data.error).toMatch(/droits administrateur requis/i);
    }
  });
});

