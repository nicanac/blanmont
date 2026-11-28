import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ensureMemberAccount,
  findMemberByEmail,
  isGrandfatheredAccount,
  MemberAccountError,
} from '@/app/lib/auth/member-account';
import { fakeAdminAuth, fakeMembersDb } from './fake-firebase';

describe('member login accounts', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('finds a member by a trimmed, case-insensitive email', async () => {
    fakeMembersDb({ a: { name: 'A', email: ' Anne@Blanmont.be' }, b: { name: 'B', email: 'b@blanmont.be' } });
    expect(await findMemberByEmail('anne@blanmont.BE ')).toMatchObject({ key: 'a' });
    expect(await findMemberByEmail('nobody@blanmont.be')).toBeNull();
  });

  it('grandfathers only accounts created before the cutoff', () => {
    expect(isGrandfatheredAccount('Wed, 25 Nov 2026 10:00:00 GMT')).toBe(true);
    expect(isGrandfatheredAccount('Tue, 01 Dec 2026 10:00:00 GMT')).toBe(false);
    expect(isGrandfatheredAccount(undefined)).toBe(false);
  });

  it('refuses a member without email', async () => {
    fakeAdminAuth();
    fakeMembersDb({ a: { name: 'A' } });
    await expect(ensureMemberAccount('a', { name: 'A' }, 'admin')).rejects.toBeInstanceOf(MemberAccountError);
  });

  it('activation links a grandfathered unverified account (made by hand before the fix)', async () => {
    fakeAdminAuth([
      {
        uid: 'uid-hand',
        email: 'anne@blanmont.be',
        emailVerified: false,
        metadata: { creationTime: 'Wed, 25 Nov 2026 10:00:00 GMT' },
      },
    ]);
    const db = fakeMembersDb({ a: { name: 'A', email: 'anne@blanmont.be' } });

    const result = await ensureMemberAccount('a', db.members.a, 'activation');

    expect(result).toMatchObject({ created: false, linked: true });
    expect(db.members.a.authUid).toBe('uid-hand');
  });

  it('survives a concurrent creation of the same account', async () => {
    const { api } = fakeAdminAuth();
    const db = fakeMembersDb({ a: { name: 'A', email: 'anne@blanmont.be' } });
    api.createUser.mockImplementationOnce(async () => {
      // Another request created it between our lookup and our create.
      await api.createUser.getMockImplementation()!({ email: 'anne@blanmont.be', emailVerified: true });
      throw Object.assign(new Error('exists'), { code: 'auth/email-already-exists' });
    });

    const result = await ensureMemberAccount('a', db.members.a, 'activation');

    expect(result.user.email).toBe('anne@blanmont.be');
    expect(db.members.a.authUid).toBe(result.user.uid);
  });

  it('activation leaves the account of a shared email to the member already linked to it', async () => {
    fakeAdminAuth([{ uid: 'uid-1', email: 'famille@blanmont.be', emailVerified: true }]);
    const db = fakeMembersDb({
      a: { name: 'A', email: 'famille@blanmont.be', authUid: 'uid-1' },
      b: { name: 'B', email: 'famille@blanmont.be' },
    });

    const result = await ensureMemberAccount('b', db.members.b, 'activation');

    expect(result).toMatchObject({ linked: false });
    expect(db.members.b.authUid).toBeUndefined();
    expect(db.members.a.authUid).toBe('uid-1');
  });
});
