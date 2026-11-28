/**
 * Link between a club member record (RTDB `members/<key>`) and its Firebase Auth login account.
 *
 * The directory email (set by the club admins) is the login email. Server only (Admin SDK).
 */
import type { UserRecord } from 'firebase-admin/auth';
import { getAdminAuth, getAdminDatabase } from '../firebase/admin';
import { isOwnerEmail } from './session-token';

export interface MemberAuthRecord {
  name?: string;
  email?: string;
  authUid?: string;
  role?: string[];
}

/** Lower-cased, trimmed email ('' when not a string). */
export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Accounts created before this instant may still be matched to a member by an unverified email.
 * Newer accounts need a verified email or an explicit link (authUid): the Firebase project lets
 * anyone create an account through the public API, which must never grant a member's session.
 */
export const LEGACY_UNVERIFIED_ACCOUNT_CUTOFF_MS = Date.parse('2026-11-28T12:00:00Z');

/** True for an account created before {@link LEGACY_UNVERIFIED_ACCOUNT_CUTOFF_MS}. */
export function isGrandfatheredAccount(creationTime: string | null | undefined): boolean {
  const createdAt = creationTime ? Date.parse(creationTime) : NaN;
  return Number.isFinite(createdAt) && createdAt < LEGACY_UNVERIFIED_ACCOUNT_CUTOFF_MS;
}

/** Why a login account cannot be prepared for a member. */
export type AccountProblem = 'no_email' | 'linked_elsewhere' | 'shared_email' | 'owner_account';

export class MemberAccountError extends Error {
  constructor(
    public readonly problem: AccountProblem,
    /** Name of the other member holding that account or that email (linked_elsewhere, shared_email). */
    public readonly otherMemberName?: string
  ) {
    super(problem);
    this.name = 'MemberAccountError';
  }
}

function hasCode(error: unknown, code: string): boolean {
  const e = error as { code?: string; message?: string } | null;
  return e?.code === code || Boolean(e?.message?.includes(code.replace('auth/', '')));
}

async function userOrNull(load: () => Promise<UserRecord>): Promise<UserRecord | null> {
  try {
    return await load();
  } catch (error) {
    if (hasCode(error, 'auth/user-not-found')) return null;
    throw error;
  }
}

async function loadMembers(): Promise<Array<[string, MemberAuthRecord]>> {
  const snapshot = await getAdminDatabase().ref('members').once('value');
  const entries: Array<[string, MemberAuthRecord]> = [];
  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      if (child.key) entries.push([child.key, (child.val() ?? {}) as MemberAuthRecord]);
    });
  }
  return entries;
}

/** The member whose directory email is `email` (last match, as the login has always done). */
export async function findMemberByEmail(
  email: string
): Promise<{ key: string; data: MemberAuthRecord } | null> {
  const target = normalizeEmail(email);
  if (!target) return null;
  let found: { key: string; data: MemberAuthRecord } | null = null;
  for (const [key, data] of await loadMembers()) {
    if (normalizeEmail(data.email) === target) found = { key, data };
  }
  return found;
}

export interface EnsuredAccount {
  user: UserRecord;
  /** The account did not exist and was created now. */
  created: boolean;
  /** members/<key>/authUid points to this account after the call. */
  linked: boolean;
}

export interface EnsureOptions {
  /** admin mode: the caller is an admin (not a delegated officer with the members section). */
  callerIsAdmin?: boolean;
  /** admin mode: Firebase-verified login email of the caller (the owner's account is the owner's). */
  callerVerifiedEmail?: string | null;
}

/**
 * Finds or creates the login account of a member and links it to the record (`authUid`).
 *
 * - `activation`: anyone can trigger it with a directory email. It never sets a password (only the
 *   emailed link can) and never changes an existing account: when the directory email has no
 *   account yet, a new one is created for it (verified by the emailed link) and linked.
 * - `admin`: someone with the members section is about to set the password. The account is linked,
 *   moved to the directory email if needed, created unverified (an admin-typed address proves
 *   nothing). Refused on the site owner's account (except for the owner) and, for a delegated
 *   officer, on an email that another record also carries.
 *
 * In both modes, an unverified account created outside the site after the cutoff and linked to no
 * record (public sign-up, console) is deleted and replaced: it is never adopted.
 */
