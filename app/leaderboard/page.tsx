import { Fragment } from 'react';
import { logger } from '@/app/lib/logger';

const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const NOTION_VERSION = '2022-06-28';

// Types
type LeaderboardEntry = {
    id: string;
    name: string;
    rides: number;
    group: string;
    dates: string[];
};

// Data Fetching Helper using native fetch to avoid client library issues
async function notionQuery(payload: any = {}) {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        next: { revalidate: 60 }, // Revalidate cache every 60s
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Notion API Error: ${res.status} ${text}`);
    }

    return res.json();
}

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
    const pages: LeaderboardEntry[] = [];
    let cursor: string | undefined = undefined;

    try {
        do {
            const response: any = await notionQuery({
                start_cursor: cursor,
                sorts: [
                    {
                        property: 'Rides',
                        direction: 'descending',
                    },
                ],
            });

            for (const page of response.results) {
                if (!('properties' in page)) continue;
                const props = page.properties;

                // Extract properties carefully
                const nameTitle = props['Name']?.type === 'title' ? props['Name'].title : [];
                const name = nameTitle && nameTitle.length > 0 ? nameTitle[0].plain_text : 'Unknown';

                const rides = props['Rides']?.type === 'number' ? props['Rides'].number || 0 : 0;

                const groupSelect = props['Group']?.type === 'select' ? props['Group'].select : null;
                const group = groupSelect ? groupSelect.name : '-';

                const datesMulti = props['Dates']?.type === 'multi_select' ? props['Dates'].multi_select : [];
                const dates = datesMulti ? datesMulti.map((d: { name: string }) => d.name) : [];

                pages.push({
                    id: page.id,
                    name,
                    rides,
                    group,
                    dates
                });
            }
            cursor = response.next_cursor || undefined;
        } while (cursor);
    } catch (error) {
        logger.error("Error fetching leaderboard:", error);
        return [];
    }

    return pages;
}


import LeaderboardView from './LeaderboardView';

// ... (existing constants and data fetching helper logic remains)

export default async function LeaderboardPage() {
    const entries = await getLeaderboardData();
    return <LeaderboardView entries={entries} />;
}

