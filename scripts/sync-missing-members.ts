/**
 * Sync Missing Members Script
 *
 * Imports members from Notion into Firebase Realtime Database that were previously
 * omitted due to pagination limits (e.g. members after letter P).
 * Preserves all existing Firebase RTDB member data and customizations.
 * Creates Firebase Auth accounts for members with emails.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { getAdminDatabase, getAdminAuth } from '../app/lib/firebase/admin';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DB_ID;

if (!NOTION_TOKEN || !NOTION_MEMBERS_DB_ID) {
  console.error('❌ Missing NOTION_TOKEN or NOTION_MEMBERS_DB_ID');
  process.exit(1);
}

function cleanId(id: string | undefined): string {
  if (!id) return '';
  const match = id.match(/([a-f0-9]{32})/);
  if (match) return match[1];
  return id.replace(/-/g, '');
}

async function notionRequest<T = any>(endpoint: string, method: string, body?: any): Promise<T> {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API Error ${res.status}: ${text}`);
  }

  return res.json();
}

// Known duplicate Notion pages that correspond to existing members in Firebase
const KNOWN_DUPLICATE_NOTION_IDS = new Set([
  '2d29555c-6779-810c-b940-cc80cc5f8fd5', // Laurent Van Belle (duplicate of Laurent Vanbelle)
  '2d29555c-6779-81a3-8cb3-cade460722c4', // Luciano Szustak (duplicate of Lucien Szustak)
  '2c59555c-6779-80c9-a95b-c8ae763f6be3', // Nico Bruyère (duplicate of Nicolas Bruyere)
]);

async function syncMissingMembers() {
  console.log('🔄 Starting missing members synchronization...');

  const db = getAdminDatabase();
  const auth = getAdminAuth();

  // 1. Fetch current members from Firebase RTDB
  const membersRef = db.ref('members');
  const snap = await membersRef.once('value');
  const existingFirebaseIds = new Set<string>();
  const existingEmails = new Map<string, string>(); // email -> firebaseId
  let initialCount = 0;

  snap.forEach((child) => {
    initialCount++;
    const data = child.val();
    existingFirebaseIds.add(child.key);
    if (data.email) {
      existingEmails.set(data.email.toLowerCase().trim(), child.key);
    }
  });

  console.log(`📊 Currently in Firebase RTDB: ${initialCount} members`);

  // 2. Fetch all members from Notion using pagination
  const dbId = cleanId(NOTION_MEMBERS_DB_ID);
  let allNotionPages: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response: any = await notionRequest(`databases/${dbId}/query`, 'POST', {
      sorts: [{ property: 'Name', direction: 'ascending' }],
      page_size: 100,
      start_cursor: startCursor,
    });

    allNotionPages = [...allNotionPages, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  console.log(`📊 Total members in Notion: ${allNotionPages.length} members`);

  // 3. Process missing members
  let addedCount = 0;
  let skippedCount = 0;
  const addedMembers: { id: string; name: string; email: string }[] = [];

  for (const page of allNotionPages) {
    const notionId = page.id;
    const firebaseId = `member_${cleanId(notionId)}`;
    const props = page.properties;
    const name = props.Name?.title?.[0]?.plain_text || 'Unknown';
    const email = props.Email?.email?.trim() || '';

    // Check if already in Firebase
    if (existingFirebaseIds.has(firebaseId)) {
      skippedCount++;
      continue;
    }

    // Check known duplicates
    if (KNOWN_DUPLICATE_NOTION_IDS.has(notionId)) {
      console.log(`  ⏩ Skipping known duplicate Notion page: ${name} (${notionId})`);
      skippedCount++;
      continue;
    }

    // Check if duplicate email already belongs to a member
    if (email && existingEmails.has(email.toLowerCase()) && name === 'Nico Bruyère') {
      console.log(`  ⏩ Skipping email duplicate: ${name} (${email})`);
      skippedCount++;
      continue;
    }

    const photoFiles = props.Photo?.files || [];
    const photoUrl =
      photoFiles.length > 0
        ? photoFiles[0].file?.url || photoFiles[0].external?.url
        : 'https://placehold.co/400x400';

    const memberData: any = {
      name: name,
      role: props.Role?.multi_select?.map((r: any) => r.name) || [],
      bio: props.Bio?.rich_text?.[0]?.plain_text || '',
      photoUrl: photoUrl,
      phone: props.Phone?.phone_number || props.Mobile?.phone_number || props.GSM?.phone_number || '',
      email: email,
      notionId: notionId,
      createdAt: page.created_time || new Date().toISOString(),
    };

    // Try to create or find Firebase Auth user if email is provided
    let authUid: string | undefined = undefined;
    if (email) {
      try {
        const userRecord = await auth.createUser({
          email: email,
          password: 'ChangeMe123!',
          displayName: name,
          photoURL: photoUrl !== 'https://placehold.co/400x400' ? photoUrl : undefined,
        });
        authUid = userRecord.uid;
        console.log(`  ✅ Created Firebase Auth account for ${name} (${email})`);
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-exists') {
          try {
            const existingUser = await auth.getUserByEmail(email);
            authUid = existingUser.uid;
            console.log(`  ℹ️ Auth user already exists for ${email}, linked uid: ${authUid}`);
          } catch {
            console.log(`  ℹ️ Auth user already exists for ${email}`);
          }
        } else {
          console.warn(`  ⚠️ Could not create auth user for ${email}: ${authError.message}`);
        }
      }
    }

    if (authUid) {
      memberData.authUid = authUid;
    }

    // Save to Firebase RTDB
    await membersRef.child(firebaseId).set(memberData);
    existingFirebaseIds.add(firebaseId);
    if (email) {
      existingEmails.set(email.toLowerCase(), firebaseId);
    }

    addedCount++;
    addedMembers.push({ id: firebaseId, name, email });
    console.log(`  ➕ Added member: ${name} (${firebaseId})`);
  }

  // 4. Final verification
  const finalSnap = await membersRef.once('value');
  const finalCount = finalSnap.numChildren();
  const allNames: string[] = [];
  finalSnap.forEach((c) => {
    allNames.push(c.val().name);
  });
  allNames.sort((a, b) => a.localeCompare(b));

  console.log('\n========================================');
  console.log(`🎉 Synchronization finished!`);
  console.log(`   Initial member count: ${initialCount}`);
  console.log(`   Added members:        ${addedCount}`);
  console.log(`   Skipped members:      ${skippedCount}`);
  console.log(`   Final member count:   ${finalCount}`);
  console.log('\nAdded members list:');
  addedMembers.forEach((m, i) => console.log(`   ${i + 1}. ${m.name} (${m.email || 'no email'})`));

  console.log('\nAlphabetical range check:');
  console.log('   First 5:', allNames.slice(0, 5));
  console.log('   Last 10:', allNames.slice(-10));
  console.log('========================================\n');

  process.exit(0);
}

syncMissingMembers().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
