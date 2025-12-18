require('dotenv').config({ path: '.env.local' });

async function notionRequest (endpoint, body) {
    const token = process.env.NOTION_TOKEN;
    const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body || {})
    });
    return res.json();
}

async function debugSchemaKeys () {
    console.log('--- DEBUGGING RIDE SCHEMA ---');
    const ridesDbId = process.env.NOTION_SATURDAY_RIDE_DB_ID;
    if (ridesDbId) {
        const res = await notionRequest(`databases/${ridesDbId}/query`, {
            page_size: 1
        });

        if (res.results && res.results.length > 0) {
            const page = res.results[0];
            console.log('Property Keys:', Object.keys(page.properties));
            console.log('Full Properties Object:', JSON.stringify(page.properties, null, 2));
        } else {
            console.log('No rides found to inspect');
        }
    }
}

debugSchemaKeys();
