import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 1. Load env vars BEFORE any other imports
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// 2. Check env vars
console.log('--- Environment Check ---');
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is missing!');
  process.exit(1);
} else {
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY found.');
}

async function run() {
  console.log('\n--- Importing Modules ---');
  // Dynamic import to ensure env vars are ready
  const { getAdminDatabase } = await import('../app/lib/firebase/admin');
  const { getCalendarEvents } = await import('../app/lib/firebase/calendar');
  const { getMembers } = await import('../app/lib/firebase/members');

  console.log('\n--- Testing Admin SDK (Direct) ---');
  try {
    const db = getAdminDatabase();
    const snapshot = await db.ref('calendar-events').limitToFirst(1).once('value');
    console.log('Direct Admin Read Success:', snapshot.exists());
  } catch (e) {
    console.error('Direct Admin Read Failed:', e);
  }

  console.log('\n--- Testing getCalendarEvents (Server Logic) ---');
  try {
    const events = await getCalendarEvents();
    console.log(`Success! Found ${events.length} events.`);
  } catch (e) {
    console.error('getCalendarEvents Failed:', e);
  }

  console.log('\n--- Testing getMembers (Server Logic) ---');
  try {
    const members = await getMembers();
    console.log(`Success! Found ${members.length} members.`);

    // Check for data integrity issues
    const membersWithoutRole = members.filter((m) => !m.role);
    if (membersWithoutRole.length > 0) {
      console.warn(`WARNING: Found ${membersWithoutRole.length} members without 'role' property!`);
    }
  } catch (e) {
    console.error('getMembers Failed:', e);
  }
}

run();
