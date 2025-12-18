const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = '2c59555c677980e4a7cbdd87005190af';

async function test () {
    console.log('Testing Notion Request...');

    // Test 0: Basic Users (GET)
    try {
        console.log('--- Test 0: Users (GET) ---');
        const users = await notion.request({
            path: 'users',
            method: 'GET'
        });
        console.log('Test 0 SUCCESS. Users found:', users.results?.length);
    } catch (e) {
        console.log('Test 0 FAILED:', e.code, e.message);
    }

    // Test 1: Query with various paths
    const paths = [
        `databases/${DB_ID}/query`,
        `/databases/${DB_ID}/query`,
        `v1/databases/${DB_ID}/query`
    ];

    for (const p of paths) {
        try {
            console.log(`--- Test Path: ${p} ---`);
            await notion.request({
                path: p,
                method: 'POST',
                body: { page_size: 1 }
            });
            console.log(`SUCCESS with path: ${p}`);
            break;
        } catch (e) {
            console.log(`FAILED with path: ${p} -> ${e.code}`);
        }
    }
}

test();
