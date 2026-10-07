'use server';

import { submitMapPreview, createRide, submitVote } from './lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  UploadMapPreviewSchema,
  GenerateMapPreviewSchema,
  CreateRideSchema,
  SubmitVoteSchema,
  LoginSchema,
  AccountActivationSchema,
  UpdateMemberPhotoSchema,
  WeekendPollResponseSchema,
  MemberEmergencyUpdateSchema,
  safeValidate,
  validateFormData,
  validateImageFile,
} from './lib/validation';
import { requireAdminSession, getSessionUser } from './lib/auth/session';

/**
 * Server Action to manually upload a map preview image URL for a trace.
 * Revalidates the traces paths upon success.
 *
 * @param formData - FormData containing 'traceId' and 'imageUrl'.
 */
export async function uploadMapPreview(formData: FormData) {
  'use server';

  await requireAdminSession();
  const validation = validateFormData(formData, UploadMapPreviewSchema);

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  const { traceId, imageUrl } = validation.data;

  try {
    // We update the Notion page property 'map-preview' with the external URL
    // Note: Notion API allows updating 'files' property with external URLs
    await submitMapPreview(traceId, imageUrl);
    revalidatePath(`/traces/${traceId}`);
    revalidatePath('/traces');
  } catch (error) {
    console.error('Failed to update map preview:', error);
    throw error;
  }

  redirect(`/traces/${traceId}`);
}

/**
 * Server Action to automatically scrape and generate a map preview from the trace's Komoot URL.
 *
 * @param formData - FormData containing 'traceId'.
 */
export async function generateMapPreview(formData: FormData) {
  'use server';

  await requireAdminSession();
  const validation = validateFormData(formData, GenerateMapPreviewSchema);

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  const { traceId } = validation.data;

  try {
    // 1. Fetch the trace to get the Komoot URL
    const { getTrace, getKomootImage, submitMapPreview } = await import('./lib/firebase');
    const trace = await getTrace(traceId);

    if (!trace || !trace.mapUrl) {
      throw new Error('Trace not found or missing Komoot URL');
    }

    // 2. Scrape the image
    const imageUrl = await getKomootImage(trace.mapUrl);
    if (!imageUrl) {
      throw new Error('Could not find OG Image in Komoot URL');
    }

    // 3. Save to Firebase
    await submitMapPreview(traceId, imageUrl);

    revalidatePath(`/traces/${traceId}`);
    revalidatePath('/traces');
  } catch (error) {
    console.error('Failed to auto-generate map preview:', error);
    throw error;
  }

  redirect(`/traces/${traceId}`);
}

/**
 * Server Action to propose a new Saturday Ride.
 *
 * @param date - The date of the ride.
 * @param traceIds - The list of candidate traces.
 */
export async function createRideAction(date: string, traceIds: string[]) {
  await requireAdminSession();
  const validation = safeValidate(CreateRideSchema, { date, traceIds });

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  await createRide(validation.data.date, validation.data.traceIds);
  revalidatePath('/saturday-ride');
}

/**
 * Server Action to submit a member's vote for a ride.
 *
 * @param rideId - The ride ID.
 * @param memberId - The member ID.
 * @param traceId - The selected trace ID.
 */
export async function submitVoteAction(rideId: string, memberId: string, traceId: string) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Vous devez être connecté pour voter.');
  }
  if (session.id !== memberId && !session.isAdmin) {
    throw new Error('Action non autorisée pour ce membre.');
  }

  const validation = safeValidate(SubmitVoteSchema, { rideId, memberId, traceId });

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  await submitVote(validation.data.rideId, validation.data.memberId, validation.data.traceId);
  revalidatePath('/saturday-ride');
}

