# Content Gap Analysis — CC Saint-Martin Blanmont
**Date**: 2026-09-14  
**Site**: CC Saint-Martin Blanmont (`blanmont.be`)  
**Scope**: Frontend (Public & Members) + Admin Backoffice (Comité & Capitaines)  
**Benchmarks / Competitors**: FFBC Clubs (Walloon Brabant clubs: VC Genappe, CC Perwez, Blancs Gilets, CC Wavre), Strava Clubs, Join Cycling, Spond / SportEasy, Rapha Cycling Club (RCC).

---

## 1. Executive Summary

The **CC Saint-Martin Blanmont** application ("Sidereal Satellite") features an exceptional editorial aesthetic ("Editorial Peloton"), robust Next.js 16 architecture, and tailored community features (Weekend QCM Poll `/sondage`, dynamic `.ics` calendar sync, Open-Meteo live wind badges, Carré Vert trophy points).

However, a comprehensive audit reveals significant **content and operational gaps** dividing into two distinct realms:
1. **Frontside (Public & Member-facing)**: Missing new-member onboarding funnel ("Rejoindre le club"), hidden/deactivated GPS trace library (`/traces`), lack of road safety & peloton code of conduct, static equipment checkout lacking backend order submission, missing regional route collections, and absent local SEO/GEO schema.
2. **Admin Part (Backoffice & Road Captains)**: Disabled trace management (`/admin/traces` redirects to `/admin`), complete absence of an equipment order fulfillment tracker (`/admin/equipements/commandes`), missing membership dues (cotisation) and emergency ICE contact tracking, lack of a mobile-friendly captain departure pointage tool, and binary authorization lacking captain-level sub-roles.

---

## 2. Content Inventory & Benchmark Baseline

| Area | CC Saint-Martin Blanmont (Current) | Belgian Club & Platform Standard (FFBC, Strava, Spond, RCC) | Gap Severity | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **New Member Onboarding** | Mention of "Essai libre sans engagement" on `/le-club`, but no dedicated join page, no procedure, no safety rules. | Dedicated "Rejoindre le club" page, FAQ, trial outing protocol, FFBC insurance explanation, welcome pack. | **CRITICAL (P0)** | Measured: `/le-club/page.tsx` line 75 |
| **Route & GPS Library** | Route catalog exists at `/traces`, but **hidden from navigation & footer**; Strava import link commented out. | Curated route collections, difficulty ratings, GPX direct pack download, Komoot/Garmin Connect links. | **HIGH (P1)** | Measured: `Footer.tsx` line 16, `Navbar.tsx` |
| **Safety & Group Charter** | Brief group description (A, B, C, VTT), no peloton etiquette or safety hand signals. | Peloton safety charter, Belgian Highway Code Art. 43bis rules, emergency protocols, helmet obligation. | **HIGH (P1)** | Measured: Missing across entire codebase |
| **Equipment & Store** | Beautiful catalog and size guide, but checkout uses `mailto:` or clipboard copy; **zero database persistence**. | Interactive reservation form stored in DB, order status tracking, stock reservation, member order history. | **CRITICAL (P0)** | Measured: `checkout/page.tsx` line 107 |
| **Admin Route Management** | `/admin/traces` **redirects to `/admin`**; no way to manage routes from admin. | Full CRUD for traces, GPX upload, elevation recalculation, route categorization, Komoot URL sync. | **CRITICAL (P0)** | Measured: `admin/traces/page.tsx` line 22 |
| **Admin Equipment Orders** | Admins can only edit catalog items and stock numbers; no orders list exists. | Order management dashboard: customer name, items, sizes, payment status, Gobik batch export, distribution checklist. | **CRITICAL (P0)** | Measured: `admin/equipements/page.tsx` |
| **Member Affiliation & ICE** | Basic profile (Name, email, bio, phone, Strava). No medical, ICE, or dues status. | Dues payment tracker (Cotisation 2026: Payé/En attente), FFBC license #, Contact d'Urgence (ICE). | **HIGH (P1)** | Measured: `types.ts`, `admin/members` |
| **Departure Pointage** | Admin desktop table for Carré Vert attendance (`/admin/carre-vert`). | Mobile-first 1-tap "Captain Mode" at Place de Blanmont meeting point or QR-code scan. | **MEDIUM (P2)** | Measured: `admin/carre-vert/page.tsx` |
| **Local SEO & AI Search (GEO)** | Basic meta tags on some pages; missing JSON-LD `SportsClub`, `SportsEvent`, local keywords. | Structured rich snippets for Google Events, local cyclotourism queries ("club vélo Chastre, Ottignies, Brabant wallon"). | **MEDIUM (P2)** | Measured: `layout.tsx`, `page.tsx` |

---

## 3. Detailed Gaps: Frontside (Public & Member-Facing)

