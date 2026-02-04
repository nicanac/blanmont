import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { getCalendarEvents } from '../app/lib/firebase/calendar';
import { getFirebaseDatabase, ref, get } from '../app/lib/firebase/client';
import { getMembers } from '../app/lib/firebase/members';

async function verify() {
  console.log('Verifying Firebase Connection...');
  console.log('Database URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);

  try {
    const db = getFirebaseDatabase();
    console.log('Database initialized.');

    console.log('Checking calendar-events...');
    const events = await getCalendarEvents();
    console.log(`Found ${events.length} calendar events.`);
    if (events.length > 0) {
      console.log('First event:', events[0].isoDate, events[0].location);
    }

    console.log('Checking members...');
    const members = await getMembers();
    console.log(`Found ${members.length} members.`);
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verify();
