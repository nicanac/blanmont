# Sidereal Satellite

Sidereal Satellite is the digital hub for the **Club de Blanmont**. It provides route management, member directories, and a democratic voting system for weekly rides.

## Features

- **Parcours (Traces)**:
  - Browse detailed cycling routes with automated stats (Distance, Elevation, Surface).
  - Interactive map previews and GPX downloads.
  - Advanced filtering (e.g., "Sorties < 50km", "Hilly Routes").
- **Sortie du Samedi (Saturday Ride)**:
  - Weekly voting system where members choose the upcoming route.
  - Admin tools for proposing candidate traces.
  - Optimistic UI for instant voting feedback.
- **Calendrier (Calendar)**:
  - Interactive month-view calendar of club events.
  - Tracks starts, groups, and locations.
- **Membres (Members)**:
  - Directory of club members with roles and bios.
  - Secure feedback system for rating routes.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4.
- **Database**: Firebase Realtime Database (RTDB) via Admin SDK (server) & Client SDK (client). Full details in [DATABASE.md](DATABASE.md).
- **Authentication**: Firebase Authentication.
- **Storage**: Cloudinary & Firebase Storage.
- **State**: React Context (`AuthContext`) + Server Actions.
- **Icons**: Heroicons.
- **Fonts**: Poppins (Google Fonts).

## Getting Started

1. **Environment Setup**:
   Create a `.env.local` file with the required Firebase, Cloudinary, and optional Notion credentials (refer to [DATABASE.md](DATABASE.md) for full specification).

    2.  **Run Development Server**:
        ```bash
        npm run dev
        ```
        Open [http://localhost:3000](http://localhost:3000).

    ## Project Documentation

<<<<<<< Updated upstream
- `/app`: Next.js App Router source.
  - `/lib/notion.ts`: **Core Data Layer**. All Notion API calls live here.
  - `/components`: Reusable UI components.
  - `/calendrier`: Calendar feature.
  - `/le-club`: Club info feature.
  - `/saturday-ride`: Voting feature.
  - `/traces`: Route catalog feature.
=======
    -   [DATABASE.md](DATABASE.md) — Comprehensive guide on database architecture, schemas, access layers, caching, and scripts.
    -   [AI_CONTEXT.md](AI_CONTEXT.md) — Context and technical conventions for development.
    -   [DESIGN.md](DESIGN.md) — Design tokens, color palette, typography, and styling standards.
>>>>>>> Stashed changes

## Contributing

- **Styles**: Use Tailwind CSS for all styling.
- **Language**: implementation in English, but **UI Text MUST be in French**.
- **Workflow**:
  1.  Create a branch `user/feature/name`.
  2.  Implement changes.
  3.  **Always commit and push** upon completion of a task.
