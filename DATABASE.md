# 🗄️ Database Architecture & Wiring Guide

> **Blanmont Cycling Club (`blanmont`)**  
> Complete documentation of the database layer, architecture, data schemas, access methods, caching strategies, and operational workflows.

---

## 1. 🏗️ High-Level Architecture Overview

The Blanmont web application operates on a **modern hybrid cloud architecture** centered around **Firebase Realtime Database (RTDB)** as the single source of truth for dynamic application data.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    NEXT.JS APPLICATION                                 │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│               SERVER SIDE               │                  CLIENT SIDE                 │
│  (Server Components, Actions, Routes)   │              (React Components)              │
│                                         │                                              │
│         Firebase Admin SDK              │             Firebase Client SDK              │
│      (app/lib/firebase/admin.ts)        │         (app/lib/firebase/client.ts)         │
│   Uses FIREBASE_SERVICE_ACCOUNT_KEY     │         Uses NEXT_PUBLIC_FIREBASE_*          │
│       • Full read/write privileges      │        • Public read / Authenticated writes  │
│       • Bypasses security rules         │        • Governed by RTDB rules              │
│       • Admin Auth & Custom Claims      │        • Firebase Auth Client (login/state)  │
└────────────────────┬────────────────────┴───────────────────────┬──────────────────────┘
                     │                                            │
                     ▼                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       FIREBASE REALTIME DATABASE (europe-west1)                        │
│             https://blanmont-c11e3-default-rtdb.europe-west1.firebasedatabase.app      │
│                                                                                        │
│   ├── /traces            (Parcours & GPX routes)                                       │
│   ├── /members           (Club members, roles & profiles)                              │
│   ├── /calendar-events   (Annual ride calendar & events)                               │
│   ├── /attendance        (Carré Vert presence per event & group)                       │
│   ├── /saturday-rides    (Weekly Saturday ride proposals & status)                     │
│   ├── /votes             (Member votes on Saturday ride traces)                        │
│   ├── /blog              (Club news, articles & announcements)                         │
│   ├── /equipment         (Gobik club apparel catalogue)                                │
│   ├── /feedback          (Trace reviews and ratings)                                   │
│   └── /leaderboard       (Member participation statistics & dates)                     │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│       CLOUDINARY STORAGE        │             │        NOTION FALLBACK          │
│  • Member avatar uploads        │             │  • Historical data source       │
│  • Blog cover pictures          │             │  • Fallback in mock mode        │
│  • Route & equipment media      │             │  • Optional legacy sync         │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

---

## 2. 🔑 Environment Variables & Configuration

All database and cloud connections are configured via `.env.local`:

| Variable | Purpose | Scope |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full JSON string of Google Service Account credentials for Admin SDK (includes `private_key`, `client_email`, etc.) | **Server Only** |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key for Client SDK authentication | **Public / Client** |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain (e.g. `blanmont-c11e3.firebaseapp.com`) | **Public / Client** |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | RTDB instance URL (`https://blanmont-c11e3-default-rtdb.europe-west1.firebasedatabase.app`) | **Public / Client** |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | GCP / Firebase Project ID (`blanmont-c11e3`) | **Public / Client** |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase Cloud Storage bucket (`blanmont-c11e3.firebasestorage.app`) | **Public / Client** |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | **Public / Client** |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web Application ID | **Public / Client** |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Credentials for high-resolution image uploads | **Server Only** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | **Public / Client** |
| `NOTION_TOKEN` / `NOTION_*_DB_ID` | Notion API access token and database UUIDs (used for migration & legacy fallback) | **Server Only** |
| `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` | Strava OAuth credentials for syncing club rides | **Server Only** |

---

## 3. 📂 Data Schemas & RTDB Node Tree

### 3.1. `/traces` — Cycling Routes (Parcours)
Stores all club routes, GPS statistics, and GPX/Komoot metadata.
```json
{
  "trace_12338a3128914ee4b788916553028046": {
    "id": "trace_12338a3128914ee4b788916553028046",
    "name": "Boucle Méhaigne",
    "distance": 95,
    "elevation": 476,
    "direction": "← Ouest",
    "surface": "Road",
    "quality": 4,
    "rating": "⭐⭐⭐⭐",
    "mapUrl": "https://www.komoot.fr/tour/968833009",
    "gpxUrl": "https://...",
    "komootImageUrl": "https://...",
    "photoUrl": "/images/traces/mehaigne.jpg",
    "start": "Blanmont",
    "end": "Roux-Miroir",
    "description": "Belle sortie vallonnée avec passages bucoliques.",
    "isFavorite": false,
    "lastDone": "2024-06-05",
    "createdAt": "2022-11-02T12:21:00.000Z"
  }
}
```

