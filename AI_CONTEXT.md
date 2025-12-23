# Sidereal Satellite - Project Context

## Executive Summary
Sidereal Satellite is a web application for the **Blanmont Cycling Club**. It serves as a central hub for managing cycling routes ("Traces"), club members, and coordinating the weekly "Saturday Ride". The application leverages **Notion** as a headless CMS and database, providing a flexible backend that non-technical users can easily manage.

## Tech Stack
- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: Notion API (via custom fetch wrapper)
- **Styling**: Tailwind CSS (Primary), Headless UI, Heroicons. (Migrating away from Material UI).
- **Fonts**: Google Fonts (Poppins) via `next/font/google`.
- **Icons**: Heroicons (Solid & Outline)
- **Theme**: Light Mode default, Red/Black (Eco/Ciseco aesthetic).
- **Build Tool**: Turbopack
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
- **System**: Simple email/passwordless (mockable) or notion-backed member matching.
- **Context**: `AuthContext` provides global user state (`user`, `isAuthenticated`).
- **Flow**: Login page -> server action verifies against Notion Members DB -> sets cookie/state.

### 5. Localization
- **Language**: French (Français) is the primary language for all public-facing text.
- **Scope**: Navbar, Footer, Home, Traces, Voting, Feedback.

### 6. Calendar System
- **Goal**: Display the club's annual schedule and events.
- **Data**: Stored in Notion "Calendar" DB (`CALENDAR_DB_ID`).
- **Features**:
  - **Month View**: Client-side interactive calendar (`CalendarView.tsx`).
  - **Events**: Cycling sorties, meetings, and special events.
  - **Visuals**: Color-coded days (Weekdays vs Weekends) and event types.
- **Flow**: Server component fetches all events -> hydrated to client for instant month navigation.

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

4.  **Notion Quirk Handling**:
    - The Notion API is strict. Use `isMockMode` check for local dev without secrets.
    - DB Queries often return raw pages; these MUST be mapped to clean interfaces (e.g., `mapPageToTrace`) immediately.
    - `Status` properties are type `active_status` or `status`, NOT `select`.

5.  **Version Control**:
    - **Branch Naming**: All branches must follow the pattern `user_name/type/feature_explanation_name`.
      - Example: `nicolas_bruyere/feature/trace-filtering`
      - Types: `feature`, `fix`, `chore`, `refactor`, `docs`.
    - **Commit Messages**: Follow the Semantic Commit pattern: `type(scope): subject`.
      - Example: `feature(voting): add optimistic UI for vote button`
      - Types match the branch types.
    - **Task Completion Rule**:
      - When a task or sub-task is verified and completed, **ALWAYS** commit and push the changes immediately.
      - Do not leave uncommitted changes at the end of a session or task block.

6.  **Continuous Documentation**:
    - **Rule**: Every time a feature is added or code is modified, the corresponding documentation (JSDoc, `AI_CONTEXT.md`, etc.) MUST be updated immediately.
    - **Scope**: Keep the AI context and Copilot instructions in sync with the codebase state.
