# Project Architecture

## Overview
**Sidereal Satellite** (Blanmont) is a Next.js application managing cycling club activities, members, and events. It leverages Firebase for backend services and Next.js App Router for the frontend and API.

## 🛠 Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Material UI 7](https://mui.com/)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth (Admin SDK & Client SDK)
- **Maps**: Leaflet / Mapbox Polyline
- **Parsing**: `pdf-parse` (Server-side)

## 📂 Key Directory Structure
```
root
├── app/                  # Next.js App Router
│   ├── admin/            # Protected Admin Dashboard
│   ├── api/              # Backend API Routes (Strava auth, Cron jobs)
│   ├── components/       # Reusable UI Components
│   ├── context/          # React Context (AuthContext)
│   ├── lib/              # Core Logic & Configuration
│   │   ├── firebase/     # Firebase Admin & Client initialization
│   │   └── noton/        # Legacy/Integration logic
│   └── types/            # TypeScript Definitions
├── memory/               # Project Documentation & Task Tracking
├── public/               # Static Assets
└── scripts/              # Utility Scripts (Backup, Migration)
```

## 🔌 Core Services

### Firebase
- **Configuration**:
  - Client: `app/lib/firebase/client.ts` uses `NEXT_PUBLIC_` env vars.
  - Admin: `app/lib/firebase/admin.ts` uses Service Account from `FIREBASE_SERVICE_ACCOUNT_KEY` env var.
- **Database Model**:
  - `members`: User profiles.
  - `events`: Calendar entries (Trace details).
  - `traces`: GPX/Route metadata.
  - `blog`: News and updates.

### External Integrations
- **Strava**: Used for fetching route data and elevation profiles.
  - Handled in `app/api/auth/strava` and `app/lib/strava.ts`.
- **Notion**: (Legacy/Migration) Previous data source, scripts exist to migrate to Firebase.

## 🔄 Data Flow
1.  **Server Actions**: Primary method for data mutation (Forms, Imports). Located in `actions.ts` files alongside pages.
2.  **API Routes**: Used for webhooks (Strava) and cron jobs (Syncing leaderboards).
3.  **Client Components**: Fetch data via Firebase Client SDK or receive initial data from Server Components.

## 🚀 Deployment
- **Platform**: Vercel (implied by `vercel.json` and Next.js).
- **Environment**: Requires `FIREBASE_SERVICE_ACCOUNT_KEY` and public config vars.
