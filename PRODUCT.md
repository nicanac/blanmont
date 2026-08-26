# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Club Members (Cyclists)**: Amateur and passionate road cyclists of the Blanmont Cycling Club (CC Saint-Martin Blanmont) looking for weekly ride schedules, route details ("parcours"), voting on Saturday routes ("Sortie du Samedi"), event calendar, leaderboard rankings, club apparel ("équipements"), and community blog posts. Accessing mostly from mobile smartphones before/after rides and desktop/laptop at home.
- **Club Admins & Committee (President, Road Captains, Admins)**: Organizers managing routes, uploading/importing GPX/Strava/Garmin tracks, organizing weekly votes, managing calendar events (including PDF and CSV imports), moderating member directories, managing equipment orders/inventory, and publishing club articles.

## Product Purpose

Sidereal Satellite (Blanmont Cycling Club Platform) is the central digital operating hub for the **CC Saint-Martin Blanmont** cycling club. It automates ride coordination, route cataloging with interactive GPX/elevation visualization, transparent democratic route voting for weekly rides, yearly calendar schedule management, and club member connection.

## Positioning

Unlike generic cycling apps (Strava/Garmin Connect) or static club websites, Sidereal Satellite integrates direct interactive club rituals into a tailored experience: custom democratic weekly route voting with real-time feedback, a curated and filterable route database with elevation profiles and direct GPX downloads, annual calendar management with automated PDF/Notion ingestion, and integrated club gear management.

## Operating Context

- **Pre-Ride Planning & Voting**: Weekly cycle where admins propose route options (Traces) and members vote before Saturday morning.
- **Onboarding & Season Calendars**: Annual club calendar distributed via official PDFs and digital calendar synced with Notion/Firebase.
- **Post-Ride Engagement**: Leaderboard points tracking ("Carré Vert" attendance), trace ratings & reviews, and club blog stories.
- **Devices**: Mobile phones (responsive web in portrait mode) for quick voting, check-ins, and GPX downloads; desktop for admin dashboards, route creation, and map inspection.

## Capabilities and Constraints

- **Capabilities**:
  - Route Catalog ("Parcours"): Search, multi-criteria filtering (distance, elevation, surface, direction, rating), interactive Leaflet map preview, elevation charts, Google Photos album embedding, and instant GPX export.
  - Route Importer: Import and parse Strava polylines, Garmin activities, and GPX files with automatic distance and elevation calculation.
  - Saturday Ride Voting ("Sortie du Samedi"): Optimistic voting system with real-time tallying and status lifecycle (`Draft` -> `Voting` -> `Closed`).
  - Club Calendar ("Calendrier"): Interactive monthly calendar view with categorized cycling outings, meetings, and special events. Includes automated PDF schedule import.
  - Member Directory & Profiles: Searchable member list, role-based authorization (President, Admin, Member), password reset, and profile management.
  - Club Gear & Equipment ("Équipements"): Catalog of club apparel, size availability, stock status, and order requests.
  - Club Blog: Markdown/rich-text article publishing with Cloudinary-backed image assets.
  - Leaderboard & Statistics: Annual attendance tracking and club activity metrics.
- **Constraints**:
  - Primary UI language must strictly be French (Français) for all user-facing copy.
  - Strict data validation using Zod and Firebase Admin/Client SDKs.
  - Client-side Leaflet rendering requires dynamic imports with `ssr: false`.
  - Date parsing must be timezone-safe (local date interpretation without UTC offset shifts).

## Brand Commitments

- **Name**: Cyclo Club Saint-Martin Blanmont (CC Blanmont) / Sidereal Satellite.
- **Aesthetic**: "Ciseco / Eco" clean modern sporting aesthetic — pure white/light gray background, dark slate typography, bold energetic red accents (`#e03e3e`), soft subtle borders, rounded corners (`rounded-2xl` / `rounded-3xl`), and clear visual hierarchy.
- **Voice & Tone**: Friendly, encouraging, sporting, clear, community-focused, and proud of local Belgian road cycling culture.

## Evidence on Hand

- Real route database with hundreds of GPS routes in Wallonia/Belgium.
- Real club calendar PDF (`public/2026-Calendrier Vélo CC Saint-Martin Blanmont.pdf`) and CSV records.
- Real club photography and rider member records.

## Product Principles

1. **Rider-First Simplicity**: Essential pre-ride actions (finding a GPX, voting for Saturday's ride, checking departure times) must take fewer than 3 taps on mobile.
2. **Visual Route Clarity**: Every route displays key physical metrics upfront: distance, elevation gain, surface, and start/finish direction.
3. **Deterministic & Fast**: Instant optimistic UI updates for member actions without layout shift or lag.
4. **Token-Efficient & Maintainable**: Standardized architecture documented for zero-overhead AI assistance via Graft and Impeccable design systems.

## Accessibility & Inclusion

- Responsive, mobile-first design with touch targets of at least 44x44px.
- High color contrast for text (WCAG AA compliant) against bright daylight outdoor mobile viewing conditions.
- Semantic HTML markup with descriptive labels for icons and interactive controls.
