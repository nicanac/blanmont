import { Member } from '../../types';
import {
  isMockMode,
  getFirebaseDatabase,
  getFirebaseAuth,
  ref,
  get,
  set,
  update,
  snapshotToArray,
  snapshotToObject,
  signInWithEmailAndPassword,
} from './client';
// Admin SDK import
import { getAdminAuth, getAdminDatabase } from './admin';
import { isGrandfatheredAccount, normalizeEmail } from '../auth/member-account';
import { loginFailureFromFirebaseCode, type LoginFailureReason } from '../auth/login-messages';

/**
 * Fetches the list of all active members from Firebase.
 */
export const getMembers = async (): Promise<Member[]> => {
  // Return mock members if Firebase not configured
  if (isMockMode) {
    console.warn('Firebase not configured, falling back to mock.');
    return [
      {
        id: '1',
        name: 'Alice Velo',
        role: ['President'],
        bio: 'Love climbing.',
        photoUrl: 'https://placehold.co/400x400',
      },
      {
        id: '2',
        name: 'Bob Sprinter',
        role: ['Member'],
        bio: 'Fast on flats.',
        photoUrl: 'https://placehold.co/400x400',
      },
    ];
  }

  try {
    let snapshot;

    // Use Admin SDK on server side
    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref('members').once('value');
    } else {
      const db = getFirebaseDatabase();
      const membersRef = ref(db, 'members');
      snapshot = await get(membersRef);
    }

    const members = snapshotToArray<Member>(snapshot);

    // Sort by name
    return members.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return [];
  }
};

/**
 * Fetches a single member by ID.
 */
export const getMember = async (id: string): Promise<Member | null> => {
  if (isMockMode) {
    return {
      id: '1',
      name: 'Mock User',
      role: ['Member'],
      bio: 'Mock',
      photoUrl: '',
      email: 'mock@test.com',
    };
  }

  try {
    const db = getFirebaseDatabase();
    const memberRef = ref(db, `members/${id}`);
    const snapshot = await get(memberRef);

    return snapshotToObject<Member>(snapshot, id);
  } catch (error) {
    console.error('Failed to fetch member:', error);
    return null;
  }
};

/** A member authenticated by password; `verifiedEmail` = login email verified by Firebase (server only). */
export type AuthenticatedMember = Member & { verifiedEmail?: string };

export type MemberAuthResult =
  | { ok: true; member: AuthenticatedMember }
  | { ok: false; reason: LoginFailureReason; code?: string };

/** Firebase Auth error code of a failed sign-in (`auth/...`), from `.code` or the message. */
function firebaseAuthCode(error: unknown): string | undefined {
  const e = error as { code?: unknown; message?: unknown } | null;
  if (typeof e?.code === 'string' && e.code) return e.code;
  const match = typeof e?.message === 'string' ? e.message.match(/auth\/[a-z0-9-]+/) : null;
  return match?.[0];
}

/**
 * Signs in with email + password (Firebase Auth) and finds the member record of that account.
 *
 * A record matches when its `authUid` is the account's uid, or when its directory email equals
 * the account's email AND that email is verified (or the account predates the cutoff of
 * `isGrandfatheredAccount`). An email match links the record (`authUid`).
 */
