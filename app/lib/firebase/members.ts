import { Member } from '../../types';
import {
  isMockMode,
  useNotionFallback,
  getFirebaseDatabase,
  getFirebaseAuth,
  ref,
  get,
  set,
  update,
  query,
  orderByChild,
  equalTo,
  snapshotToArray,
  snapshotToObject,
  signInWithEmailAndPassword,
} from './client';
// Admin SDK import
import { getAdminDatabase } from './admin';

// Notion fallback imports
import {
  getMembers as getNotionMembers,
  validateUser as validateNotionUser,
  updateMemberPhoto as updateNotionMemberPhoto,
} from '../notion/members';

/**
 * Fetches the list of all active members from Firebase.
 */
export const getMembers = async (): Promise<Member[]> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionMembers();
    }
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

/**
 * Validates user credentials using Firebase Auth.
 */
export const validateUser = async (email: string, password: string): Promise<Member | null> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return validateNotionUser(email, password);
    }
    if (email === 'mock@test.com' && password === 'password') {
      return {
        id: '1',
        name: 'Mock User',
        role: ['Member'],
        bio: 'Mock',
        photoUrl: '',
        email: 'mock@test.com',
      };
    }
    return null;
  }

  try {
    console.log(`[validateUser] Starting validation for: ${email}`);
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`[validateUser] Auth successful. UID: ${user.uid}`);

    // Fetch member data from database
    let snapshot;

    if (typeof window === 'undefined') {
      // Server-side: Use Admin SDK to bypass rules (Permission Denied fix)
      console.log('[validateUser] Using Admin SDK for DB lookup');
      const db = getAdminDatabase();
      snapshot = await db.ref('members').once('value');
    } else {
      // Client-side: Use Client SDK
      console.log('[validateUser] Using Client SDK for DB lookup');
      const db = getFirebaseDatabase();
      const membersRef = ref(db, 'members');
      snapshot = await get(membersRef);
    }

    console.log(`[validateUser] Members snapshot exists: ${snapshot.exists()}`);

    if (snapshot.exists()) {
      let foundMember: Member | null = null;
      snapshot.forEach((child: any) => {
        const memberData = child.val();
        // Loose check matching
        if (
          memberData.email?.toLowerCase() === email.toLowerCase() ||
          memberData.authUid === user.uid
        ) {
          console.log(`[validateUser] Match found in DB! Key: ${child.key}`);
          foundMember = { id: child.key, ...memberData };
        }
      });

      if (foundMember) {
        return foundMember;
      }
    }

    console.log('[validateUser] No DB match found, returning basic auth user.');

    // If no member found, return basic user info
    return {
      id: user.uid,
      name: user.displayName || email.split('@')[0],
      role: ['Member'],
      bio: '',
      photoUrl: user.photoURL || 'https://placehold.co/400x400',
      email: email,
    };
  } catch (error) {
    console.error('Failed to validate user:', error);
    return null;
  }
};

/**
 * Updates a member's profile photo.
 */
export const updateMemberPhoto = async (memberId: string, photoUrl: string): Promise<void> => {
  if (isMockMode) {
    if (useNotionFallback) {
      return updateNotionMemberPhoto(memberId, photoUrl);
    }
    console.log('Mock member photo update:', { memberId, photoUrl });
    return;
  }

  try {
    const db = getFirebaseDatabase();
    const memberRef = ref(db, `members/${memberId}`);
    await update(memberRef, { photoUrl });
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
    const snapshot = await get(membersRef);

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
