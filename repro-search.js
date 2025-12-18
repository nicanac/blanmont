const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function test () {
    console.log('Searching for ANY object...');

    try {
        const search = await notion.search({});

        console.log(`Found ${search.results.length} objects.`);

        for (const obj of search.results) {
            console.log(`Object: ${obj.object} | ID: ${obj.id}`);

            if (obj.object === 'database') {
                console.log(`TYPE MATCH! Database found: ${obj.title?.[0]?.plain_text || 'Untitled'}`);

                // Try to query this exact ID
                try {
                    console.log(`Attempting query on ${obj.id}...`);
                    await notion.request({
                        path: `databases/${obj.id}/query`,
                        method: 'POST',
                        body: { page_size: 1 }
                    });
                    console.log('Query SUCCESS!');
                } catch (e) {
                    console.log('Query FAILED:', e.code);
                }
            }
        }

    } catch (e) {
        console.log('Search FAILED:', e.code, e.message);
    }
}

test();
