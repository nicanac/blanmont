import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  allowedAdminSections,
  canAccessSection,
  clearAdminAccessCache,
  delegatedMemberChangeError,
  delegatedPasswordResetError,
  getAdminAccessMatrix,
  hasMatrixRole,
  requireSectionAccess,
  saveAdminAccessMatrix,
  verifySectionRequest,
} from '@/app/lib/auth/admin-access';
import { ADMIN_SECTION_IDS } from '@/app/constants/admin-sections';
import { signSessionToken } from '@/app/lib/auth/session';
import { USERS, asSession, fakeDb, requestAs, type TestUser } from './rbac-fixtures';

const cookie = vi.hoisted(() => ({ token: undefined as string | undefined }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (cookie.token ? { value: cookie.token } : undefined), set: vi.fn(), delete: vi.fn() }),
}));

const NODE = 'settings/admin-access';
const loginAs = async (u?: TestUser) => {
  cookie.token = u ? await signSessionToken(u) : undefined;
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  clearAdminAccessCache();
  cookie.token = undefined;
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('allowedAdminSections / canAccessSection', () => {
  it('gives an admin every section without reading the matrix', async () => {
    const db = fakeDb({ [NODE]: new Error('down') });
    expect(await allowedAdminSections(asSession(USERS.admin))).toEqual(ADMIN_SECTION_IDS);
    expect(db.once).not.toHaveBeenCalled();
  });

  it('uses the suggested defaults while the node is absent', async () => {
    fakeDb({});
    expect(await allowedAdminSections(asSession(USERS.tresorier))).toEqual(['equipements', 'commandes']);
    expect(await canAccessSection(asSession(USERS.capitaine), 'sondages')).toBe(true);
    expect(await canAccessSection(asSession(USERS.capitaine), 'members')).toBe(false);
  });

  it('grants the union of the member roles', async () => {
    fakeDb({});
    const both = asSession({ ...USERS.member, role: ['Trésorier', 'Secrétaire'] });
    expect(await allowedAdminSections(both)).toEqual(['blog', 'galerie', 'members', 'prospects', 'equipements', 'commandes']);
  });

  it('grants nothing to unknown or look-alike roles (exact match only)', async () => {
    fakeDb({});
    for (const role of [['Traceur'], ['Trésorier adjoint'], [], ['Member']]) {
      expect(await allowedAdminSections(asSession({ ...USERS.member, role }))).toEqual([]);
    }
    expect(await allowedAdminSections(asSession({ ...USERS.member, role: ['tresorier'] }))).toEqual(['equipements', 'commandes']);
    expect(await allowedAdminSections(null)).toEqual([]);
  });

  it('fails closed when the matrix cannot be read', async () => {
    fakeDb({ [NODE]: new Error('RTDB unavailable') });
    expect(await allowedAdminSections(asSession(USERS.tresorier))).toEqual([]);
    expect(await canAccessSection(asSession(USERS.tresorier), 'commandes')).toBe(false);
    expect(await canAccessSection(asSession(USERS.admin), 'commandes')).toBe(true);
  });

  it('reads the stored matrix and ignores unknown roles, sections and non-true values', async () => {
    fakeDb({
      [NODE]: {
        roles: { Trésorier: { logs: true, commandes: 'yes', bogus: true }, Hacker: { members: true } },
        updatedAt: '2026-11-26T10:00:00.000Z',
        updatedBy: { id: 'admin-1', name: 'Admin' },
      },
    });
    expect(await allowedAdminSections(asSession(USERS.tresorier))).toEqual(['logs']);
    const matrix = await getAdminAccessMatrix();
    expect(Object.keys(matrix.roles)).not.toContain('Hacker');
    expect(matrix.updatedBy).toEqual({ id: 'admin-1', name: 'Admin' });
  });

  it('caches the matrix for 60 s', async () => {
    vi.useFakeTimers();
    const db = fakeDb({});
    await getAdminAccessMatrix();
    await getAdminAccessMatrix();
    expect(db.once).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(61_000);
    await getAdminAccessMatrix();
    expect(db.once).toHaveBeenCalledTimes(2);
  });
});

describe('hasMatrixRole', () => {
  it('matches key, label and synonyms exactly, case-insensitively', () => {
    expect(hasMatrixRole(['Capitaine de Route'], 'Capitaine de Route')).toBe(true);
    expect(hasMatrixRole(['captain'], 'Capitaine de Route')).toBe(true);
    expect(hasMatrixRole('SECRETAIRE', 'Secrétaire')).toBe(true);
    expect(hasMatrixRole(['Capitaine adjoint'], 'Capitaine de Route')).toBe(false);
    expect(hasMatrixRole(['Trésorier'], 'Unknown')).toBe(false);
  });
});

describe('saveAdminAccessMatrix', () => {
  it('stores { roles: { role: { section: true } }, updatedAt, updatedBy } and clears the cache', async () => {
    const db = fakeDb({});
    await getAdminAccessMatrix();
    const saved = await saveAdminAccessMatrix(
      { roles: { Trésorier: ['commandes', 'commandes', 'logs'], Member: [] } },
      asSession(USERS.admin)
    );
    expect(saved.roles.Trésorier).toEqual(['commandes', 'logs']);
    expect(saved.roles.Secrétaire).toEqual([]);
    expect(db.set).toHaveBeenCalledWith(NODE, {
      roles: { 'Capitaine de Route': {}, Trésorier: { commandes: true, logs: true }, Secrétaire: {}, Member: {} },
      updatedAt: expect.any(String),
      updatedBy: { id: 'admin-1', name: 'admin-1' },
    });
    await getAdminAccessMatrix();
    expect(db.once).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['an unknown role', { roles: { Hacker: ['members'] } }],
    ['the Admin role', { roles: { Admin: ['members'] } }],
    ['an unknown section', { roles: { Trésorier: ['settings'] } }],
    ['a malformed body', { roles: { Trésorier: 'commandes' } }],
    ['no roles', {}],
  ])('rejects %s', async (_label, input) => {
    const db = fakeDb({});
    await expect(saveAdminAccessMatrix(input, asSession(USERS.admin))).rejects.toThrow(/invalide/);
    expect(db.set).not.toHaveBeenCalled();
  });

  it('refuses a non-admin session even if called directly', async () => {
    const db = fakeDb({});
    await expect(saveAdminAccessMatrix({ roles: {} }, asSession(USERS.secretaire))).rejects.toThrow(/Accès refusé/);
    expect(db.set).not.toHaveBeenCalled();
  });
});

describe('requireSectionAccess', () => {
  it('refuses anonymous users, then users without the section', async () => {
    fakeDb({});
    await expect(requireSectionAccess('commandes')).rejects.toThrow('Non authentifié. Veuillez vous connecter.');
    await loginAs(USERS.capitaine);
    await expect(requireSectionAccess('commandes')).rejects.toThrow('Accès refusé. Droits administrateur requis.');
  });

  it('returns the session of an allowed officer or an admin', async () => {
    fakeDb({});
    await loginAs(USERS.tresorier);
    expect((await requireSectionAccess('commandes')).id).toBe('tres-1');
    await loginAs(USERS.admin);
    expect((await requireSectionAccess('logs')).id).toBe('admin-1');
  });
});

describe('verifySectionRequest', () => {
  it('answers 401, 403 or authorizes like verifyAdminRequest', async () => {
    fakeDb({});
    const anonymous = await verifySectionRequest(await requestAs('/api/admin/equipements'), 'equipements');
    expect(anonymous.authorized ? 200 : anonymous.response.status).toBe(401);
    const denied = await verifySectionRequest(await requestAs('/api/admin/members', USERS.tresorier), 'members');
    expect(denied.authorized ? 200 : denied.response.status).toBe(403);
    const allowed = await verifySectionRequest(await requestAs('/api/admin/equipements', USERS.tresorier), 'equipements');
    expect(allowed.authorized && allowed.user.id).toBe('tres-1');
  });
});

describe('delegated member changes (role assignment stays admin-only)', () => {
  const sec = asSession(USERS.secretaire);
  const plain = { role: ['Member'], email: 'rider@example.test' };

  it('lets an admin change anything', () => {
    expect(delegatedMemberChangeError(asSession(USERS.admin), plain, { role: ['Admin'] })).toBeNull();
  });

  it('lets a delegate edit other fields and resend the same roles', () => {
    expect(delegatedMemberChangeError(sec, plain, { bio: 'x', role: ['Member'] } as never)).toBeNull();
    expect(delegatedMemberChangeError(sec, { email: 'a@example.test' }, { role: ['Member'] })).toBeNull();
  });

  it('refuses role changes, login-link changes, admin accounts and admin emails', () => {
    expect(delegatedMemberChangeError(sec, plain, { role: ['Member', 'Trésorier'] })).toMatch(/rôles/);
    expect(delegatedMemberChangeError(sec, plain, { authUid: 'uid-x' })).toMatch(/compte de connexion/);
    expect(delegatedMemberChangeError(sec, { role: ['Président'] }, { bio: 'x' } as never)).toMatch(/compte administrateur/);
    vi.stubEnv('ADMIN_EMAILS', 'boss@example.test');
    expect(delegatedMemberChangeError(sec, plain, { email: 'boss@example.test' })).toMatch(/droits administrateur/);
  });

  it("refuses a delegate's change of an officer's email, allows the same email or a plain member's", () => {
    const tres = { role: ['Trésorier'], email: 'tres@example.test' };
    expect(delegatedMemberChangeError(sec, tres, { email: 'other@example.test' })).toMatch(/email d’un responsable/);
    expect(delegatedMemberChangeError(sec, tres, { email: ' TRES@example.test ' })).toBeNull();
    expect(delegatedMemberChangeError(sec, plain, { email: 'new@example.test' })).toBeNull();
    expect(delegatedMemberChangeError(asSession(USERS.admin), tres, { email: 'other@example.test' })).toBeNull();
  });

  it('only lets an admin reset the password of an officer or an admin', () => {
    expect(delegatedPasswordResetError(sec, plain)).toBeNull();
    expect(delegatedPasswordResetError(sec, { role: ['Trésorier'] })).toMatch(/administrateur/);
    expect(delegatedPasswordResetError(sec, { role: ['Admin'] })).toMatch(/administrateur/);
    expect(delegatedPasswordResetError(asSession(USERS.admin), { role: ['Trésorier'] })).toBeNull();
  });
});
