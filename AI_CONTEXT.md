# Sidereal Satellite - Project Context

## Executive Summary
Sidereal Satellite is a web application for the **Blanmont Cycling Club**. It serves as a central hub for managing cycling routes ("Traces"), club members, and coordinating the weekly "Saturday Ride". The application leverages **Notion** as a headless CMS and database, providing a flexible backend that non-technical users can easily manage.

## Tech Stack
- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: Notion API (via custom fetch wrapper)
- **Styling**: CSS Modules (`*.module.css`) + Global CSS variables
- **Build Tool**: Turbopack
- **Hosting environment**: Node.js (Vercel-compatible)

## Architecture & Folder Structure

```
/app
  /actions.ts         # Server Actions for mutations (Votes, Rides, Feedback)
  /components/        # Reusable UI components (Client & Server)
  /lib/
    notion.ts         # CORE DATA LAYER: Handles all Notion API fetching & mapping
  /saturday-ride/     # Feature: Weekly voting system
  /traces/            # Feature: Route browsing and details
  /types.ts           # Global TypeScript interfaces
  layout.tsx          # Root layout (Metadata, Navigation)
  page.tsx            # Landing page
```

## Business Logic & Core Flows

### 1. Trace Management
- **Goal**: Catalog valid cycling routes.
- **Data**: Stored in Notion "Traces" DB.
- **Features**:
  - browsing traces with stats (Distance, Elevation, Surface).
  - viewing details (Map URL, GPX link).
  - "Google Photos" integration (scraping album previews).

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

## Key Technical Conventions

1.  **Data Fetching**:
    - All data access must go through `app/lib/notion.ts`.
    - Do NOT call Notion API directly in components; use the helper functions (`getTraces`, `getActiveRides`).
    - Use `cleanId()` to handle Notion UUIDs safely.

2.  **State & Mutations**:
    - Use **Server Actions** (`actions.ts`) for all writes (POST/PATCH).
    - Use `revalidatePath` to refresh data after mutations.
    - Implement **Optimistic UI** for high-latency interactions (e.g., Voting).

3.  **Styling**:
    - Use CSS Variables defined in `app/globals.css` (e.g., `--foreground`, `--background-start`).
    - specific styles must go in `[Name].module.css`.

4.  **Notion Quirk Handling**:
    - The Notion API is strict. Use `isMockMode` check for local dev without secrets.
    - DB Queries often return raw pages; these MUST be mapped to clean interfaces (e.g., `mapPageToTrace`) immediately.
    - `Status` properties are type `active_status` or `status`, NOT `select`.
