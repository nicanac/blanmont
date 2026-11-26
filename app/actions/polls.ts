'use server';

import { revalidatePath } from 'next/cache';
import {
  submitPollResponse,
  deletePollResponse,
  createWeekendPoll,
  updateWeekendPoll,
  deleteWeekendPoll,
} from '../lib/firebase/polls';
import { getSaturdaySortieDetails, type SaturdaySortieInfo } from '../lib/sondage-helpers';
import { autoCreateUpcomingWeekendPoll, type AutoCreatePollResult } from '../lib/sondage-automation';
import { getSessionUser } from '../lib/auth/session';
import { canAccessSection, requireSectionAccess } from '../lib/auth/admin-access';
import type { WeekendPoll, PollSlot, CyclingGroupChoice, PollGroupVariant, PollResponse } from '../types';
import { POLL_SLOT_IDS } from '../lib/poll-slots';
import { CYCLING_GROUP_CHOICES } from '../constants/cycling';
import { recordActivity } from '../lib/logging/activityLogger';

/**
 * Server Action to submit or update a member's response for the weekend poll.
 */
export async function submitWeekendPollResponseAction(payload: {
  pollId: string;
  memberId: string;
  memberName: string;
  memberPhotoUrl?: string;
  /** Ticked slots; empty means absent this weekend. */
  slots: PollSlot[];
  groupChoice?: CyclingGroupChoice;
  groupVariant?: PollGroupVariant;
  customAnswers?: Record<string, string | string[]>;
  comment?: string;
}) {
  const session = await getSessionUser();
  if (!session) throw new Error('Connectez-vous pour répondre au sondage.');
  if (session.id !== payload.memberId && !(await canAccessSection(session, 'sondages'))) {
    throw new Error('Action non autorisée pour ce membre.');
  }

  const slots = POLL_SLOT_IDS.filter((s) => payload.slots?.includes(s));
  if (!Array.isArray(payload.slots) || slots.length !== payload.slots.length) {
    throw new Error('Créneau inconnu.');
  }
  const groupChoice = payload.groupChoice;
  if (groupChoice !== undefined && !CYCLING_GROUP_CHOICES.includes(groupChoice)) {
    throw new Error('Groupe inconnu.');
  }
  if (slots.length > 0 && !groupChoice) {
    throw new Error('Choisissez votre groupe.');
  }
  // RTDB rejects undefined values: only set what is present.
  const response: Omit<PollResponse, 'id' | 'updatedAt'> = {
    pollId: payload.pollId,
    memberId: payload.memberId,
    memberName: payload.memberName,
    slots,
    ...(payload.memberPhotoUrl ? { memberPhotoUrl: payload.memberPhotoUrl } : {}),
    ...(groupChoice ? { groupChoice } : {}),
    ...(groupChoice === 'Groupe B' && (payload.groupVariant === 'plus' || payload.groupVariant === 'moins')
      ? { groupVariant: payload.groupVariant }
      : {}),
    ...(payload.customAnswers && Object.keys(payload.customAnswers).length > 0
      ? { customAnswers: payload.customAnswers }
      : {}),
    ...(payload.comment?.trim() ? { comment: payload.comment.trim().slice(0, 500) } : {}),
  };

  const result = await submitPollResponse(response);
  if (!result.success) {
    throw new Error(result.error || 'Erreur lors de l’enregistrement du vote.');
  }

  await recordActivity({
    category: 'participation',
    action: 'participation:weekend_poll_answered',
    title: `Réponse au sondage week-end : ${payload.memberName}`,
    severity: 'info',
    user: {
      isAuthenticated: true,
      userId: session.id,
      userName: payload.memberName,
      userEmail: session.email || null,
      role: session.role || ['Member'],
    },
    metadata: {
      pollId: payload.pollId,
      slots,
      groupChoice: groupChoice ?? null,
      groupVariant: response.groupVariant ?? null,
    },
  });

  revalidatePath('/sondage');
  revalidatePath(`/admin/sondages/${payload.pollId}`);
  return { success: true };
}

/**
 * Server Action to delete a member's response from a poll.
 */
export async function deleteWeekendPollResponseAction(pollId: string, memberId: string) {
  const session = await getSessionUser();
  if (!session) throw new Error('Connectez-vous pour modifier votre réponse.');
  // A member deletes only their own answer; the sondages section (admin page) may delete any.
  if (session.id !== memberId && !(await canAccessSection(session, 'sondages'))) {
    throw new Error('Action non autorisée.');
  }

  const result = await deletePollResponse(pollId, memberId);
  if (!result.success) {
    throw new Error(result.error || 'Erreur lors de la suppression.');
  }

  revalidatePath('/sondage');
  revalidatePath(`/admin/sondages/${pollId}`);
  return { success: true };
}

/**
 * Admin Server Action to create a new weekend poll.
 */
export async function createWeekendPollAction(data: Omit<WeekendPoll, 'id' | 'createdAt'>) {
  await requireSectionAccess('sondages');
  const result = await createWeekendPoll(data);
  if (!result.success) {
    throw new Error(result.error || 'Échec de la création du sondage.');
  }
  revalidatePath('/sondage');
  revalidatePath('/admin/sondages');
  return result;
}

/**
 * Admin Server Action to update a weekend poll.
 */
export async function updateWeekendPollAction(id: string, updates: Partial<WeekendPoll>) {
  await requireSectionAccess('sondages');
  const result = await updateWeekendPoll(id, updates);
  if (!result.success) {
    throw new Error(result.error || 'Échec de la mise à jour du sondage.');
  }
  revalidatePath('/sondage');
  revalidatePath('/admin/sondages');
  revalidatePath(`/admin/sondages/${id}`);
  return result;
}

/**
 * Admin Server Action to delete a weekend poll.
 */
export async function deleteWeekendPollAction(id: string) {
  await requireSectionAccess('sondages');
  const result = await deleteWeekendPoll(id);
  if (!result.success) {
    throw new Error(result.error || 'Échec de la suppression du sondage.');
  }
  revalidatePath('/sondage');
  revalidatePath('/admin/sondages');
  return result;
}

/**
 * Server Action to fetch Saturday ride details and precalculated poll suggestions.
 */
export async function getSaturdaySortieInfoAction(isoDate?: string): Promise<SaturdaySortieInfo> {
  await requireSectionAccess('sondages');
  return getSaturdaySortieDetails(isoDate);
}

/**
 * Admin Server Action to manually trigger the automated weekend poll creation workflow.
 */
export async function triggerAutoCreateWeekendPollAction(
  options?: { force?: boolean }
): Promise<AutoCreatePollResult> {
  await requireSectionAccess('sondages');
  const result = await autoCreateUpcomingWeekendPoll(options);
  if (!result.success) {
    throw new Error(result.error || result.message || 'Échec de la génération automatique.');
  }
  revalidatePath('/sondage');
  revalidatePath('/admin/sondages');
  return result;
}
