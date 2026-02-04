import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 1. Load env vars BEFORE any other imports
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// 2. Mock browser globals for Firebase Client SDK if needed
// (Firebase v9+ usually handles this, but just in case)

async function run() {
  console.log('\n--- Test Client Login Script ---');

  const email = 'bruyere.nicolas@gmail.com';
  const password = '__AA0436aa__';

  console.log(`Attempting to sign in with: ${email} / ${password}`);

  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

    if (!firebaseConfig.apiKey) {
      throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');
    }

    console.log('Firebase Config (partial):', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('\nSUCCESS! Logged in as:', cred.user.uid);
    console.log('Email verified:', cred.user.emailVerified);
  } catch (error: any) {
    console.error('\nLOGIN FAILED:', error.code, error.message);
  } finally {
    process.exit(0);
  }
}

run().catch(console.error);
