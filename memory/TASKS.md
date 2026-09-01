# Project Tasks & Progress

## Memory Log
This file tracks the history of tasks performed in this session and planned future work.

## ✅ Completed Tasks
- **Application-Wide Typographic Harmonization & Impeccable Polish (Typeset)**:
  - Standardized the typographic system and role hierarchy across the entire application in alignment with `DESIGN.md` (Display, Headline, Title, Lead, Body, Label/Badge, Tabular Data).
  - Added custom brand text selection styling, caret color, smooth scrolling, and custom sleek scrollbars in `app/globals.css`.
  - Replaced non-standard micro-text (`text-[9px]`, `text-[10px]`, `text-[11px]`) across Calendar, Traces, Blog, Admin, Le Club, Leaderboard, and Loaders with accessible, readable `text-xs font-semibold` / `text-xs font-medium`.
  - Integrated `text-balance` across hero titles and section headers for optimal editorial wrapping.
  - Formatted numerical stats (distances in `km`, elevation in `m D+`, prices in `€`, speeds in `km/h`, time stamps, attendee counts) with `tabular-nums` and French typographic non-breaking spacing.
  - Removed legacy unused `.module.css` files (`page.module.css`, `members/page.module.css`, `layout.module.css`, `SaturdayRideView.module.css`, `TraceSelector.module.css`) and migrated `TraceSelector.tsx` to Tailwind CSS.
  - Validated with Impeccable design detector (0 issues), TypeScript compiler (0 errors), and Next.js production build (27 routes).
  - *Status*: Verified with Next.js build.
- **Weekend Poll QCM System & Admin Management Suite**:
  - Implemented Firebase data layer (`app/lib/firebase/polls.ts`) for managing weekend poll sessions (`weekend-polls`) and member responses (`weekend-poll-responses`).
  - Created dedicated member-facing QCM page (`app/sondage/page.tsx` & `WeekendPollView.tsx`) with day choices (Samedi, Dimanche, Les deux, Absent), group selector (Groupe A/B/C/VTT), custom QCM questions, and real-time live attendance tallies with rider directory.
  - Built complete Admin management suite (`app/admin/sondages/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`) with poll creation, status toggles, response inspections, member response removals, and 1-click WhatsApp formatted summary generator.
  - Linked Weekend Poll across Navbar, Footer, and Admin Dashboard.
  - *Status*: Verified with Next.js build.
- **Complete Removal of Material UI (@mui, @emotion), Sonner Toasts & HTML Cleanup**:
  - Uninstalled all `@mui/material`, `@mui/icons-material`, `@emotion/*`, and `@fontsource/roboto` packages (-40 packages, -250 KB JS bundle).
  - Deleted legacy `ThemeRegistry.tsx`, `EmotionCache.tsx`, and `TraceList.tsx.backup`.
  - Converted all remaining MUI pages and components (`app/layout.tsx`, `app/traces/[id]/page.tsx`, `app/traces/[id]/FeedbackList.tsx`, `app/traces/[id]/FeedbackForm.tsx`, `app/traces/loading.tsx`, `app/leaderboard/LeaderboardView.tsx`, `app/calendrier/CalendarDrawer.tsx`, `app/import/strava/ImportForm.tsx`, `app/features/traces/components/DownloadGPXButton.tsx`) to 100% Tailwind CSS v4 + Heroicons.
  - Replaced all 17 blocking `window.alert(...)` dialogs across the entire application with modern, lightweight `sonner` toasts (`<Toaster />`).
  - Configured `<html lang="fr">` in `app/layout.tsx` and updated the "Rejoindre le club" action on `/le-club` to contact mailto / calendar ride information.
  - *Status*: Verified with Next.js build.
- **Priority 3 Calendar Subscription (.ics), Weather Forecast & 2-Step PDF Import**:
  - **iCalendar Sync Feed**: Implemented RFC 5545 generator (`app/lib/calendar-ics.ts`) and API routes (`/api/calendar/subscribe.ics`, `/api/calendar/ics`) for continuous 1-click calendar synchronization across Apple Calendar (`webcal://`), Google Agenda, Outlook, and manual `.ics` download.
  - **Calendar Subscription Modal**: Added `CalendarSubscribeButton` on `/calendrier` header with quick 1-click links and clipboard feed URL copy.
  - **Live Weather & Wind Direction Integration**: Implemented Open-Meteo weather integration (`app/lib/weather.ts`) with `RideWeatherBadge` displaying temperature, sky condition, rain probability, wind speed (km/h) and wind cardinal/arrow rotation (e.g., SO ↗) on `/calendrier` event drawer and `Footer` Next Ride card.
  - **2-Step PDF Calendar Import**: Refactored `/admin/events/import` into an interactive 2-step workflow (`parsePdfForPreviewAction` -> editable preview table with batch toggles, line editing and addition -> `saveImportedEventsAction` with database commit).
  - *Status*: Verified with build and unit test runs.
