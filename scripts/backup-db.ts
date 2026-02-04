import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function backup() {
  console.log('--- Database Backup Script ---');

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

  // Define what to backup
  const nodesToBackup = ['calendar-events', 'members', 'traces', 'saturday-rides', 'feedback'];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = resolve(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  console.log(`Starting backup at ${timestamp}...`);

  for (const node of nodesToBackup) {
    try {
      console.log(`Backing up "${node}"...`);
      const ref = db.ref(node);
      const snapshot = await ref.once('value');
      const data = snapshot.val();

      if (data) {
        const filePath = resolve(backupDir, `${node}_${timestamp}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✔ Saved ${node} to ${filePath} (${Object.keys(data).length} items)`);
      } else {
        console.log(`⚠ No data found for "${node}"`);
      }
    } catch (error) {
      console.error(`✘ Error backing up "${node}":`, error);
    }
  }

  console.log('--- Backup Complete ---');
  process.exit(0);
}

backup().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
