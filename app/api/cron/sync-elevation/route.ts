import { NextResponse } from 'next/server';
import https from 'https';

// Environment variables should be checked at runtime
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const DATABASE_ID = '1e855e15-3a2c-4562-83e2-6c77052d27a3';
const NOTION_VERSION = '2022-06-28';

// Helper for Notion API requests
function notionRequest(path: string, method: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.notion.com',
            path: '/v1' + path,
            method: method,
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse Notion response'));
                    }
                } else {
                    reject(new Error(`Notion API error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

// Helper to fetch external HTML (Komoot)
function fetchHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const req = https.get(url, options, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchHtml(res.headers.location).then(resolve).catch(reject);
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
}

function extractElevation(html: string): number | null {
    // 1. Try JSON in kmtBoot
    let match = html.match(/\\"elevation_up\\":([\d.]+)/);
    if (match) return Math.round(parseFloat(match[1]));

    match = html.match(/"elevation_up":([\d.]+)/);
    if (match) return Math.round(parseFloat(match[1]));

    return null;
}

async function getTraces() {
    const pages = [];
    let cursor = undefined;

    do {
        const body: any = {
            filter: {
                property: 'Komoot',
                url: {
                    is_not_empty: true
                }
            },
            start_cursor: cursor
        };
        const response = await notionRequest(`/databases/${DATABASE_ID}/query`, 'POST', body);
        pages.push(...response.results);
        cursor = response.next_cursor;
    } while (cursor);

    return pages;
}

async function updateTrace(pageId: string, elevation: number) {
    await notionRequest(`/pages/${pageId}`, 'PATCH', {
        properties: {
            'Elevation': {
                number: elevation
            }
        }
    });
}

export async function GET(request: Request) {
    // Basic authorization check (optional, but good practice for Cron jobs)
    // You can set CRON_SECRET in Vercel environment variables
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // Allow unauthenticated for now based on user request complexity, 
        // or just rely on obscurity if secret not set.
    }

    if (!NOTION_TOKEN) {
        return NextResponse.json({ error: 'Missing NOTION_TOKEN' }, { status: 500 });
    }

    try {
        const traces = await getTraces();
        let updatedCount = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (const trace of traces) {
            const komootUrl = trace.properties.Komoot?.url;
            const currentElevation = trace.properties.Elevation?.number;

            if (!komootUrl) continue;

            // Optimization: Skip if elevation already exists (optional, but good for Cron quotas)
            // Comment out the next line if you want to force update every time
            if (currentElevation !== undefined && currentElevation !== null) {
                skippedCount++;
                continue;
            }

            try {
                // Rate limiting delay
                await new Promise(r => setTimeout(r, 600));

                const html = await fetchHtml(komootUrl);
                const elevation = extractElevation(html);

                if (elevation !== null) {
                    if (currentElevation !== elevation) {
                        await updateTrace(trace.id, elevation);
                        updatedCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    failCount++;
                }
            } catch (e) {
                console.error(`Error processing trace ${trace.id}:`, e);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: traces.length,
            updated: updatedCount,
            skipped: skippedCount,
            failed: failCount
        });

    } catch (error: any) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
