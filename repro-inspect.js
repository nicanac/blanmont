const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = '2c59555c677980e4a7cbdd87005190af';

async function test () {
    console.log('Inspecting Retrieve Result...');
    try {
        const obj = await notion.databases.retrieve({ database_id: DB_ID });
        console.log('--- RETRIEVE SUCCESS ---');
        console.log('Object Type:', obj.object);
        console.log('ID:', obj.id);
        console.log('Title:', obj.title?.[0]?.plain_text);
        console.log('Properties:', Object.keys(obj.properties).join(', '));
        console.log('Full structure keys:', Object.keys(obj));
    } catch (e) {
        console.log('Retrieve FAILED:', e.code, e.message);
    }
}

test();
