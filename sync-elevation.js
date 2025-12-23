const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const DATABASE_ID = '1e855e15-3a2c-4562-83e2-6c77052d27a3';
const NOTION_VERSION = '2022-06-28';

if (!NOTION_TOKEN) {
    console.error('Error: NOTION_TOKEN or NOTION_KEY not found in .env.local');
    process.exit(1);
}

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

function fetchHtml (url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const req = https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
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

function extractElevation (html) {
    // 1. Try JSON in kmtBoot
    let match = html.match(/\\"elevation_up\\":([\d.]+)/);
    if (match) return Math.round(parseFloat(match[1]));

    match = html.match(/"elevation_up":([\d.]+)/);
    if (match) return Math.round(parseFloat(match[1]));

    // 2. Try OG description or other meta if JSON fails
    // e.g. "Distance : 91,2 km" might be close to elevation? 
    // Usually OG doesn't have elevation.

    // 3. Look for " m <" patterns? risky.

    return null;
}

async function ensureElevationProperty () {
    console.log('Ensuring "Elevation" property exists...');
    try {
        // Retrieve database to check properties
        const db = await notionRequest(`/databases/${DATABASE_ID}`, 'GET');
        if (db.properties['Elevation']) {
            console.log('  -> Property "Elevation" already exists.');
            return;
        }

        console.log('  -> Creating "Elevation" property...');
        await notionRequest(`/databases/${DATABASE_ID}`, 'PATCH', {
            properties: {
                'Elevation': {
                    number: {
                        format: 'number'
                    }
                }
            }
        });
        console.log('  -> Created.');
    } catch (e) {
        throw new Error(`Failed to ensure property: ${e.message}`);
    }
}

async function getTraces () {
    console.log('Fetching traces...');
    const pages = [];
    let cursor = undefined;

    do {
        const body = {
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

    console.log(`Found ${pages.length} traces with Komoot links.`);
    return pages;
}

async function updateTrace (pageId, elevation) {
    await notionRequest(`/pages/${pageId}`, 'PATCH', {
        properties: {
            'Elevation': {
                number: elevation
            }
        }
    });
}

async function main () {
    try {
        await ensureElevationProperty();

        const traces = await getTraces();
        let updatedCount = 0;
        let failCount = 0;

        for (const trace of traces) {
            const komootUrl = trace.properties.Komoot?.url;
            const name = trace.properties.Name?.title?.[0]?.plain_text || 'Untitled';

            console.log(`Processing "${name}"...`);

            try {
                // Delay to respect rate limits
                console.timeLog && console.timeLog('  -> Fetching...');
                await new Promise(r => setTimeout(r, 600));

                const html = await fetchHtml(komootUrl);
                const elevation = extractElevation(html);

                if (elevation !== null) {
                    console.log(`  -> Found Elevation: ${elevation}. Updating...`);
                    await updateTrace(trace.id, elevation);
                    updatedCount++;
                } else {
                    console.log('  -> No elevation data found.');
                    failCount++;
                }
            } catch (e) {
                console.error(`  -> Error: ${e.message}`);
                failCount++;
            }
        }

        console.log(`\nDone. Updated: ${updatedCount}, Failed/Skipped: ${failCount}`);

    } catch (e) {
        console.error('Fatal error:', e.message);
    }
}

main();
