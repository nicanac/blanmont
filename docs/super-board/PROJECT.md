# Blanmont (CC Saint-Martin Blanmont)

Cycling club platform for `Club de Blanmont` (`CC Saint-Martin Blanmont`).
Provides route (parcours) discovery, GPX downloads, Saturday ride voting, interactive events calendar, and member management.

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict).
- **Styling**: Tailwind CSS v4 following "La Feuille de Blanmont — Carte IGN" topographic sheet design system (`DESIGN.md`).
- **Database**: Firebase Realtime Database (RTDB) — Admin SDK for server actions / API routes, Client SDK for frontend reactive listeners.
- **Authentication**: Firebase Authentication.
- **Storage**: Cloudinary & Firebase Storage.
- **Testing**: Vitest for unit/integration tests, Playwright for E2E tests.
- **Code Navigation**: `graft/` index for semantic retrieval, signatures, and symbol callers.

## Core Workflows & Conventions

1. **Parcours (Traces)**:
   - Detailed cycling routes with automated stats (distance in km, elevation in m D+, surface breakdown).
   - Topographic map previews and GPX downloads.
2. **Sortie du Samedi**:
   - Member voting for candidate Saturday rides with optimistic UI feedback.
3. **Calendrier**:
   - Month view of club events, start times, locations, and groups.
4. **Membres**:
   - Member roster, roles, profiles, and trace feedback submission.
5. **UI & Language**:
   - All UI text MUST be in French (Français).
   - Code, documentation, commits, and comments in English.
   - Strictly follow design tokens (`bg-paper`, `bg-night`, `brand`, `bistre`, `hydro`, `vert`, `ambre`).
