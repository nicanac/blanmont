import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  console.log('--- Set Admin Custom Claim Script ---');

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local');
    process.exit(1);
  }

  // Sanitize private key just in case (same fix as applied to admin.ts)
  let parsedServiceAccount = JSON.parse(serviceAccountKey);
  if (parsedServiceAccount.private_key) {
    parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
  }

  let app;
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(parsedServiceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } else {
    app = getApps()[0];
  }

  const auth = getAuth(app);
  const email = 'bruyere.nicolas@gmail.com';

  console.log(`Looking for user by email: ${email}...`);

  try {
    const user = await auth.getUserByEmail(email);
    console.log(`User found! UID: ${user.uid}`);

    console.log('Setting custom user claims { admin: true }...');
    await auth.setCustomUserClaims(user.uid, { admin: true });

    console.log('✅ Custom claim "admin" set successfully.');
    console.log('⚠️  IMPORTANT: The user must sign out and sign in again (or force token refresh) for claims to take effect.');
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }

  process.exit(0);
}

run().catch(console.error);
