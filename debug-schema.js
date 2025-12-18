const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function debugSchema () {
    const dbId = process.env.NOTION_SATURDAY_RIDE_DB_ID;
    if (!dbId) {
        console.error('Missing NOTION_SATURDAY_RIDE_DB_ID');
        return;
    }

    try {
        console.log(`Fecthing database ${dbId}...`);
        const db = await notion.databases.retrieve({ database_id: dbId });
        console.log('Database Properties:');
        console.log(JSON.stringify(db.properties, null, 2));
    } catch (e) {
        console.error(e);
    }
}

debugSchema();