import {
  submitPollResponse,
  deletePollResponse,
  createWeekendPoll,
  updateWeekendPoll,
  deleteWeekendPoll,
} from './lib/firebase/polls';
import { WeekendPoll, PollDayChoice, CyclingGroupChoice } from './types';

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
  if (!session) {
    throw new Error('Vous devez être connecté pour répondre au sondage.');
  }

  const validation = safeValidate(WeekendPollResponseSchema, payload);
  if (!validation.success) {
    throw new Error(
      `Validation échouée : ${validation.errors.map((error) => error.message).join(', ')}`
    );
  }

  const response = validation.data.memberId === session.id
    ? {
        ...validation.data,
        memberName: session.name,
        memberPhotoUrl: session.photoUrl || validation.data.memberPhotoUrl,
      }
    : validation.data;

  if (session.id !== response.memberId && !session.isAdmin) {
    throw new Error('Action non autorisée pour ce membre.');
  }

  const result = await submitPollResponse(response);
  if (!result.success) {
    throw new Error(result.error || 'Erreur lors de l’enregistrement du vote.');
  }

  revalidatePath('/sondage');
  revalidatePath(`/admin/sondages/${response.pollId}`);
  return { success: true };
}

/**
 * Server Action to delete a member's response from a poll.
 */
export async function deleteWeekendPollResponseAction(pollId: string, memberId: string) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Vous devez être connecté.');
  }
  if (session.id !== memberId && !session.isAdmin) {
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

import { getSaturdaySortieDetails, type SaturdaySortieInfo } from './lib/sondage-helpers';
import { autoCreateUpcomingWeekendPoll, type AutoCreatePollResult } from './lib/sondage-automation';

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

import { validateUser } from './lib/firebase';
import { setSessionCookie, clearSessionCookie, type SessionUser } from './lib/auth/session';

/**
 * Server Action to validate user credentials and establish an HttpOnly session cookie.
 *
 * @param email - The email.
 * @param password - The password.
 * @returns The Member object if valid, or null.
 */
export async function loginAction(email: string, password: string) {
  const validation = safeValidate(LoginSchema, { email, password });

  if (!validation.success) {
    return null;
  }

  const member = await validateUser(validation.data.email, validation.data.password);
  if (member) {
    await setSessionCookie(member);
  }
  return member;
}

/**
 * Server Action to logout and clear the HttpOnly session cookie.
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
}

/**
 * Server Action to fetch the current authenticated session user from HttpOnly cookie.
 */
export async function getCurrentSessionUserAction(): Promise<SessionUser | null> {
  return await getSessionUser();
}

import { getAdminAuth, getAdminDatabase } from './lib/firebase/admin';

/**
 * Prepares a member account for Firebase's email-based password reset without
 * returning a reset code to the browser.
 */
export async function requestAccountActivationAction(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  const validation = safeValidate(AccountActivationSchema, { email });
  const successMessage =
    'Si cette adresse correspond à un membre inscrit, un courriel de réinitialisation va être envoyé. Pour un premier accès, contactez un administrateur.';

  if (!validation.success) {
    return { success: false, message: validation.errors.map(e => e.message).join(', ') };
  }

  const normalizedEmail = validation.data.email.trim().toLowerCase();

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDatabase();

    const membersSnap = await adminDb.ref('members').once('value');
    const memberMatch: {
      key: string | null;
      data: { email?: unknown; name?: unknown; authUid?: unknown } | null;
    } = { key: null, data: null };

    if (membersSnap.exists()) {
      membersSnap.forEach((child) => {
        const value = child.val() as { email?: unknown; name?: unknown; authUid?: unknown };
        if (
          typeof value.email === 'string' &&
          value.email.trim().toLowerCase() === normalizedEmail
        ) {
          memberMatch.key = child.key;
          memberMatch.data = value;
        }
      });
    }

    const { key: memberKey, data: memberData } = memberMatch;
    if (!memberKey || !memberData) {
      return { success: true, message: successMessage };
    }

    let userRecord: { uid: string };
    try {
      userRecord = await adminAuth.getUserByEmail(normalizedEmail);
    } catch (error: unknown) {
      const authError = error as { code?: string; message?: string };
      if (
        authError.code === 'auth/user-not-found' ||
        authError.message?.includes('user-not-found')
      ) {
        userRecord = await adminAuth.createUser({
          email: normalizedEmail,
          displayName:
            typeof memberData.name === 'string' && memberData.name
              ? memberData.name
              : normalizedEmail.split('@')[0],
          emailVerified: false,
        });
      } else {
        throw error;
      }
    }

    if (userRecord.uid && memberData.authUid !== userRecord.uid) {
      await adminDb.ref(`members/${memberKey}`).update({
        authUid: userRecord.uid,
      });
      revalidatePath('/admin/members');
    }

    return { success: true, message: successMessage };
  } catch (error: unknown) {
    console.error('Failed to process account activation:', error);
    return {
      success: false,
      message: 'Impossible de préparer la réinitialisation. Veuillez réessayer plus tard.',
    };
  }
}

