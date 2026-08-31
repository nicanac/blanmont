# Sidereal Satellite - Project Context

## Executive Summary

Sidereal Satellite is a web application for the **Club de Blanmont**. It serves as a central hub for managing cycling routes ("Traces"), club members, the annual calendar, news/blog, club gear, Carré Vert attendance, and coordinating the weekly "Saturday Ride". The application leverages **Firebase Realtime Database (RTDB)** as its primary backend and database (with Cloudinary for media storage and optional Notion fallback). Detailed database wiring and schemas are documented in [DATABASE.md](DATABASE.md).

## Tech Stack

- **Framework**: Next.js 16.0.8 (App Router with Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Database**: Firebase Realtime Database (via Admin SDK & Client SDK) — See [DATABASE.md](DATABASE.md)
- **Authentication**: Firebase Authentication (Email/Password, Custom Admin Claims)
- **Storage**: Cloudinary (Image uploads) & Firebase Storage
- **Styling**: Tailwind CSS (Primary), Headless UI, Heroicons.
- **Fonts**: Google Fonts (Poppins) via `next/font/google`.
- **Icons**: Heroicons (Solid & Outline)
- **Theme**: Light Mode default, Red/Black (Eco/Ciseco aesthetic).
- **Hosting environment**: Node.js (Vercel-compatible)

## Architecture & Folder Structure

```
/app
  /actions.ts         # Server Actions for mutations (Votes, Rides, Feedback)
  /components/        # Reusable UI components (Client & Server)
    Footer.tsx        # Responsive Footer with multi-column layout
    Navbar.tsx        # Client Component for AppBar/Navigation
    HeroActions.tsx   # Client Component for Landing Page interactions
    SaturdayRideView.tsx # Client View for Saturday Ride voting
  /context/
    AuthContext.tsx   # React Context for User Authentication state
  /le-club/           # Feature: Club information page (Bento layout)
  /lib/
    notion.ts         # CORE DATA LAYER: Fetching & Mapping (incl. new 'Direction' field)
  /login/             # Feature: User Login page
  /saturday-ride/     # Feature: Weekly voting system interactions
  /traces/            # Feature: Route browsing and details
    FilterPanel.tsx   # Responsive Drawer for filtering traces
    TraceCard.tsx     # Enhanced card with visual hover effects & overlay stats
    [id]/FeedbackForm.tsx # Component for submitting trace feedback
  /types.ts           # Global TypeScript interfaces
  layout.tsx          # Root layout (Font, Navbar, Footer, AuthProvider)
  page.tsx            # Landing page
  ThemeRegistry.tsx   # Legacy Material UI Theme provider (being deprecated)
```

## Business Logic & Core Flows

### 1. Trace Management

- **Goal**: Catalog valid cycling routes.
- **Data**: Stored in Notion "Traces" DB.
- **Features**:
  - browsing traces with stats (Distance, Elevation, Surface, Direction).
  - Advanced Filtering: Sidebar Drawer (Distance, Elevation, Ratings, etc.).
  - viewing details (Map URL, GPX link).
  - "Google Photos" integration (scraping album previews).
  - **UI**: Cards with image overlays for ratings, hover effects, and responsive tag layout.

### 2. Saturday Ride (Voting System)

- **Goal**: democratic choice of the weekly ride.
- **Roles**:
  - **President/Admin**: Can propose multiple traces for the upcoming Saturday.
  - **Members**: Can vote for their preferred trace.
- **Mechanism**:
  - Optimistic UI updates for instant voting feedback.
  - Limits: 1 vote per member per ride.
  - Statuses: `Draft` -> `Voting` -> `Closed`.

### 3. Feedback Loop

- **Goal**: Assess route quality.
- **Flow**: Members rating traces (1-5 stars) and leaving comments relative to specific experiences.
- **Auth**: Requires Login. Feedback is automatically attributed to the logged-in user.

### 4. Authentication & User Management

- **System**: Secure session-based authentication backed by Firebase Auth & Realtime Database with `HttpOnly`, `Secure`, `SameSite=Lax` cookies (`ccb_session`).
- **Session Layer**: Centralized in `app/lib/auth/session.ts` using tamper-proof Web Crypto HMAC-SHA256 tokens.
- **Middleware & Route Protection**: `middleware.ts` intercepts `/admin/*` and `/api/admin/*`, coupled with defense-in-depth verification (`verifyAdminRequest`) on all administrative API endpoints.
- **Context**: `AuthContext` provides client-side reactivity (`user`, `isAuthenticated`, `isAdmin`) synchronized with the server session cookie via Server Actions (`loginAction`, `logoutAction`, `getCurrentSessionUserAction`).

### 5. Localization

- **Language**: French (Français) is the primary language for all public-facing text.
- **Scope**: Navbar, Footer, Home, Traces, Voting, Feedback.

### 6. Calendar System

- **Goal**: Display the club's annual schedule and events.
- **Data**: Stored in Firebase Realtime Database `calendar-events` (with Notion fallback).
- **Features**:
  - **Month View**: Client-side interactive calendar (`CalendarView.tsx`).
  - **Events**: Cycling sorties, meetings, and special events.
  - **Visuals**: Color-coded days (Weekdays vs Weekends) and event types.
  - **Admin Navigation**: When logged in as an administrator/president, clicking an event in the calendar directly redirects to the admin edit page (`/admin/events/[id]/edit`) with visual edit indicators and quick-action buttons in the event drawer.
- **Flow**: Server component fetches all events -> hydrated to client for instant month navigation.

### 7. Carré Vert & Leaderboard System
- **Goal**: Track member attendance and calculate annual fidelity ranking.
- **Rules**:
  - **Weekend**: Participation on Saturday and/or Sunday gives **1 Carré Vert point max** per weekend. Both individual dates are preserved in the member's history.
  - **Weekdays**: Each ride on Monday-Friday (including public holidays) gives **+1 Carré Vert point**.
  - **Fidelity Rate**: $\frac{\text{Member Carrés}}{\text{Total Possible Carrés to Date}} \times 100$.
- **Source of Truth**: Google Sheets CSV export (`/api/admin/import-csv` & `/api/cron/sync-leaderboard`) with fallback to local `public/CC Blanmont - sorties 2026 - SORTiES.csv`, plus real-time admin toggles (`/admin/carre-vert` -> `/api/admin/attendance`).
- **Engine**: Centralized in `app/lib/carreVert.ts` (`calculateMemberCarres`, `getPossibleCarresCount`, `calculateLeaderboardFromAttendance`).
- **Data Model**: Firebase Realtime Database `attendance/{eventId}` and `leaderboard/{memberId}`. Detailed documentation in `memory/CARRE_VERT_PROCESS.md`.

## Key Technical Conventions

1.  **Data Fetching**:
    - All data access must go through `app/lib/notion.ts`.
    - Do NOT call Notion API directly in components; use the helper functions (`getTraces`, `getActiveRides`).
    - Use `cleanId()` to handle Notion UUIDs safely.

2.  **State & Mutations**:
    - Use **Server Actions** (`actions.ts`) for all writes (POST/PATCH).
    - Use `revalidatePath` to refresh data after mutations.
    - Implement **Optimistic UI** for high-latency interactions (e.g., Voting).

3.  **Styling & UI**:
    - **Tailwind First**: All new components should use Tailwind CSS classes.
    - **Aesthetics**: "Ciseco/Eco" style - Clean, White/Gray backgrounds, Rounded corners (xl/2xl), Black/Red accents.
    - **Fonts**: Use `var(--font-poppins)` (Poppins).
    - **Responsive**: Mobile-first approach is mandatory.

4.  **Localization**:
    - **French**: All UI text must be in French.
    - **Terminology**:
      - "Traces" -> "Parcours"
      - "Rides" -> "Sorties"
      - "Members" -> "Membres"

5.  **Notion Quirk Handling**:
    - The Notion API is strict. Use `isMockMode` check for local dev without secrets.
    - DB Queries often return raw pages; these MUST be mapped to clean interfaces (e.g., `mapPageToTrace`) immediately.
    - `Status` properties are type `active_status` or `status`, NOT `select`.

6.  **Version Control**:
    - **Branch Naming**: All branches must follow the pattern `user_name/type/feature_explanation_name`.
      - Example: `nicolas_bruyere/feature/trace-filtering`
      - Types: `feature`, `fix`, `chore`, `refactor`, `docs`.
    - **Commit Messages**: Follow the Semantic Commit pattern: `type(scope): subject`.
      - Example: `feature(voting): add optimistic UI for vote button`
      - Types match the branch types.
    - **Task Completion Rule**:
      - When a task or sub-task is verified and completed, **ALWAYS** commit and push the changes immediately.
      - Do not leave uncommitted changes at the end of a session or task block.

7.  **Continuous Documentation**:
    - **Rule**: Every time a feature is added or code is modified, the corresponding documentation (JSDoc, `AI_CONTEXT.md`, etc.) MUST be updated immediately.
    - **Scope**: Keep the AI context and Copilot instructions in sync with the codebase state.

8.  **Date & Timezone Handling**:
    - **Issue**: `new Date('YYYY-MM-DD')` parses as UTC 00:00:00. in timezones east of UTC (like Europe), this works, but in timezones west of UTC (like US), or if any time component is added, it can shift to the _previous day_. Conversely, `new Date(year, month, day)` creates a local time date.
    - **Rule**: When parsing pure dates (e.g., "2026-05-30") for visual display:
      - **Avoid**: `new Date(isoString)` which risks timezone shifts.
      - **Prefer**: Manual parsing `const [y, m, d] = isoString.split('-')` or `new Date(y, m-1, d)` which uses local browser time.
      - **Reason**: We want the date "May 30" to appear as "May 30" regardless of whether the user is in Tokyo, Brussels, or New York.

9.  **Graft Context Graph & Token Economy**:
    - **Purpose**: This repository is indexed with **Graft** (`@nanonets/graft`) to dramatically reduce token consumption (up to 40-60%+ savings) and eliminate repetitive cold exploration overhead.
    - **Usage**:
      - For semantic exploration / code location: `npx graft ask "<query>" --source` (or `npm run graft:ask -- "<query>" --source`).
      - For viewing file API skeleton: `npx graft skeleton <file>` (~200 tokens).
      - For dependency and caller blast-radius tracing: `npx graft callers <symbol> --depth 2`.
      - For codebase structure map: `npx graft map` (or `npm run graft:map`).
      - For exhaustive regex search across indexed code: `npx graft grep "<pattern>"`.
      - Rebuild index after major code updates: `npm run graft:build`.
    - **MCP Server**: Graft MCP server is configured in `.vscode/mcp.json` and `.mcp.json` providing native MCP tools (`graft_find_code`, `graft_file_api`, `graft_trace_calls`, etc.).
