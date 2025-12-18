const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function listDatabases () {
    try {
        console.log('Searching for shared databases...');
        // Search for everything, then filter for databases
        const response = await notion.search({
            page_size: 100,
            filter: {
                value: 'database',
                property: 'object'
            }
        }).catch(async (e) => {
            // Fallback if filter fails
            console.log('Filter failed, searching all objects...');
            return await notion.search({ page_size: 100 });
        });

        console.log('--- Accessible Databases ---');
        const databases = response.results.filter(obj => obj.object === 'database');

        if (databases.length === 0) {
            console.log('No databases found! Make sure to share them with your integration.');
        }

        databases.forEach(db => {
            const title = db.title?.[0]?.plain_text || 'Untitled';
            console.log(`[${db.id.replace(/-/g, '')}] ${title}`); // Print without dashes for easy comparison
        });

        // Check specifically for the configured ones
        const saturdayId = process.env.NOTION_SATURDAY_RIDE_DB_ID || '';
        const votesId = process.env.NOTION_VOTES_DB_ID || '';

        console.log('\n--- Configuration Check ---');
        console.log(`Configured Saturday Rides ID: ${saturdayId}`);

        const foundSaturday = databases.find(db => db.id.replace(/-/g, '') === saturdayId.replace(/-/g, ''));
        if (foundSaturday) {
            console.log('✅ Saturday Rides DB IS accessible');
        } else {
            console.log('❌ Saturday Rides DB is NOT accessible');
        }

        console.log(`Configured Votes ID:         ${votesId}`);
        const foundVotes = databases.find(db => db.id.replace(/-/g, '') === votesId.replace(/-/g, ''));
        if (foundVotes) {
            console.log('✅ Votes DB IS accessible');
        } else {
            console.log('❌ Votes DB is NOT accessible');
        }

    } catch (error) {
        console.error('Error searching databases:', error);
    }
}

listDatabases();
