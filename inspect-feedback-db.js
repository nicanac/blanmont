const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

async function inspect () {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_FEEDBACK_DB_ID;

    if (!dbId) {
        console.error('No NOTION_FEEDBACK_DB_ID found');
        return;
    }

    console.log('Inspecting Feedback DB:', dbId);

    try {
        const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
            }
        });

        const db = await res.json();
        console.log('Properties:', JSON.stringify(db.properties, null, 2));

    } catch (e) {
        console.log('Error:', e);
    }
}

inspect();
