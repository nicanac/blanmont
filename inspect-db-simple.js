const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

// ID from: https://www.notion.so/1e855e153a2c456283e26c77052d27a3?v=8c98885abe204438a28032d5b99e835e
const DB_ID = '1e855e153a2c456283e26c77052d27a3';

async function test () {
    const token = process.env.NOTION_TOKEN;

    const url = `https://api.notion.com/v1/databases/${DB_ID}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        console.log('PROPERTIES MAPPING:');
        for (const [key, value] of Object.entries(data.properties)) {
            console.log(`Key: "${key}" | Type: ${value.type}`);
        }

    } catch (e) {
        console.log('Fetch error:', e);
    }
}

test();
