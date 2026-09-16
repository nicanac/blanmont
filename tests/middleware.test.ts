import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { signSessionToken, SESSION_COOKIE_NAME, SessionUser } from '@/app/lib/auth/session';

describe('Next.js Root Middleware', () => {
  const regularUser: Omit<SessionUser, 'iat' | 'exp'> = {
    id: 'user-regular-1',
    email: 'cycliste@blanmont.be',
    name: 'Laurent Cycliste',
    role: ['Member'],
    isAdmin: false,
  };

  const adminUser: Omit<SessionUser, 'iat' | 'exp'> = {
    id: 'user-admin-1',
    email: 'president@blanmont.be',
    name: 'Nicolas Président',
    role: ['President', 'Admin'],
    isAdmin: true,
  };

  describe('/api/admin/* protection', () => {
    it('returns 401 Unauthorized for unauthenticated requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/members');
      const response = await middleware(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/non authentifié/i);
    });

    it('returns 403 Forbidden for authenticated non-admin members', async () => {
      const token = await signSessionToken(regularUser);
      const request = new NextRequest('http://localhost:3000/api/admin/members', {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const response = await middleware(request);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toMatch(/droits administrateur requis/i);
    });

    it('allows access (NextResponse.next()) for authenticated admins', async () => {
      const token = await signSessionToken(adminUser);
      const request = new NextRequest('http://localhost:3000/api/admin/members', {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const response = await middleware(request);
      // NextResponse.next() produces an internal 200 response with x-middleware-next header
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('/admin/* UI page protection', () => {
    it('redirects unauthenticated users to /login?redirect=...', async () => {
      const request = new NextRequest('http://localhost:3000/admin/events');
      const response = await middleware(request);

      expect(response.status).toBe(307); // NextResponse.redirect default status
      const location = response.headers.get('location');
      expect(location).toContain('/login?redirect=%2Fadmin%2Fevents');
    });

    it('redirects authenticated non-admin members to /login', async () => {
      const token = await signSessionToken(regularUser);
      const request = new NextRequest('http://localhost:3000/admin/sondages', {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const response = await middleware(request);
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login?redirect=%2Fadmin%2Fsondages');
    });

    it('allows access to /admin pages for authenticated admins', async () => {
      const token = await signSessionToken(adminUser);
      const request = new NextRequest('http://localhost:3000/admin/hero', {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const response = await middleware(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Public routes', () => {
    it('passes through public pages without modification', async () => {
      const publicPaths = ['/', '/calendrier', '/traces', '/le-club', '/members', '/blog'];

      for (const path of publicPaths) {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await middleware(request);
        expect(response.status).toBe(200);
        expect(response.headers.get('x-middleware-next')).toBe('1');
      }
    });
  });
});
