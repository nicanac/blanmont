const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

async function search () {
    const token = process.env.NOTION_TOKEN;
    console.log('Searching for "Feedback"...');

    try {
        const res = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: 'Feedback',
                filter: {
                    value: 'database',
                    property: 'object'
                }
            })
        });

        const data = await res.json();
        data.results.forEach(db => {
            console.log(`Found DB: ${db.title[0]?.plain_text} (ID: ${db.id})`);
            console.log('Fields:', Object.keys(db.properties).join(', '));
        });

    } catch (e) {
        console.log('Error:', e);
    }
}

search();
