import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  console.log('--- Configure Firebase Storage CORS Script ---');

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local');
    process.exit(1);
  }

  // Sanitize private key
  let parsedServiceAccount = JSON.parse(serviceAccountKey);
  if (parsedServiceAccount.private_key) {
    parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
  }

  let app;
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(parsedServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    app = getApps()[0];
  }

  const bucket = getStorage(app).bucket();
  console.log(`Configuring CORS for bucket: ${bucket.name}`);

  // CORS Configuration
  const corsConfiguration = [
    {
      origin: ['http://localhost:3000', 'https://blanmont-c11e3.web.app', 'https://blanmont-c11e3.firebaseapp.com'],
      method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'], // HEAD is often useful too, but standardized list is usually these
      responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'], // x-goog-resumable is important for resumable uploads
      maxAgeSeconds: 3600,
    },
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('✅ CORS configuration updated successfully!');
    console.log('Allowed origins:', corsConfiguration[0].origin.join(', '));
  } catch (error) {
    console.error('❌ Error updating CORS configuration:', error);
  }
}

run().catch(console.error);
