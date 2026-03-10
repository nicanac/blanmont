/**
 * Migration Script: Notion Leaderboard to Firebase
 * Run with: npx tsx scripts/migrate-leaderboard-simple.ts
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const NOTION_VERSION = '2022-06-28';

// Initialize Firebase Admin
function initializeFirebase() {
    return getAdminDatabase();
}

// Fetch data from Notion
async function fetchFromNotion() {
    const entries = [];
    let cursor = undefined;

    console.log('📥 Fetching data from Notion...');

    try {
        do {
            const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${NOTION_TOKEN}`,
                    'Notion-Version': NOTION_VERSION,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start_cursor: cursor,
                    sorts: [
                        {
                            property: 'Rides',
                            direction: 'descending',
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Notion API Error: ${response.status} ${text}`);
            }

            const data = await response.json();

            for (const page of data.results) {
                if (!('properties' in page)) continue;
                const props = page.properties;

                // Extract properties
                const nameTitle = props['Name']?.type === 'title' ? props['Name'].title : [];
                const name = nameTitle && nameTitle.length > 0 ? nameTitle[0].plain_text : 'Unknown';

                const rides = props['Rides']?.type === 'number' ? props['Rides'].number || 0 : 0;

                const groupSelect = props['Group']?.type === 'select' ? props['Group'].select : null;
                const group = groupSelect ? groupSelect.name : '-';

                const datesMulti = props['Dates']?.type === 'multi_select' ? props['Dates'].multi_select : [];
                const dates = datesMulti ? datesMulti.map((d) => d.name) : [];

                entries.push({
                    id: page.id,
                    name,
                    rides,
                    group,
                    dates,
                });
            }

            cursor = data.next_cursor || undefined;
        } while (cursor);

        console.log(`✅ Fetched ${entries.length} entries from Notion`);
        return entries;
    } catch (error) {
        console.error('❌ Error fetching from Notion:', error);
        throw error;
    }
}

// Migrate to Firebase
async function migrateToFirebase(entries) {
    const db = initializeFirebase();
    const leaderboardRef = db.ref('leaderboard');

    console.log('📤 Migrating to Firebase...');

    try {
        // Clear existing data
        await leaderboardRef.remove();
        console.log('🗑️  Cleared existing leaderboard data');

        // Add entries
        const batch = {};
        
        entries.forEach((entry, index) => {
            const entryId = `entry_${Date.now()}_${index}`;
            batch[entryId] = {
                name: entry.name,
                rides: entry.rides,
                group: entry.group,
                dates: entry.dates,
                notionId: entry.id, // Keep reference to original Notion ID
                createdAt: new Date().toISOString(),
            };
        });

        await leaderboardRef.set(batch);
        console.log(`✅ Migrated ${entries.length} entries to Firebase`);
    } catch (error) {
        console.error('❌ Error migrating to Firebase:', error);
        throw error;
    }
}

// Main migration function
async function migrate() {
    console.log('🚀 Starting migration from Notion to Firebase...\n');

    try {
        // Fetch from Notion
        const entries = await fetchFromNotion();

        if (entries.length === 0) {
            console.warn('⚠️  No entries found in Notion. Migration aborted.');
            return;
        }

        // Display preview
        console.log('\n📋 Preview of data to migrate:');
        entries.slice(0, 5).forEach((entry, i) => {
            console.log(`  ${i + 1}. ${entry.name} - ${entry.rides} rides (${entry.group})`);
        });
        if (entries.length > 5) {
            console.log(`  ... and ${entries.length - 5} more`);
        }

        // Migrate to Firebase
        console.log('');
        await migrateToFirebase(entries);

        console.log('\n✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrate();