export async function ensureMemberAccount(
  memberKey: string,
  member: MemberAuthRecord,
  mode: 'activation' | 'admin',
  options: EnsureOptions = {}
): Promise<EnsuredAccount> {
  const email = normalizeEmail(member.email);
  if (!email) throw new MemberAccountError('no_email');

  const auth = getAdminAuth();
  const others = (await loadMembers()).filter(([key]) => key !== memberKey);
  const linkedElsewhere = (uid: string) => others.find(([, m]) => m.authUid === uid);
  const sameEmailElsewhere = others.find(([, m]) => normalizeEmail(m.email) === email);

  const guardOwnerAccount = (account: UserRecord | null) => {
    if (mode !== 'admin' || !account?.email || !isOwnerEmail(account.email)) return;
    if (normalizeEmail(options.callerVerifiedEmail) !== normalizeEmail(account.email)) {
      throw new MemberAccountError('owner_account');
    }
  };
  // A delegated officer must not set a password on an address another record carries (e.g. an admin's).
  const guardSharedEmail = () => {
    if (mode === 'admin' && !options.callerIsAdmin && sameEmailElsewhere) {
      throw new MemberAccountError('shared_email', sameEmailElsewhere[1].name);
    }
  };

  let byEmail = await userOrNull(() => auth.getUserByEmail(email));
  const linkedAccount = member.authUid ? await userOrNull(() => auth.getUser(member.authUid as string)) : null;

  if (
    byEmail &&
    !byEmail.emailVerified &&
    !isGrandfatheredAccount(byEmail.metadata?.creationTime) &&
    byEmail.uid !== member.authUid &&
    !linkedElsewhere(byEmail.uid)
  ) {
    await auth.deleteUser(byEmail.uid);
    byEmail = null;
  }

  let user: UserRecord;
  let created = false;

  if (byEmail) {
    // An account already owns the directory email.
    if (byEmail.uid !== member.authUid) {
      const holder = linkedElsewhere(byEmail.uid);
      if (holder) {
        // Two records share one email (one login account per email in Firebase).
        if (mode === 'admin') throw new MemberAccountError('linked_elsewhere', holder[1].name);
        return { user: byEmail, created: false, linked: false };
      }
      guardSharedEmail();
    }
    guardOwnerAccount(byEmail);
    user = byEmail;
  } else if (linkedAccount && mode === 'admin') {
    // The directory email changed after the account was made: move the account to it.
    // Unverified until the member uses an emailed link (an admin-typed address proves nothing).
    guardOwnerAccount(linkedAccount);
    guardSharedEmail();
    user = await auth.updateUser(linkedAccount.uid, { email, emailVerified: false });
  } else {
    if (mode === 'activation' && linkedAccount?.email && isOwnerEmail(linkedAccount.email)) {
      // Never re-point the owner's record to another address from a public form.
      throw new MemberAccountError('owner_account');
    }
    guardSharedEmail();
    try {
      user = await auth.createUser({
        email,
        displayName: member.name || email.split('@')[0],
        emailVerified: mode === 'activation',
      });
      created = true;
    } catch (error) {
      // A concurrent request (double click, activation during an admin reset) created it first.
      if (!hasCode(error, 'auth/email-already-exists')) throw error;
      user = await auth.getUserByEmail(email);
    }
  }

  const alreadyLinked = member.authUid === user.uid;
  const mayLink =
    mode === 'admin' || created || user.emailVerified || isGrandfatheredAccount(user.metadata?.creationTime);
  if (!alreadyLinked && mayLink) {
    await getAdminDatabase().ref(`members/${memberKey}`).update({ authUid: user.uid });
  }
  return { user, created, linked: alreadyLinked || mayLink };
}
