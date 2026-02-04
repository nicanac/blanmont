import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  console.log('--- Force Grant Admin Script ---');

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local');
    process.exit(1);
  }

  // Initialize Admin SDK
  let app;
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } else {
    app = getApps()[0];
  }

  const db = getDatabase(app);
  const emailToPromote = 'bruyere.nicolas@gmail.com';

  console.log(`Looking for user: ${emailToPromote}...`);

  const usersRef = db.ref('members');
  const snapshot = await usersRef.once('value');

  let foundKey: string | null = null;
  let foundData: any = null;

  snapshot.forEach((child) => {
    const data = child.val();
    if (data.email?.toLowerCase() === emailToPromote.toLowerCase()) {
      foundKey = child.key;
      foundData = data;
    }
  });

  if (foundKey && foundData) {
    console.log(`User found! Key: ${foundKey}`);
    console.log(`Current Role: ${JSON.stringify(foundData.role)}`);

    console.log('Updating role to ["Admin"]...');
    await usersRef.child(foundKey).update({
      role: ['Admin', 'WebMaster'],
    });

    console.log('✅ Update successful.');
  } else {
    console.error('❌ User not found in "members" path.');
    // Optional: Create if not exists? No, better to correct the email mapping.
  }

  process.exit(0);
}

run().catch(console.error);
