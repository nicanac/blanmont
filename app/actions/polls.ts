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
import { requireAdminSession, getSessionUser } from '../lib/auth/session';
import type { WeekendPoll, PollDayChoice, CyclingGroupChoice } from '../types';
import { recordActivity } from '../lib/logging/activityLogger';

/**
 * Server Action to submit or update a member's response for the weekend poll.
 */
export async function submitWeekendPollResponseAction(payload: {
  pollId: string;
  memberId: string;
  memberName: string;
  memberPhotoUrl?: string;
  dayChoice: PollDayChoice;
  groupChoice: CyclingGroupChoice;
  customAnswers?: Record<string, string | string[]>;
  comment?: string;
}) {
  const session = await getSessionUser();
  if (session && session.id !== payload.memberId && !session.isAdmin) {
    throw new Error('Action non autorisée pour ce membre.');
  }

  const result = await submitPollResponse(payload);
  if (!result.success) {
    throw new Error(result.error || 'Erreur lors de l’enregistrement du vote.');
  }

  await recordActivity({
    category: 'participation',
    action: 'participation:weekend_poll_answered',
    title: `Réponse au sondage week-end : ${payload.memberName}`,
    severity: 'info',
    user: {
      isAuthenticated: Boolean(session),
      userId: session?.id || payload.memberId,
      userName: payload.memberName,
      userEmail: session?.email || null,
      role: session?.role || ['Member'],
    },
    metadata: {
      pollId: payload.pollId,
      dayChoice: payload.dayChoice,
      groupChoice: payload.groupChoice,
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
  if (session && session.id !== memberId && !session.isAdmin) {
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
  await requireAdminSession();
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
  await requireAdminSession();
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
  await requireAdminSession();
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
  await requireAdminSession();
  return getSaturdaySortieDetails(isoDate);
}

/**
 * Admin Server Action to manually trigger the automated weekend poll creation workflow.
 */
export async function triggerAutoCreateWeekendPollAction(
  options?: { force?: boolean }
): Promise<AutoCreatePollResult> {
  await requireAdminSession();
  const result = await autoCreateUpcomingWeekendPoll(options);
  if (!result.success) {
    throw new Error(result.error || result.message || 'Échec de la génération automatique.');
  }
  revalidatePath('/sondage');
  revalidatePath('/admin/sondages');
  return result;
}
