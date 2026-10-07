'use server';

import { revalidatePath } from 'next/cache';
import { updateMemberPhoto } from '../lib/firebase';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { getSessionUser } from '../lib/auth/session';
import {
  UpdateMemberPhotoSchema,
  validateImageFile,
  safeValidate,
} from '../lib/validation';

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

/**
 * Server Action to retrieve the current logged-in member's full profile details (ICE, Cotisation, Group).
 */
export async function getMemberProfileAction() {
  const session = await getSessionUser();
  if (!session) return null;
  const { getAdminDatabase } = await import('../lib/firebase/admin');
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

  const { getAdminDatabase } = await import('../lib/firebase/admin');
  const db = getAdminDatabase();
  await db.ref(`members/${session.id}`).update({
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath('/profile');
  revalidatePath('/profile/pass');
  return { success: true };
}
