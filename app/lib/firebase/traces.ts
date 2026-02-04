import { unstable_cache } from 'next/cache';
import { Trace } from '../../types';
import {
  isMockMode,
  useNotionFallback,
  getFirebaseDatabase,
  ref,
  get,
  set,
  update,
  remove,
  snapshotToArray,
  snapshotToObject,
} from './client';
import { CreateTraceSchema, safeValidate } from '../validation';

// Notion fallback imports
import {
  getTrace as getNotionTrace,
  getTraces as getNotionTraces,
  getTracesSchema as getNotionTracesSchema,
  createTrace as createNotionTrace,
  updateTrace as updateNotionTrace,
  deleteTrace as deleteNotionTrace,
  submitMapPreview as submitNotionMapPreview,
  createTraceWithGPX as createNotionTraceWithGPX,
  getKomootImage as getNotionKomootImage,
} from '../notion/traces';

// === Cache Revalidation Utilities ===

/**
 * Revalidates the traces cache
 */
export const revalidateTracesCache = async () => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/traces');
};

/**
 * Revalidates a specific trace cache
 */
export const revalidateTraceCache = async (traceId: string) => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/traces/${traceId}`);
  revalidatePath('/traces');
};

// === Helpers ===

export async function getKomootImage(url: string): Promise<string | undefined> {
  if (!url || !url.includes('komoot')) return undefined;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 86400 },
    });
    const html = await res.text();
    const match = html.match(/og:image['"]\s*content=['"]([^'"]+)['"]/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Fetches a single trace by ID (uncached version)
 */
const getTraceUncached = async (id: string): Promise<Trace | null> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionTrace(id);
    }
    return null;
  }

  try {
    let snapshot;
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref(`traces/${id}`).once('value');
    } else {
      const db = getFirebaseDatabase();
      const traceRef = ref(db, `traces/${id}`);
      snapshot = await get(traceRef);
    }

    if (!snapshot.exists()) return null;

    const trace = snapshotToObject<Trace>(snapshot, id);

    // Fetch Komoot image if needed
    if (trace && trace.mapUrl && !trace.photoUrl) {
      const komootImage = await getKomootImage(trace.mapUrl);
      if (komootImage) {
        trace.photoUrl = komootImage;
      }
    }

    return trace;
  } catch (error) {
    console.error('Failed to fetch trace:', error);
    return null;
  }
};

/**
 * Fetches a single trace by ID with caching
 */
export const getTrace = unstable_cache(getTraceUncached, ['trace'], {
  revalidate: 300,
  tags: ['traces'],
});

/**
 * Fetches all traces from Firebase (uncached version)
 */
const getTracesUncached = async (): Promise<Trace[]> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionTraces();
    }
    console.warn('Firebase not configured, falling back to mock.');
    return [
      {
        id: '1',
        name: 'Morning Coffee Loop',
        distance: 45,
        elevation: 300,
        surface: 'Road',
        quality: 5,
        description: 'Easy Sunday ride.',
        mapUrl: 'https://google.com',
      },
    ];
  }

  try {
    let snapshot;
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref('traces').once('value');
    } else {
      const db = getFirebaseDatabase();
      const tracesRef = ref(db, 'traces');
      snapshot = await get(tracesRef);
    }

    const traces = snapshotToArray<Trace>(snapshot);

    // Batch fetch Komoot images for traces without photos
    const komootPromises = traces
      .filter((t) => t.mapUrl && !t.photoUrl && t.mapUrl.includes('komoot'))
      .map(async (t) => {
        const image = await getKomootImage(t.mapUrl!);
        if (image) t.photoUrl = image;
        return t;
      });

    await Promise.allSettled(komootPromises);

    return traces;
  } catch (error) {
    console.error('Failed to fetch traces:', error);
    return [];
  }
};

/**
 * Fetches all traces with caching
 */
export const getTraces = unstable_cache(getTracesUncached, ['traces-list'], {
  revalidate: 300,
  tags: ['traces'],
});

/**
 * Fetches schema info for filtering (select options)
 */
export const getTracesSchema = async () => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode && useNotionFallback) {
    return getNotionTracesSchema();
  }
  // Firebase doesn't have schema like Notion, return static options
  return {
    direction: ['Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest'],
    surface: ['Road', 'Gravel', 'Mixed'],
    start: [],
    rating: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
  };
};

/**
 * Creates a new trace in Firebase
 */
export const createTrace = async (traceData: Partial<Trace> & { photos?: string[] }) => {
  const validation = safeValidate(CreateTraceSchema.partial(), traceData);

  if (!validation.success) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
    };
  }

  const validData = validation.data;

  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return createNotionTrace(traceData);
    }
    console.log('Mock create trace:', validData);
    return { success: true, id: 'mock-new-id' };
  }

  try {
    const db = getFirebaseDatabase();
    const newId = `trace_${Date.now()}`;
    const traceRef = ref(db, `traces/${newId}`);

    // Calculate quality from rating stars
    const ratingStr = validData.rating || '';
    const quality = ratingStr.replace(/[^⭐]/g, '').length || 3;

    const traceRecord: any = {
      name: validData.name || '',
      distance: validData.distance || 0,
      elevation: validData.elevation || 0,
      surface: validData.surface || 'Road',
      quality: quality,
      rating: ratingStr,
      description: validData.description || '',
      mapUrl: validData.mapUrl || '',
      gpxUrl: validData.gpxUrl || '',
      photoUrl: (traceData as any).photoUrl || '',
      photoAlbumUrl: (traceData as any).photoAlbumUrl || '',
      direction: validData.direction || '',
      start: validData.start || '',
      end: validData.end || '',
      polyline: validData.polyline || '',
      createdAt: new Date().toISOString(),
    };

    // Handle photos array
    if ((traceData as any).photos?.length > 0) {
      traceRecord.photoPreviews = (traceData as any).photos;
    }

    await set(traceRef, traceRecord);
    await revalidateTracesCache();

    return { success: true, id: newId };
  } catch (error) {
    console.error('Failed to create trace:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Updates an existing trace in Firebase
 */
export const updateTrace = async (
  traceId: string,
  traceData: {
    name?: string;
    distance?: number;
    elevation?: number;
    direction?: string;
    surface?: string;
    rating?: string;
    description?: string;
    mapUrl?: string;
  }
) => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return updateNotionTrace(traceId, traceData);
    }
    console.log('Mock update trace:', { traceId, traceData });
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    const traceRef = ref(db, `traces/${traceId}`);

    const updates: any = {
      ...traceData,
      updatedAt: new Date().toISOString(),
    };

    // Calculate quality from rating if provided
    if (traceData.rating) {
      updates.quality = traceData.rating.replace(/[^⭐]/g, '').length || 3;
    }

    await update(traceRef, updates);
    await revalidateTraceCache(traceId);

    return { success: true };
  } catch (error) {
    console.error('Failed to update trace:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Deletes a trace from Firebase
 */
export const deleteTrace = async (traceId: string) => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return deleteNotionTrace(traceId);
    }
    console.log('Mock delete trace:', traceId);
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    const traceRef = ref(db, `traces/${traceId}`);
    await remove(traceRef);
    await revalidateTraceCache(traceId);

    return { success: true };
  } catch (error) {
    console.error('Failed to delete trace:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Updates the map preview image for a trace
 */
export const updateTraceMapPreview = async (traceId: string, imageUrl: string) => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      await submitNotionMapPreview(traceId, imageUrl);
      return { success: true };
    }
    console.log('Mock update map preview:', { traceId, imageUrl });
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    const traceRef = ref(db, `traces/${traceId}`);
    await update(traceRef, {
      photoUrl: imageUrl,
      updatedAt: new Date().toISOString(),
    });
    await revalidateTraceCache(traceId);

    return { success: true };
  } catch (error) {
    console.error('Failed to update map preview:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Creates a trace from admin form data
 */
export const createTraceFromAdmin = async (traceData: {
  name: string;
  date: string;
  distance?: number;
  elevation?: number;
  direction?: string;
  start?: string;
  end?: string;
  roadQuality?: string;
  rating?: string;
  status?: string;
  polyline?: string;
}) => {
  if (isMockMode) {
    console.log('Mock admin create trace:', traceData);
    return { success: true, id: 'mock-admin-id' };
  }

  try {
    const db = getFirebaseDatabase();
    const newId = `trace_${Date.now()}`;
    const traceRef = ref(db, `traces/${newId}`);

    const traceRecord = {
      name: traceData.name,
      distance: traceData.distance || 0,
      elevation: traceData.elevation || 0,
      surface: traceData.roadQuality || 'Road',
      quality: traceData.rating ? traceData.rating.replace(/[^⭐]/g, '').length : 3,
      rating: traceData.rating || '',
      description: '',
      mapUrl: '',
      gpxUrl: '',
      photoUrl: '',
      direction: traceData.direction || '',
      start: traceData.start || '',
      end: traceData.end || '',
      polyline: traceData.polyline || '',
      status: traceData.status || 'To Do',
      lastDone: traceData.date,
      createdAt: new Date().toISOString(),
    };

    await set(traceRef, traceRecord);
    await revalidateTracesCache();

    return { success: true, id: newId };
  } catch (error) {
    console.error('Failed to create trace from admin:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Alias for updateTraceMapPreview - for compatibility with Notion API
 */
export const submitMapPreview = async (traceId: string, imageUrl: string): Promise<void> => {
  const result = await updateTraceMapPreview(traceId, imageUrl);
  if (!result.success) {
    throw new Error(result.error || 'Failed to update map preview');
  }
};

/**
 * Creates a trace with complete metadata and optional GPX content
 * GPX content is stored as a string field in Firebase (no block structure needed)
 */
export const createTraceWithGPX = async (
  traceData: {
    name: string;
    date: string;
    distance?: number;
    elevation?: number;
    direction?: string;
    start?: string;
    end?: string;
    komootLink?: string;
    gpxLink?: string;
    photoLink?: string;
    roadQuality?: string;
    rating?: string;
    status?: string;
    note?: string;
  },
  gpxContent?: string
) => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return createNotionTraceWithGPX(traceData, gpxContent);
    }
    console.log('Mock create trace with GPX:', traceData);
    return { success: true, id: 'mock-new-id' };
  }

  try {
    const db = getFirebaseDatabase();
    const newId = `trace_${Date.now()}`;
    const traceRef = ref(db, `traces/${newId}`);

    const traceRecord: any = {
      name: traceData.name,
      distance: traceData.distance || 0,
      elevation: traceData.elevation || 0,
      surface: traceData.roadQuality || 'Road',
      quality: traceData.rating ? traceData.rating.replace(/[^⭐]/g, '').length : 3,
      rating: traceData.rating || '',
      description: traceData.note || '',
      mapUrl: traceData.komootLink || '',
      gpxUrl: traceData.gpxLink || '',
      photoUrl: traceData.photoLink || '',
      direction: traceData.direction || '',
      start: traceData.start || '',
      end: traceData.end || '',
      status: traceData.status || 'To Do',
      lastDone: traceData.date,
      createdAt: new Date().toISOString(),
    };

    // Store GPX content directly (Firebase has no 2000 char block limit like Notion)
    if (gpxContent) {
      traceRecord.gpxContent = gpxContent;
    }

    await set(traceRef, traceRecord);
    await revalidateTracesCache();

    return { success: true, id: newId };
  } catch (error) {
    console.error('Failed to create trace with GPX:', error);
    return { success: false, error: String(error) };
  }
};
