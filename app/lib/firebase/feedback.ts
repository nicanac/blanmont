import { Feedback } from '../../types';
import { isMockMode, useNotionFallback } from './client';
import {
  fetchCollection,
  saveRecord,
  updateRecord,
  deleteRecord,
} from './rtdbService';
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
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionFeedback(traceId);
    }
    return [];
  }

  return fetchCollection<Feedback>('feedback', {
    filter: (f) => f.traceId === traceId,
    sort: (a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    },
  });
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

  if (targetId) {
    await updateRecord('feedback', targetId, {
      comment: validData.comment,
      rating: validData.rating,
      updatedAt: new Date().toISOString(),
    });
  } else {
    const newId = `feedback_${Date.now()}`;
    await saveRecord('feedback', newId, {
      traceId: validData.traceId,
      memberId: validData.memberId,
      comment: validData.comment,
      rating: validData.rating,
      createdAt: new Date().toISOString(),
    });
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
    await deleteRecord('feedback', feedbackId);
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
  return fetchCollection<Feedback>('feedback');
};
