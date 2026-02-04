/**
 * Notion to Firebase Migration Script
 *
 * This script migrates all data from Notion databases to Firebase Realtime Database.
 * It also creates Firebase Auth users for all members with email addresses.
 *
 * Prerequisites:
 * 1. Set up Firebase project with Realtime Database
 * 2. Enable Email/Password authentication in Firebase
 * 3. Set all required environment variables (see .env.example)
 *
 * Usage:
 * npx tsx scripts/migrate-notion-to-firebase.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

// Notion API configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DB_ID;
const NOTION_TRACES_DB_ID = process.env.NOTION_TRACES_DB_ID;
const NOTION_FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;
const NOTION_SATURDAY_RIDE_DB_ID = process.env.NOTION_SATURDAY_RIDE_DB_ID;
const NOTION_VOTES_DB_ID = process.env.NOTION_VOTES_DB_ID;
const NOTION_CALENDAR_DB_ID =
  process.env.NOTION_CALENDAR_DB_ID || '2d29555c-6779-80b0-a9e3-e07785d2d847';

// Firebase configuration
const FIREBASE_DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!NOTION_TOKEN) {
  console.error('❌ Missing NOTION_TOKEN environment variable');
  process.exit(1);
}

if (!FIREBASE_DATABASE_URL || !FIREBASE_SERVICE_ACCOUNT) {
  console.error(
    '❌ Missing Firebase configuration. Set NEXT_PUBLIC_FIREBASE_DATABASE_URL and FIREBASE_SERVICE_ACCOUNT_KEY'
  );
  process.exit(1);
}

console.log('Using Database URL:', FIREBASE_DATABASE_URL);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL,
});

const db = getDatabase(app);
const auth = getAuth(app);

// Notion API helper
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

function cleanId(id: string | undefined): string {
  if (!id) return '';
  const match = id.match(/([a-f0-9]{32})/);
  if (match) return match[1];
  return id.replace(/-/g, '');
}

// Mapping for Notion IDs to Firebase IDs
const idMappings = {
  members: new Map<string, string>(),
  traces: new Map<string, string>(),
  rides: new Map<string, string>(),
};

// ============================================
// MIGRATE MEMBERS
// ============================================
async function migrateMembers() {
  console.log('\n📦 Migrating Members...');

  if (!NOTION_MEMBERS_DB_ID) {
    console.log('⚠️  No NOTION_MEMBERS_DB_ID configured, skipping members migration');
    return;
  }

  try {
    const dbId = cleanId(NOTION_MEMBERS_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      sorts: [{ property: 'Name', direction: 'ascending' }],
    });

    const members: any[] = [];

    for (const page of response.results) {
      const props = page.properties;
      const notionId = page.id;
      const firebaseId = `member_${cleanId(notionId)}`;

      idMappings.members.set(notionId, firebaseId);

      const photoFiles = props.Photo?.files || [];
      const photoUrl =
        photoFiles.length > 0
          ? photoFiles[0].file?.url || photoFiles[0].external?.url
          : 'https://placehold.co/400x400';

      const email = props.Email?.email || '';
      const password = props.Password?.rich_text?.[0]?.plain_text || '';

      const member = {
        name: props.Name?.title?.[0]?.plain_text || 'Unknown',
        role: props.Role?.multi_select?.map((r: any) => r.name) || [],
        bio: props.Bio?.rich_text?.[0]?.plain_text || '',
        photoUrl: photoUrl,
        phone:
          props.Phone?.phone_number || props.Mobile?.phone_number || props.GSM?.phone_number || '',
        email: email,
        notionId: notionId, // Keep reference for debugging
        createdAt: page.created_time,
      };

      members.push({ id: firebaseId, data: member, email, password });
    }

    // Write to Firebase
    const membersRef = db.ref('members');
    for (const { id, data, email, password } of members) {
      await membersRef.child(id).set(data);

      // Create Firebase Auth user if email exists
      if (email) {
        try {
          const userRecord = await auth.createUser({
            email: email,
            password: password || 'ChangeMe123!', // Default password if none set
            displayName: data.name,
            photoURL: data.photoUrl !== 'https://placehold.co/400x400' ? data.photoUrl : undefined,
          });

          // Update member with auth UID
          await membersRef.child(id).update({ authUid: userRecord.uid });
          console.log(`  ✅ Created auth user for ${email}`);
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-exists') {
            console.log(`  ℹ️  Auth user already exists for ${email}`);
          } else {
            console.log(`  ⚠️  Failed to create auth user for ${email}: ${authError.message}`);
          }
        }
      }
    }

    console.log(`✅ Migrated ${members.length} members`);
  } catch (error) {
    console.error('❌ Failed to migrate members:', error);
  }
}

// ============================================
// MIGRATE TRACES
// ============================================
async function migrateTraces() {
  console.log('\n📦 Migrating Traces...');

  if (!NOTION_TRACES_DB_ID) {
    console.log('⚠️  No NOTION_TRACES_DB_ID configured, skipping traces migration');
    return;
  }

  try {
    const dbId = cleanId(NOTION_TRACES_DB_ID);
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response: any = await notionRequest(`databases/${dbId}/query`, 'POST', {
        sorts: [{ property: 'Name', direction: 'ascending' }],
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults = [...allResults, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    const traces: any[] = [];

    for (const page of allResults) {
      const props = page.properties;
      const notionId = page.id;
      const firebaseId = `trace_${cleanId(notionId)}`;

      idMappings.traces.set(notionId, firebaseId);

      const kmFormula = props.km?.formula;
      const dist =
        props.Distance?.number || parseFloat(kmFormula?.string || kmFormula?.number || '0');

      const ratingSelect = props.Rating?.select;
      const ratingStr = ratingSelect?.name || '';
      const quality = ratingStr.replace(/[^⭐]/g, '').length || 3;

      const photoFiles = props.photo?.files || [];
      const mapPreviewFiles = props['map-preview']?.files || [];
      let photoUrl = '';

      if (mapPreviewFiles.length > 0) {
        photoUrl = mapPreviewFiles[0].file?.url || mapPreviewFiles[0].external?.url || '';
      } else if (photoFiles.length > 0) {
        photoUrl = photoFiles[0].file?.url || photoFiles[0].external?.url || '';
      }

      const trace = {
        name: props.Name?.title?.[0]?.plain_text || 'Unknown',
        distance: dist,
        elevation: props.Elevation?.number || props['D+']?.number || 0,
        surface: props.road?.select?.name || 'Road',
        quality: quality,
        rating: ratingStr,
        ratingColor: ratingSelect?.color || 'default',
        description: props.Description?.rich_text?.[0]?.plain_text || '',
        mapUrl: props.Komoot?.url || '',
        gpxUrl: props.GPX?.files?.[0]?.file?.url || props.GPX?.files?.[0]?.external?.url || '',
        photoUrl: photoUrl,
        photoAlbumUrl: props.photo?.url || '',
        start: props.start?.select?.name || '',
        end: props.end?.select?.name || '',
        direction:
          props.Direction?.select?.name || props.Direction?.rich_text?.[0]?.plain_text || '',
        polyline: props.MapPolyline?.rich_text?.map((t: any) => t.plain_text).join('') || '',
        status: props.Status?.status?.name || props.Status?.select?.name || 'To Do',
        lastDone: props['last done']?.date?.start || '',
        notionId: notionId,
        createdAt: page.created_time,
      };

      traces.push({ id: firebaseId, data: trace });
    }

    // Write to Firebase
    const tracesRef = db.ref('traces');
    for (const { id, data } of traces) {
      await tracesRef.child(id).set(data);
    }

    console.log(`✅ Migrated ${traces.length} traces`);
  } catch (error) {
    console.error('❌ Failed to migrate traces:', error);
  }
}

// ============================================
// MIGRATE FEEDBACK
// ============================================
async function migrateFeedback() {
  console.log('\n📦 Migrating Feedback...');

  if (!NOTION_FEEDBACK_DB_ID) {
    console.log('⚠️  No NOTION_FEEDBACK_DB_ID configured, skipping feedback migration');
    return;
  }

  try {
    const dbId = cleanId(NOTION_FEEDBACK_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const feedbackList: any[] = [];

    for (const page of response.results) {
      const props = page.properties;
      const notionId = page.id;
      const firebaseId = `feedback_${cleanId(notionId)}`;

      const traceRelation = props.Trace?.relation || [];
      const memberRelation = props.Members?.relation || [];

      const notionTraceId = traceRelation.length > 0 ? traceRelation[0].id : '';
      const notionMemberId = memberRelation.length > 0 ? memberRelation[0].id : '';

      const feedback = {
        traceId: idMappings.traces.get(notionTraceId) || notionTraceId,
        memberId: idMappings.members.get(notionMemberId) || notionMemberId,
        comment: props.Comment?.title?.[0]?.plain_text || '',
        rating: props.Rating?.number || 0,
        notionId: notionId,
        createdAt: page.created_time,
      };

      feedbackList.push({ id: firebaseId, data: feedback });
    }

    // Write to Firebase
    const feedbackRef = db.ref('feedback');
    for (const { id, data } of feedbackList) {
      await feedbackRef.child(id).set(data);
    }

    console.log(`✅ Migrated ${feedbackList.length} feedback entries`);
  } catch (error) {
    console.error('❌ Failed to migrate feedback:', error);
  }
}

// ============================================
// MIGRATE SATURDAY RIDES
// ============================================
async function migrateSaturdayRides() {
  console.log('\n📦 Migrating Saturday Rides...');

  if (!NOTION_SATURDAY_RIDE_DB_ID) {
    console.log('⚠️  No NOTION_SATURDAY_RIDE_DB_ID configured, skipping rides migration');
    return;
  }

  try {
    const dbId = cleanId(NOTION_SATURDAY_RIDE_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      sorts: [{ property: 'Date', direction: 'ascending' }],
    });

    const rides: any[] = [];

    for (const page of response.results) {
      const props = page.properties;
      const notionId = page.id;
      const firebaseId = `ride_${cleanId(notionId)}`;

      idMappings.rides.set(notionId, firebaseId);

      const candidates =
        props.Candidates?.relation?.map((r: { id: string }) => {
          return idMappings.traces.get(r.id) || r.id;
        }) || [];

      const selectedId = props['Selected Trace']?.relation?.[0]?.id;

      const ride = {
        date: props.Date?.date?.start || '',
        candidateTraceIds: candidates,
        selectedTraceId: selectedId ? idMappings.traces.get(selectedId) || selectedId : '',
        status: props.Status?.status?.name || props.Status?.select?.name || 'Draft',
        notionId: notionId,
        createdAt: page.created_time,
      };

      rides.push({ id: firebaseId, data: ride });
    }

    // Write to Firebase
    const ridesRef = db.ref('saturday-rides');
    for (const { id, data } of rides) {
      await ridesRef.child(id).set(data);
    }

    console.log(`✅ Migrated ${rides.length} Saturday rides`);
  } catch (error) {
    console.error('❌ Failed to migrate Saturday rides:', error);
  }
}

// ============================================
// MIGRATE VOTES
// ============================================
async function migrateVotes() {
  console.log('\n📦 Migrating Votes...');

  if (!NOTION_VOTES_DB_ID) {
    console.log('⚠️  No NOTION_VOTES_DB_ID configured, skipping votes migration');
    return;
  }

  try {
    const dbId = cleanId(NOTION_VOTES_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {});

    const votes: any[] = [];

    for (const page of response.results) {
      const props = page.properties;
      const notionId = page.id;
      const firebaseId = `vote_${cleanId(notionId)}`;

      const rideId = props.Ride?.relation?.[0]?.id || '';
      const memberId = props.Member?.relation?.[0]?.id || '';
      const traceId = props.Trace?.relation?.[0]?.id || '';

      const vote = {
        rideId: idMappings.rides.get(rideId) || rideId,
        memberId: idMappings.members.get(memberId) || memberId,
        traceId: idMappings.traces.get(traceId) || traceId,
        notionId: notionId,
        createdAt: page.created_time,
      };

      votes.push({ id: firebaseId, data: vote });
    }

    // Write to Firebase
    const votesRef = db.ref('votes');
    for (const { id, data } of votes) {
      await votesRef.child(id).set(data);
    }

    console.log(`✅ Migrated ${votes.length} votes`);
  } catch (error) {
    console.error('❌ Failed to migrate votes:', error);
  }
}

// ============================================
// MIGRATE CALENDAR EVENTS
// ============================================
async function migrateCalendarEvents() {
  console.log('\n📦 Migrating Calendar Events...');

  if (!NOTION_CALENDAR_DB_ID) {
    console.log('⚠️  No NOTION_CALENDAR_DB_ID configured, skipping calendar migration');
    return;
  }

  try {
    const dbId = cleanId(NOTION_CALENDAR_DB_ID);
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response: any = await notionRequest(`databases/${dbId}/query`, 'POST', {
        sorts: [{ property: 'Date', direction: 'ascending' }],
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults = [...allResults, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    const events: any[] = [];

    for (const page of allResults) {
      const props = page.properties;
      const notionId = page.id;
      const firebaseId = `event_${cleanId(notionId)}`;

      const event = {
        isoDate: props.Date?.date?.start || '',
        location: props.Lieu?.rich_text?.[0]?.text?.content || '',
        distances: props.Distances?.rich_text?.[0]?.text?.content || '',
        departure: props['Départ']?.rich_text?.[0]?.text?.content || '',
        address: props.Adresse?.rich_text?.[0]?.text?.content || '',
        remarks: props.Remarques?.rich_text?.[0]?.text?.content || '',
        alternative: props.Alternative?.rich_text?.[0]?.text?.content || '',
        group: props.Groupe?.rich_text?.[0]?.text?.content || '',
        notionId: notionId,
        createdAt: page.created_time,
      };

      events.push({ id: firebaseId, data: event });
    }

    // Write to Firebase
    const eventsRef = db.ref('calendar-events');
    for (const { id, data } of events) {
      await eventsRef.child(id).set(data);
    }

    console.log(`✅ Migrated ${events.length} calendar events`);
  } catch (error) {
    console.error('❌ Failed to migrate calendar events:', error);
  }
}

// ============================================
// MAIN MIGRATION
// ============================================
async function main() {
  console.log('🚀 Starting Notion to Firebase Migration');
  console.log('========================================\n');

  // Migrate in order (members and traces first for ID mappings)
  await migrateMembers();
  await migrateTraces();

  // Then migrate dependent data
  await migrateFeedback();
  await migrateSaturdayRides();
  await migrateVotes();
  await migrateCalendarEvents();

  console.log('\n========================================');
  console.log('🎉 Migration Complete!');
  console.log('\nID Mappings Summary:');
  console.log(`  Members: ${idMappings.members.size} mapped`);
  console.log(`  Traces: ${idMappings.traces.size} mapped`);
  console.log(`  Rides: ${idMappings.rides.size} mapped`);
  console.log('\n⚠️  Important Next Steps:');
  console.log('1. Update your .env file with Firebase credentials');
  console.log('2. Remove Notion environment variables');
  console.log('3. Users with migrated emails should reset their passwords via Firebase');

  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
