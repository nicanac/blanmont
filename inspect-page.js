const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

// ID from the first link: Incourt Hannut Huy Andenne#155-fecacd0fbb1a49bf938f12db910f0d69
const PAGE_ID = 'fecacd0fbb1a49bf938f12db910f0d69';

async function test () {
    const token = process.env.NOTION_TOKEN;
    console.log('Inspecting Page:', PAGE_ID);

    const url = `https://api.notion.com/v1/pages/${PAGE_ID}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.log('Error:', await res.text());
            return;
        }

        const data = await res.json();
        console.log('--- Page Properties ---');
        console.log(JSON.stringify(data.properties, null, 2));

    } catch (e) {
        console.log('Fetch error:', e);
    }
}

test();
