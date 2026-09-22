# 🚴‍♂️ Master Roadmap & Future Evolution Plan: Sidereal Satellite
> **Platform**: Cyclo Club Saint-Martin Blanmont (`CC Blanmont`)  
> **Target Horizon**: 2026 – 2027+  
> **Status**: Living Strategy & Architectural Blueprint  
> **Scope**: Full-Stack Next.js 16 / React 19 / Firebase Realtime Database Architecture  

---

## 📑 Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Comprehensive Application Audit & Current State Analysis](#2-comprehensive-application-audit--current-state-analysis)
   - [2.1 Tech Stack Health & Architecture Assessment](#21-tech-stack-health--architecture-assessment)
   - [2.2 Module-by-Module Capability & Gap Inventory](#22-module-by-module-capability--gap-inventory)
   - [2.3 Key Architectural Bottlenecks & Friction Points](#23-key-architectural-bottlenecks--friction-points)
3. [Strategic Evolution Pillars (2026–2027)](#3-strategic-evolution-pillars-20262027)
4. [Catalog of 12 Major Future Improvement Features](#4-catalog-of-12-major-future-improvement-features)
   - [Feature 1: "Hub Rituel du Weekend" — Unified Ride & Attendance Portal](#feature-1-hub-rituel-du-weekend--unified-ride--attendance-portal)
   - [Feature 2: PWA & Field Offline Mode ("Mode Peloton Hors-Ligne")](#feature-2-pwa--field-offline-mode-mode-peloton-hors-ligne)
   - [Feature 3: Digital Member Safety Pass & Club ID ("Pass Sécurité & Carte de Membre")](#feature-3-digital-member-safety-pass--club-id-pass-sécurité--carte-de-membre)
   - [Feature 4: Community Road Hazard & Incident Reporting ("Signalement Dangers & Routes")](#feature-4-community-road-hazard--incident-reporting-signalement-dangers--routes)
   - [Feature 5: Strava Club Integration & Dynamic Weekly Peloton Challenges](#feature-5-strava-club-integration--dynamic-weekly-peloton-challenges)
   - [Feature 6: Persisted Club Boutique & Gobik Group-Order Logistics Engine](#feature-6-persisted-club-boutique--gobik-group-order-logistics-engine)
   - [Feature 7: Instant Belgian EPC QR-Code & Payconiq Payment Suite](#feature-7-instant-belgian-epc-qr-code--payconiq-payment-suite)
   - [Feature 8: Reactivation & Modernization of Traces Admin Studio (`/admin/traces`)](#feature-8-reactivation--modernization-of-traces-admin-studio-admintraces)
   - [Feature 9: Trial Ride Lead Management & Prospect Onboarding CRM](#feature-9-trial-ride-lead-management--prospect-onboarding-crm)
   - [Feature 10: Multi-Channel Alert & Automated Broadcast System (Web Push + WhatsApp)](#feature-10-multi-channel-alert--automated-broadcast-system-web-push--whatsapp)
   - [Feature 11: Dynamic Multi-Year Season Transition & Historical Archive Engine](#feature-11-dynamic-multi-year-season-transition--historical-archive-engine)
   - [Feature 12: In-Browser GPX Route Editor & Peloton Variant Generator ("Atelier Tracé")](#feature-12-in-browser-gpx-route-editor--peloton-variant-generator-atelier-tracé)
5. [Phased Implementation Roadmap & Timeline (2026–2027)](#5-phased-implementation-roadmap--timeline-20262027)
6. [Data Architecture, Database Schemas & Security Updates](#6-data-architecture-database-schemas--security-updates)
7. [Quality Assurance, Core Web Vitals & Testing Matrix](#7-quality-assurance-core-web-vitals--testing-matrix)

---

## 1. Executive Summary & Product Vision

**Sidereal Satellite** is the dedicated operating system of the **Cyclo Club Saint-Martin Blanmont (CC Blanmont)**, an amateur cycling club based in Chastre / Blanmont (Walloon Brabant, Belgium). 

Unlike commercial fitness trackers (Strava, Garmin Connect) or generic CMS websites (WordPress), Sidereal Satellite is purpose-built to digitize the unique social rituals and operational workflows of Belgian club cycling:
- Organizing democratic weekly route selection and peloton speed group coordination (Groupes A, B, C, VTT).
- Cataloging hundreds of curated GPS itineraries across Wallonia and the Ardennes with instant GPX downloads and elevation visualization.
- Tracking annual rider loyalty via the club's signature **"Carré Vert"** attendance competition.
- Managing custom Gobik Spain team gear and annual official federated calendars (FFBC).

The application is in an advanced, stable state: powered by Next.js 16 App Router, React 19, Tailwind CSS v4, and Firebase Realtime Database. The test suite is robust (72 test suites, 514 passing unit tests).

This master roadmap establishes the next evolutionary leap: transforming the platform from an administrative web portal into a **field-ready, offline-capable, automated club companion** that accompanies riders from mid-week planning to the Saturday departure on the Place de Blanmont, and across the entire sporting season.

---

## 2. Comprehensive Application Audit & Current State Analysis

### 2.1 Tech Stack Health & Architecture Assessment

| Layer | Technologies in Use | Health / Assessment |
|---|---|---|
| **Framework** | Next.js 16.0.8 (App Router, Turbopack) | 🟢 Excellent. Modern architecture with Server Components and Server Actions. |
| **UI Library & React** | React 19.2.1, Headless UI 2.2, Heroicons 2.2 | 🟢 Excellent. Clean separation of client/server boundaries. |
| **Styling & Theming** | Tailwind CSS v4.1.18, Poppins typography, Ciseco/Eco sporting aesthetic | 🟢 Impeccable. Zero CSS module technical debt, consistent typographic scale. |
| **Backend & Database** | Firebase Realtime Database (`europe-west1`), Firebase Admin SDK 13.6 + Client SDK 12.8 | 🟢 High performance, low latency real-time data sync. |
| **Authentication** | Firebase Auth + Web Crypto HMAC-SHA256 Session Cookies (`ccb_session`) | 🟢 High security. Protected via `middleware.ts` and `verifyAdminRequest`. |
| **Media Storage** | Cloudinary API + Firebase Storage fallback | 🟢 Optimized image delivery and responsive image transformations. |
| **Testing** | Vitest 5.0 (Unit/Integration, 514 passing tests), Playwright (E2E) | 🟢 Robust automated coverage with rapid local execution. |
| **Code Graph** | Pre-computed Graft index (`@nanonets/graft`) | 🟢 Token-efficient semantic navigation and dependency blast-radius tracing. |

---

### 2.2 Module-by-Module Capability & Gap Inventory

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   APPLICATION MODULE AUDIT MATRIX                                │
├──────────────────────────┬────────────────────────────┬─────────────────────────────┬────────────┤
│ Module / Route           │ Core Current Capabilities  │ Identified Limitations      │ Status     │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 1. Accueil (Landing)     │ Editorial Pelonton cover,  │ Telemetry cards are static  │ 🟢 Active  │
│    `/`                   │ telemetry frame, mosaic,   │ unless edited in admin;     │            │
│                          │ dynamic next ride weather  │ no live ride countdown.     │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 2. Parcours (Traces)     │ Multi-criteria filters,    │ Admin trace editor disabled │ 🟡 Partial │
│    `/traces`, `/[id]`    │ Leaflet preview, GPX export│ (`redirect('/admin')`); no  │            │
│                          │ Komoot preview, feedback   │ GPX loop reverse or edit.   │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 3. Sortie du Samedi      │ Democratic route voting,   │ Disconnected from presence  │ 🟡 Partial │
│    `/saturday-ride`      │ candidate comparison,      │ poll (`/sondage`); separate │            │
│                          │ optimistic vote recording  │ voting session required.    │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 4. Sondage du Weekend    │ Multi-day RSVP (Sat/Sun),  │ Disconnected from route     │ 🟢 Active  │
│    `/sondage`            │ groups A/B/C/VTT, QCM,     │ candidate voting; manual    │            │
│                          │ 1-click WhatsApp export    │ WhatsApp sharing needed.    │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 5. Calendrier            │ Month view, drawer details,│ No offline storage; debrief │ 🟢 Active  │
│    `/calendrier`         │ Open-Meteo wind & weather, │ reviews exist in code but   │            │
│                          │ 1-click .ics feed sync     │ under-utilized by riders.   │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 6. Carré Vert & Classement│ 1 pt/weekend + 1 pt/weekday│ Hardcoded 2026 references;  │ 🟢 Active  │
│    `/leaderboard`        │ fidelity %, Google Sheets  │ no multi-year historical    │            │
│                          │ CSV cron synchronization   │ season archive tab.         │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 7. Équipements & Boutique│ Gobik gear catalog, size   │ Orders are NOT saved in DB! │ 🔴 Weak    │
│    `/le-club/equipement` │ guide modal, paper ticket  │ Checkout only triggers      │            │
│    `/checkout`           │ pricing calculation        │ `mailto:` or copy-to-board. │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 8. Membres & Profils     │ Roles, portrait cropping,  │ Public directory only shows │ 🟡 Partial │
│    `/members`, `/profile`│ emergency ICE contact,     │ committee/captains; regular │            │
│                          │ FFBC license, photo sync   │ members cannot view peers.  │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 9. Sorties d'Essai       │ 3 free rides registration, │ Inquiries saved in DB but   │ 🔴 Weak    │
│    `/rejoindre`          │ onboarding FAQ, safety     │ NO admin dashboard to view  │            │
│                          │ charter integration        │ or follow up with leads.    │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 10. Sécurité & Signaux   │ Peloton signals guide,     │ Static content only; no     │ 🟡 Partial │
│     `/securite`          │ emergency phone numbers,   │ dynamic road hazard or      │            │
│                          │ group riding code          │ incident reporting tool.    │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 11. Actualités & Galerie │ Markdown blog editor,      │ No automated newsletter or  │ 🟢 Active  │
│     `/blog`, `/galerie`  │ Google Photos albums,      │ social auto-broadcast;      │            │
│                          │ year & category filtering  │ manual photo scraping.      │            │
├──────────────────────────┼────────────────────────────┼─────────────────────────────┼────────────┤
│ 12. Suite Admin          │ Command palette, stats,    │ Route admin locked; trial   │ 🟡 Partial │
│     `/admin/*`           │ 2-step PDF calendar import,│ leads absent; gear orders   │            │
│                          │ express check-in, tours    │ not tracked centrally.      │            │
└──────────────────────────┴────────────────────────────┴─────────────────────────────┴────────────┘
```

---

### 2.3 Key Architectural Bottlenecks & Friction Points

1. **Disconnected Weekend Rituals**:  
   Members must currently visit `/saturday-ride` to vote between proposed routes, and then visit `/sondage` to declare whether they ride Saturday or Sunday and in which speed group. This doubles cognitive friction and splits engagement.

2. **Non-Persisted Equipment Checkout**:  
   `/checkout` calculates accurate totals and renders a receipt ticket, but clicking submit opens the member's default email client (`mailto:info@blanmont.be`) or copies text to the clipboard. The club committee has no administrative order ledger, no inventory reservation, and no automated payment reconciliation.

3. **Disabled Route Admin Studio**:  
   In `app/admin/traces/page.tsx` and `app/admin/add-trace/page.tsx`, `redirect('/admin')` is hardcoded at the top of the components, and the navigation link in `app/admin/layout.tsx` is commented out. Road captains are unable to edit, add, or curate routes from the admin portal.

4. **Orphaned Trial Ride Requests**:  
   The public registration form on `/rejoindre` writes valid records to `/trial-requests` via `createTrialRequest()`, but there is zero admin UI or notification system to review incoming prospects, assign a captain mentor, or log trial ride attendance.

5. **Hardcoded 2026 Temporal Coupling**:  
   Synchronization scripts (`app/api/cron/sync-leaderboard/route.ts`, `app/lib/carreVert.ts`, `app/data/migrated-albums.json`) hardcode year `2026` in date matching regexes and column parsers. In season 2027, the leaderboard sync will fail unless refactored into dynamic season parameters.

6. **Absence of PWA & Field Offline Resilience**:  
   The application lacks a Web App Manifest (`manifest.webmanifest`) and Service Worker. Cyclists who lose cellular reception in the wooded valleys of Walloon Brabant or the Ardennes cannot pull up the GPX file, trace profile, or club emergency contacts.

7. **Manual Communication Workflows**:  
   Opening weekly polls, announcing the winning Saturday route, and notifying riders of weather cancellations currently rely on committee members manually copying text into private WhatsApp groups. There is no automated Web Push or webhook integration.

8. **Legacy Notion Residue**:  
   While Firebase RTDB is the single source of truth, traces of legacy Notion data mapping, `@notionhq/client` dependencies, and dead backup scripts remain in the repository.

---

## 3. Strategic Evolution Pillars (2026–2027)

To guide engineering and product investments, future development is structured into **four foundational pillars**:

```
                                  ┌────────────────────────┐
                                  │   SIDEREAL SATELLITE   │
                                  │    VISION 2026-2027    │
                                  └───────────┬────────────┘
                                              │
         ┌───────────────────┬────────────────┴───────────────────┬───────────────────┐
         ▼                   ▼                                    ▼                   ▼
┌─────────────────┐ ┌─────────────────┐                  ┌─────────────────┐ ┌─────────────────┐
│    PILLAR I     │ │    PILLAR II    │                  │   PILLAR III    │ │    PILLAR IV    │
│  Rider Rituals  │ │    Connected    │                  │  Club Commerce  │ │  Safety & Field │
│  & Mobile PWA   │ │   Ecosystem     │                  │  & Governance   │ │   Operations    │
├─────────────────┤ ├─────────────────┤                  ├─────────────────┤ ├─────────────────┤
│ • Unified Hub   │ │ • Strava Club   │                  │ • Persistent DB │ │ • Offline PWA   │
│ • 1-Tap RSVP    │ │ • Leaderboards  │                  │   Gear Orders   │ │ • Digital ICE   │
│ • Live Weather  │ │ • Route Studio  │                  │ • Belgian EPC   │ │ • Road Hazard   │
│ • Push Alerts   │ │ • Multi-Year DB │                  │   QR Payments   │ │   Reporting     │
└─────────────────┘ └─────────────────┘                  └─────────────────┘ └─────────────────┘
```

---

## 4. Catalog of 12 Major Future Improvement Features

### Feature 1: "Hub Rituel du Weekend" — Unified Ride & Attendance Portal
- **Problem**: Route voting (`/saturday-ride`) and presence polling (`/sondage`) are fragmented across two disconnected pages and database nodes.
- **Solution**: Merge both workflows into a unified, high-octane **"Rituel du Weekend"** hub at `/weekend` (with backwards-compatible redirects from `/sondage` and `/saturday-ride`).
- **User Flow**:
  1. **Phase 1 (Tuesday – Friday 18h)**: *Vote & Projections*. The member votes for their preferred Saturday route among candidate traces while simultaneously indicating their intended speed group (A, B, C, VTT).
  2. **Phase 2 (Friday 18h – Sunday 18h)**: *Peloton Lineup & Execution*. Voting closes automatically. The winning route is declared with an interactive elevation map, GPX download button, localized Open-Meteo wind forecasts, and live group rosters.
  3. **Captains Bar**: Dedicated floating action bar for road captains to generate formatted WhatsApp messages, export the GPX, or broadcast route changes.
- **Database Schema**:
  ```json
  "/weekend-rituals/{weekendId}": {
    "targetDate": "2026-09-26",
    "phase": "voting",
    "candidateTraces": ["trace_1", "trace_2"],
    "winningTraceId": null,
    "departure": "08h30",
    "location": "Place de Blanmont",
    "responses": {
      "member_uid": {
        "votedTraceId": "trace_1",
        "dayChoice": "samedi",
        "groupChoice": "Groupe B",
        "timestamp": "2026-09-24T18:22:00Z"
      }
    }
  }
  ```

---

### Feature 2: PWA & Field Offline Mode ("Mode Peloton Hors-Ligne")
- **Problem**: Cellular networks in rural Walloon areas (Lasne valleys, Villers-la-Ville woods, Condroz) frequently experience blackouts. When riders lose signal, they cannot consult the itinerary or GPX file.
- **Solution**: Transform Sidereal Satellite into a Progressive Web App (PWA) with intelligent service worker caching.
- **Capabilities**:
  - **1-Tap Standalone Install**: Add to iOS / Android home screen with custom club icons and splash screens.
  - **Offline Route Caching**: Automatically pre-caches the upcoming Saturday trace, GPX geometry, elevation profile, and map tiles (zoom levels 11–15 along the route corridor) onto the rider's phone upon opening the app.
  - **Offline ICE Registry**: Local caching of club emergency contacts and road captains' phone numbers.
  - **Background Sync**: If a rider marks attendance or submits a review while offline, the action is queued in IndexedDB and synchronized automatically once network connectivity is restored.

---

### Feature 3: Digital Member Safety Pass & Club ID ("Pass Sécurité & Carte de Membre")
- **Problem**: In the event of a crash or medical emergency during a ride, emergency responders (SAMU 112) or road captains need immediate access to the rider's identity, emergency contact (ICE), and Belgian cycling federation (FFBC) insurance information.
- **Solution**: A cryptographic, mobile-optimized digital membership pass accessible directly from the rider's profile (`/profile/pass`) and exportable to Apple Wallet / Google Wallet (`.pkpass`).
- **Included Data**:
  - Official rider photo, Full Name, and Club License ID.
  - Active season badge (e.g. `Membre Actif 2026`).
  - Emergency Contact (ICE): Name, Relationship, and 1-tap dial phone number.
  - Medical badges (Optional): Blood type, allergies, or emergency medical notes.
  - Instant QR Code: Scannable by road captains with `/admin/pointage-express` for zero-tap attendance check-in.

---

### Feature 4: Community Road Hazard & Incident Reporting ("Signalement Dangers & Routes")
- **Problem**: Belgian country roads frequently develop severe hazards: gravel spills from tractors, dangerous potholes after winter frosts, unexpected road closures, or aggressive unrestrained dogs. Currently, warnings are lost in WhatsApp chats.
- **Solution**: An interactive road condition reporting layer integrated directly into the Trace map view (`/traces/[id]`) and calendar ride drawer.
- **Features**:
  - **GPS Tagged Incident**: Riders drop a pin on the route map specifying hazard type: `Nid-de-poule dangereux`, `Gravillons / Boue`, `Route barrée / Travaux`, `Chien dangereux`.
  - **Photo Upload**: Optional photo attachment processed via Cloudinary.
  - **Captain Moderation**: Road captains receive an alert and can either validate the warning (attaching an automated hazard badge to the trace) or publish an alternative detour bypass.
  - **Auto-Expiration**: Reports auto-archive after 30 days unless reaffirmed by another rider.

---

### Feature 5: Strava Club Integration & Dynamic Weekly Peloton Challenges
- **Problem**: Members record their club rides on Strava, but there is no automated bridge between Strava activities and the club platform's annual leaderboards.
- **Solution**: Connect the official Strava Club via the Strava API v3 to automate peloton engagement.
- **Features**:
  - **Automated Activity Matching**: Matches Saturday/Sunday Strava rides against scheduled calendar events based on date, time window, and start location (`Blanmont`).
  - **Weekly Peloton Leaderboard**: Displays top club performers:
    - *Le Bourreau de Kilomètres* (longest distance of the week).
    - *Le Roi de la Montagne* (most elevation gain in Wallonia).
    - *L'Échappée Régulière* (most consistent attendance).
  - **Strava Activity Embeds**: Members can link their Strava activity to their post-ride debrief in `/calendrier` with one click.

---

### Feature 6: Persisted Club Boutique & Gobik Group-Order Logistics Engine
- **Problem**: The current `/checkout` page is a visual mock that generates mailto links. The club committee has no administrative order ledger, no inventory tracking, and no size aggregation for manufacturer bulk orders.
- **Solution**: Implement a complete database-backed order management and group-purchasing engine.
- **Features**:
  - **Firebase Order Persistence**: Submitting `/checkout` writes an immutable record to `/orders/{orderId}` with status `pending_payment` | `paid` | `ordered_gobik` | `received` | `delivered`.
  - **Member Order History**: Members see their previous gear orders and fulfillment status in their `/profile`.
  - **Admin Batch Aggregator (`/admin/equipements/commandes`)**:
    - Generates the exact size matrix for Gobik Spain production orders (e.g. `Veste Plus 2.0: 3x S, 8x M, 12x L, 4x XL`).
    - 1-click CSV/PDF export formatted for Gobik customer service.
  - **Distribution Checklist**: Captains on the Place de Blanmont check off delivered items on their mobile phones.

---

### Feature 7: Instant Belgian EPC QR-Code & Payconiq Payment Suite
- **Problem**: Collecting annual membership dues (cotisations) and payment for Gobik gear requires manual bank transfer entry, causing delays and payment tracking overhead for the club treasurer.
- **Solution**: Native Belgian payment flow supporting standard European EPC QR Codes (European Payments Council) and Payconiq by Bancontact deep links.
- **Implementation**:
  - **EPC QR Code Generator**: Generates dynamic SEPA QR codes embedded in the checkout ticket and member profile cotisation card containing:
    - Beneficiary: `Cyclo Club Saint-Martin Blanmont`
    - IBAN: Club bank account
    - Structured Communication: `+++123/4567/89012+++` (encoded with member ID and order ID)
    - Exact Amount: (e.g. `85,00 €`)
  - **Mobile Banking 1-Tap**: Riders scanning the screen with their Belfius, BNP Paribas Fortis, ING, or KBC app have the transfer pre-filled instantly with zero typos.
  - **Treasurer Reconciliation**: Admin toggles `/admin/members` payment status with one tap upon bank statement check.

---

### Feature 8: Reactivation & Modernization of Traces Admin Studio (`/admin/traces`)
- **Problem**: `/admin/traces` and `/admin/add-trace` are currently hardcoded to redirect to `/admin`, leaving admins without a web GUI to manage the club's route database.
- **Solution**: Reopen and completely modernize the Traces Admin studio.
- **Capabilities**:
  - **Interactive Route Table**: Search, filter by distance/elevation/surface, bulk tagging, and status toggle (`Actif`, `Archivé`, `À vérifier`).
  - **GPX File Uploader & Inspector**: Drag-and-drop `.gpx` upload with automatic polyline encoding, distance/elevation parsing, elevation profile generation, and auto-detection of cardinal direction (North, South, East, West).
  - **1-Click Saturday Candidate Selector**: Instantly nominate any trace as a candidate for the upcoming weekend vote.
  - **Komoot & Garmin Scraper**: Updated auto-importers with resilient fallback parsers.

---

### Feature 9: Trial Ride Lead Management & Prospect Onboarding CRM
- **Problem**: Inquiries from `/rejoindre` are saved to Firebase but have no admin interface. Potential new members are left uncontacted or forgotten.
- **Solution**: A dedicated Lead CRM view at `/admin/prospects` (or `/admin/rejoindre`).
- **Features**:
  - **Lead Dashboard**: Table of prospect requests showing name, phone, experience level, preferred group (A/B/C/VTT), and desired first ride date.
  - **Status Pipeline**: `Nouveau` ➔ `Contacté` ➔ `Sortie 1 faite` ➔ `Sortie 2 faite` ➔ `Sortie 3 faite` ➔ `Adhésion validée` / `Sans suite`.
  - **1-Click WhatsApp Mentor Intro**: Pre-formatted message pairing the prospect with a designated road captain before Saturday morning.
  - **1-Click Convert to Member**: Automatically transforms a prospect record into an official club member account without retyping data.

---

### Feature 10: Multi-Channel Alert & Automated Broadcast System (Web Push + WhatsApp)
- **Problem**: Critical time-sensitive club announcements (weather cancellations due to ice/storms, weekend poll openings, route decisions) require manual WhatsApp copy-pasting.
- **Solution**: Automated notification orchestrator.
- **Triggers & Channels**:
  - **Thursday 18h00**: Automated Web Push & WhatsApp summary draft: *"Le sondage du weekend est ouvert ! Choisissez votre groupe avant vendredi 18h."*
  - **Friday 18h00**: Automated announcement of the chosen Saturday trace with distance, departure time, and weather badge.
  - **Emergency Weather Alert**: Instant admin broadcast: *"⚠️ Sortie annulée ce samedi en raison du verglas / tempête."* Sends high-priority push notification and highlights a red alert banner across the site header.

---

### Feature 11: Dynamic Multi-Year Season Transition & Historical Archive Engine
- **Problem**: Leaderboard crons and calendar queries hardcode `2026`. At the end of the year, transitioning to the 2027 season would cause software regressions.
- **Solution**: Architectural decoupling of season years into dynamic configuration parameters.
- **Features**:
  - **Season Selector**: Dropdown on `/leaderboard` allowing members to browse historical standings (`Saison 2024`, `Saison 2025`, `Saison 2026`, `Saison 2027`).
  - **Dynamic CSV Sync**: Auto-detects the active season from calendar events or allows the admin to specify the target year parameter (`/api/cron/sync-leaderboard?year=2027`).
  - **All-Time Club Hall of Fame**: Aggregated career stats for longtime veterans (total Carrés Verts over 5+ seasons, total estimated club kilometers).

---

### Feature 12: In-Browser GPX Route Editor & Peloton Variant Generator ("Atelier Tracé")
- **Problem**: Road captains often need to modify existing traces: reversing the loop direction because of strong headwind, or creating a 70 km shortcut for Group C from a 95 km Group A track. Currently, this requires third-party desktop tools.
- **Solution**: Lightweight route manipulation studio inside `/admin/traces/[id]/edit`.
- **Features**:
  - **Reverse Route (Inversion de sens)**: Inverts the GPX coordinate stream with 1 click while automatically recalculating the new elevation profile.
  - **Cut & Loop Trimmer**: Place two scissors markers on the Leaflet map to bridge a shortcut, creating an official shorter variant (e.g. `Boucle Méhaigne - Variante 72km`).
  - **Wind Optimization Advisory**: Integrates Open-Meteo wind vectors along the route to suggest the optimal direction of travel (tailwind on the return leg).

---

## 5. Phased Implementation Roadmap & Timeline (2026–2027)

```
2026                                                                    2027
Q2 (Apr - Jun)          Q3 (Jul - Sep)          Q4 (Oct - Dec)          Q1 - Q2 (Jan - Jun)
┌───────────────────────┐┌───────────────────────┐┌───────────────────────┐┌───────────────────────┐
│ PHASE 1: Quick Wins   ││ PHASE 2: Core Rituals ││ PHASE 3: Field & PWA  ││ PHASE 4: Ecosystem    │
│ & Unblocking          ││ & Financial Suite     ││ & Safety Ops          ││ & Advanced Studio     │
├───────────────────────┤├───────────────────────┤├───────────────────────┤├───────────────────────┤
│ • Unblock Trace Admin ││ • Unified Weekend Hub ││ • Full PWA Offline    ││ • Strava Club Sync    │
│ • Persist Gear Orders ││ • Dynamic Season Eng. ││ • Digital Member Pass ││ • In-Browser GPX Ed. │
│ • Trial CRM in Admin  ││ • Belgian EPC QR Pay  ││ • Road Hazard Alerts  ││ • All-Time Hall Fame  │
│ • Fix /boutique cache ││ • Automated WhatsApp  ││ • Web Push Broadcast  ││ • Wind Route Advisory │
└───────────────────────┘└───────────────────────┘└───────────────────────┘└───────────────────────┘
```

### Phase Breakdown

#### 🎯 Phase 1: Quick Wins & Unblocking (Immediate / Weeks 1–4)
- **Objective**: Eliminate administrative blockers and stop data leakage.
- **Deliverables**:
  1. Remove redirect in `app/admin/traces/page.tsx` and reactivate sidebar navigation item.
  2. Implement Firebase persistence for equipment orders (`/orders` node) and add `/admin/equipements/commandes` view.
  3. Build `/admin/prospects` view to review and manage incoming trial requests from `/rejoindre`.
  4. Fix invalid revalidation paths (e.g. `/boutique` ➔ `/le-club/equipement`).
  5. Refactor year hardcoding in `sync-leaderboard` cron to accept dynamic year parameters.

#### 🚴 Phase 2: The Unified Weekend Experience & Financial Suite (Weeks 5–10)
- **Objective**: Maximize weekly member engagement and streamline treasurer operations.
- **Deliverables**:
  1. Launch **"Hub Rituel du Weekend"** merging voting and presence polling.
  2. Implement Belgian EPC SEPA QR-code generator for cotisations and gear orders.
  3. Integrate dynamic multi-year selector on the `/leaderboard` page.
  4. Build 1-click WhatsApp announcement generator for captains with weather and route links.

#### 📱 Phase 3: Field Usability, PWA & Safety Passport (Weeks 11–16)
- **Objective**: Empower riders on the bike with offline capabilities and medical security.
- **Deliverables**:
  1. Implement PWA manifest and Service Worker with offline caching of upcoming traces and emergency contacts.
  2. Deploy **Pass Sécurité & Carte de Membre Digitale** in `/profile/pass`.
  3. Deploy **Road Hazard Reporting** on trace maps with captain moderation.
  4. Integrate Web Push notifications for weekend poll openings and emergency weather alerts.

#### 🌐 Phase 4: Strava Ecosystem, Gamification & Route Studio (Weeks 17–24)
- **Objective**: Expand community retention and provide pro tools for road captains.
- **Deliverables**:
  1. Strava Club automated leaderboard and weekly awards.
  2. In-browser GPX route reversal and shortcut variant generator.
  3. All-time club Hall of Fame and veteran attendance statistics.

---

## 6. Data Architecture, Database Schemas & Security Updates

### 6.1 New Firebase Realtime Database Nodes

#### 1. `/orders` — Equipment Gear Orders
```json
{
  "order_1774500000_abc12": {
    "id": "order_1774500000_abc12",
    "memberId": "member_2cd9555c677980aaa529f4985fd6ebf7",
    "memberName": "Laurent Vanbelle",
    "memberEmail": "famille.vanbelle@skynet.be",
    "memberPhone": "+32 470 12 34 56",
    "productId": "CoupeVent",
    "productName": "Coupe vent GOBIK",
    "gobikReference": "VEST PLUS 2.0 MEN CUSTOM",
    "size": "L",
    "quantity": 1,
    "unitPrice": 65.00,
    "totalPrice": 65.00,
    "paymentMethod": "sepa_transfer",
    "paymentStatus": "paid",
    "orderStatus": "ordered_gobik",
    "structuredCommunication": "+++102/4567/89012+++",
    "notes": "Remise souhaitée au départ de samedi.",
    "createdAt": "2026-04-10T14:32:00.000Z",
    "paidAt": "2026-04-11T09:15:00.000Z",
    "deliveredAt": null
  }
}
```

#### 2. `/road-hazards` — Live Incident Reports
```json
{
  "hazard_1774500000_xyz": {
    "id": "hazard_1774500000_xyz",
    "traceId": "trace_12338a3128914ee4b788916553028046",
    "type": "pothole",
    "severity": "high",
    "description": "Nid-de-poule profond masqué en sortie de virage rapide.",
    "lat": 50.6214,
    "lng": 4.6852,
    "photoUrl": "https://res.cloudinary.com/dizy3s5zh/image/upload/...",
    "reportedByMemberId": "member_2cd9555c677980aaa529f4985fd6ebf7",
    "reportedByName": "Laurent Vanbelle",
    "status": "verified",
    "verifiedByAdminId": "admin_123",
    "createdAt": "2026-05-02T10:15:00.000Z",
    "expiresAt": "2026-06-02T10:15:00.000Z"
  }
}
```

#### 3. `/seasons` — Multi-Year Configuration
```json
{
  "2026": {
    "year": 2026,
    "name": "Saison 2026",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "googleSheetGid": "1551990117",
    "isCurrent": true
  },
  "2027": {
    "year": 2027,
    "name": "Saison 2027",
    "startDate": "2027-01-01",
    "endDate": "2027-12-31",
    "googleSheetGid": "",
    "isCurrent": false
  }
}
```

---

### 6.2 Firebase Security Rules Updates

Ensure non-admin members can create orders and road hazard reports, but can only read their own orders:

```json
{
  "rules": {
    "orders": {
      ".read": "auth != null && (root.child('members').child(auth.uid).child('role').val().contains('Admin') || root.child('members').child(auth.uid).child('role').val().contains('President'))",
      "$orderId": {
        ".read": "auth != null && (data.child('memberId').val() === auth.uid || root.child('members').child(auth.uid).child('role').val().contains('Admin'))",
        ".write": "auth != null && (!data.exists() || root.child('members').child(auth.uid).child('role').val().contains('Admin'))"
      }
    },
    "road-hazards": {
      ".read": true,
      ".write": "auth != null"
    },
    "trial-requests": {
      ".read": "auth != null && (root.child('members').child(auth.uid).child('role').val().contains('Admin') || root.child('members').child(auth.uid).child('role').val().contains('President'))",
      ".write": true
    }
  }
}
```

---

## 7. Quality Assurance, Core Web Vitals & Testing Matrix

### 7.1 Testing Standards (Vitest & Playwright)
- Every new server action and data service must be paired with dedicated Vitest unit tests (minimum 90% branch coverage).
- Mocking: Use established patterns from `tests/setup.ts` and `app/lib/firebase/client.ts` mock store.
- Playwright E2E: Test the critical member journey:
  1. Member logs in.
  2. Member visits `/weekend`, votes for Saturday route, and selects Group B.
  3. Member visits `/checkout`, configures a jersey, and verifies order persistence.
  4. Admin logs in, verifies order in `/admin/equipements/commandes`, and validates attendance in `/admin/pointage-express`.

### 7.2 Performance & Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 1.4s on 4G mobile emulation.
- **CLS (Cumulative Layout Shift)**: 0.00 across all responsive breakpoints.
- **INP (Interaction to Next Paint)**: < 80ms for voting, filtering, and drawer open interactions.
- **Accessibility**: 100% WCAG AA compliance with high-contrast sunlight outdoor readability and touch targets ≥ 44×44px.

---

*Document established and maintained under the authority of the CC Saint-Martin Blanmont Committee.*
