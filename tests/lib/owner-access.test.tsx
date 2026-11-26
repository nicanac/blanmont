import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactElement } from 'react';
import { GET as getFeedbackSettings } from '@/app/api/admin/feedback-settings/route';
import SettingsLayout from '@/app/admin/settings/layout';
import {
  isSessionOwner,
  requireOwnerSession,
  setSessionCookie,
  signSessionToken,
  verifySessionToken,
} from '@/app/lib/auth/session';
import * as visualFeedback from '@/app/lib/firebase/visual-feedback';
import { USERS, asSession, requestAs, type TestUser } from './rbac-fixtures';

const cookie = vi.hoisted(() => ({ token: undefined as string | undefined, set: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => (cookie.token ? { value: cookie.token } : undefined),
    set: cookie.set,
    delete: vi.fn(),
  }),
}));

const OWNER = 'owner@example.test';
const loginAs = async (u?: TestUser) => {
  cookie.token = u ? await signSessionToken(u) : undefined;
};
// An admin who edited a member record email to the owner address: the verified login email stays theirs.
const editedEmail: TestUser = { ...USERS.admin, email: OWNER, verifiedEmail: 'admin@example.test' };

describe('site owner (Paramètres)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('OWNER_EMAILS', ` Other@example.test , ${OWNER.toUpperCase()} `);
    cookie.token = undefined;
    cookie.set.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('is an admin whose verified login email is in OWNER_EMAILS (case-insensitive)', () => {
    expect(isSessionOwner(asSession(USERS.owner))).toBe(true);
    expect(isSessionOwner(asSession(USERS.admin))).toBe(false);
    expect(isSessionOwner(asSession(editedEmail))).toBe(false);
    expect(isSessionOwner(asSession({ ...USERS.member, verifiedEmail: OWNER }))).toBe(false);
    expect(isSessionOwner(null)).toBe(false);
  });

  it('is nobody when OWNER_EMAILS is unset', () => {
    vi.stubEnv('OWNER_EMAILS', '');
    expect(isSessionOwner(asSession(USERS.owner))).toBe(false);
  });

  it('settings API: owner allowed; other admins, edited email and unset OWNER_EMAILS denied', async () => {
    vi.spyOn(visualFeedback, 'getVisualFeedbackSettings').mockResolvedValue({ enabled: false } as never);
    expect((await getFeedbackSettings(await requestAs('/api/admin/feedback-settings', USERS.owner))).status).toBe(200);
    expect((await getFeedbackSettings(await requestAs('/api/admin/feedback-settings', USERS.admin))).status).toBe(403);
    expect((await getFeedbackSettings(await requestAs('/api/admin/feedback-settings', editedEmail))).status).toBe(403);
    expect((await getFeedbackSettings(await requestAs('/api/admin/feedback-settings'))).status).toBe(401);
    vi.stubEnv('OWNER_EMAILS', '');
    expect((await getFeedbackSettings(await requestAs('/api/admin/feedback-settings', USERS.owner))).status).toBe(403);
  });

  it('requireOwnerSession: owner allowed, other admins denied', async () => {
    await loginAs(USERS.owner);
    expect((await requireOwnerSession()).id).toBe('owner-1');
    await loginAs(USERS.admin);
    await expect(requireOwnerSession()).rejects.toThrow(/propriétaire/);
    await loginAs(editedEmail);
    await expect(requireOwnerSession()).rejects.toThrow(/propriétaire/);
  });

  it('settings page: the owner sees it, other admins see « Réservé au propriétaire du site »', async () => {
    const page = <p>Paramètres du site</p>;
    await loginAs(USERS.owner);
    const shown = (await SettingsLayout({ children: page })) as ReactElement<{ children?: unknown }>;
    expect(shown.props.children).toBe(page);

    for (const u of [USERS.admin, editedEmail]) {
      await loginAs(u);
      const notice = (await SettingsLayout({ children: page })) as ReactElement<{ title?: string; children?: unknown }>;
      expect(notice.props.title).toBe('Réservé au propriétaire du site');
      expect(notice.props.children).toBeUndefined();
    }
  });

  it('setSessionCookie stores the verified login email and makes the owner an admin', async () => {
    const member = { id: 'm1', name: 'Owner', email: 'record@example.test', role: ['Member'] } as never;
    const owner = await setSessionCookie(member, OWNER);
    expect(owner.isAdmin).toBe(true);
    const token = cookie.set.mock.calls[0][1] as string;
    expect((await verifySessionToken(token))?.verifiedEmail).toBe(OWNER);

    const plain = await setSessionCookie({ ...(member as object), email: OWNER } as never);
    expect(plain.isAdmin).toBe(false);
    expect(plain.verifiedEmail).toBeNull();
  });
});
