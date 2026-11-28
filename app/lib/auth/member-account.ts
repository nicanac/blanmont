/**
 * Link between a club member record (RTDB `members/<key>`) and its Firebase Auth login account.
 *
 * The directory email (set by the club admins) is the login email. Server only (Admin SDK).
 */
import type { UserRecord } from 'firebase-admin/auth';
import { getAdminAuth, getAdminDatabase } from '../firebase/admin';

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
export type AccountProblem = 'no_email' | 'linked_elsewhere';

export class MemberAccountError extends Error {
  constructor(
    public readonly problem: AccountProblem,
    /** Name of the other member already holding that login account (linked_elsewhere). */
    public readonly otherMemberName?: string
  ) {
    super(problem);
    this.name = 'MemberAccountError';
  }
}

function isUserNotFound(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  return e?.code === 'auth/user-not-found' || Boolean(e?.message?.includes('user-not-found'));
}

async function userOrNull(load: () => Promise<UserRecord>): Promise<UserRecord | null> {
  try {
    return await load();
  } catch (error) {
    if (isUserNotFound(error)) return null;
    throw error;
  }
}

/** The member whose directory email is `email` (last match, as the login has always done). */
export async function findMemberByEmail(
  email: string
): Promise<{ key: string; data: MemberAuthRecord } | null> {
  const target = normalizeEmail(email);
  if (!target) return null;
  const snapshot = await getAdminDatabase().ref('members').once('value');
  let found: { key: string; data: MemberAuthRecord } | null = null;
  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      const data = child.val() as MemberAuthRecord;
      if (child.key && normalizeEmail(data?.email) === target) found = { key: child.key, data };
    });
  }
  return found;
}

/** Another member record (not `exceptKey`) already linked to the login account `uid`. */
async function otherMemberLinkedTo(
  uid: string,
  exceptKey: string
): Promise<{ key: string; name?: string } | null> {
  const snapshot = await getAdminDatabase().ref('members').once('value');
  let other: { key: string; name?: string } | null = null;
  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      const data = child.val() as MemberAuthRecord;
      if (child.key && child.key !== exceptKey && data?.authUid === uid) other = { key: child.key, name: data.name };
    });
  }
  return other;
}

export interface EnsuredAccount {
  user: UserRecord;
  /** The account did not exist and was created now. */
  created: boolean;
  /** members/<key>/authUid points to this account after the call. */
  linked: boolean;
}

/**
 * Finds or creates the login account of a member, keeps its email equal to the directory email
 * and links it to the record (`authUid`).
 *
 * - `activation`: anyone can trigger it with a directory email. It never sets a password (only the
 *   emailed link can), and it does not link an unverified account it did not create: that account
 *   gets linked at its first login, once the emailed link has verified it.
 * - `admin`: an admin with the members section is about to set the password; the account is linked.
 */
export async function ensureMemberAccount(
  memberKey: string,
  member: MemberAuthRecord,
  mode: 'activation' | 'admin'
): Promise<EnsuredAccount> {
  const email = normalizeEmail(member.email);
  if (!email) throw new MemberAccountError('no_email');

  const auth = getAdminAuth();
  const byEmail = await userOrNull(() => auth.getUserByEmail(email));
  const linkedAccount = member.authUid ? await userOrNull(() => auth.getUser(member.authUid as string)) : null;

  let user: UserRecord;
  let created = false;

  if (byEmail) {
    // An account already owns the directory email.
    if (byEmail.uid !== member.authUid) {
      const other = await otherMemberLinkedTo(byEmail.uid, memberKey);
      if (other) {
        // Two records share one email (one login account per email in Firebase).
        if (mode === 'admin') throw new MemberAccountError('linked_elsewhere', other.name);
        return { user: byEmail, created: false, linked: false };
      }
    }
    user = byEmail;
  } else if (linkedAccount) {
    // The directory email changed after the account was made: move the account to the new email.
    // Unverified until the member uses an emailed link (an admin-typed address proves nothing).
    user = await auth.updateUser(linkedAccount.uid, { email, emailVerified: false });
  } else {
    user = await auth.createUser({
      email,
      displayName: member.name || email.split('@')[0],
      emailVerified: true,
    });
    created = true;
  }

  const alreadyLinked = member.authUid === user.uid;
  const mayLink =
    mode === 'admin' || created || user.emailVerified || isGrandfatheredAccount(user.metadata?.creationTime);
  if (!alreadyLinked && mayLink) {
    await getAdminDatabase().ref(`members/${memberKey}`).update({ authUid: user.uid });
  }
  return { user, created, linked: alreadyLinked || mayLink };
}
