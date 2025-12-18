const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

// ID from env or hardcoded for safety
const DB_ID = process.env.NOTION_TRACES_DB_ID || '1e855e153a2c456283e26c77052d27a3';

async function test () {
    const token = process.env.NOTION_TOKEN;
    console.log('Fetching rows from:', DB_ID);

    const url = `https://api.notion.com/v1/databases/${DB_ID}/query`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page_size: 2 }) // Just get 2 rows
        });

        const data = await res.json();

        for (const page of data.results) {
            const p = page.properties;
            console.log(`\n--- Trace: ${p.Name?.title?.[0]?.plain_text} ---`);
            console.log('km (Formula):', JSON.stringify(p.km?.formula));
            console.log('Komoot (URL):', p.Komoot?.url);
            console.log('Gpx (URL):', p.Gpx?.url);
            console.log('Rating (Select):', JSON.stringify(p.Rating?.select));
            console.log('status (Status):', JSON.stringify(p.Status?.status));
        }

    } catch (e) {
        console.log('Fetch error:', e);
    }
}

test();
