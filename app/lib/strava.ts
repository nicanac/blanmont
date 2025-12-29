import { notFound } from 'next/navigation';

export interface StravaActivity {
    id: number;
    name: string;
    distance: number;
    total_elevation_gain: number;
    start_latlng: [number, number];
    map: {
        id: string;
        summary_polyline: string;
        polyline?: string;
    };
    description: string;
    start_date: string;
    photos: {
        primary: {
            urls: {
                '600': string;
            }
        } | null;
        count: number;
    };
    total_photo_count: number;
}

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export function getStravaAuthUrl(redirectUri: string) {
    const params = new URLSearchParams({
        client_id: CLIENT_ID!,
        redirect_uri: redirectUri,
        response_type: 'code',
        approval_prompt: 'auto',
        scope: 'activity:read,activity:read_all', // Read permission
    });
    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeToken(code: string) {
    const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange Strava token');
    }

    return response.json(); // Returns { access_token, refresh_token, athlete, ... }
}

export async function getStravaActivity(activityId: string, accessToken: string): Promise<StravaActivity> {
    const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 404) return notFound();
    if (!response.ok) throw new Error('Failed to fetch Strava activity');

    return response.json();
}

export async function getActivityStreams(activityId: string, accessToken: string) {
     const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,altitude&key_by_type=true`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    
    if (!response.ok) throw new Error('Failed to fetch activity streams');
    return response.json();
}

export async function getStravaActivityPhotos(activityId: string, accessToken: string): Promise<any[]> {
    const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}/photos?size=2048&photo_sources=true`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error('Failed to fetch activity photos');
    return response.json();
}
