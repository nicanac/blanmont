/**
 * Migration Script: Notion Leaderboard to Firebase
 * 
 * This script migrates leaderboard data from Notion to Firebase Realtime Database.
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const NOTION_VERSION = '2022-06-28';

interface NotionLeaderboardEntry {
    id: string;
    name: string;
    rides: number;
    group: string;
    dates: string[];
}

// Initialize Firebase Admin
function initializeFirebase() {
    if (admin.apps.length === 0) {
        const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
        let serviceAccount: admin.ServiceAccount;

        try {
            const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
            serviceAccount = JSON.parse(serviceAccountFile);
        } catch (error) {
            console.error('Error reading firebase-service-account.json:', error);
            throw new Error('Firebase service account file not found or invalid');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });

        console.log('✅ Firebase Admin initialized');
    }
    return admin.database();
}

// Fetch data from Notion
async function fetchFromNotion(): Promise<NotionLeaderboardEntry[]> {
    const entries: NotionLeaderboardEntry[] = [];
    let cursor: string | undefined = undefined;

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

            const data: any = await response.json();

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
                const dates = datesMulti ? datesMulti.map((d: { name: string }) => d.name) : [];

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
async function migrateToFirebase(entries: NotionLeaderboardEntry[]) {
    const db = initializeFirebase();
    const leaderboardRef = db.ref('leaderboard');

    console.log('📤 Migrating to Firebase...');

    try {
        // Clear existing data
        await leaderboardRef.remove();
        console.log('🗑️  Cleared existing leaderboard data');

        // Add entries
        const batch: { [key: string]: any } = {};
        
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
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrate();
