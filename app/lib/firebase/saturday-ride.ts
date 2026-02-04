import { SaturdayRide, Vote } from '../../types';
import {
  isMockMode,
  useNotionFallback,
  getFirebaseDatabase,
  ref,
  get,
  set,
  update,
  snapshotToArray,
} from './client';

// Notion fallback imports
import {
  getActiveRides as getNotionActiveRides,
  getVotes as getNotionVotes,
  createRide as createNotionRide,
  submitVote as submitNotionVote,
} from '../notion/saturday-ride';

/**
 * Fetches all active rides (status = 'Voting').
 */
export const getActiveRides = async (): Promise<SaturdayRide[]> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionActiveRides();
    }
    return [{ id: 'mock-ride', date: '2024-05-18', candidateTraceIds: ['1'], status: 'Voting' }];
  }

  try {
    let snapshot;
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref('saturday-rides').once('value');
    } else {
      const db = getFirebaseDatabase();
      const ridesRef = ref(db, 'saturday-rides');
      snapshot = await get(ridesRef);
    }

    if (!snapshot.exists()) return [];

    const allRides = snapshotToArray<SaturdayRide>(snapshot);

    // Filter for voting rides and sort by date
    return allRides
      .filter((ride) => ride.status === 'Voting')
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Failed to get active rides:', error);
    return [];
  }
};

/**
 * Fetches all rides.
 */
export const getAllRides = async (): Promise<SaturdayRide[]> => {
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionActiveRides(); // Returns all active rides from Notion
    }
    return [{ id: 'mock-ride', date: '2024-05-18', candidateTraceIds: ['1'], status: 'Voting' }];
  }

  try {
    const db = getFirebaseDatabase();
    const ridesRef = ref(db, 'saturday-rides');
    const snapshot = await get(ridesRef);

    if (!snapshot.exists()) return [];

    const allRides = snapshotToArray<SaturdayRide>(snapshot);

    return allRides.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Failed to get all rides:', error);
    return [];
  }
};

/**
 * Creates a new Saturday ride.
 */
export const createRide = async (date: string, traceIds: string[]): Promise<void> => {
  if (isMockMode) {
    if (useNotionFallback) {
      return createNotionRide(date, traceIds);
    }
    console.log('Mock create ride:', { date, traceIds });
    return;
  }

  try {
    const db = getFirebaseDatabase();
    const newId = `ride_${Date.now()}`;
    const rideRef = ref(db, `saturday-rides/${newId}`);

    await set(rideRef, {
      date,
      candidateTraceIds: traceIds,
      status: 'Voting',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create ride:', error);
    throw error;
  }
};

/**
 * Updates a ride's status or selected trace.
 */
export const updateRide = async (
  rideId: string,
  data: { status?: string; selectedTraceId?: string }
): Promise<void> => {
  if (isMockMode) {
    console.log('Mock update ride:', { rideId, data });
    return;
  }

  try {
    const db = getFirebaseDatabase();
    const rideRef = ref(db, `saturday-rides/${rideId}`);
    await update(rideRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update ride:', error);
    throw error;
  }
};

/**
 * Fetches all votes for a specific ride.
 */
export const getVotes = async (rideId: string): Promise<Vote[]> => {
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionVotes(rideId);
    }
    return [];
  }

  try {
    const db = getFirebaseDatabase();
    const votesRef = ref(db, 'votes');
    const snapshot = await get(votesRef);

    if (!snapshot.exists()) return [];

    const allVotes = snapshotToArray<Vote>(snapshot);

    return allVotes.filter((vote) => vote.rideId === rideId);
  } catch (error) {
    console.error('Failed to get votes:', error);
    return [];
  }
};

/**
 * Submits or updates a member's vote for a ride.
 */
export const submitVote = async (
  rideId: string,
  memberId: string,
  traceId: string
): Promise<void> => {
  if (isMockMode) {
    if (useNotionFallback) {
      return submitNotionVote(rideId, memberId, traceId);
    }
    console.log('Mock submit vote:', { rideId, memberId, traceId });
    return;
  }

  try {
    const db = getFirebaseDatabase();

    // Check for existing vote
    const votes = await getVotes(rideId);
    const existingVote = votes.find((v) => v.memberId === memberId);

    if (existingVote) {
      // Update existing vote
      const voteRef = ref(db, `votes/${existingVote.id}`);
      await update(voteRef, {
        traceId,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new vote
      const newId = `vote_${Date.now()}`;
      const voteRef = ref(db, `votes/${newId}`);
      await set(voteRef, {
        rideId,
        memberId,
        traceId,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to submit vote:', error);
    throw error;
  }
};

/**
 * Deletes a vote.
 */
export const deleteVote = async (voteId: string): Promise<void> => {
  if (isMockMode) {
    console.log('Mock delete vote:', voteId);
    return;
  }

  try {
    const db = getFirebaseDatabase();
    const voteRef = ref(db, `votes/${voteId}`);
    await set(voteRef, null);
  } catch (error) {
    console.error('Failed to delete vote:', error);
    throw error;
  }
};
