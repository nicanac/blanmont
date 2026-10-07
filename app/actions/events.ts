'use server';

import { revalidatePath } from 'next/cache';
import {
  submitEventReview,
  deleteEventReview,
} from '../lib/firebase/event-reviews';
import { SubmitEventReviewSchema, safeValidate } from '../lib/validation';
import { getSessionUser } from '../lib/auth/session';
import type { EventReview } from '../types';

/**
 * Server Action to submit or update a member's debrief / review for a calendar event.
 */
export async function submitEventReviewAction(payload: {
  eventId: string;
  rating: number;
  comment: string;
  effort?: EventReview['effort'];
  pace?: EventReview['pace'];
  roadCondition?: EventReview['roadCondition'];
  weatherEncountered?: EventReview['weatherEncountered'];
  stravaActivityUrl?: string;
}): Promise<{ success: boolean; review?: EventReview; error?: string }> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Vous devez être connecté pour publier un débrief de sortie.');
  }

  const validation = safeValidate(SubmitEventReviewSchema, payload);
  if (!validation.success) {
    throw new Error(
      `Validation échouée : ${validation.errors.map((e) => e.message).join(', ')}`
    );
  }

  const valid = validation.data;

  const reviewData: Parameters<typeof submitEventReview>[0] = {
    eventId: valid.eventId,
    memberId: session.id,
    memberName: session.name,
    rating: valid.rating,
    comment: valid.comment,
  };

  if (session.photoUrl) reviewData.memberPhotoUrl = session.photoUrl;
  if (valid.effort) reviewData.effort = valid.effort;
  if (valid.pace) reviewData.pace = valid.pace;
  if (valid.roadCondition) reviewData.roadCondition = valid.roadCondition;
  if (valid.weatherEncountered) reviewData.weatherEncountered = valid.weatherEncountered;
  if (valid.stravaActivityUrl) reviewData.stravaActivityUrl = valid.stravaActivityUrl;

  const result = await submitEventReview(reviewData);

  if (!result.success) {
    throw new Error(result.error || 'Erreur lors de l’enregistrement de votre avis.');
  }

  revalidatePath('/calendrier');
  return result;
}

/**
 * Server Action to delete a member's review from a calendar event.
 */
export async function deleteEventReviewAction(
  eventId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionUser();
  if (!session || (session.id !== memberId && !session.isAdmin)) {
    throw new Error('Action non autorisée.');
  }

  const result = await deleteEventReview(eventId, memberId);
  if (!result.success) {
    throw new Error(result.error || 'Erreur lors de la suppression de l’avis.');
  }

  revalidatePath('/calendrier');
  return result;
}
