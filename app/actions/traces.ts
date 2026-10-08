'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { submitMapPreview } from '../lib/firebase';
import {
  UploadMapPreviewSchema,
  GenerateMapPreviewSchema,
  validateFormData,
} from '../lib/validation';
import { requireAdminSession } from '../lib/auth/session';

/**
 * Server Action to manually upload a map preview image URL for a trace.
 * Revalidates the traces paths upon success.
 *
 * @param formData - FormData containing 'traceId' and 'imageUrl'.
 */
export async function uploadMapPreview(formData: FormData) {
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
    const { getTrace, getKomootImage, submitMapPreview } = await import('../lib/firebase');
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
