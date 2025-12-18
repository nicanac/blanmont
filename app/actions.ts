'use server'

import { submitMapPreview, createRide, submitVote } from './lib/notion';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

export async function createRideAction(date: string, traceIds: string[]) {
    if (!date || traceIds.length === 0) throw new Error('Invalid input');
    
    await createRide(date, traceIds);
    revalidatePath('/saturday-ride');
}

export async function submitVoteAction(rideId: string, memberId: string, traceId: string) {
    if (!rideId || !memberId || !traceId) throw new Error('Invalid input');

    await submitVote(rideId, memberId, traceId);
    revalidatePath('/saturday-ride');
}
