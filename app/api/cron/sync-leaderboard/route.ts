import { NextResponse } from 'next/server';
import https from 'https';
import { logger } from '@/app/lib/logger';

export const dynamic = 'force-dynamic'; // Ensure no caching for this route

const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142'; // Carré Vert DB
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1VwlMyl_ePIb-zWzlwl7JfagPftdonz6akamlYrWgsdg/export?format=csv&gid=1551990117';
const NOTION_VERSION = '2022-06-28';

// --- Helpers ---

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
                        reject(new Error('Failed to parse Notion response: ' + data));
                    }
                } else {
                    reject(new Error(`Notion API error ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function fetchCsv(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // Handle redirects
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchCsv(res.headers.location).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch CSV: ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseCsv(csvText: string) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        // Simple CSV split (Note: assumes no commas in values, consistent with previous script)
        const row = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (row.length < headers.length) continue;
        
        const obj: any = {};
        headers.forEach((h, index) => {
            obj[h] = row[index];
        });
        results.push(obj);
    }
    return results;
}

// --- Logic ---

async function ensureSchema() {
    const db = await notionRequest(`/databases/${DATABASE_ID}`, 'GET');
    
    const changes: any = {};
    if (!db.properties['Rides']) {
        changes['Rides'] = { number: { format: 'number' } };
    }
    if (!db.properties['Group']) {
        changes['Group'] = { select: {} };
    }
    if (!db.properties['Dates']) {
        changes['Dates'] = { multi_select: {} };
    }

    if (Object.keys(changes).length > 0) {
        await notionRequest(`/databases/${DATABASE_ID}`, 'PATCH', { properties: changes });
        return true;
    }
    return false;
}

async function getExistingEntries() {
    const pages = [];
    let cursor = undefined;
    do {
        const res: any = await notionRequest(`/databases/${DATABASE_ID}/query`, 'POST', { start_cursor: cursor });
        pages.push(...res.results);
        cursor = res.next_cursor;
    } while (cursor);
    
    const map = new Map<string, string>();
    pages.forEach((p: any) => {
        const title = p.properties.Name?.title?.[0]?.plain_text;
        if (title) map.set(title, p.id);
    });
    return map;
}

export async function GET(request: Request) {
    if (!NOTION_TOKEN) {
        return NextResponse.json({ error: 'Missing NOTION_TOKEN' }, { status: 500 });
    }

    try {
        await ensureSchema();

        const csvData = await fetchCsv(GOOGLE_SHEET_CSV_URL);
        const rows = parseCsv(csvData);
        const existingEntries = await getExistingEntries();
        
        let updated = 0;
        let created = 0;
        let errors = 0;

        for (const row of rows) {
            const group = row['groupe(s)'];
            const firstName = row['prénom'];
            const lastName = row['Nom'];
            const totalRidesStr = row['∑']; // U+2211 for Summation

            if (!firstName || !lastName) continue;

            const dates = [];
            const fixedHeaders = ['groupe(s)', 'prénom', 'Nom', '∑', 'Σ'];
            for (const [key, value] of Object.entries(row)) {
                if (!fixedHeaders.includes(key) && value && (value as string).trim() !== '') {
                    dates.push({ name: key });
                }
            }

            const fullName = `${firstName} ${lastName}`.trim();
            const totalRides = parseInt(totalRidesStr, 10) || 0;

            const properties: any = {
                'Name': {
                    title: [{ text: { content: fullName } }]
                },
                'Rides': {
                    number: totalRides
                },
                'Group': {
                    select: { name: group || 'Unknown' }
                },
                'Dates': {
                    multi_select: dates.slice(0, 99)
                }
            };
            
            if (!group) delete properties['Group'];

            try {
                if (existingEntries.has(fullName)) {
                    // Update
                    const pageId = existingEntries.get(fullName);
                    await notionRequest(`/pages/${pageId}`, 'PATCH', { properties });
                    updated++;
                } else {
                    // Create
                    await notionRequest('/pages', 'POST', {
                        parent: { database_id: DATABASE_ID },
                        properties
                    });
                    created++;
                }
                
                // Rate limit
                await new Promise(r => setTimeout(r, 200));
                
            } catch (e) {
                logger.error(`Error syncing ${fullName}`, e);
                errors++;
            }
        }
        
        return NextResponse.json({
            success: true,
            processed_rows: rows.length,
            created,
            updated,
            errors
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
