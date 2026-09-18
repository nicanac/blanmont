import { Feedback } from '../../types';
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
import { SubmitFeedbackSchema, safeValidate } from '../validation';

// Notion fallback imports
import {
  getFeedbackForTrace as getNotionFeedback,
  submitFeedback as submitNotionFeedback,
} from '../notion/feedback';

/**
 * Fetches all feedback for a specific trace.
 */
export const getFeedbackForTrace = async (traceId: string): Promise<Feedback[]> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionFeedback(traceId);
    }
    return [];
  }

  try {
    let snapshot;
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref('feedback').once('value');
    } else {
      const db = getFirebaseDatabase();
      const feedbackRef = ref(db, 'feedback');
      snapshot = await get(feedbackRef);
    }

    if (!snapshot.exists()) return [];

    const allFeedback = snapshotToArray<Feedback>(snapshot);

    // Filter by traceId and sort by createdAt descending
    return allFeedback
      .filter((f) => f.traceId === traceId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return [];
  }
};

/**
 * Submits or updates feedback for a trace.
 */
export const submitFeedback = async (
  traceId: string,
  memberId: string,
  rating: number,
  comment: string,
  feedbackId?: string
): Promise<void> => {
  const validation = safeValidate(SubmitFeedbackSchema, {
    traceId,
    memberId,
    rating,
    comment,
    feedbackId,
  });

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  const validData = validation.data;

  if (isMockMode) {
    if (useNotionFallback) {
      return submitNotionFeedback(
        validData.traceId,
        validData.memberId || '',
        validData.rating,
        validData.comment,
        validData.feedbackId
      );
    }
    console.log('Mock feedback submission:', validData);
    return;
  }

  try {
    let targetId = validData.feedbackId;

    // Check for existing feedback from this member
    if (!targetId && validData.memberId) {
      const existingFeedback = await getFeedbackForTrace(validData.traceId);
      const match = existingFeedback.find((f) => f.memberId === validData.memberId);
      if (match) {
        console.log(
          `Found existing feedback ${match.id} for member ${validData.memberId}, updating.`
        );
        targetId = match.id;
      }
    }

    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      if (targetId) {
        await db.ref(`feedback/${targetId}`).update({
          comment: validData.comment,
          rating: validData.rating,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newId = `feedback_${Date.now()}`;
        await db.ref(`feedback/${newId}`).set({
          traceId: validData.traceId,
          memberId: validData.memberId,
          comment: validData.comment,
          rating: validData.rating,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      const db = getFirebaseDatabase();
      if (targetId) {
        const feedbackRef = ref(db, `feedback/${targetId}`);
        await update(feedbackRef, {
          comment: validData.comment,
          rating: validData.rating,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newId = `feedback_${Date.now()}`;
        const feedbackRef = ref(db, `feedback/${newId}`);
        await set(feedbackRef, {
          traceId: validData.traceId,
          memberId: validData.memberId,
          comment: validData.comment,
          rating: validData.rating,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error;
  }
};

/**
 * Deletes feedback.
 */
export const deleteFeedback = async (
  feedbackId: string
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    console.log('Mock delete feedback:', feedbackId);
    return { success: true };
  }

  try {
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      await db.ref(`feedback/${feedbackId}`).remove();
    } else {
      const db = getFirebaseDatabase();
      const feedbackRef = ref(db, `feedback/${feedbackId}`);
      await set(feedbackRef, null);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete feedback:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Gets all feedback (for admin purposes).
 */
export const getAllFeedback = async (): Promise<Feedback[]> => {
  if (isMockMode) return [];

  try {
    let snapshot;
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref('feedback').once('value');
    } else {
      const db = getFirebaseDatabase();
      const feedbackRef = ref(db, 'feedback');
      snapshot = await get(feedbackRef);
    }

    return snapshotToArray<Feedback>(snapshot);
  } catch (error) {
    console.error('Failed to fetch all feedback:', error);
    return [];
  }
};
