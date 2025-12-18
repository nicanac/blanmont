const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const ID = '2c59555c677980e4a7cbdd87005190af';
// Format with dashes just in case
const DASHED_ID = `${ID.substr(0, 8)}-${ID.substr(8, 4)}-${ID.substr(12, 4)}-${ID.substr(16, 4)}-${ID.substr(20)}`;

async function test () {
    const token = process.env.NOTION_TOKEN;
    console.log('Testing with fetch...');

    const url = `https://api.notion.com/v1/databases/${DASHED_ID}/query`;
    console.log('URL:', url);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page_size: 1 })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (e) {
        console.log('Fetch error:', e);
    }
}

test();
