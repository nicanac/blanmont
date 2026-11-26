import { revalidatePath } from 'next/cache';
import {
  getWeekendPollByDate,
  getAllWeekendPolls,
  createWeekendPoll,
  updateWeekendPoll,
} from './firebase/polls';
import { getUpcomingSaturdayIso, getSaturdaySortieDetails, SaturdaySortieInfo } from './sondage-helpers';
import { WeekendPoll } from '../types';

export interface AutoCreatePollOptions {
  force?: boolean;
  targetDate?: string;
}

export interface AutoCreatePollResult {
  success: boolean;
  created: boolean;
  alreadyExisted?: boolean;
  pollId?: string;
  weekendIsoDate: string;
  title?: string;
  message: string;
  sortieFound?: boolean;
  sortieLocation?: string;
  distanceOptionsCount?: number;
  closedPreviousPollsCount?: number;
  error?: string;
}

/**
 * Automatically creates the weekend poll for the upcoming Saturday based on
 * calendar ride information and GPX traces.
 *
 * Safe & Idempotent:
 * - Does not overwrite or recreate if a poll already exists for that weekend (unless force=true).
 * - Automatically archives / closes past active polls so only the new poll remains open for votes.
 * - No distance question: the group a member picks decides the route.
 */
export async function autoCreateUpcomingWeekendPoll(
  options?: AutoCreatePollOptions
): Promise<AutoCreatePollResult> {
  const targetSaturdayIso = options?.targetDate || getUpcomingSaturdayIso();

  try {
    // 1. Check if a poll already exists for this weekend
    const existingPoll = await getWeekendPollByDate(targetSaturdayIso);
    if (existingPoll && !options?.force) {
      return {
        success: true,
        created: false,
        alreadyExisted: true,
        pollId: existingPoll.id,
        weekendIsoDate: targetSaturdayIso,
        title: existingPoll.title,
        message: `Un sondage existe déjà pour le weekend du ${targetSaturdayIso}.`,
      };
    }

    // 2. Retrieve upcoming Saturday ride info (calendar + traces)
    const sortieInfo: SaturdaySortieInfo = await getSaturdaySortieDetails(targetSaturdayIso);

    // 3. No distance question any more: the chosen group decides the route (2026-11).

    // 4. Close any older polls that are still marked 'active'
    let closedPreviousPollsCount = 0;
    try {
      const allPolls = await getAllWeekendPolls();
      const olderActivePolls = allPolls.filter(
        (p) => p.status === 'active' && p.weekendIsoDate < targetSaturdayIso
      );

      for (const oldPoll of olderActivePolls) {
        await updateWeekendPoll(oldPoll.id, { status: 'closed' });
        closedPreviousPollsCount++;
      }
    } catch (archiveErr) {
      console.warn('Could not archive previous active polls:', archiveErr);
    }

    // 5. Build poll payload
    const pollData: Omit<WeekendPoll, 'id' | 'createdAt'> = {
      title: sortieInfo.suggestedTitle || `Sortie du Weekend - ${targetSaturdayIso}`,
      weekendIsoDate: targetSaturdayIso,
      description:
        sortieInfo.suggestedDescription ||
        'Indiquez vos disponibilités et votre groupe de niveau pour les sorties de ce weekend !',
      status: 'active',
    };

    // 6. Persist to Firebase
    const createResult = await createWeekendPoll(pollData);
    if (!createResult.success || !createResult.id) {
      throw new Error(createResult.error || 'Échec de la création du sondage.');
    }

    // 7. Revalidate Next.js cache
    try {
      revalidatePath('/sondage');
      revalidatePath('/admin/sondages');
    } catch {
      // Ignore when called outside of a Next.js request context (e.g. testing)
    }

    return {
      success: true,
      created: true,
      alreadyExisted: false,
      pollId: createResult.id,
      weekendIsoDate: targetSaturdayIso,
      title: pollData.title,
      sortieFound: sortieInfo.found,
      sortieLocation: sortieInfo.location,
      distanceOptionsCount: sortieInfo.distanceOptions.length,
      closedPreviousPollsCount,
      message: `Sondage du weekend du ${targetSaturdayIso} créé avec succès !`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to auto-create weekend poll:', error);
    return {
      success: false,
      created: false,
      weekendIsoDate: targetSaturdayIso,
      message: `Erreur lors de la création automatique : ${errorMsg}`,
      error: errorMsg,
    };
  }
}
