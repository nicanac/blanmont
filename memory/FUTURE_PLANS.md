# Future Plans & Implementation Blueprint (2026–2027)

> **Canonical Document**: Full strategic and technical specification is maintained in [`ROADMAP.md`](../ROADMAP.md) and [`docs/roadmap.md`](../docs/roadmap.md).

---

## 🏆 Completed Historical Milestones
- [x] **PDF 2-Step Ingestion & Import**: Implemented interactive preview table, batch row editing/toggling, and database commit (`/admin/events/import`).
- [x] **Cloudinary Storage & Member Photo Uploads**: Migrated image storage to Cloudinary with `react-easy-crop` positioning for member portraits (`/admin/members/photos`).
- [x] **Security Hardening**: Web Crypto HMAC-SHA256 HttpOnly session cookies (`ccb_session`), `middleware.ts` perimeter protection, `verifyAdminRequest` on all admin endpoints.
- [x] **Weekend Poll QCM System**: Live presence polling (`/sondage`), speed groups (A/B/C/VTT), 1-click WhatsApp export, and complete admin management (`/admin/sondages`).
- [x] **Typographic System & Design Tokens**: 100% Tailwind CSS v4, Poppins typography, zero CSS modules, Ciseco/Eco sporting aesthetic.

---

## 🚀 Active Future Roadmap (from `ROADMAP.md`)

### Phase 1: Quick Wins & Unblocking (Immediate)
- [ ] **Unblock Traces Admin (`/admin/traces`)**: Remove hardcoded `redirect('/admin')`, restore sidebar nav link in `app/admin/layout.tsx`.
- [ ] **Persist Equipment Orders in Firebase**: Upgrade `/checkout` from mailto to write into `/orders` node; add `/admin/equipements/commandes` view.
- [ ] **Trial Ride Leads CRM (`/admin/prospects`)**: Build interface to manage prospect inquiries from `/rejoindre`, assign mentors, and track 3 trial rides.
- [ ] **Fix Revalidation Path Bug**: Correct `revalidatePath('/boutique')` to `revalidatePath('/le-club/equipement')` in `app/lib/firebase/equipment.ts`.
- [x] **Decouple 2026 Year Coupling**: Parameterize `sync-leaderboard` cron and Carré Vert logic for dynamic multi-year handling.

### Phase 2: Core Rituals & Financial Suite
- [ ] **"Hub Rituel du Weekend" (`/weekend`)**: Unify Saturday route voting (`/saturday-ride`) and presence poll (`/sondage`) into a single 2-step portal.
- [ ] **Belgian EPC QR-Code & Payconiq Suite**: Generate dynamic SEPA QR codes for zero-typo membership dues (cotisations) and gear orders.
- [x] **Multi-Year Leaderboard Archive**: Add historical season selector (`2024`, `2025`, `2026`, `2027`) on `/leaderboard`.
- [ ] **Automated WhatsApp Announcement**: Enhance 1-click WhatsApp export with Open-Meteo weather badge and winning route GPX link.

### Phase 3: Field Usability, PWA & Safety Operations
- [ ] **Progressive Web App (PWA)**: Add `manifest.webmanifest` and Service Worker for offline route, GPX, and emergency contact caching.
- [ ] **Digital Member Safety Pass (`/profile/pass`)**: Mobile badge with photo, FFBC license, ICE emergency contacts, and blood group alert.
- [ ] **Road Hazard Reporting Layer**: Interactive warning drop-pins on trace maps (potholes, gravel, road closures) with captain moderation.
- [ ] **Web Push Notifications**: Automated broadcasts for poll opening, Saturday route decisions, and weather cancellations.

### Phase 4: Connected Ecosystem & Route Studio
- [ ] **Strava Club Hub**: Webhook sync, activity matching against calendar events, weekly awards ("Roi de la Montagne").
- [ ] **In-Browser GPX Route Editor**: Reverse route direction with 1 click, cut/loop variants generator, wind vector advisory.
- [x] **All-Time Club Hall of Fame**: Veteran fidelity rankings across multiple seasons.
