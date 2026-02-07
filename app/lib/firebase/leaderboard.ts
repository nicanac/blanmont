import { isMockMode, getFirebaseDatabase, ref, get, set, update, snapshotToArray } from './client';
// Admin SDK for server-side access (bypasses security rules)
import { getAdminDatabase } from './admin';

/**
 * Represents a leaderboard entry.
 */
export interface LeaderboardEntry {
  /** Unique identifier for the entry. */
  id: string;
  /** Full name of the member. */
  name: string;
  /** Total number of rides. */
  rides: number;
  /** Group identifier (e.g., 'A1', 'B2', 'C'). */
  group: string;
  /** Array of ride dates in DD/MM/YYYY format. */
  dates: string[];
}

/**
 * Fetches all leaderboard entries from Firebase.
 */
export const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  // Fallback to mock if Firebase not configured
  if (isMockMode) {
    console.warn('Firebase not configured, falling back to mock leaderboard data.');
    return [
      {
        id: '1',
        name: 'Mock Rider 1',
        rides: 0,
        group: 'A1',
        dates: [],
      },
      {
        id: '2',
        name: 'Mock Rider 2',
        rides: 0,
        group: 'B2',
        dates: [],
      },
    ];
  }

  try {
    let snapshot;

    // Use Admin SDK on server side to bypass rules
    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref('leaderboard').once('value');
    } else {
      const db = getFirebaseDatabase();
      const leaderboardRef = ref(db, 'leaderboard');
      snapshot = await get(leaderboardRef);
    }

    if (!snapshot.exists()) return [];

    const entries = snapshotToArray<LeaderboardEntry>(snapshot);

    // Sort by rides descending
    return entries.sort((a, b) => b.rides - a.rides);
  } catch (error) {
    console.error('Failed to fetch leaderboard entries:', error);
    return [];
  }
};

/**
 * Updates a leaderboard entry.
 */
export const updateLeaderboardEntry = async (
  entryId: string,
  entryData: Partial<LeaderboardEntry>
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    console.warn('Mock update leaderboard entry:', { entryId, entryData });
    return { success: true };
  }

  try {
    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      await db.ref(`leaderboard/${entryId}`).update({
        ...entryData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const db = getFirebaseDatabase();
      const entryRef = ref(db, `leaderboard/${entryId}`);
      await update(entryRef, {
        ...entryData,
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update leaderboard entry:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Creates a new leaderboard entry.
 */
export const createLeaderboardEntry = async (
  entryData: Omit<LeaderboardEntry, 'id'>
): Promise<{ success: boolean; id?: string; error?: string }> => {
  if (isMockMode) {
    console.warn('Mock create leaderboard entry:', entryData);
    return { success: true, id: 'mock-entry-id' };
  }

  try {
    const newId = `entry_${Date.now()}`;
    const dataToSave = {
      ...entryData,
      createdAt: new Date().toISOString(),
    };

    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      await db.ref(`leaderboard/${newId}`).set(dataToSave);
    } else {
      const db = getFirebaseDatabase();
      const entryRef = ref(db, `leaderboard/${newId}`);
      await set(entryRef, dataToSave);
    }

    return { success: true, id: newId };
  } catch (error) {
    console.error('Failed to create leaderboard entry:', error);
    return { success: false, error: String(error) };
  }
};
