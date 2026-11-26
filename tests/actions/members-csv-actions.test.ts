import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importMembersCsvAction, previewMembersCsvAction } from '@/app/admin/members/actions';
import * as adminAccessModule from '@/app/lib/auth/admin-access';
import * as adminModule from '@/app/lib/firebase/admin';
import { USERS, asSession } from '../lib/rbac-fixtures';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const MEMBERS = {
  m1: { name: 'Alice', email: 'alice@example.test', role: ['Member'] },
  m2: { name: 'Boss', email: 'boss@example.test', role: ['Admin'] },
  m3: { name: 'Tres', email: 'tres@example.test', role: ['Trésorier'] },
};

let update: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  update = vi.fn().mockResolvedValue(undefined);
  const ref = {
    once: vi.fn().mockResolvedValue({ val: () => MEMBERS }),
    update,
    push: vi.fn(() => ({ key: 'new-1' })),
  };
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: vi.fn(() => ref) } as never);
});

const as = (user: keyof typeof USERS) =>
  vi.spyOn(adminAccessModule, 'requireSectionAccess').mockResolvedValue(asSession(USERS[user]));

describe('members CSV actions', () => {
  it('is guarded by the members section and writes nothing when denied', async () => {
    vi.spyOn(adminAccessModule, 'requireSectionAccess').mockRejectedValue(new Error('Accès refusé. Droits administrateur requis.'));
    const res = await importMembersCsvAction('Nom\nX');
    expect(res).toEqual({ success: false, error: 'Accès refusé. Droits administrateur requis.' });
    expect(adminAccessModule.requireSectionAccess).toHaveBeenCalledWith('members');
    expect(update).not.toHaveBeenCalled();
  });

  it('previews without writing', async () => {
    as('admin');
    const res = await previewMembersCsvAction('ID;Téléphone\nm1;0470');
    expect(res.success && res.plan.updates).toEqual([{ line: 2, id: 'm1', name: 'Alice', changes: { phone: '0470' } }]);
    expect(update).not.toHaveBeenCalled();
  });

  it('writes updates and creates in one update, a new member always plain Member', async () => {
    as('admin');
    const res = await importMembersCsvAction('ID;Nom;Email;Rôles\nm1;Alice V;;Admin\n;Neo;neo@example.test;Admin');
    expect(res).toEqual({ success: true, created: 1, updated: 1, rejected: 0 });
    const paths = update.mock.calls[0][0];
    expect(paths['m1/name']).toBe('Alice V');
    expect(paths['m1/email']).toBeNull();
    expect(paths['m1/role']).toBeUndefined();
    expect(paths['new-1']).toMatchObject({ name: 'Neo', email: 'neo@example.test', role: ['Member'] });
  });

  it('applies the delegated rules to a non-admin: no admin account, no officer email', async () => {
    as('secretaire');
    const res = await previewMembersCsvAction('ID;Nom;Email\nm2;Big Boss;boss@example.test\nm3;Tres;new@example.test\nm1;Alice B;alice@example.test');
    expect(res.success && res.plan.updates.map((u) => u.id)).toEqual(['m1']);
    expect(res.success && res.plan.rejected.map((r) => r.line)).toEqual([2, 3]);
  });
});
