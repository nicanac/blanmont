import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  ADMIN_ONLY,
  ADMIN_ONLY_PATHS,
  ADMIN_SECTIONS,
  ADMIN_SECTION_IDS,
  DASHBOARD,
  DEFAULT_ADMIN_ACCESS,
  MATRIX_ROLES,
  OWNER_ONLY,
  OWNER_ONLY_PATHS,
  canOpenAdminPath,
  sectionForPath,
} from '@/app/constants/admin-sections';

const APP = path.resolve(import.meta.dirname, '../../app');

function filesNamed(dir: string, names: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesNamed(full, names);
    return names.includes(entry.name) ? [full] : [];
  });
}

/** app/admin/members/[id]/edit/page.tsx → /admin/members/x1/edit (route groups dropped). */
function urlOf(file: string): string {
  const segments = path
    .relative(APP, path.dirname(file))
    .split(path.sep)
    .filter((s) => !/^\(.*\)$/.test(s))
    .map((s) => (/^\[.*\]$/.test(s) ? 'x1' : s));
  return '/' + segments.join('/');
}

const pageUrls = filesNamed(path.join(APP, 'admin'), ['page.tsx', 'page.ts']).map(urlOf);
const apiUrls = filesNamed(path.join(APP, 'api', 'admin'), ['route.ts', 'route.tsx']).map(urlOf);

describe('admin section registry', () => {
  it('finds the admin pages and API routes on disk', () => {
    expect(pageUrls).toContain('/admin/commandes/banque');
    expect(apiUrls).toContain('/api/admin/members/x1/reset-password');
  });

  it.each([...pageUrls, ...apiUrls])('maps %s to a section, admin-only or owner-only', (url) => {
    expect(sectionForPath(url)).not.toBeNull();
  });

  it('maps known paths to the expected guard', () => {
    expect(sectionForPath('/admin')).toBe(DASHBOARD);
    expect(sectionForPath('/admin/')).toBe(DASHBOARD);
    expect(sectionForPath('/admin/acces')).toBe(ADMIN_ONLY);
    expect(sectionForPath('/admin/settings')).toBe(OWNER_ONLY);
    expect(sectionForPath('/admin/parametres')).toBe(OWNER_ONLY);
    expect(sectionForPath('/api/admin/feedback-settings')).toBe(OWNER_ONLY);
    expect(sectionForPath('/admin/commandes/banque')).toBe('commandes');
    expect(sectionForPath('/admin/commandes/campagnes/x1')).toBe('commandes');
    expect(sectionForPath('/admin/members/photos')).toBe('members');
    expect(sectionForPath('/admin/members/x1/reset-password')).toBe('members');
    expect(sectionForPath('/api/admin/members/x1/reset-password')).toBe('members');
    expect(sectionForPath('/admin/sorties-essai')).toBe('prospects');
    expect(sectionForPath('/admin/add-trace')).toBe('traces');
    expect(sectionForPath('/api/admin/attendance')).toBe('pointage-express');
    expect(sectionForPath('/admin/events/x1/edit')).toBe('events');
  });

  it('denies unknown paths and respects segment boundaries', () => {
    expect(sectionForPath('/admin/unknown')).toBeNull();
    expect(sectionForPath('/admin/membersX')).toBeNull();
    expect(sectionForPath('/admin/Members')).toBeNull();
    expect(sectionForPath('/api/admin')).toBeNull();
    expect(sectionForPath('/api/admin/unknown')).toBeNull();
    expect(sectionForPath('/api/admin/eventsX')).toBeNull();
  });

  it('has unique, non-nested path prefixes (exactly one guard per path)', () => {
    const prefixes = [
      ...ADMIN_SECTIONS.flatMap((s) => [...s.pages, ...s.apis]),
      ...ADMIN_ONLY_PATHS.pages,
      ...ADMIN_ONLY_PATHS.apis,
      ...OWNER_ONLY_PATHS.pages,
      ...OWNER_ONLY_PATHS.apis,
    ];
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const a of prefixes) {
      for (const b of prefixes) {
        if (a !== b) expect(b.startsWith(a + '/')).toBe(false);
      }
    }
    expect(new Set(ADMIN_SECTION_IDS).size).toBe(ADMIN_SECTION_IDS.length);
  });

  it('keeps admin roles out of the matrix and the settings out of the sections', () => {
    expect(MATRIX_ROLES.map((r) => r.key)).toEqual(['Capitaine de Route', 'Trésorier', 'Secrétaire', 'Member']);
    expect(ADMIN_SECTION_IDS).not.toContain('settings');
  });

  it('suggests the spec defaults, with known roles and sections only', () => {
    expect(DEFAULT_ADMIN_ACCESS).toEqual({
      'Capitaine de Route': ['sondages', 'events', 'pointage-express', 'carre-vert'],
      Trésorier: ['commandes', 'equipements'],
      Secrétaire: ['members', 'prospects', 'blog', 'galerie'],
      Member: [],
    });
    const roleKeys = MATRIX_ROLES.map((r) => r.key);
    for (const [role, ids] of Object.entries(DEFAULT_ADMIN_ACCESS)) {
      expect(roleKeys).toContain(role);
      ids.forEach((id) => expect(ADMIN_SECTION_IDS).toContain(id));
    }
  });
});

describe('canOpenAdminPath (sidebar, palette, dashboard)', () => {
  const none = { isAdmin: false, isOwner: false, sections: [] };
  const tresorier = { isAdmin: false, isOwner: false, sections: ['commandes', 'equipements'] };
  const admin = { isAdmin: true, isOwner: false, sections: ADMIN_SECTION_IDS };
  const owner = { ...admin, isOwner: true };

  it('shows a delegated role its sections and the dashboard only', () => {
    expect(canOpenAdminPath(tresorier, '/admin')).toBe(true);
    expect(canOpenAdminPath(tresorier, '/admin/commandes/banque')).toBe(true);
    expect(canOpenAdminPath(tresorier, '/admin/members')).toBe(false);
    expect(canOpenAdminPath(tresorier, '/admin/acces')).toBe(false);
    expect(canOpenAdminPath(tresorier, '/admin/settings')).toBe(false);
    expect(canOpenAdminPath(tresorier, '/admin/unknown')).toBe(false);
  });

  it('shows nothing to a role without sections', () => {
    expect(canOpenAdminPath(none, '/admin')).toBe(false);
    expect(canOpenAdminPath(none, '/admin/members')).toBe(false);
  });

  it('shows admins everything but Paramètres, which is owner-only', () => {
    expect(canOpenAdminPath(admin, '/admin/acces')).toBe(true);
    expect(canOpenAdminPath(admin, '/admin/members')).toBe(true);
    expect(canOpenAdminPath(admin, '/admin/settings')).toBe(false);
    expect(canOpenAdminPath(owner, '/admin/settings')).toBe(true);
    expect(canOpenAdminPath(owner, '/admin/parametres')).toBe(true);
  });
});
