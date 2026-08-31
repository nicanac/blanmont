import { WeekendPoll, PollResponse } from '../../types';
import { isMockMode, getFirebaseDatabase, ref, get, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';

/**
 * Fetches the currently active weekend poll (status === 'active').
 */
export async function getActiveWeekendPoll(): Promise<WeekendPoll | null> {
  if (isMockMode) {
    return {
      id: 'mock-poll-1',
      title: 'Sortie du Weekend - Samedi & Dimanche',
      weekendIsoDate: '2026-09-05',
      description: 'Indiquez vos disponibilités et votre groupe pour le peloton de ce weekend !',
      status: 'active',
      createdAt: new Date().toISOString(),
      customQuestions: [
        {
          id: 'q1',
          title: 'Option de distance souhaitée',
          options: ['Circuit court (~70 km)', 'Circuit moyen (~90 km)', 'Grand tour (~120 km)'],
          allowMultiple: false,
        },
      ],
    };
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref('weekend-polls').once('value');
    } else {
      snapshot = await get(ref(db as any, 'weekend-polls'));
    }

    if (!snapshot.exists()) return null;

    const polls = snapshotToArray<WeekendPoll>(snapshot);
    const activePolls = polls.filter((p) => p.status === 'active');

    if (activePolls.length === 0) return null;

    // Return the one with closest weekend date
    return activePolls.sort((a, b) => a.weekendIsoDate.localeCompare(b.weekendIsoDate))[0];
  } catch (error) {
    console.error('Failed to fetch active weekend poll:', error);
    return null;
  }
}

/**
 * Fetches all weekend polls.
 */
export async function getAllWeekendPolls(): Promise<WeekendPoll[]> {
  if (isMockMode) {
    return [
      {
        id: 'mock-poll-1',
        title: 'Sortie du Weekend - Samedi & Dimanche',
        weekendIsoDate: '2026-09-05',
        description: 'Indiquez vos disponibilités et votre groupe pour le peloton de ce weekend !',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref('weekend-polls').once('value');
    } else {
      snapshot = await get(ref(db as any, 'weekend-polls'));
    }

    if (!snapshot.exists()) return [];

    const polls = snapshotToArray<WeekendPoll>(snapshot);
    return polls.sort((a, b) => b.weekendIsoDate.localeCompare(a.weekendIsoDate));
  } catch (error) {
    console.error('Failed to fetch all weekend polls:', error);
    return [];
  }
}

/**
 * Fetches a single weekend poll by ID.
 */
export async function getWeekendPollById(id: string): Promise<WeekendPoll | null> {
  if (isMockMode) {
    return {
      id,
      title: 'Sortie du Weekend - Samedi & Dimanche',
      weekendIsoDate: '2026-09-05',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref(`weekend-polls/${id}`).once('value');
    } else {
      snapshot = await get(ref(db as any, `weekend-polls/${id}`));
    }

    if (!snapshot.exists()) return null;

    const val = snapshot.val();
    return { id, ...val };
  } catch (error) {
    console.error(`Failed to fetch weekend poll ${id}:`, error);
    return null;
  }
}

/**
 * Creates a new weekend poll.
 */
export async function createWeekendPoll(poll: Omit<WeekendPoll, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (isMockMode) {
    return { success: true, id: 'mock-created-poll' };
  }

  try {
    const db = getAdminDatabase();
    const pollRef = db.ref('weekend-polls').push();
    const newPoll: WeekendPoll = {
      ...poll,
      id: pollRef.key!,
      createdAt: new Date().toISOString(),
    };

    await pollRef.set(newPoll);
    return { success: true, id: pollRef.key! };
  } catch (error) {
    console.error('Failed to create weekend poll:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Updates a weekend poll.
 */
export async function updateWeekendPoll(
  id: string,
  updates: Partial<Omit<WeekendPoll, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getAdminDatabase();
    await db.ref(`weekend-polls/${id}`).update(updates);
    return { success: true };
  } catch (error) {
    console.error(`Failed to update weekend poll ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Deletes a weekend poll and all its responses.
 */
export async function deleteWeekendPoll(id: string): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getAdminDatabase();
    await Promise.all([
      db.ref(`weekend-polls/${id}`).remove(),
      db.ref(`weekend-poll-responses/${id}`).remove(),
    ]);
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete weekend poll ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Fetches all member responses for a specific poll.
 */
export async function getPollResponses(pollId: string): Promise<PollResponse[]> {
  if (isMockMode) {
    return [
      {
        id: '1',
        pollId,
        memberId: '1',
        memberName: 'Alice Velo',
        dayChoice: 'samedi',
        groupChoice: 'Groupe A',
        comment: 'Départ 8h30 à l\'heure !',
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        pollId,
        memberId: '2',
        memberName: 'Bob Sprinter',
        dayChoice: 'dimanche',
        groupChoice: 'Groupe B',
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref(`weekend-poll-responses/${pollId}`).once('value');
    } else {
      snapshot = await get(ref(db as any, `weekend-poll-responses/${pollId}`));
    }

    if (!snapshot.exists()) return [];

    const responses = snapshotToArray<PollResponse>(snapshot);
    return responses.sort((a, b) => a.memberName.localeCompare(b.memberName));
  } catch (error) {
    console.error(`Failed to fetch responses for poll ${pollId}:`, error);
    return [];
  }
}

/**
 * Submits or updates a member's response for a weekend poll.
 */
export async function submitPollResponse(
  response: Omit<PollResponse, 'id' | 'updatedAt'>
): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getAdminDatabase();
    const responseRef = db.ref(`weekend-poll-responses/${response.pollId}/${response.memberId}`);

    const payload: PollResponse = {
      ...response,
      id: response.memberId,
      updatedAt: new Date().toISOString(),
    };

    await responseRef.set(payload);
    return { success: true };
  } catch (error) {
    console.error('Failed to submit poll response:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Deletes a member's response from a poll.
 */
export async function deletePollResponse(
  pollId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getAdminDatabase();
    await db.ref(`weekend-poll-responses/${pollId}/${memberId}`).remove();
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete poll response ${pollId}/${memberId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