### Gap F1: The "Rejoindre le Club" Onboarding Funnel (P0)
- **Current State**: Potential members clicking "Découvrir le Club & Horaires" land on `/le-club`, which provides a general presentation of the 4 groups. There is no clear call to action on how to attend a first ride, what time to arrive, what to bring, or what happens if one gets dropped.
- **Competitor Benchmark**: Modern sports clubs (e.g. Blancs Gilets, Rapha CC) feature a frictionless onboarding guide:
  1. *Étape 1 : Choisissez votre groupe d'allure* (A, B, C, VTT).
  2. *Étape 2 : Venez faire une sortie d'essai* (Rendez-vous 15 min avant à la Place de Blanmont, casque obligatoire, vélo en ordre).
  3. *Étape 3 : Accueil par un capitaine de route* (Parrainage du débutant).
  4. *Étape 4 : Adhésion & Licence FFBC* (Assurance omnium corporelle et matérielle).
- **Recommended Asset**: Dedicated page `/rejoindre` + prominent CTA button in Navbar & Hero.

### Gap F2: "Charte de Sécurité & Règles du Peloton" (P1)
- **Current State**: No safety guidelines anywhere in the app.
- **Competitor Benchmark**: Every sanctioned Belgian cyclotourist club publishes safety and group etiquette guidelines:
  - Belgian road rules for cyclists in groups (Code de la route art. 43bis: 15 to 50 cyclists, ride two abreast, car escort rules).
  - Standard vocal and hand signals (Obstacle à droite, trou, ralentissement, voiture avant/arrière).
  - Principle of solidarity: "On part ensemble, on rentre ensemble" with designated regroups at summit of hills.
  - Emergency protocol: First aid kit location, emergency call (112), ICE contact policy.
- **Recommended Asset**: `/le-club/charte-securite` or a permanent tab within `/le-club`.

### Gap F3: Unhiding & Revitalizing the GPS Route Catalog (`/traces`) (P1)
- **Current State**: The route catalog (`/traces`) has a Leaflet map, elevation chart, Komoot integration, and GPX download, but it is **commented out in the footer** and absent from the Navbar navigation!
- **Competitor Benchmark**: Cycling clubs use their route database as their primary SEO and utility moat:
  - Curated collections: "Les 10 Côtes Mythiques du Brabant wallon", "Boucles d'échauffement 60 km", "Sorties vallonnées 90-110 km", "Traces VTT/Gravel Hesbaye et Forêt de Soignes".
  - Difficulty filter (Dénivelé D+, distance, revêtement).
  - 1-Click "Télécharger le Pack GPX 2026" (ZIP file containing all official club routes).
- **Recommended Action**: Re-enable `/traces` in the Navbar and Footer, and group routes by difficulty and geographic zone.

### Gap F4: Complete Equipment Checkout Loop (P0)
- **Current State**: `/checkout` and `/le-club/equipement` display Gobik products, but clicking "Commander" generates a plain text string to copy or sends an email via `mailto:`.
- **Impact**: Zero traceability for club managers, orders get lost, members don't know if their size was reserved, and no order confirmation is generated.
- **Recommended Asset**:
  - Store order submissions in Firebase RTDB (`/equipment-orders`).
  - Generate a distinct Order Reference (e.g. `CMD-2026-042`).
  - Display member's pending orders in their personal `/profile`.

### Gap F5: Dynamic Photo Gallery & Season Chronicles (P2)
- **Current State**: Only 4 static photos in a bento grid on `/le-club`.
- **Competitor Benchmark**: Cyclists are visually driven. Clubs maintain albums of big outings (e.g., Liège-Bastogne-Liège, Ardennes weekend, Tour des Flandres, Souper annuel).
- **Recommended Asset**: Integration of shared Google Photos / Cloudinary albums grouped by year/season on `/galerie` or `/blog`.

### Gap F6: Club Sponsors & Local Partners Showcase (P2)
- **Current State**: Sponsors that appear on the Gobik jerseys (local bike shops, breweries, artisans) have zero digital presence on the website.
- **Competitor Benchmark**: Dedicated partners section featuring exclusive member benefits (e.g. "10% de remise chez notre vélociste partenaire à Wavre sur présentation de la licence club").
- **Recommended Asset**: Footer/Homepage sponsor strip + `/partenaires` page.

---

## 4. Detailed Gaps: Admin Part (Backoffice & Road Captains)

### Gap A1: Equipment Order Management Dashboard (`/admin/equipements/commandes`) (P0)
- **Current State**: The admin panel (`/admin/equipements`) only manages product catalog items and current stock numbers. There is **no way to view or manage member orders**.
- **Admin Need**:
  - Filter orders by Status: `En attente` (Pending), `Confirmée / Payée` (Paid), `Commandée Gobik` (In production), `Reçue` (Received), `Distribuée` (Handed over).
  - Aggregate orders by size (e.g. "Total Cuissards K10 Taille L needed: 14").
  - 1-Click CSV/Excel Export for direct submission to the Gobik Spain factory representative.
  - Mark order as distributed with date and pickup notes.

