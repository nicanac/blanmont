import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run(): Promise<void> {
  console.log('--- Verify User Custom Claims ---');

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is missing');
    process.exit(1);
  }

  let parsedServiceAccount = JSON.parse(serviceAccountKey);
  if (parsedServiceAccount.private_key) {
    parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
  }

  let app;
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(parsedServiceAccount),
    });
  } else {
    app = getApps()[0];
  }

  const auth = getAuth(app);
  const email = 'bruyere.nicolas@gmail.com';

  try {
    const user = await auth.getUserByEmail(email);
    console.log(`User: ${user.email}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Custom Claims:`, user.customClaims);
    
    if (user.customClaims?.admin) {
      console.log('✅ Admin claim is SET');
    } else {
      console.log('❌ Admin claim is NOT set - setting it now...');
      await auth.setCustomUserClaims(user.uid, { admin: true });
      console.log('✅ Admin claim has been set');
    }
    
    console.log('\n⚠️  REMINDER: User must sign out and sign back in for claims to take effect!');
  } catch (error) {
    console.error('Error:', error);
  }
}

run().catch(console.error);
