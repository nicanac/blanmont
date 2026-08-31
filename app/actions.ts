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
  UpdateMemberPhotoSchema,
  safeValidate,
  validateFormData,
  type ValidationResult,
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
  if (session && session.id !== memberId && !session.isAdmin) {
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
import { WeekendPoll, PollResponse, PollDayChoice, CyclingGroupChoice } from './types';

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

import { updateMemberPhoto } from './lib/firebase';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const session = await getSessionUser();
    if (session && session.id !== targetMemberId && !session.isAdmin) {
      throw new Error('Action non autorisée pour ce profil.');
    }

    // Verify Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error('Cloudinary not configured');
    }

    // Convert File to base64 data URI for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profiles',
      public_id: `profile-${targetMemberId}`,
      resource_type: 'auto',
      overwrite: true,
      transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
    });

    finalPhotoUrl = result.secure_url;
  }
  // Handle string URL (Legacy/Direct URL)
  else if (typeof input === 'string') {
    finalPhotoUrl = input;
    if (!targetMemberId) throw new Error('Member ID required for URL update');
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