### Gap A2: Unblocking & Rebuilding Admin Traces (`/admin/traces`) (P0)
- **Current State**: `app/admin/traces/page.tsx` line 22 has `redirect('/admin');`! The entire trace management system is locked out for admins.
- **Admin Need**:
  - Restore the trace administration page.
  - Table of all GPX traces with quick actions: Edit, Delete, Duplicate, Download GPX, Open Komoot.
  - Batch GPX upload with automatic distance and elevation calculation via the existing `/api/admin/parse-gpx`.

### Gap A3: Member Cotisation, Medical & ICE Emergency Tracker (P1)
- **Current State**: Admin members table only tracks Name, Email, Role, and Bio.
- **Admin Need**:
  - **Cotisation 2026**: Status badge (`À jour`, `En attente`, `Exempté`).
  - **FFBC License Number**: For insurance coverage validation.
  - **ICE Contact (Personne de contact en cas d'urgence)**: Emergency phone number readily available to road captains in case of an accident.
  - **Speed Group Affinity**: Default group (A, B, C, VTT).

### Gap A4: Mobile-First "Capitaine de Route" Mode for Departure Pointage (P1)
- **Current State**: Carré Vert attendance (`/admin/carre-vert`) is designed for desktop review. Pointing 40+ members on a Saturday morning with cycling gloves before departure at 8:30 is impractical.
- **Admin Need**:
  - Lightweight, responsive mobile check-in view (`/admin/pointage-express` or captain view).
  - Pre-filtered by respondents from the weekend poll (`/sondage`).
  - 1-tap toggle per cyclist (Present/Absent).

### Gap A5: Communication & Broadcast Dispatch Center (P2)
- **Current State**: The admin panel has a WhatsApp copy button on `/admin/sondages/[id]`, but no centralized communication hub.
- **Admin Need**:
  - Weekly newsletter / notification generator (combining weekend poll results, Saturday route GPX link, weather forecast, and captains on duty).
  - 1-Click WhatsApp blast formatted message for group admins.

### Gap A6: Granular Administrative Roles (P2)
- **Current State**: Binary system (`Admin` vs `Member`).
- **Admin Need**:
  - `Capitaine de Route`: Can access poll attendance and mark Carré Vert points, but cannot edit members or delete traces.
  - `Responsable Équipements`: Can manage clothing catalog and view/update orders, without full site admin privileges.
  - `Rédacteur`: Can write and publish blog articles.

---

## 5. Prioritized Action Plan & Roadmap

| Tier | Priority | Component | Scope | Expected Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Quick Win** | **P0** | Restore `/admin/traces` | Admin | Unlocks route catalog editing and prevents 404/redirect dead ends. |
| **Quick Win** | **P0** | Unhide `/traces` in Navbar & Footer | Frontend | Makes the library of 100+ Belgian GPX routes accessible to riders. |
| **Quick Win** | **P0** | Database Equipment Order Flow | Frontend + Admin | Enables members to order gear and gives admins an order tracking ledger. |
| **Strategic** | **P1** | "Rejoindre le Club" & Onboarding Page | Frontend | Converts new visiting cyclists into club members with zero friction. |
| **Strategic** | **P1** | Peloton Safety Charter & Belgian Road Rules | Frontend | Legal clarity, member reassurance, and safety standard compliance. |
| **Strategic** | **P1** | Member ICE & Cotisation Tracker | Admin | Critical duty of care for organizers and road captains in Wallonia. |
| **Strategic** | **P1** | Mobile Captain Quick-Pointage | Admin | Dramatically simplifies Saturday morning attendance for Carré Vert. |
| **Long-Term** | **P2** | Local SEO & GEO Structured Data | Frontend | Positions club as #1 result for cycling in Chastre / Ottignies / Brabant wallon. |
| **Long-Term** | **P2** | Community Ride Gallery & Photo Chronicles | Frontend + Admin | Deepens club camaraderie and visual retention across seasons. |
| **Long-Term** | **P2** | Granular Sub-Roles (Capitaine, Matériel) | Admin | Distributes club operational workload across committee members. |

---

## 6. Success Metrics
- **New Member Inquiries**: +40% increase in trial ride requests via the new `/rejoindre` funnel.
- **Route Engagement**: +150% increase in GPX downloads by restoring `/traces` in main navigation.
- **Equipment Fulfillment**: 100% of kit orders tracked in database with zero lost manual requests.
- **Operational Speed**: Saturday morning attendance check-in completed in under 2 minutes by captains.
- **Search Visibility**: Top 3 ranking for "club vélo route Brabant wallon" and "cyclo club Chastre Blanmont".
