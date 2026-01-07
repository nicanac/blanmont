import { unstable_cache } from 'next/cache';
import { Trace, NotionPage } from '../../types';
import { isMockMode, TRACES_DB_ID, cleanId, notionRequest } from './client';

// === Cache Revalidation Utilities ===

/**
 * Revalidates the traces cache
 * Note: This should be called from Server Actions or Route Handlers
 */
export const revalidateTracesCache = async () => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/traces');
};

/**
 * Revalidates a specific trace cache
 * @param traceId - The trace ID to revalidate
 */
export const revalidateTraceCache = async (traceId: string) => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/traces/${traceId}`);
  revalidatePath('/traces');
};

// === Helpers ===

export async function getKomootImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const html = await res.text();
    const match = html.match(/<meta property="og:image"\s+content="([^"]+)"/);
    if (!match) return undefined;
    return match[1].replace(/&amp;/g, '&');
  } catch (err) {
    console.error('Failed to scrape Komoot image:', err);
    return undefined;
  }
}

async function scrapeGooglePhotos(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+/g;
    const matches = html.match(regex);
    if (!matches) return [];
    
    return [...new Set(matches)].slice(0, 5).map(u => `${u}=w600-h400-c`);
  } catch (e) {
    console.warn('Failed to scrape photos:', e);
    return [];
  }
}

/**
 * Maps a Notion page to a Trace object without fetching external photos
 * @param page - The Notion page to map
 * @param komootImageUrl - Pre-fetched Komoot image URL (optional)
 * @returns A Trace object
 */
const mapPageToTrace = async (page: NotionPage, komootImageUrl?: string): Promise<Trace> => {
  const props = page.properties;
  
  const kmFormula = props.km?.formula;
  const dist = props.Distance?.number || parseFloat(kmFormula?.string || kmFormula?.number || '0');
  
  const ratingSelect = props.Rating?.select;
  const ratingStr = ratingSelect?.name || '';
  const ratingColor = ratingSelect?.color || 'default';
  const quality = ratingStr.replace(/[^⭐]/g, '').length || 3;

  const photoAlbumUrl = props.photo?.url || undefined;
  const photoFiles = props.photo?.files || [];
  let photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : undefined;

  const mapPreviewFiles = props['map-preview']?.files || [];
  if (mapPreviewFiles.length > 0) {
      photoUrl = mapPreviewFiles[0].file?.url || mapPreviewFiles[0].external?.url;
  } else if (komootImageUrl) {
      photoUrl = komootImageUrl;
  }

  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text || 'Untitled Trace',
    distance: dist,
    elevation: props.Elevation?.number || props.elevation?.number || props['D+']?.number || undefined, 
    surface: props.road?.select?.name || 'Road',
    quality: quality,
    ratingColor: ratingColor,
    description: props.Note?.rich_text?.[0]?.plain_text || '',
    mapUrl: props.Komoot?.url || undefined,
    gpxUrl: props.Gpx?.url || undefined,
    photoUrl: photoUrl,
    photoAlbumUrl: photoAlbumUrl,
    start: props.start?.select?.name,
    end: props.end?.select?.name,
    direction: props.Direction?.select?.name || props.Direction?.rich_text?.[0]?.plain_text || undefined,
    polyline: props.MapPolyline?.rich_text?.map((t: any) => t.plain_text).join('') || undefined
  };
};

const chunkString = (str: string, length: number) => {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
};

const ensureDistanceProperty = async () => {
    if (isMockMode || !TRACES_DB_ID) return;
    const dbId = cleanId(TRACES_DB_ID);
    try {
        await notionRequest(`databases/${dbId}`, 'PATCH', {
            properties: { 'Distance': { number: { format: 'number' } } }
        });
    } catch (e) {
        console.error('Failed to ensure Distance property:', e);
    }
};

const ensureMapPolylineProperty = async () => {
    if (isMockMode || !TRACES_DB_ID) return;
    const dbId = cleanId(TRACES_DB_ID);
    try {
        await notionRequest(`databases/${dbId}`, 'PATCH', {
            properties: { 'MapPolyline': { rich_text: {} } }
        });
    } catch (e) {
        console.error('Failed to ensure MapPolyline property:', e);
    }
};

// === Exports ===

/**
 * Fetches a single trace by ID (uncached version)
 * @param id - The trace ID
 * @returns Trace object or null
 */
const getTraceUncached = async (id: string): Promise<Trace | null> => {
    if (isMockMode) return null;
    try {
        const page = await notionRequest(`pages/${id}`, 'GET');
        
        // Check if we need to fetch Komoot image
        const props = page.properties;
        const mapPreviewFiles = props['map-preview']?.files || [];
        const photoFiles = props.photo?.files || [];
        const hasExistingPhoto = mapPreviewFiles.length > 0 || photoFiles.length > 0;
        
        let komootImage: string | undefined;
        if (!hasExistingPhoto) {
          const mapUrl = props.Komoot?.url;
          if (mapUrl && mapUrl.includes('komoot')) {
            komootImage = await getKomootImage(mapUrl);
          }
        }
        
        const trace = await mapPageToTrace(page, komootImage);
        
        if (trace.photoAlbumUrl) {
            trace.photoPreviews = await scrapeGooglePhotos(trace.photoAlbumUrl);
        }
        
        return trace;
    } catch (e) {
        console.error('Failed to fetch trace:', e);
        return null;
    }
};

/**
 * Fetches a single trace by ID with caching
 * @param id - The trace ID
 * @returns Trace object or null
 */
export const getTrace = (id: string): Promise<Trace | null> => {
  return unstable_cache(
    () => getTraceUncached(id),
    [`trace-${id}`],
    { 
      revalidate: 300, // 5 minutes cache
      tags: ['traces', `trace-${id}`] 
    }
  )();
};

/**
 * Batch fetches Komoot images for multiple URLs to avoid N+1 queries
 * @param urls - Array of Komoot URLs to scrape
 * @returns Map of URL to scraped image URL
 */
const batchFetchKomootImages = async (urls: string[]): Promise<Map<string, string>> => {
  const results = new Map<string, string>();
  
  // Fetch all images in parallel with limit to avoid overwhelming the server
  const BATCH_SIZE = 10;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (url) => {
        const image = await getKomootImage(url);
        return { url, image };
      })
    );
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.image) {
        results.set(result.value.url, result.value.image);
      }
    });
  }
  
  return results;
};

/**
 * Fetches all traces from the Notion database (uncached version)
 * @returns Array of Trace objects
 */
const getTracesUncached = async (): Promise<Trace[]> => {
  if (isMockMode || !TRACES_DB_ID) {
    if (!isMockMode) console.warn('Missing NOTION_TRACES_DB_ID, falling back to mock.');
    return [
      { id: '1', name: 'Morning Coffee Loop', distance: 45, elevation: 300, surface: 'Road', quality: 5, description: 'Easy Sunday ride.', mapUrl: 'https://google.com' },
    ];
  }

  try {
    const dbId = cleanId(TRACES_DB_ID);
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response: any = await notionRequest(`databases/${dbId}/query`, 'POST', {
            sorts: [{ property: 'Name', direction: 'ascending' }],
            page_size: 100,
            start_cursor: startCursor
        });
        
        allResults = [...allResults, ...response.results];
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    // Batch fetch Komoot images to avoid N+1 queries
    const komootUrls: string[] = [];
    const komootUrlToPageIndex = new Map<string, number>();
    
    allResults.forEach((page, index) => {
      const props = page.properties;
      const mapPreviewFiles = props['map-preview']?.files || [];
      const photoFiles = props.photo?.files || [];
      const hasExistingPhoto = mapPreviewFiles.length > 0 || photoFiles.length > 0;
      
      if (!hasExistingPhoto) {
        const mapUrl = props.Komoot?.url;
        if (mapUrl && mapUrl.includes('komoot')) {
          komootUrls.push(mapUrl);
          komootUrlToPageIndex.set(mapUrl, index);
        }
      }
    });
    
    const komootImages = await batchFetchKomootImages(komootUrls);
    
    // Map pages to traces with pre-fetched images
    const traces = await Promise.all(
      allResults.map((page, index) => {
        const mapUrl = page.properties.Komoot?.url;
        const komootImage = mapUrl ? komootImages.get(mapUrl) : undefined;
        return mapPageToTrace(page, komootImage);
      })
    );
    
    return traces;
  } catch (error) {
    console.error('Failed to fetch traces:', error);
    return [];
  }
};

/**
 * Fetches all traces from the Notion database with caching
 * @returns Array of Trace objects
 */
export const getTraces = unstable_cache(
  getTracesUncached,
  ['traces-list'],
  { 
    revalidate: 300, // 5 minutes cache
    tags: ['traces'] 
  }
);

/**
 * Creates a new trace in the Notion database
 * Automatically revalidates the traces cache
 * @param traceData - The trace data to create
 * @returns Success status and trace ID
 */
export const createTrace = async (traceData: Partial<Trace> & { photos?: string[] }) => {
    if (isMockMode || !TRACES_DB_ID) {
        console.log('Mock create trace:', traceData);
        return { success: true, id: 'mock-new-id' };
    }

    try {
        await ensureDistanceProperty();
        await ensureMapPolylineProperty();

        const dbId = cleanId(TRACES_DB_ID);
        const properties: any = {
            Name: { title: [{ text: { content: traceData.name || 'Untitled Import' } }] },
            Note: { rich_text: [{ text: { content: traceData.description || 'Imported from Strava' } }] },
            Komoot: { url: traceData.mapUrl || null },
            Elevation: { number: traceData.elevation || 0 },
            Distance: { number: traceData.distance || 0 }
        };

        if (traceData.polyline) {
            const chunks = chunkString(traceData.polyline, 2000) || [];
            properties.MapPolyline = {
                rich_text: chunks.map(chunk => ({
                    text: { content: chunk }
                }))
            };
        }

        if (traceData.direction) {
            properties.Direction = { select: { name: traceData.direction } };
        }

        if (traceData.photos && traceData.photos.length > 0) {
            properties.photo = { url: traceData.photos[0] };
        }

        const children = [];
        if (traceData.description) {
            children.push({
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: traceData.description } }] }
            });
        }
        if (traceData.photos) {
            traceData.photos.forEach(url => {
                children.push({
                    object: 'block', type: 'image', image: { type: 'external', external: { url } }
                });
            });
        }

        const response = await notionRequest('pages', 'POST', {
            parent: { database_id: dbId },
            properties: properties,
            children: children
        });

        // Revalidate traces cache after creation
        await revalidateTracesCache();

        return { success: true, id: response.id as string };
    } catch (e) {
        console.error('Failed to create trace:', e);
        return { success: false, error: String(e) };
    }
};

/**
 * Deletes (archives) a trace in the Notion database
 * Automatically revalidates the traces cache
 * @param traceId - The trace ID to delete
 * @returns Success status
 */
export const deleteTrace = async (traceId: string) => {
    if (isMockMode) {
        console.log('Mock delete trace:', traceId);
        return { success: true };
    }
    
    try {
        await notionRequest(`pages/${traceId}`, 'PATCH', {
            archived: true
        });
        
        // Revalidate traces cache after deletion
        await revalidateTraceCache(traceId);
        
        return { success: true };
    } catch (e) {
        console.error('Failed to delete trace:', e);
        return { success: false, error: String(e) };
    }
};

/**
 * Updates the map preview for a trace in the Notion database
 * Automatically revalidates the trace cache
 * @param traceId - The trace ID
 * @param imageUrl - The preview image URL
 */
export const submitMapPreview = async (traceId: string, imageUrl: string) => {
    if (isMockMode) {
      console.log('Mock map preview update:', { traceId, imageUrl });
      return;
    }

    try {
      await notionRequest(`pages/${traceId}`, 'PATCH', {
        properties: {
          "map-preview": {
            files: [
              {
                name: "preview.jpg",
                type: "external",
                external: { url: imageUrl }
              }
            ]
          }
        }
      });
      
      // Revalidate trace cache after update
      await revalidateTraceCache(traceId);
    } catch (error) {
       console.error('Failed to update map preview in Notion:', error);
       throw error;
    }
};

export const getTracesSchema = async () => {
    if (isMockMode || !TRACES_DB_ID) return null;
    try {
        const dbId = cleanId(TRACES_DB_ID);
        const response = await notionRequest(`databases/${dbId}`, 'GET');
        return response.properties;
    } catch (e) {
        console.error('Failed to get schema:', e);
        return null;
    }
};
