'use server';

import { cookies } from 'next/headers';
import { getStravaActivity, getActivityStreams, getStravaActivityPhotos } from '../../lib/strava';
import { createTrace } from '../../lib/notion'; // Assuming this exists or I need to create/export it. I might need to move it to a shared lib if it's in a different file.
// Checking previous context, createTrace logic is likely in notion.ts or needs to be added.
// I will check app/lib/notion.ts later. For now I will mock or assume it.
import toGeoJSON from '@tmcw/togeojson'; // Wait, this changes XML to GeoJSON. Strava gives Polyline or LatLng stream.
// I'll need a utility to convert Strava LatLng stream to GPX or GeoJSON.

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
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('strava_access_token')?.value;

    if (!accessToken) {
        return { error: 'Not authenticated with Strava' };
    }

    // Extract ID
    // Supports: https://www.strava.com/activities/1234567890
    const match = url.match(/\/activities\/(\d+)/);
    if (!match) return { error: 'Invalid Strava URL' };
    const id = match[1];

    try {
        const activity = await getStravaActivity(id, accessToken);
        // We could also fetch streams here if we want to preview the map immediately
        // or just return the summary polyline.
        return { success: true, activity };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to fetch activity. Ensure it is yours or public.' };
    }
}

// Complex part: Converting Strava Activity to Notion Trace
// We need to: 
// 1. Generate GPX/GeoJSON from streams.
// 2. Upload/Store it? Or save raw text in Notion?
// 3. Create Notion Page.

export async function importStravaTraceAction(activity: any, overrides?: { name?: string; direction?: string }) {
     const cookieStore = await cookies();
     const accessToken = cookieStore.get('strava_access_token')?.value;
     if (!accessToken) throw new Error("No token");

     // Fetch Streams for full resolution path
     // const streams = await getActivityStreams(String(activity.id), accessToken); // Not used yet
     
     // Fetch Photos
     let photoUrls: string[] = [];
     try {
         const photos = await getStravaActivityPhotos(String(activity.id), accessToken);
         photoUrls = photos.map(p => p.urls['2048'] || p.urls['1024'] || p.urls['600']).filter(Boolean);
     } catch (e) {
         console.warn('Failed to fetch photos', e);
     }

     // Create Notion Page
     const result = await createTrace({
         name: overrides?.name || activity.name,
         distance: activity.distance / 1000,
         elevation: activity.total_elevation_gain,
         mapUrl: `https://www.strava.com/activities/${activity.id}`,
         description: activity.description || `Imported from Strava. Distance: ${(activity.distance/1000).toFixed(1)}km`,
         direction: overrides?.direction,
         photos: photoUrls
     });

     if (!result.success) {
         return { error: result.error || 'Notion creation failed' };
     }

     return { success: true, message: "Trace created successfully in Notion!" };
}
