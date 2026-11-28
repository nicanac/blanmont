/**
 * In-memory Firebase Admin Auth + `members` RTDB node for the login / activation tests.
 * Both are installed with vi.spyOn on app/lib/firebase/admin (restore with vi.restoreAllMocks).
 */
import { vi } from 'vitest';
import * as adminModule from '@/app/lib/firebase/admin';

export interface FakeUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  disabled?: boolean;
  password?: string;
  metadata: { creationTime: string };
}

const notFound = () => Object.assign(new Error('There is no user record (auth/user-not-found).'), { code: 'auth/user-not-found' });

/** Firebase Auth fake: one account per email (lower-cased), like Firebase. */
export function fakeAdminAuth(initial: Array<Partial<FakeUser> & { uid: string; email: string }> = []) {
  const users = new Map<string, FakeUser>();
  for (const u of initial) {
    users.set(u.uid, {
      emailVerified: false,
      metadata: { creationTime: new Date('2026-12-01T10:00:00Z').toUTCString() },
      ...u,
      email: u.email.toLowerCase(),
    });
  }
  let seq = 0;
  const byEmail = (email: string) => [...users.values()].find((u) => u.email === email.toLowerCase());

  const api = {
    getUser: vi.fn(async (uid: string) => {
      const u = users.get(uid);
      if (!u) throw notFound();
      return { ...u };
    }),
    getUserByEmail: vi.fn(async (email: string) => {
      const u = byEmail(email);
      if (!u) throw notFound();
      return { ...u };
    }),
    createUser: vi.fn(async (props: Partial<FakeUser> & { email: string }) => {
      if (byEmail(props.email)) throw Object.assign(new Error('email exists'), { code: 'auth/email-already-exists' });
      const uid = `uid-new-${++seq}`;
      const user: FakeUser = {
        uid,
        emailVerified: false,
        metadata: { creationTime: new Date().toUTCString() },
        ...props,
        email: props.email.toLowerCase(),
      };
      users.set(uid, user);
      return { ...user };
    }),
    updateUser: vi.fn(async (uid: string, props: Partial<FakeUser>) => {
      const u = users.get(uid);
      if (!u) throw notFound();
      if (props.email) {
        const holder = byEmail(props.email);
        if (holder && holder.uid !== uid) throw Object.assign(new Error('email exists'), { code: 'auth/email-already-exists' });
      }
      Object.assign(u, props, props.email ? { email: props.email.toLowerCase() } : {});
      return { ...u };
    }),
  };
  vi.spyOn(adminModule, 'getAdminAuth').mockReturnValue(api as never);
  return { api, users };
}

/** RTDB fake holding `members/<key>` records; other paths (activity logs) are accepted and ignored. */
export function fakeMembersDb(initial: Record<string, Record<string, unknown>>) {
  const members: Record<string, Record<string, unknown>> = structuredClone(initial);
  const update = vi.fn();
  const snapshotOf = (value: unknown, key: string | null = null) => ({
    key,
    exists: () => value != null,
    val: () => value ?? null,
    forEach: (cb: (child: { key: string; val: () => unknown }) => unknown) => {
      Object.entries((value as Record<string, unknown>) ?? {}).forEach(([k, v]) => cb({ key: k, val: () => v }));
      return false;
    },
  });
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({
    ref: (path: string) => ({
      once: async () => {
        if (path === 'members') return snapshotOf(members);
        const key = path.startsWith('members/') ? path.slice('members/'.length) : null;
        return snapshotOf(key ? members[key] : null, key);
      },
      update: async (value: Record<string, unknown>) => {
        update(path, value);
        const key = path.startsWith('members/') ? path.slice('members/'.length) : null;
        if (key && members[key]) Object.assign(members[key], value);
      },
      set: async () => undefined,
      push: () => ({ key: 'log', set: async () => undefined }),
    }),
  } as never);
  return { members, update };
}
