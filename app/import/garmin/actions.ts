'use server';

import { trace } from "console";

// Attempt to fetch Garmin activity data
// Note: Garmin is very strict. True API requires OAuth.
// Public scraping is brittle. We will try best-effort or return error.
export async function fetchGarminActivityAction(urlInput: string) {
    try {
        // Extract Activity ID
        // Formats: https://connect.garmin.com/modern/activity/12345678...
        const match = urlInput.match(/\/activity\/(\d+)/);
        if (!match) {
            return { error: 'Invalid Garmin URL. Expected format: .../activity/12345678' };
        }
        const activityId = match[1];

        // 1. Try to fetch the GPX directly (often blocked without cookie)
        // const gpxUrl = `https://connect.garmin.com/modern/proxy/download-service/files/activity/${activityId}`;
        
        // 2. For now, since we cannot easily bypass Garmin Auth on server without a headless browser or cookies,
        // we will implement a "Metadata Only" fetch if possible, or just acknowledge we need the file.
        // HOWEVER, the user asked to "put the garmin url".
        
        // Let's try to fetch the page and see if there's JSON-LD or embedded metadata.
        const pageRes = await fetch(urlInput, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!pageRes.ok) {
            return { error: `Could not reach Garmin (Status ${pageRes.status}). Activity might be private.` };
        }

        const html = await pageRes.text();
        
        // Attempt to find basic metadata (Title, etc.)
        // This is highly specific to Garmin's current DOM implementation
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const name = titleMatch ? titleMatch[1].replace(' | Garmin Connect', '') : `Garmin Activity ${activityId}`;

        // If we can't get the GPX, we can't get the map/stats accurately without complex scraping.
        // For MVP, if we can't get the GPX, we should probably tell the user.
        
        // Let's return what we found, but signal that GPX is missing.
        return {
            activity: {
                id: activityId,
                name: name,
                // We don't have these unless we can parse them from HTML
                distance: 0,
                elevation: 0,
                // We definitely don't have the map polyline from just the HTML usually
                hasGpx: false
            }
        };

    } catch (e) {
        console.error('Garmin Fetch Error:', e);
        return { error: 'Failed to process Garmin URL.' };
    }
}
