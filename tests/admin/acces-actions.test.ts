import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminAccessAction,
  getMyAdminAccessAction,
  resetAdminAccessAction,
  saveAdminAccessAction,
} from '@/app/admin/acces/actions';
import { clearAdminAccessCache } from '@/app/lib/auth/admin-access';
import { ADMIN_SECTION_IDS } from '@/app/constants/admin-sections';
import { signSessionToken } from '@/app/lib/auth/session';
import { USERS, fakeDb, type TestUser } from '../lib/rbac-fixtures';

const cookie = vi.hoisted(() => ({ token: undefined as string | undefined }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (cookie.token ? { value: cookie.token } : undefined), set: vi.fn(), delete: vi.fn() }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const loginAs = async (u?: TestUser) => {
  cookie.token = u ? await signSessionToken(u) : undefined;
};
const NODE = 'settings/admin-access';

describe('/admin/acces actions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    clearAdminAccessCache();
    cookie.token = undefined;
  });

  it('are admin-only, even for a role that holds every section', async () => {
    const db = fakeDb({ [NODE]: { roles: { Secrétaire: Object.fromEntries(ADMIN_SECTION_IDS.map((id) => [id, true])) } } });
    for (const u of [undefined, USERS.member, USERS.secretaire]) {
      await loginAs(u);
      expect((await getAdminAccessAction()).success).toBe(false);
      expect((await saveAdminAccessAction({ roles: { Secrétaire: ['members'] } })).success).toBe(false);
      expect((await resetAdminAccessAction()).success).toBe(false);
    }
    expect(db.set).not.toHaveBeenCalled();
  });

  it('give the admin the matrix and the registries', async () => {
    fakeDb({});
    await loginAs(USERS.admin);
    const res = await getAdminAccessAction();
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.matrix.roles.Trésorier).toEqual(['equipements', 'commandes']);
    expect(res.sections.map((s) => s.id)).toEqual(ADMIN_SECTION_IDS);
    expect(res.roles.map((r) => r.key)).toEqual(['Capitaine de Route', 'Trésorier', 'Secrétaire', 'Member']);
  });

  it('save validates and stores; reset stores the suggested defaults', async () => {
    const db = fakeDb({});
    await loginAs(USERS.admin);
    expect(await saveAdminAccessAction({ roles: { Trésorier: ['settings'] } })).toEqual({
      success: false,
      error: expect.stringMatching(/invalide/),
    });
    const saved = await saveAdminAccessAction({ roles: { Trésorier: ['logs'] } });
    expect(saved.success && saved.matrix.roles.Trésorier).toEqual(['logs']);
    const reset = await resetAdminAccessAction();
    // Suggested defaults, in registry order.
    expect(reset.success && reset.matrix.roles).toEqual({
      'Capitaine de Route': ['sondages', 'events', 'pointage-express', 'carre-vert'],
      Trésorier: ['equipements', 'commandes'],
      Secrétaire: ['blog', 'galerie', 'members', 'prospects'],
      Member: [],
    });
    expect(reset.success && reset.matrix.updatedBy).toEqual({ id: 'admin-1', name: 'admin-1' });
    expect(db.set).toHaveBeenCalledTimes(2);
  });

  it('getMyAdminAccessAction reports the current session access', async () => {
    fakeDb({});
    await loginAs();
    expect(await getMyAdminAccessAction()).toEqual({ isAdmin: false, isOwner: false, sections: [] });
    await loginAs(USERS.capitaine);
    expect(await getMyAdminAccessAction()).toEqual({
      isAdmin: false,
      isOwner: false,
      sections: ['sondages', 'events', 'pointage-express', 'carre-vert'],
    });
    await loginAs(USERS.admin);
    expect((await getMyAdminAccessAction()).sections).toEqual(ADMIN_SECTION_IDS);
  });
});
