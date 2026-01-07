'use server';

import { cookies } from 'next/headers';
import { getStravaActivity, getActivityStreams, getStravaActivityPhotos } from '../../lib/strava';
import { createTrace, getTracesSchema, deleteTrace } from '../../lib/notion';
import {
  FetchStravaActivitySchema,
  ImportStravaTraceSchema,
  safeValidate,
} from '../../lib/validation';
import toGeoJSON from '@tmcw/togeojson';
import { logger } from '../../lib/logger';

import fs from 'fs';
import path from 'path';

export async function validateSchemaAction() {
    const schema = await getTracesSchema();
    if (schema) {
        try {
            const dumpPath = path.join(process.cwd(), 'public', 'schema_dump.json');
            fs.writeFileSync(dumpPath, JSON.stringify(schema, null, 2));
            return { success: true };
        } catch (e) {
            logger.error('Failed to write dump', e);
        }
    }
    return { success: false };
}

export async function getStravaAuthLink() {
    // Dynamically determine host if possible, or use env var.
    // simpler: hardcode localhost for dev, or use headers() to get host.
    const { headers } = await import('next/headers'); // Dynamic import for headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/strava/callback`;
    
    // Circular dependency if I import from lib/strava? No.
    const { getStravaAuthUrl } = await import('../../lib/strava');
    return getStravaAuthUrl(redirectUri);
}

export async function fetchStravaActivityAction(url: string) {
    const validation = safeValidate(FetchStravaActivitySchema, { url });
    
    if (!validation.success) {
        return { error: validation.errors.map(e => e.message).join(', ') };
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('strava_access_token')?.value;

    if (!accessToken) {
        return { error: 'Not authenticated with Strava' };
    }

    // Extract ID
    const match = validation.data.url.match(/\/activities\/(\d+)/);
    if (!match) return { error: 'Invalid Strava URL' };
    const id = match[1];

    try {
        const activity = await getStravaActivity(id, accessToken);
        return { success: true, activity };
    } catch (e) {
        logger.error('Strava activity fetch failed:', e);
        return { error: 'Failed to fetch activity. Ensure it is yours or public.' };
    }
}

// Complex part: Converting Strava Activity to Notion Trace
// We need to: 
// 1. Generate GPX/GeoJSON from streams.
// 2. Upload/Store it? Or save raw text in Notion?
// 3. Create Notion Page.

export async function importStravaTraceAction(activity: any, overrides?: { name?: string; direction?: string; surface?: string; rating?: string }) {
     const validation = safeValidate(ImportStravaTraceSchema, { activity, overrides });
     
     if (!validation.success) {
         return { error: validation.errors.map(e => `${e.field}: ${e.message}`).join(', ') };
     }

     const cookieStore = await cookies();
     const accessToken = cookieStore.get('strava_access_token')?.value;
     if (!accessToken) return { error: 'No authentication token' };

     const { activity: validatedActivity, overrides: validatedOverrides } = validation.data;
     
     // Fetch Photos
     let photoUrls: string[] = [];
     try {
         const photos = await getStravaActivityPhotos(String(validatedActivity.id), accessToken);
         photoUrls = photos.map(p => p.urls['2048'] || p.urls['1024'] || p.urls['600']).filter(Boolean);
     } catch (e) {
         logger.warn('Failed to fetch photos', e);
     }

     // Create Notion Page
     const result = await createTrace({
         name: validatedOverrides?.name || validatedActivity.name,
         distance: validatedActivity.distance / 1000,
         elevation: validatedActivity.total_elevation_gain,
         mapUrl: validatedActivity.mapUrl || `https://www.strava.com/activities/${validatedActivity.id}`,
         description: validatedActivity.description || `Imported from Strava. Distance: ${(validatedActivity.distance/1000).toFixed(1)}km`,
         direction: validatedOverrides?.direction,
         surface: validatedOverrides?.surface,
         rating: validatedOverrides?.rating,
         photos: photoUrls,
         polyline: validatedActivity.map?.summary_polyline
     });

     if (!result.success) {
         return { error: result.error || 'Notion creation failed' };
     }

     return { success: true, message: "Trace created successfully in Notion!", traceId: result.id };
}

export async function deleteTraceAction(traceId: string) {
    if (!traceId || typeof traceId !== 'string') {
        return { error: 'Invalid trace ID' };
    }
    
    const result = await deleteTrace(traceId);
    if (!result.success) {
        return { error: result.error };
    }
    return { success: true };
}