### 3.2. `/members` — Club Members & Profiles
Contains all registered cyclos, their contact information, club roles, and linked Firebase Auth accounts.
```json
{
  "member_2cd9555c677980aaa529f4985fd6ebf7": {
    "id": "member_2cd9555c677980aaa529f4985fd6ebf7",
    "name": "Laurent Vanbelle",
    "email": "famille.vanbelle@skynet.be",
    "role": ["Member"],
    "bio": "Passionné de vélo de route et longues distances.",
    "phone": "+32 470 12 34 56",
    "photoUrl": "https://res.cloudinary.com/dizy3s5zh/image/upload/...",
    "authUid": "ZktaF5nP9hUDE5J23SRb42DMcqv1",
    "stravaId": "192380",
    "notionId": "2cd9555c-6779-80aa-a529-f4985fd6ebf7",
    "createdAt": "2025-12-18T09:19:00.000Z"
  }
}
```

### 3.3. `/calendar-events` — Annual Event Calendar
Stores weekly scheduled rides and special events throughout the year.
```json
{
  "event_2d29555c677981068b31fca30da6374b": {
    "id": "event_2d29555c677981068b31fca30da6374b",
    "isoDate": "2026-03-08",
    "departure": "13h00",
    "location": "Club Blanmont",
    "address": "FECHERE",
    "distances": "80-110",
    "group": "",
    "remarks": "Ravitaillement prévu à mi-parcours",
    "alternative": "",
    "notionId": "2d29555c-6779-8106-8b31-fca30da6374b",
    "createdAt": "2025-12-23T15:52:00.000Z"
  }
}
```

### 3.4. `/attendance` — Carré Vert Attendance & Groups
Tracks ride attendance per event and group allocation (V = Vert, J = Jaune, B = Bleu, R = Rouge).
```json
{
  "event_2d89555c67798102aff4c76cc1a45bd4": {
    "isoDate": "2026-07-05",
    "members": {
      "entry_1770390404487_13": {
        "memberId": "entry_1770390404487_13",
        "name": "Pascal Jacquemin",
        "group": "V",
        "markedAt": "2026-08-26T05:37:19.856Z"
      }
    }
  }
}
```

### 3.5. `/saturday-rides` & `/votes` — Saturday Ride Voting System
Democratic voting mechanism for the upcoming weekend ride.
```json
// /saturday-rides/ride_2cd9555c677980a68fc7fa72667e5936
{
  "id": "ride_2cd9555c677980a68fc7fa72667e5936",
  "date": "2026-05-30",
  "status": "Voting",
  "candidateTraceIds": [
    "trace_fecacd0fbb1a49bf938f12db910f0d69",
    "trace_63395a9302e343ffbfc5e2629194d88f"
  ],
  "selectedTraceId": null,
  "createdAt": "2026-05-25T11:10:00.000Z"
}

// /votes/vote_2cd9555c67798104a0cff604ce636f3a
{
  "id": "vote_2cd9555c67798104a0cff604ce636f3a",
  "rideId": "ride_2cd9555c677980a68fc7fa72667e5936",
  "memberId": "member_2c59555c677980c9a95bc8ae763f6be3",
  "traceId": "trace_fecacd0fbb1a49bf938f12db910f0d69",
  "createdAt": "2026-05-26T08:15:00.000Z"
}
```

### 3.6. `/blog` — News & Articles
Club publications, technical gear guides, and ride reports.
```json
{
  "-OkdMWaZZ6Teznm7siy3": {
    "id": "-OkdMWaZZ6Teznm7siy3",
    "title": "Les nouveaux maillots sont là !",
    "slug": "les-nouveaux-maillots-sont-la",
    "excerpt": "Un grand merci à Fabian et Nicolas pour la gestion du projet et le redesign...",
    "content": "# Les nouveaux maillots sont là !\n\nC'est avec une grande fierté...",
    "coverImage": "https://res.cloudinary.com/dizy3s5zh/image/upload/...",
    "author": "Nicolas Bruyere",
    "authorAvatar": "/images/home-hero.jpg",
    "category": "Actualités",
    "publishedAt": "2026-02-04T15:55:59.124Z",
    "isPublished": true
  }
}
```

