import { EventReview } from '../../types';
import { isMockMode, getFirebaseDatabase, ref, get } from './client';
import { getAdminDatabase } from './admin';

// In-memory mock store for local development / testing without Firebase credentials
const mockReviewsStore: Record<string, Record<string, EventReview>> = {
  // Sample seed review for past events
  'mock-event-1': {
    '1': {
      id: '1',
      eventId: 'mock-event-1',
      memberId: '1',
      memberName: 'Antoine Gallo',
      memberGroup: 'Groupe A',
      rating: 5,
      effort: 'soutenu',
      pace: 'parfait',
      roadCondition: 'impeccable',
      weatherEncountered: 'soleil',
      comment: 'Superbe sortie avec le Groupe A ! Très bonne cohésion dans les relais et météo parfaite.',
      stravaActivityUrl: 'https://www.strava.com',
      createdAt: '2026-09-05T14:30:00.000Z',
    },
    '2': {
      id: '2',
      eventId: 'mock-event-1',
      memberId: '2',
      memberName: 'Nicolas Bruyere',
      memberGroup: 'Groupe A',
      rating: 4,
      effort: 'modere',
      pace: 'parfait',
      roadCondition: 'bonne',
      weatherEncountered: 'ideal',
      comment: 'Très beau tracé vallonné. Rythme régulier et super ambiance dans le peloton.',
      createdAt: '2026-09-05T15:10:00.000Z',
    },
  },
};

/**
 * Fetches all reviews/debriefs for a specific calendar event.
 */
export async function getEventReviews(eventId: string): Promise<EventReview[]> {
  if (isMockMode) {
    const eventMap = mockReviewsStore[eventId] || {};
    return Object.values(eventMap).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    let snapshot;

    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref(`event-reviews/${eventId}`).once('value');
    } else {
      const db = getFirebaseDatabase();
      snapshot = await get(ref(db, `event-reviews/${eventId}`));
    }

    if (!snapshot.exists()) return [];

    const val = snapshot.val() as Record<string, EventReview>;
    const reviews = Object.values(val);
    return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error(`Failed to fetch reviews for event ${eventId}:`, error);
    return [];
  }
}

/**
 * Fetches all reviews across all events, indexed by eventId.
 * Useful for server-side page data preloading.
 */
export async function getAllEventReviews(): Promise<Record<string, EventReview[]>> {
  if (isMockMode) {
    const result: Record<string, EventReview[]> = {};
    for (const [eventId, map] of Object.entries(mockReviewsStore)) {
      result[eventId] = Object.values(map).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return result;
  }

  try {
    let snapshot;

    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref('event-reviews').once('value');
    } else {
      const db = getFirebaseDatabase();
      snapshot = await get(ref(db, 'event-reviews'));
    }

    if (!snapshot.exists()) return {};

    const raw = snapshot.val() as Record<string, Record<string, EventReview>>;
    const result: Record<string, EventReview[]> = {};

    for (const [eventId, membersMap] of Object.entries(raw)) {
      if (membersMap && typeof membersMap === 'object') {
        result[eventId] = Object.values(membersMap).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to fetch all event reviews:', error);
    return {};
  }
}

/**
 * Submits or updates a member's debrief/review for an event.
 */
export async function submitEventReview(
  review: Omit<EventReview, 'id' | 'createdAt'> & { createdAt?: string }
): Promise<{ success: boolean; review?: EventReview; error?: string }> {
  const timestamp = review.createdAt || new Date().toISOString();
  const rawPayload: EventReview = {
    ...review,
    id: review.memberId,
    createdAt: timestamp,
    updatedAt: new Date().toISOString(),
  };

  // Strip all undefined properties because Firebase Realtime Database strictly rejects undefined values
  const payload: EventReview = Object.fromEntries(
    Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
  ) as EventReview;

  if (isMockMode) {
    if (!mockReviewsStore[review.eventId]) {
      mockReviewsStore[review.eventId] = {};
    }
    mockReviewsStore[review.eventId][review.memberId] = payload;
    return { success: true, review: payload };
  }

  try {
    const db = getAdminDatabase();
    await db.ref(`event-reviews/${review.eventId}/${review.memberId}`).set(payload);
    return { success: true, review: payload };
  } catch (error) {
    console.error('Failed to submit event review:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Deletes a member's review for an event.
 */
export async function deleteEventReview(
  eventId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  if (isMockMode) {
    if (mockReviewsStore[eventId]?.[memberId]) {
      delete mockReviewsStore[eventId][memberId];
    }
    return { success: true };
  }

  try {
    const db = getAdminDatabase();
    await db.ref(`event-reviews/${eventId}/${memberId}`).remove();
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete event review for event ${eventId}, member ${memberId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
