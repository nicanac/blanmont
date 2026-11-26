import { vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as adminModule from '@/app/lib/firebase/admin';
import { SESSION_COOKIE_NAME, signSessionToken, type SessionUser } from '@/app/lib/auth/session';

/** Shared RBAC test fixtures (sessions, signed cookies, fake RTDB). Addresses use the reserved example.test domain. */
export type TestUser = Omit<SessionUser, 'iat' | 'exp'>;

const user = (id: string, role: string[], extra: Partial<TestUser> = {}): TestUser => ({
  id,
  name: id,
  email: null,
  role,
  isAdmin: false,
  ...extra,
});

export const USERS = {
  admin: user('admin-1', ['Admin'], { isAdmin: true }),
  owner: user('owner-1', ['Admin'], { isAdmin: true, verifiedEmail: 'owner@example.test' }),
  tresorier: user('tres-1', ['Trésorier']),
  capitaine: user('cap-1', ['Capitaine de Route']),
  secretaire: user('sec-1', ['Secrétaire']),
  member: user('mem-1', ['Member']),
};

export const asSession = (u: TestUser): SessionUser => ({ ...u, iat: 0, exp: 4_000_000_000 });

export async function cookieFor(u: TestUser): Promise<string> {
  return `${SESSION_COOKIE_NAME}=${await signSessionToken(u)}`;
}

export async function requestAs(url: string, u?: TestUser, init: { method?: string; body?: unknown } = {}): Promise<NextRequest> {
  return new NextRequest(`http://localhost:3000${url}`, {
    method: init.method ?? 'GET',
    headers: u ? { cookie: await cookieFor(u) } : {},
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });
}

/** Fake Admin SDK database: `nodes[path]` is the stored value (undefined = absent, Error = read failure). */
export function fakeDb(nodes: Record<string, unknown>) {
  const writes = { set: vi.fn(), update: vi.fn(), remove: vi.fn() };
  const once = vi.fn(async (path: string) => {
    const value = nodes[path];
    if (value instanceof Error) throw value;
    return { exists: () => value != null, val: () => value ?? null };
  });
  vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({
    ref: (path: string) => ({
      once: () => once(path),
      set: async (v: unknown) => writes.set(path, v),
      update: async (v: unknown) => writes.update(path, v),
      remove: async () => writes.remove(path),
    }),
  } as never);
  return { ...writes, once };
}
