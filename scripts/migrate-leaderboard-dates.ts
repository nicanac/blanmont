/**
 * Migration Script: Add year to leaderboard dates
 *
 * Converts dates from DD/MM format to DD/MM/2025 for all existing leaderboard entries.
 * Future entries will already have the year included.
 *
 * Run with: npx tsx scripts/migrate-leaderboard-dates.ts
 * Dry-run:  npx tsx scripts/migrate-leaderboard-dates.ts --dry-run
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const DEFAULT_YEAR = '2025';

// Initialize Firebase Admin
function initializeFirebase(): void {
  if (admin.apps.length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment!');
      process.exit(1);
    }

    try {
      const parsedServiceAccount = JSON.parse(serviceAccountKey);

      if (parsedServiceAccount.private_key) {
        parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
        databaseURL:
          process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL,
      });

      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      process.exit(1);
    }
  }
}

/**
 * Convert a date string to include the year.
 * - DD/MM           → DD/MM/2025
 * - DD/MM/YYYY      → unchanged
 * - YYYY-MM-DD      → DD/MM/YYYY
 */
function addYearToDate(dateStr: string): string {
  // Already has year: DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // DD/MM format → add default year
  if (/^\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    return `${dateStr}/${DEFAULT_YEAR}`;
  }

  // ISO format YYYY-MM-DD → convert to DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
  }

  // Unknown format, return as-is
  console.warn(`  ⚠️  Unknown date format: "${dateStr}" — skipping`);
  return dateStr;
}

async function migrate(): Promise<void> {
  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE — no changes will be written\n');
  }

  initializeFirebase();

  const db = admin.database();
  const snapshot = await db.ref('leaderboard').once('value');

  if (!snapshot.exists()) {
    console.log('No leaderboard data found.');
    return;
  }

  const entries = snapshot.val();
  let totalEntries = 0;
  let totalDatesUpdated = 0;
  let totalEntriesModified = 0;

  const updates: Record<string, string[]> = {};

  for (const [entryId, entry] of Object.entries(entries)) {
    const entryData = entry as Record<string, unknown>;
    const dates = entryData.dates;
    totalEntries++;

    if (!Array.isArray(dates) || dates.length === 0) {
      continue;
    }

    let modified = false;
    const newDates: string[] = [];

    for (const dateStr of dates) {
      if (typeof dateStr !== 'string') {
        newDates.push(String(dateStr));
        continue;
      }

      const converted = addYearToDate(dateStr);
      if (converted !== dateStr) {
        modified = true;
        totalDatesUpdated++;
      }
      newDates.push(converted);
    }

    if (modified) {
      totalEntriesModified++;
      updates[entryId] = newDates;

      const name = (entryData.name as string) || entryId;
      console.log(`📝 ${name}:`);

      // Show a sample of changes
      const sampleCount = Math.min(3, dates.length);
      for (let i = 0; i < sampleCount; i++) {
        const oldDate = dates[i];
        const newDate = newDates[i];
        if (oldDate !== newDate) {
          console.log(`     "${oldDate}" → "${newDate}"`);
        }
      }
      if (dates.length > sampleCount) {
        console.log(`     ... and ${dates.length - sampleCount} more dates`);
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total entries: ${totalEntries}`);
  console.log(`   Entries to modify: ${totalEntriesModified}`);
  console.log(`   Dates to update: ${totalDatesUpdated}`);

  if (isDryRun) {
    console.log('\n🔍 Dry run complete. No changes written.');
    return;
  }

  if (totalEntriesModified === 0) {
    console.log('\n✅ No changes needed — all dates already have years.');
    return;
  }

  console.log('\n⏳ Writing updates to Firebase...');

  const batchUpdates: Record<string, unknown> = {};
  for (const [entryId, newDates] of Object.entries(updates)) {
    batchUpdates[`${entryId}/dates`] = newDates;
    batchUpdates[`${entryId}/updatedAt`] = new Date().toISOString();
  }

  await db.ref('leaderboard').update(batchUpdates);

  console.log(`✅ Successfully updated ${totalEntriesModified} entries!`);
}

migrate().catch((err: Error) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