export const authenticateMember = async (email: string, password: string): Promise<MemberAuthResult> => {
  if (isMockMode) {
    if (email === 'mock@test.com' && password === 'password') {
      return {
        ok: true,
        member: { id: '1', name: 'Mock User', role: ['Member'], bio: 'Mock', photoUrl: '', email: 'mock@test.com' },
      };
    }
    return { ok: false, reason: 'invalid_credentials' };
  }

  const loginEmail = normalizeEmail(email);
  let user: Awaited<ReturnType<typeof signInWithEmailAndPassword>>['user'];
  try {
    user = (await signInWithEmailAndPassword(getFirebaseAuth(), loginEmail, password)).user;
  } catch (error) {
    const code = firebaseAuthCode(error);
    const reason = loginFailureFromFirebaseCode(code);
    if (reason === 'unavailable') console.error('[authenticateMember] Sign-in failed:', error);
    return { ok: false, reason, code };
  }

  try {
    // Owner checks (OWNER_EMAILS) use this, never the member-record email that admins can edit.
    let verifiedEmail: string | undefined;
    if (typeof window === 'undefined') {
      try {
        const token = await getAdminAuth().verifyIdToken(await user.getIdToken());
        if (token.email && token.email_verified === true) verifiedEmail = token.email;
      } catch (tokenErr) {
        console.warn('[authenticateMember] Could not verify the ID token; session gets no verified email:', tokenErr);
      }
    }

    // Server: Admin SDK (the live RTDB rules deny clients). Browser: client SDK.
    const snapshot =
      typeof window === 'undefined'
        ? await getAdminDatabase().ref('members').once('value')
        : await get(ref(getFirebaseDatabase(), 'members'));

    const accountEmail = normalizeEmail(user.email ?? loginEmail);
    const emailTrusted = user.emailVerified === true || isGrandfatheredAccount(user.metadata?.creationTime);

    // `null as` keeps TypeScript from narrowing to null (the assignments happen in the callback).
    let byUid = null as (Member & { authUid?: string }) | null;
    let byEmail = null as (Member & { authUid?: string }) | null;
    if (snapshot.exists()) {
      snapshot.forEach((child: { key: string | null; val: () => Record<string, unknown> }) => {
        const data = child.val() as Partial<Member> & { email?: string; authUid?: string };
        const candidate = { id: child.key, ...data } as Member & { authUid?: string };
        if (data.authUid === user.uid) byUid = candidate;
        else if (emailTrusted && normalizeEmail(data.email) === accountEmail) byEmail = candidate;
      });
    }

    const found = byUid ?? byEmail;
    if (!found) {
      console.warn(`[authenticateMember] No member record for uid ${user.uid} (email verified: ${user.emailVerified}).`);
      return { ok: false, reason: 'not_linked' };
    }

    // Matched by email: link the record to this account (first login, or the email moved account).
    if (found.authUid !== user.uid && typeof window === 'undefined') {
      try {
        await getAdminDatabase().ref(`members/${found.id}`).update({ authUid: user.uid });
      } catch (syncErr) {
        console.warn('[authenticateMember] Failed to link authUid:', syncErr);
      }
    }
    return { ok: true, member: verifiedEmail ? { ...found, verifiedEmail } : found };
  } catch (error) {
    console.error('[authenticateMember] Member lookup failed:', error);
    return { ok: false, reason: 'unavailable' };
  }
};

/** Validates credentials; the member, or null (see {@link authenticateMember} for the reason). */
export const validateUser = async (email: string, password: string): Promise<AuthenticatedMember | null> => {
  const result = await authenticateMember(email, password);
  return result.ok ? result.member : null;
};

/**
 * Updates a member's profile photo.
 */
export const updateMemberPhoto = async (memberId: string, photoUrl: string): Promise<void> => {
  if (isMockMode) {
    console.log('Mock member photo update:', { memberId, photoUrl });
    return;
  }

  try {
    // Server-only (profile Server Action): the live RTDB rules are deny-all, so only the Admin SDK can write.
    await getAdminDatabase().ref(`members/${memberId}`).update({ photoUrl });
  } catch (error) {
    console.error('Failed to update member photo:', error);
    throw error;
  }
};

/**
 * Creates a new member.
 */
export const createMember = async (
  memberData: Omit<Member, 'id'>
): Promise<{ success: boolean; id?: string; error?: string }> => {
  if (isMockMode) {
    console.log('Mock create member:', memberData);
    return { success: true, id: 'mock-member-id' };
  }

  try {
    const db = getFirebaseDatabase();
    const membersRef = ref(db, 'members');
    await get(membersRef);

    // Generate new ID
    const newId = `member_${Date.now()}`;
    const newMemberRef = ref(db, `members/${newId}`);

    await set(newMemberRef, {
      ...memberData,
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: newId };
  } catch (error) {
    console.error('Failed to create member:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Updates a member's data.
 */
export const updateMember = async (
  memberId: string,
  memberData: Partial<Member>
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    console.log('Mock update member:', { memberId, memberData });
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    const memberRef = ref(db, `members/${memberId}`);
    await update(memberRef, {
      ...memberData,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update member:', error);
    return { success: false, error: String(error) };
  }
};
