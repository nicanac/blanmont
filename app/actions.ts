'use server'

import { submitMapPreview, createRide, submitVote } from './lib/notion';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Server Action to manually upload a map preview image URL for a trace.
 * Revalidates the traces paths upon success.
 * 
 * @param formData - FormData containing 'traceId' and 'imageUrl'.
 */
export async function uploadMapPreview(formData: FormData) {
  'use server'
  
  const traceId = formData.get('traceId') as string;
  const imageUrl = formData.get('imageUrl') as string;

  if (!traceId || !imageUrl) {
    throw new Error('Missing trace ID or image URL');
  }

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
  'use server'
  
  const traceId = formData.get('traceId') as string;
  if (!traceId) throw new Error('Missing trace ID');

  try {
      // 1. Fetch the trace to get the Komoot URL
      const { getTrace, getKomootImage, submitMapPreview } = await import('./lib/notion');
      const trace = await getTrace(traceId);
      
      if (!trace || !trace.mapUrl) {
          throw new Error('Trace not found or missing Komoot URL');
      }

      // 2. Scrape the image
      const imageUrl = await getKomootImage(trace.mapUrl);
      if (!imageUrl) {
          throw new Error('Could not find OG Image in Komoot URL');
      }

      // 3. Save to Notion
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
    if (!date || traceIds.length === 0) throw new Error('Invalid input');
    
    await createRide(date, traceIds);
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
    if (!rideId || !memberId || !traceId) throw new Error('Invalid input');

    await submitVote(rideId, memberId, traceId);
    revalidatePath('/saturday-ride');
}

import { validateUser } from './lib/notion';

/**
 * Server Action to validate user credentials.
 * 
 * @param email - The email.
 * @param password - The password.
 * @returns The Member object if valid, or null.
 */
export async function loginAction(email: string, password: string) {
  if (!email || !password) return null;
  return await validateUser(email, password);
}

import { updateMemberPhoto } from './lib/notion';

/**
 * Server Action to update a member's profile photo.
 * 
 * @param memberId - The member ID.
 * @param photoUrl - The new photo URL.
 */
export async function updateProfilePhotoAction(memberId: string, photoUrl: string) {
    if (!memberId || !photoUrl) throw new Error('Invalid input');
    
    await updateMemberPhoto(memberId, photoUrl);
    revalidatePath('/profile');
}
