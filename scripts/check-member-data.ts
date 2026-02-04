import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  const { initializeApp } = await import('firebase/app');
  const { getDatabase, ref, get } = await import('firebase/database');
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const email = 'bruyere.nicolas@gmail.com';
  const password = '__AA0436aa__';

  console.log(`Signing in as ${email}...`);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful. UID:', cred.user.uid);
  } catch (e) {
    console.error('Sign in failed:', e);
    process.exit(1);
  }

  console.log('Fetching members...');
  try {
    const snapshot = await get(ref(db, 'members'));
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const data = child.val();
        // Check exact and case-insensitive
        if (data.email === email) {
          console.log('FOUND EXACT MATCH:', child.key);
        }
        if (data.email?.toLowerCase() === email.toLowerCase()) {
          console.log('FOUND MEMBER (Case Insensitive):', child.key);
          console.log('Email in DB:', data.email);
          console.log('Role:', data.role);
          console.log('AuthUID:', data.authUid);
        }
      });
    } else {
      console.log('No members found (snapshot empty).');
    }
  } catch (e: any) {
    console.error('FETCH FAILED:', e.message);
  }

  process.exit(0);
}

run();