### 3.7. `/equipment` — Apparel Catalogue (Gobik)
Club cycling kit models, categories, and availability.
```json
{
  "CoupeVent": {
    "id": "CoupeVent",
    "name": "Coupe vent",
    "category": "Veste",
    "description": "Gilet coupe-vent Plus 2.0 Homme. Code: CoupeVent",
    "gobikReference": "VEST PLUS 2.0 MEN CUSTOM",
    "imageUrl": "/images/equipment/CoupeVent.jpg",
    "isAvailable": true,
    "createdAt": "2026-02-07T20:07:31.801Z"
  }
}
```

### 3.8. `/feedback` — Route Reviews
Member reviews, comments, and star ratings for specific routes.
```json
{
  "feedback_2c79555c677981138812fded1b6cdab1": {
    "id": "feedback_2c79555c677981138812fded1b6cdab1",
    "traceId": "trace_2c8c3186eb2246df81b1263b651ac503",
    "memberId": "member_2cd9555c677980aaa529f4985fd6ebf7",
    "memberName": "Laurent Vanbelle",
    "rating": 5,
    "comment": "Superbe tracé, routes calmes et très beau panorama !",
    "createdAt": "2025-12-12T10:47:00.000Z"
  }
}
```

### 3.9. `/leaderboard` — Participation Ranking
Aggregated attendance count and historical participation dates per member.
```json
{
  "entry_1770390404485_0": {
    "id": "entry_1770390404485_0",
    "name": "Marc Dupont",
    "totalRides": 28,
    "dates": ["25/01/2025", "01/02/2025", "08/02/2025", "15/02/2025"],
    "createdAt": "2026-02-06T15:06:44.485Z"
  }
}
```

---

## 4. 🔌 Code Wiring: Data Access Layers (`app/lib/firebase/`)

The application isolates database access in `app/lib/firebase/`:

| Module | Purpose | Key Exports |
|---|---|---|
| [`client.ts`](app/lib/firebase/client.ts) | Initializes Client SDK; provides helper utilities (`snapshotToArray`, `snapshotToObject`, `cleanId`, `isMockMode`) | `getFirebaseDatabase`, `getFirebaseAuth`, `getFirebaseStorage` |
| [`admin.ts`](app/lib/firebase/admin.ts) | Initializes Admin SDK with Service Account certificate; bypasses client rules on server side | `getAdminDatabase`, `getAdminAuth`, `isAdminConfigured` |
| [`traces.ts`](app/lib/firebase/traces.ts) | Queries & mutations for routes; Komoot OpenGraph image fetching; cache revalidation | `getTraces`, `getTrace`, `createTrace`, `updateTrace`, `deleteTrace` |
| [`members.ts`](app/lib/firebase/members.ts) | Member listings, profile updates, photo sync, role validation | `getMembers`, `getMemberById`, `updateMemberPhoto`, `validateUser` |
| [`calendar.ts`](app/lib/firebase/calendar.ts) | Scheduled events, month view queries, upcoming ride resolution | `getCalendarEvents`, `getCalendarEventById`, `createCalendarEvent` |
| [`attendance.ts`](app/lib/firebase/attendance.ts) | Carré Vert attendance tracking, group allocations per event | `getAttendance`, `markAttendance`, `removeAttendance` |
| [`saturday-ride.ts`](app/lib/firebase/saturday-ride.ts) | Active weekly ride proposal, vote casting and vote tallying | `getActiveRides`, `voteForTrace`, `createSaturdayRide` |
| [`blog.ts`](app/lib/firebase/blog.ts) | Blog articles, slug querying, Markdown conversion, admin post editor | `getBlogPosts`, `getBlogPostBySlug`, `createBlogPost`, `updateBlogPost` |
| [`equipment.ts`](app/lib/firebase/equipment.ts) | Gobik gear items, categories, ordering, availability | `getEquipment`, `getEquipmentById`, `updateEquipment` |
| [`leaderboard.ts`](app/lib/firebase/leaderboard.ts) | Member ranking calculations, attendance date sync | `getLeaderboard`, `updateLeaderboardEntry` |
| [`feedback.ts`](app/lib/firebase/feedback.ts) | Route reviews and star ratings | `getFeedbackForTrace`, `submitFeedback` |