- **Priority 1 Security, HttpOnly Session Cookies & Blog XSS Protection**:
  - Implemented secure Web Crypto HMAC-SHA256 session token management (`app/lib/auth/session.ts`) with `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
  - Secured all admin API endpoints under `app/api/admin/*` (`members`, `events`, `attendance`, `blog`, `equipements`, `add-trace`, `import-csv`, `parse-gpx`, `fetch-metadata`) plus mutation routes (`/api/traces/[id]`, `/api/upload`) with server-side authorization checks (`verifyAdminRequest`).
  - Added Next.js `middleware.ts` to intercept and protect `/admin/*` pages and `/api/admin/*` endpoints at the network perimeter.
  - Connected `AuthContext` and Server Actions (`loginAction`, `logoutAction`, `getCurrentSessionUserAction`) directly to the HttpOnly session cookie lifecycle.
  - Created dedicated public equipment API (`app/api/equipements/route.ts`) to separate public catalog reads from protected admin inventory management.
  - Secured blog Markdown rendering in `app/blog/[slug]/page.tsx` by replacing unescaped `dangerouslySetInnerHTML` with `react-markdown` and `remark-gfm` for complete XSS prevention.
  - *Status*: Verified with build and test runs.
- **Dynamic Next Rendez-Vous Footer Feature**: Connected `app/components/layout/Footer.tsx` directly to the calendar database (`getCalendarEvents()`) to dynamically retrieve and display the scheduled destination, departure time, distances, and location for the upcoming Saturday/weekend ride. Wrapped the block in an accessible interactive link redirecting straight to `/calendrier`.
  - *Status*: Verified with browser rendering and build tests.
- **Header Navbar Solid Background Fix**: Updated `app/components/layout/Navbar.tsx` to use a sticky translucent white background (`bg-white/95 backdrop-blur-md`) with high-contrast text and branding across all routes, preventing dark text on red hero backgrounds on initial load.
  - *Status*: Merged via PR #29.
- **Production Footer Redesign**: Replaced template filler text in `app/components/layout/Footer.tsx` with production-ready links (Le Club, Parcours & Sorties, Vie du Club), added weekly meeting point info (Blanmont place & speed groups), integrated real club social channels (Facebook, Instagram, Strava), and refined styling aligned with the `DESIGN.md` aesthetic.
  - *Status*: Verified with browser rendering and build tests.
- **Graft Context Graph & Token Economy Installation**: Installed `@nanonets/graft`, initialized and wired Graft across AI agent ecosystems (Copilot, Claude Code, Cursor, OpenCode, Gemini, Grok, Windsurf, Kiro, AdaL), registered MCP server in `.vscode/mcp.json` and `.mcp.json`, added `graft:*` npm scripts, added skills, and generated `graft/` context graph.
  - *Status*: Verified and operational.
- **Members Search**: Implemented a client-side search/filter for the members list in the admin panel.
  - *File*: `app/admin/members/page.tsx`, `components/admin/MembersTable.tsx`
- **Database Backup**: Created and executed a script to backup the Firebase Realtime Database to a local JSON file.
  - *File*: `scripts/backup-db.ts`
  - *Status*: Backup verified.
- **PDF Import Feature (Initial)**: Created the UI and Server Action for importing calendar events from PDF.
  - *Files*: `app/admin/events/import/page.tsx`, `app/admin/events/import/actions.ts`
  - *Status*: Implemented, currently debugging.

## 🚧 In Progress
- **Debugging PDF Import**:
  - *Issue*: User reported a generic error.
  - *Fix*: Improved error propagation and switched to dynamic `require` for `pdf-parse` to resolve Next.js server-side bundling issues.
  - *Status*: Waiting for user validation.

## 📋 Future Tasks / Backlog
### 1. Correct PDF Import Logic
- **Objective**: Ensure the parser correctly handles the specific layout of the club's calendar PDF (dates, descriptions, split columns).
- **Steps**:
  - Validate the text extraction output.
  - Refine the Regex patterns in `app/admin/events/import/actions.ts`.
  - Add unit tests or dry-run mode to verify parsing without writing to DB.

### 2. Implement Firebase Storage
- **Objective**: Allow uploading images for Blog Posts and Member profiles.
- **Steps**:
  - Enable Firebase Storage in the Firebase Console.
  - Update `app/lib/firebase/client.ts` to export `getStorage()`.
  - Create an upload utility hook (e.g., `useStorageUpload`).
  - Update `MemberForm` and `BlogPostForm` to handle image selection and URL storage.

### 3. General Improvements
- **Security Check**: Verify Firebase Rules for the new Storage bucket.
- **Type Safety**: Improve TypeScript interfaces for the Events model.
