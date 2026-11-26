import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { clearAdminAccessCache } from '@/app/lib/auth/admin-access';
import { USERS, fakeDb, requestAs } from './lib/rbac-fixtures';

const NODE = 'settings/admin-access';
const passes = (res: Response) => res.status === 200 && res.headers.get('x-middleware-next') === '1';
const redirectedTo = (res: Response) => {
  expect(res.status).toBe(307);
  const url = new URL(res.headers.get('location')!);
  return url.pathname + url.search;
};

describe('proxy.ts (back-office RBAC)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    clearAdminAccessCache();
    fakeDb({}); // matrix absent: suggested defaults
  });
  afterEach(() => vi.unstubAllEnvs());

  describe('anonymous', () => {
    it('gets 401 on the admin API', async () => {
      const res = await proxy(await requestAs('/api/admin/members'));
      expect(res.status).toBe(401);
      expect((await res.json()).error).toMatch(/non authentifié/i);
    });

    it('is redirected to /login?redirect=… on admin pages', async () => {
      expect(redirectedTo(await proxy(await requestAs('/admin/events')))).toBe('/login?redirect=%2Fadmin%2Fevents');
    });
  });

  describe('admin', () => {
    it('opens every page and API, including admin-only and unknown paths, without reading the matrix', async () => {
      const db = fakeDb({ [NODE]: new Error('down') });
      for (const url of ['/admin', '/admin/hero', '/admin/acces', '/admin/unknown', '/api/admin/members', '/admin/settings']) {
        expect(passes(await proxy(await requestAs(url, USERS.admin)))).toBe(true);
      }
      expect(db.once).not.toHaveBeenCalled();
    });
  });

  describe('officer (Trésorier: commandes, equipements by default)', () => {
    it('opens its sections and the dashboard', async () => {
      for (const url of ['/admin', '/admin/commandes/banque', '/admin/equipements/x1/edit', '/api/admin/equipements']) {
        expect(passes(await proxy(await requestAs(url, USERS.tresorier)))).toBe(true);
      }
    });

    it('is redirected to /admin?acces=refuse from a denied page', async () => {
      expect(redirectedTo(await proxy(await requestAs('/admin/members', USERS.tresorier)))).toBe('/admin?acces=refuse');
      expect(redirectedTo(await proxy(await requestAs('/admin/acces', USERS.tresorier)))).toBe('/admin?acces=refuse');
    });

    it('gets 403 on a denied API', async () => {
      const res = await proxy(await requestAs('/api/admin/members', USERS.tresorier));
      expect(res.status).toBe(403);
      expect((await res.json()).error).toMatch(/accès refusé/i);
    });

    it('is denied on unknown paths', async () => {
      expect(redirectedTo(await proxy(await requestAs('/admin/unknown', USERS.tresorier)))).toBe('/admin?acces=refuse');
      expect((await proxy(await requestAs('/api/admin/unknown', USERS.tresorier))).status).toBe(403);
    });

    it('follows the stored matrix', async () => {
      fakeDb({ [NODE]: { roles: { Trésorier: { members: true } } } });
      expect(passes(await proxy(await requestAs('/admin/members', USERS.tresorier)))).toBe(true);
      expect(redirectedTo(await proxy(await requestAs('/admin/commandes', USERS.tresorier)))).toBe('/admin?acces=refuse');
    });

    it('is denied everything when the matrix cannot be read (admins only)', async () => {
      fakeDb({ [NODE]: new Error('RTDB unavailable') });
      expect(redirectedTo(await proxy(await requestAs('/admin/commandes', USERS.tresorier)))).toBe('/');
      expect((await proxy(await requestAs('/api/admin/equipements', USERS.tresorier))).status).toBe(403);
    });
  });

  describe('member without any section', () => {
    it('is sent to the public home from any admin page, dashboard included', async () => {
      expect(redirectedTo(await proxy(await requestAs('/admin', USERS.member)))).toBe('/');
      expect(redirectedTo(await proxy(await requestAs('/admin/sondages', USERS.member)))).toBe('/');
    });

    it('gets 403 on the admin API', async () => {
      const res = await proxy(await requestAs('/api/admin/members', USERS.member));
      expect(res.status).toBe(403);
      expect((await res.json()).error).toMatch(/droits administrateur requis/i);
    });
  });

  describe('Paramètres (owner-only)', () => {
    beforeEach(() => vi.stubEnv('OWNER_EMAILS', 'owner@example.test'));

    it('opens the settings API to the owner only', async () => {
      expect(passes(await proxy(await requestAs('/api/admin/feedback-settings', USERS.owner)))).toBe(true);
      expect((await proxy(await requestAs('/api/admin/feedback-settings', USERS.admin))).status).toBe(403);
    });

    it('denies a member whose record email was edited to the owner address', async () => {
      const edited = { ...USERS.admin, email: 'owner@example.test', verifiedEmail: 'someone@example.test' };
      expect((await proxy(await requestAs('/api/admin/feedback-settings', edited))).status).toBe(403);
    });

    it('denies everyone when OWNER_EMAILS is unset', async () => {
      vi.stubEnv('OWNER_EMAILS', '');
      expect((await proxy(await requestAs('/api/admin/feedback-settings', USERS.owner))).status).toBe(403);
    });

    it('lets admins load the page (it shows the owner notice) and keeps officers out', async () => {
      expect(passes(await proxy(await requestAs('/admin/settings', USERS.admin)))).toBe(true);
      expect(redirectedTo(await proxy(await requestAs('/admin/parametres', USERS.tresorier)))).toBe('/admin?acces=refuse');
    });
  });

  it('passes public pages through untouched', async () => {
    for (const path of ['/', '/calendrier', '/traces', '/le-club', '/members', '/blog', '/administration']) {
      expect(passes(await proxy(new NextRequest(`http://localhost:3000${path}`)))).toBe(true);
    }
  });
});
