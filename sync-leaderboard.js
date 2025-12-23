const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142'; // Carré Vert DB
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1VwlMyl_ePIb-zWzlwl7JfagPftdonz6akamlYrWgsdg/export?format=csv&gid=1551990117';
const NOTION_VERSION = '2022-06-28';

if (!NOTION_TOKEN) {
    console.error('Error: NOTION_TOKEN not found.');
    process.exit(1);
}

// --- Helpers ---

function notionRequest (path, method, body) {
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
                if (res.statusCode >= 200 && res.statusCode < 300) {
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

function fetchCsv (url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // Handle redirects (Google Sheets often redirects exports)
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                console.log('Following redirect...');
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

function parseCsv (csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Simple cleanup

    const results = [];
    for (let i = 1; i < lines.length; i++) {
        // Simple CSV split (NOTE: This breaks if values contain commas, but sufficient for this specific clean data)
        // For production robustness with arbitrary user input, use a library like `csv-parse`.
        const row = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        if (row.length < headers.length) continue;

        const obj = {};
        headers.forEach((h, index) => {
            obj[h] = row[index];
        });
        results.push(obj);
    }
    return results;
}

// --- Main Logic ---

async function ensureSchema () {
    console.log('Ensuring database schema...');
    const db = await notionRequest(`/databases/${DATABASE_ID}`, 'GET');

    const changes = {};
    if (!db.properties['Rides']) {
        console.log('  -> Adding "Rides" property.');
        changes['Rides'] = { number: { format: 'number' } };
    }
    if (!db.properties['Group']) {
        console.log('  -> Adding "Group" property.');
        changes['Group'] = { select: {} };
    }
    if (!db.properties['Dates']) {
        console.log('  -> Adding "Dates" property.');
        changes['Dates'] = { multi_select: {} };
    }

    if (Object.keys(changes).length > 0) {
        await notionRequest(`/databases/${DATABASE_ID}`, 'PATCH', { properties: changes });
        console.log('  -> Schema updated.');
    } else {
        console.log('  -> Schema already correct.');
    }
}

async function getExistingEntries () {
    console.log('Fetching existing Notion entries...');
    const pages = [];
    let cursor = undefined;
    do {
        const res = await notionRequest(`/databases/${DATABASE_ID}/query`, 'POST', { start_cursor: cursor });
        pages.push(...res.results);
        cursor = res.next_cursor;
    } while (cursor);

    // Map Name -> PageID
    const map = new Map();
    pages.forEach(p => {
        const title = p.properties.Name?.title?.[0]?.plain_text;
        if (title) map.set(title, p.id);
    });
    return map;
}

async function syncData () {
    console.log('Fetching Google Sheet CSV...');
    const csvData = await fetchCsv(GOOGLE_SHEET_CSV_URL);
    const rows = parseCsv(csvData);
    console.log(`  -> Parsed ${rows.length} rows.`);

    // Expected headers based on inspection: "groupe(s)", "prénom", "Nom", "Σ"
    // Adjust key access to match exactly what is in CSV.
    // CSV Header line from inspection: groupe(s),prénom,Nom,Σ,...

    const existingEntries = await getExistingEntries();
    let updated = 0;
    let created = 0;
    let errors = 0;

    for (const row of rows) {
        const group = row['groupe(s)']; // Column A
        const firstName = row['prénom']; // Column B
        const lastName = row['Nom']; // Column C
        const totalRidesStr = row['∑']; // Column D (Corrected to U+2211)

        if (!firstName || !lastName) continue;

        // Parse Dates
        const dates = [];
        const fixedHeaders = ['groupe(s)', 'prénom', 'Nom', '∑', 'Σ'];
        for (const [key, value] of Object.entries(row)) {
            if (!fixedHeaders.includes(key) && value && value.trim() !== '') {
                dates.push({ name: key });
            }
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const totalRides = parseInt(totalRidesStr, 10) || 0;

        const properties = {
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
                multi_select: dates.slice(0, 99) // Notion limit safety
            }
        };

        if (!group) delete properties['Group'];

        try {
            if (existingEntries.has(fullName)) {
                // Update
                const pageId = existingEntries.get(fullName);
                // console.log(`Updating ${fullName}...`);
                await notionRequest(`/pages/${pageId}`, 'PATCH', { properties });
                updated++;
            } else {
                // Create
                // console.log(`Creating ${fullName}...`);
                await notionRequest('/pages', 'POST', {
                    parent: { database_id: DATABASE_ID },
                    properties
                });
                created++;
            }

            // Rate limit
            await new Promise(r => setTimeout(r, 200));

        } catch (e) {
            console.error(`Error syncing ${fullName}:`, e.message);
            errors++;
        }
    }

    console.log(`Sync complete.`);
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errors}`);
}

async function main () {
    try {
        await ensureSchema();
        await syncData();
    } catch (e) {
        console.error('Fatal Error:', e.message);
    }
}

main();