import { updateMemberPhoto } from './lib/firebase';
import { uploadImageToCloudinary } from './lib/cloudinary';

/**
 * Server Action to update a member's profile photo.
 * Accepts either a raw URL (string) or a File object (via FormData).
 *
 * @param input - FormData or plain string URL.
 */
export async function updateProfilePhotoAction(input: string | FormData, memberId?: string) {
  let finalPhotoUrl = '';
  let targetMemberId = memberId;

  // Handle FormData (File Upload)
  if (input instanceof FormData) {
    const file = input.get('file') as File;
    targetMemberId = input.get('memberId') as string;

    if (!file || !targetMemberId) throw new Error('Invalid input');

    const imageValidation = validateImageFile(file);
    if (!imageValidation.success) {
      throw new Error(imageValidation.error.issues.map(e => e.message).join(', '));
    }

    const session = await getSessionUser();
    if (session && session.id !== targetMemberId && !session.isAdmin) {
      throw new Error('Action non autorisée pour ce profil.');
    }

    const result = await uploadImageToCloudinary(file, {
      folder: 'profiles',
      publicId: `profile-${targetMemberId}`,
      resourceType: 'auto',
      overwrite: true,
      transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
    });

    finalPhotoUrl = result.secure_url;
  }
  // Handle string URL (Legacy/Direct URL)
  else if (typeof input === 'string') {
    if (!targetMemberId) {
      throw new Error('Member ID required for URL update');
    }
    finalPhotoUrl = input;
  }

  // Validate the final result
  const validation = safeValidate(UpdateMemberPhotoSchema, {
    memberId: targetMemberId,
    photoUrl: finalPhotoUrl,
  });

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  await updateMemberPhoto(validation.data.memberId, validation.data.photoUrl);
  revalidatePath('/profile');
  return finalPhotoUrl;
}

import {
  submitEventReview,
  deleteEventReview,
} from './lib/firebase/event-reviews';
import { SubmitEventReviewSchema } from './lib/validation';
import type { EventReview } from './types';

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

/**
 * Server Action to retrieve the current logged-in member's full profile details (ICE, Cotisation, Group).
 */
export async function getMemberProfileAction() {
  const session = await getSessionUser();
  if (!session) return null;
  const { getAdminDatabase } = await import('./lib/firebase/admin');
  const db = getAdminDatabase();
  const snapshot = await db.ref(`members/${session.id}`).once('value');
  if (!snapshot.exists()) return null;
  return { id: session.id, ...snapshot.val() };
}

/**
 * Server Action for a logged-in member to update their own emergency contact (ICE) and phone.
 */
export async function updateMemberEmergencyAction(payload: {
  iceContactName?: string;
  iceContactPhone?: string;
  iceRelationship?: string;
  preferredGroup?: 'A' | 'B' | 'C' | 'VTT';
  phone?: string;
  ffbcLicenseNumber?: string;
}) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Vous devez être connecté.');
  }

  const validation = safeValidate(MemberEmergencyUpdateSchema, payload);
  if (!validation.success) {
    throw new Error(
      `Validation échouée : ${validation.errors.map((error) => error.message).join(', ')}`
    );
  }

  const { getAdminDatabase } = await import('./lib/firebase/admin');
  const db = getAdminDatabase();
  await db.ref(`members/${session.id}`).update({
    ...validation.data,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath('/profile');
  revalidatePath('/profile/pass');
  return { success: true };
}