---

## 5. ⚡ Caching, Revalidation & Optimization Strategy

To achieve high performance and minimize database reads, data fetching combines Next.js **App Router caching** (`unstable_cache`) with **on-demand revalidation**:

```typescript
// Example: Cached Trace Fetching
export const getTraces = unstable_cache(
  async (): Promise<Trace[]> => {
    const db = getAdminDatabase();
    const snapshot = await db.ref('traces').once('value');
    return snapshotToArray<Trace>(snapshot);
  },
  ['all-traces'],
  {
    revalidate: 60,       // Stale-While-Revalidate after 60 seconds
    tags: ['traces'],     // Tag for on-demand invalidation
  }
);
```

### On-Demand Cache Invalidation
When mutations occur (via Server Actions or API routes), the cache is purged immediately:
```typescript
export const revalidateTracesCache = async () => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/traces');
};
```

---

## 6. 🛡️ Authentication & Authorization Flow

1. **Firebase Authentication**:
   - Members authenticate via Email / Password using `signInWithEmailAndPassword` or password reset emails.
2. **Member Record Association**:
   - The user's Firebase Auth `UID` is stored in `/members/<id>/authUid`.
3. **Role-Based Access Control (RBAC)**:
   - User roles (`['President']`, `['Admin']`, `['Member']`) are checked server-side and in `AuthContext.tsx`.
   - Admin routes (`/admin/*`) are protected by [`AdminGuard.tsx`](app/admin/components/AdminGuard.tsx).
   - Custom claims (`{ admin: true }`) can be verified or granted using Admin SDK scripts.

---

## 7. 🛠️ Operational Scripts (`scripts/`)

The repository includes administrative and maintenance scripts located in `scripts/`:

| Command | Purpose |
|---|---|
| `npx tsx scripts/seed-blog.ts` | Populates / resets the 7 blog articles in French with proper image metadata and author attribution. |
| `npx tsx scripts/backup-db.ts` | Creates a full JSON backup of the RTDB tree to disk. |
| `npx tsx scripts/set-admin-claim.ts <email>` | Grants Firebase Auth `{ admin: true }` custom claim to a member. |
| `npx tsx scripts/verify-admin.ts <email>` | Inspects token claims for an authenticated user. |
| `npx tsx scripts/migrate-notion-to-firebase.ts` | Historical migration utility to transfer pages from Notion databases into Firebase RTDB. |
| `npx tsx scripts/sync-carre-vert.js` | Synchronizes Carré Vert attendance scores with the calendar. |

---

## 8. 📝 Developer Recipes

### 8.1. How to Read Data in a Server Component
```tsx
import { getTraces } from '@/app/lib/firebase';

export default async function TracesPage() {
  const traces = await getTraces();
  return <TraceList traces={traces} />;
}
```

### 8.2. How to Mutate Data in a Server Action / Route
```typescript
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

export async function addTrace(formData: FormData) {
  'use server';
  const db = getAdminDatabase();
  const newRef = db.ref('traces').push();
  await newRef.set({
    id: newRef.key,
    name: formData.get('name'),
    distance: Number(formData.get('distance')),
    createdAt: new Date().toISOString(),
  });
  revalidatePath('/traces');
}
```

---

## 9. 🔍 Troubleshooting & Common Issues

- **`FIREBASE_SERVICE_ACCOUNT_KEY` Private Key Newlines**:
  When storing JSON credentials in environment variables, newline characters in `private_key` must be properly unescaped. `app/lib/firebase/admin.ts` automatically converts literal `\n` to true newlines.
- **Mock Mode**:
  If `NEXT_PUBLIC_FIREBASE_API_KEY` is undefined, the application gracefully operates in mock mode with static fixtures.
- **Timezone Safety**:
  Date calculations for calendar events and Saturday rides use UTC or discrete `YYYY-MM-DD` string parsing (see [`app/lib/carreVert.ts`](app/lib/carreVert.ts)) to prevent timezone shifts across geographical client locations.
