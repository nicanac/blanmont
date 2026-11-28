import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMembers,
  getMember,
  validateUser,
  authenticateMember,
  updateMemberPhoto,
  createMember,
  updateMember,
} from '@/app/lib/firebase/members';
import * as adminModule from '@/app/lib/firebase/admin';
import * as clientModule from '@/app/lib/firebase/client';

vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
    useNotionFallback: false,
    getFirebaseDatabase: vi.fn(),
    getFirebaseAuth: vi.fn(),
    ref: vi.fn((db, path) => ({ db, path })),
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
    snapshotToObject: vi.fn((snap, id) => {
      if (!snap || !snap.exists()) return null;
      return { id, ...snap.val() };
    }),
  };
});

describe('Firebase Members Service (app/lib/firebase/members.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMembers', () => {
    it('fetches members on server side using Admin SDK and sorts them alphabetically by name', async () => {
      const mockItems = [
        { key: 'm-2', val: () => ({ name: 'Zoé Martin', role: ['Member'] }) },
        { key: 'm-1', val: () => ({ name: 'Alain Bernard', role: ['Captain'] }) },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const members = await getMembers();
      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('Alain Bernard');
      expect(members[1].name).toBe('Zoé Martin');
    });

    it('catches errors and returns empty array', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Database unreachable');
      });

      const members = await getMembers();
      expect(members).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getMember', () => {
    it('fetches single member by ID', async () => {
      const snapshot = {
        exists: () => true,
        val: () => ({ name: 'Alice', email: 'alice@blanmont.be' }),
      };

      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);

      const member = await getMember('m-123');
      expect(member).not.toBeNull();
      expect(member?.id).toBe('m-123');
      expect(member?.name).toBe('Alice');
    });

    it('returns null if not found or on error', async () => {
      const snapshot = { exists: () => false };
      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);

      const member = await getMember('unknown');
      expect(member).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('authenticates user and returns matching member, syncing authUid if absent', async () => {
      vi.spyOn(clientModule, 'signInWithEmailAndPassword').mockResolvedValue({
        user: { uid: 'firebase-uid-777', email: 'julien@blanmont.be', emailVerified: true },
      } as any);

      const mockMembers = [
        {
          key: 'member-j',
          val: () => ({
            name: 'Julien Cycliste',
            email: 'julien@blanmont.be',
            role: ['Member'],
            // authUid is missing initially
          }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockMembers.forEach(cb),
      };

      const updateMock = vi.fn().mockResolvedValue(undefined);
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn((_path: string) => ({
        once: onceMock,
        update: updateMock,
      }));
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const member = await validateUser('julien@blanmont.be', 'secret123');
      expect(member).not.toBeNull();
      expect(member?.name).toBe('Julien Cycliste');
      expect(member?.id).toBe('member-j');
      expect(refMock).toHaveBeenCalledWith('members/member-j');
      expect(updateMock).toHaveBeenCalledWith({ authUid: 'firebase-uid-777' });
    });

    it('takes the verified email from the Firebase ID token, never from the member record', async () => {
      const verifyIdToken = vi
        .fn()
        .mockResolvedValueOnce({ email: 'login@example.test', email_verified: true })
        .mockResolvedValueOnce({ email: 'login@example.test', email_verified: false })
        .mockRejectedValueOnce(new Error('bad token'));
      vi.spyOn(adminModule, 'getAdminAuth').mockReturnValue({ verifyIdToken } as any);
      vi.spyOn(clientModule, 'signInWithEmailAndPassword').mockResolvedValue({
        user: { uid: 'uid-1', email: 'login@example.test', getIdToken: async () => 'id-token' },
      } as any);
      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) =>
          cb({ key: 'm1', val: () => ({ name: 'M', email: 'record@example.test', authUid: 'uid-1' }) }),
      };
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({
        ref: () => ({ once: vi.fn().mockResolvedValue(snapshot), update: vi.fn() }),
      } as any);
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect((await validateUser('login@example.test', 'pw'))?.verifiedEmail).toBe('login@example.test');
      expect(verifyIdToken).toHaveBeenCalledWith('id-token');
      expect((await validateUser('login@example.test', 'pw'))?.verifiedEmail).toBeUndefined();
      expect((await validateUser('login@example.test', 'pw'))?.verifiedEmail).toBeUndefined();
    });

    it('returns null when member is not found in database', async () => {
      vi.spyOn(clientModule, 'signInWithEmailAndPassword').mockResolvedValue({
        user: { uid: 'unregistered-uid', email: 'intruder@test.com' },
      } as any);

      const snapshot = {
        exists: () => false,
        forEach: () => {},
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const member = await validateUser('intruder@test.com', 'secret');
      expect(member).toBeNull();
    });

    it('returns null when password authentication fails', async () => {
      vi.spyOn(clientModule, 'signInWithEmailAndPassword').mockRejectedValue(new Error('Firebase: Error (auth/wrong-password).'));

      const member = await validateUser('member@test.com', 'wrongpassword');
      expect(member).toBeNull();
    });
  });

  describe('authenticateMember', () => {
    const membersDb = (records: Record<string, Record<string, unknown>>) => {
      const update = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn((_path: string) => ({
        once: vi.fn().mockResolvedValue({
          exists: () => true,
          forEach: (cb: (item: any) => void) =>
            Object.entries(records).forEach(([key, val]) => cb({ key, val: () => val })),
        }),
        update,
      }));
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);
      return { refMock, update };
    };
    const signedIn = (user: Record<string, unknown>) =>
      vi.spyOn(clientModule, 'signInWithEmailAndPassword').mockResolvedValue({ user } as any);

    it('says why Firebase refused the password', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const signIn = vi.spyOn(clientModule, 'signInWithEmailAndPassword');
      const cases: Array<[unknown, string]> = [
        [Object.assign(new Error('x'), { code: 'auth/invalid-credential' }), 'invalid_credentials'],
        [Object.assign(new Error('x'), { code: 'auth/too-many-requests' }), 'too_many_attempts'],
        [Object.assign(new Error('x'), { code: 'auth/user-disabled' }), 'account_disabled'],
        [Object.assign(new Error('x'), { code: 'auth/network-request-failed' }), 'unavailable'],
      ];
      for (const [error, reason] of cases) {
        signIn.mockRejectedValueOnce(error);
        expect(await authenticateMember('m@test.com', 'pw')).toMatchObject({ ok: false, reason });
      }
    });

    it('signs in with the trimmed, lower-cased email', async () => {
      const signIn = signedIn({ uid: 'u1', email: 'julien@blanmont.be', emailVerified: true });
      membersDb({ m1: { name: 'J', email: ' Julien@Blanmont.be ', authUid: 'u1' } });

      const result = await authenticateMember('  JULIEN@blanmont.be ', 'pw');

      expect(signIn).toHaveBeenCalledWith(undefined, 'julien@blanmont.be', 'pw');
      expect(result).toMatchObject({ ok: true, member: { id: 'm1' } });
    });

    it('prefers the record linked to the account over an email match', async () => {
      signedIn({ uid: 'u-linked', email: 'shared@blanmont.be', emailVerified: true });
      membersDb({
        first: { name: 'Linked', email: 'shared@blanmont.be', authUid: 'u-linked' },
        second: { name: 'Same email', email: 'shared@blanmont.be' },
      });

      expect(await authenticateMember('shared@blanmont.be', 'pw')).toMatchObject({ ok: true, member: { id: 'first' } });
    });

    it('refuses an unverified account that is not linked to the record (self-made through the public API)', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      signedIn({
        uid: 'u-intruder',
        email: 'julien@blanmont.be',
        emailVerified: false,
        metadata: { creationTime: 'Tue, 01 Dec 2026 10:00:00 GMT' },
      });
      const { update } = membersDb({ m1: { name: 'J', email: 'julien@blanmont.be' } });

      expect(await authenticateMember('julien@blanmont.be', 'pw')).toEqual({ ok: false, reason: 'not_linked' });
      expect(update).not.toHaveBeenCalled();
    });

    it('still accepts an unverified account created before the fix (made by hand for a member)', async () => {
      signedIn({
        uid: 'u-legacy',
        email: 'julien@blanmont.be',
        emailVerified: false,
        metadata: { creationTime: 'Wed, 25 Nov 2026 10:00:00 GMT' },
      });
      const { update } = membersDb({ m1: { name: 'J', email: 'julien@blanmont.be' } });

      expect(await authenticateMember('julien@blanmont.be', 'pw')).toMatchObject({ ok: true, member: { id: 'm1' } });
      expect(update).toHaveBeenCalledWith({ authUid: 'u-legacy' });
    });

    it('relinks the record when a verified account owns its email (the email moved to a new account)', async () => {
      signedIn({ uid: 'u-new', email: 'julien@blanmont.be', emailVerified: true });
      const { refMock, update } = membersDb({ m1: { name: 'J', email: 'julien@blanmont.be', authUid: 'u-old' } });

      expect(await authenticateMember('julien@blanmont.be', 'pw')).toMatchObject({ ok: true, member: { id: 'm1' } });
      expect(refMock).toHaveBeenCalledWith('members/m1');
      expect(update).toHaveBeenCalledWith({ authUid: 'u-new' });
    });
  });

  describe('updateMemberPhoto', () => {
    it('updates photoUrl on member record', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await updateMemberPhoto('m-1', 'https://res.cloudinary.com/new-avatar.jpg');
      expect(refMock).toHaveBeenCalledWith('members/m-1');
      const payload = updateMock.mock.calls[0][0];
      expect(payload).toEqual({ photoUrl: 'https://res.cloudinary.com/new-avatar.jpg' });
    });
  });

  describe('createMember & updateMember', () => {
    it('creates new member with createdAt timestamp', async () => {
      const setMock = vi.spyOn(clientModule, 'set').mockResolvedValue(undefined as any);
      const emptySnapshot = { exists: () => true };
      vi.spyOn(clientModule, 'get').mockResolvedValue(emptySnapshot as any);

      const result = await createMember({
        name: 'New Rider',
        email: 'new@blanmont.be',
        role: ['Member'],
        bio: 'New rider bio',
        photoUrl: '',
      });

      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^member_/);
      expect(setMock).toHaveBeenCalled();
      const payload = setMock.mock.calls[0][1];
      expect(payload.name).toBe('New Rider');
      expect(payload.createdAt).toBeDefined();
    });

    it('updates member with updatedAt timestamp', async () => {
      const updateMock = vi.spyOn(clientModule, 'update').mockResolvedValue(undefined as any);

      const result = await updateMember('member-456', { bio: 'Updated bio' });
      expect(result.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
      const payload = updateMock.mock.calls[0][1];
      expect(payload.bio).toBe('Updated bio');
      expect(payload.updatedAt).toBeDefined();
    });
  });
});
