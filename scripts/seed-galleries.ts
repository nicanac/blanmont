/**
 * Seed script to populate Firebase Realtime Database with the migrated photo gallery albums.
 *
 * Usage:
 *   npx tsx scripts/seed-galleries.ts
 *   npx tsx scripts/seed-galleries.ts --dry-run
 *   npx tsx scripts/seed-galleries.ts --force
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import type { PhotoAlbum } from '../app/types';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { getAdminDatabase } from '../app/lib/firebase/admin';

async function seedGalleries() {
  const isDryRun = process.argv.includes('--dry-run');
  const isForce = process.argv.includes('--force');

  console.log('--- Seeding Photo Galleries to Firebase RTDB ---');
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE: No changes will be written to the database.');
  }

  const dataPath = resolve(process.cwd(), 'app/data/migrated-albums.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found at: ${dataPath}`);
    process.exit(1);
  }

  const albums: PhotoAlbum[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📸 Loaded ${albums.length} albums from ${dataPath}`);

  const totalPhotos = albums.reduce((acc, a) => acc + (a.photoCount || 0), 0);
  const years = Array.from(new Set(albums.map((a) => a.year))).sort((a, b) => b - a);

  console.log(`📊 Total photos: ${totalPhotos}`);
  console.log(`📅 Saisons: ${years.join(', ')}`);

  if (isDryRun) {
    console.log('✔ Dry run complete. Sample album:');
    console.log(JSON.stringify(albums[0], null, 2));
    process.exit(0);
  }

  const db = getAdminDatabase();
  const galleriesRef = db.ref('galleries');

  const snapshot = await galleriesRef.once('value');
  const existingCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

  console.log(`Database currently has ${existingCount} albums in '/galleries'.`);

  if (existingCount > 0 && !isForce) {
    console.log('⚠️  Existing albums found. Use --force to overwrite all albums.');
    console.log('Updating/merging albums without deleting existing unmentioned nodes...');
  }

  const albumMap: Record<string, PhotoAlbum> = {};
  for (const album of albums) {
    albumMap[album.id] = album;
  }

  if (isForce) {
    console.log(`Writing full replacement map of ${albums.length} albums to '/galleries'...`);
    await galleriesRef.set(albumMap);
  } else {
    console.log(`Updating ${albums.length} albums in '/galleries'...`);
    await galleriesRef.update(albumMap);
  }

  console.log(`✅ Successfully seeded ${albums.length} photo albums into Firebase RTDB!`);
  process.exit(0);
}

seedGalleries().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
