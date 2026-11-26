# System Design — Club de Blanmont platform

> Codename **Sidereal Satellite** · repo `nicanac/blanmont` · version `0.29.1` · written 2026-11-25
>
> Audience: any engineer or AI agent (Claude, Gemini, Copilot, Codex…) that needs the whole picture before changing the system.
> This is the **as-built** design, derived from the code. Where an older doc disagrees, the code wins and the gap is listed in §12.
> Visual version (Claude artifact, private to the owner): https://claude.ai/artifact/XB5YRDGtvjPaZrXTmRffHx — this Markdown file is the canonical copy.
> Related: [architecture.md](architecture.md) (conventions), [database.md](database.md) (node schemas), [admin-guide.md](admin-guide.md) (roles, FR), [validation.md](validation.md) (Zod), [DESIGN.md](../DESIGN.md) (visual system).

---

## 1. Context

The platform is the digital hub of the **CC Saint-Martin Blanmont** road-cycling club (Wallonia, Belgium). It replaces a static site plus Notion with one Next.js app that runs the club's weekly rituals: pick Saturday's route, poll who rides at the weekend, publish the calendar, count attendance ("Carré Vert"), and sell club kit.

| Item | Value |
|---|---|
| Live URL | `https://blanmont.vercel.app` (legacy domain `cyclo-blanmont.be` — DNS cut-over pending) |
| Hosting | Vercel (Node runtime + Edge middleware + Vercel Cron) |
| Data | Firebase Realtime Database, `europe-west1` |
| Team | 1 developer (+ AI agents), a handful of club admins |
| UI language | French only; code/commits in English |

---

## 2. Requirements

### 2.1 Functional

| # | Capability | Main routes |
|---|---|---|
| F1 | Route catalogue ("Parcours"): filter, map, elevation profile, GPX download, ratings | `/traces`, `/traces/[id]` |
| F2 | Route import from GPX / Strava / Komoot metadata | `/admin/add-trace`, `/api/admin/parse-gpx`, `/api/admin/fetch-metadata` |
| F3 | Saturday route vote (`Draft → Voting → Closed`) | `/saturday-ride`, `app/actions/rides.ts` |
| F4 | Weekend attendance poll (day, speed group, custom QCM), WhatsApp summary | `/sondage`, `/admin/sondages`, cron `create-weekend-poll` |
| F5 | Club calendar, PDF import, iCal feed, ride weather | `/calendrier`, `/admin/events/import`, `/api/calendar/*.ics` |
| F6 | Carré Vert attendance + annual leaderboard | `/leaderboard`, `/admin/carre-vert`, `/admin/pointage-express` |
| F7 | Members directory, profiles, roles, password reset, account activation | `/members`, `/profile`, `/admin/members` |
| F8 | Club kit shop + orders | `/equipements` (`/api/equipements`), `/checkout`, `/admin/commandes` |
| F9 | Blog, photo galleries, homepage hero | `/blog`, `/galerie`, `/admin/blog`, `/admin/galerie`, `/admin/hero` |
| F10 | Prospects / trial rides ("Rejoindre") | `/rejoindre`, `/api/rejoindre`, `/admin/prospects`, `/admin/sorties-essai` |
| F11 | Activity logging + admin review, statistics | `/api/logs`, `/admin/logs`, `/admin/statistics` |

### 2.2 Non-functional

| Concern | Target / assumption |
|---|---|
| Users | ~100–200 members, ~5 admins. Peak = Friday evening / Saturday morning (vote + poll + GPX download) |
| Load | < 2 req/s at peak, ~1–3 k page views/week. Data set fits in memory (MBs, not GBs) |
| Latency | Mobile-first, "< 3 taps" to GPX/vote; cached reads ≤ 60 s stale; optimistic UI on votes |
| Availability | Best effort (club tool). Loss of the site on a Saturday morning is the only painful outage |
| Cost | Free / hobby tiers: Vercel, Firebase Spark/Blaze-low, Cloudinary free, Open-Meteo free |
| Security | Member PII (email, phone), orders. No payments in-app. Admin perimeter must hold |
| Privacy | GDPR: anonymised IPs in logs, consent banner (`app/lib/consent`), `/confidentialite` |
| Maintainability | One developer + AI agents → conventions in `AGENTS.md`, Graft index, ~123 test files |

### 2.3 Constraints

- Stack fixed: Next.js 16 App Router, React 19, TS strict, Tailwind v4, Firebase RTDB.
- Visual system "La Feuille de Blanmont — Carte IGN" is non-negotiable (`DESIGN.md`).
- Zero GitHub Actions; releases via `nicode-ci` (Variant C), deploy via Vercel.

---

## 3. High-level architecture

```
                        ┌──────────────────────── Browser (mobile-first, FR) ───────────────────────┐
                        │ RSC HTML + client islands: Leaflet map, Chart.js, GSAP sheet motion,      │
                        │ AuthContext (mirrors session), Firebase Web SDK (few direct reads)        │
                        └───────────────┬───────────────────────────────────┬──────────────────────┘
                                        │ HTTPS, cookie ccb_session          │ webcal:// / .ics
                                        ▼                                   ▼
┌──────────────────────────────────────── Vercel ─────────────────────────────────────────────────────┐
│  Edge middleware.ts  ── HMAC verify ccb_session ── guards /admin/* (redirect) and /api/admin/* (401/403)│
│                                                                                                        │
│  Next.js Node runtime                                                                                  │
│  ├─ Server Components (pages)  ──► app/lib/firebase/*  (unstable_cache 60 s, tags)                     │
│  ├─ Server Actions  app/actions/*.ts, app/actions.ts  (writes + revalidatePath)                        │
│  ├─ Route Handlers  app/api/**     (admin CRUD, uploads, ics, logs, crons)                             │
│  └─ Domain libs     carreVert · sondage-automation · calendar-ics · weather · strava · validation(Zod) │
│                                                                                                        │
│  Vercel Cron: 04:00 sync-elevation · 05:00 sync-leaderboard · Mon 06:00 create-weekend-poll (UTC)      │
└───────┬──────────────┬───────────────┬───────────────┬───────────────┬───────────────┬────────────────┘
        │ Admin SDK    │ Auth (email/pw)│ upload        │ CSV export    │ forecast      │ OAuth/API
        ▼              ▼                ▼               ▼               ▼               ▼
  Firebase RTDB   Firebase Auth     Cloudinary     Google Sheets    Open-Meteo      Strava / Komoot
  (europe-west1)  (+ Storage rules) (images)       (attendance)     (weather)       (route import)
                                                                        Sentry (errors, 10 % traces)
```

### 3.1 Layers and responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Edge guard | `middleware.ts`, `app/lib/auth/session-token.ts` | Verify signed cookie with Web Crypto; no Node/Firebase imports allowed (edge bundle) |
| Pages | `app/**/page.tsx` (58 pages) | Server-render data, pass to client views |
| Writes | `app/actions/{auth,events,members,polls,rides,traces}.ts`, `app/actions.ts` | Validate (Zod) → Admin SDK write → `revalidatePath` |
| HTTP API | `app/api/**/route.ts` (28 handlers) | Admin CRUD, file parsing, uploads, feeds, telemetry, crons |
| Data access | `app/lib/firebase/*` | One module per RTDB node; `rtdbService.ts` isomorphic reader (Admin SDK on server, Web SDK in browser); mock mode when no keys |
| Domain | `app/lib/*` | Pure-ish business rules (Carré Vert scoring, poll automation, ICS, weather) |
| UI system | `app/components/carte/*`, `app/globals.css` | Carte IGN tokens, `SheetHeader`, motion |

---

## 4. Data model (Firebase RTDB)

Single JSON tree; every collection is a top-level node keyed by a string id (`trace_…`, `member_…`, push ids). Full JSON samples live in [database.md](database.md).

| Node | Key | Purpose | Written by |
|---|---|---|---|
| `traces` | `trace_<id>` | Routes: distance, elevation, surface, direction, Komoot/GPX URLs | admin |
| `members` | `member_<id>` | Profile, `role[]`, `authUid`, Strava id | admin, member (own profile) |
| `calendar-events` | `event_<id>` | Season calendar (`isoDate`, departure, distances, group) | admin, PDF import, leaderboard sync |
| `attendance` | `<eventId>/members/<memberId>` | Carré Vert presence + group (V/J/B/R) | admin, pointage-express, sync |
| `leaderboard` | `entry_<id>` | Aggregated `totalRides`, `dates[]` | cron sync-leaderboard, CSV import |
| `saturday-rides` | `ride_<id>` | Candidate traces, status, selected trace | admin |
| `votes` | `vote_<id>` | (ride, member, trace) | member |
| `weekend-polls` | poll id | Weekly poll definition, status `active/closed`, custom questions | cron, admin |
| `weekend-poll-responses` | per poll | Day, speed group, answers, notes | member |
| `feedback` | `feedback_<id>` | Route rating 1–5 + comment | member |
| `event-reviews` | `<eventId>/…` | Reviews per calendar event | member |
| `blog` | push id | Markdown articles, slug, cover | admin |
| `galleries` | album slug | Google Photos albums, cover, images | admin |
| `equipment` | code | Gobik kit catalogue, price, availability | admin |
| `equipment-orders` | `order_<ts>_<rand>` | Orders; price recomputed server-side; status `pending→confirmed→delivered/cancelled` | server action only |
| `trial-requests` | id | Prospect sign-ups and trial-ride follow-up | public form → admin |
| `hero-settings` | singleton | Homepage hero config | admin |
| `activity-logs` | `<YYYY-MM>/<id>` | Telemetry, anonymised IP, review flags; month-sharded for pruning | `/api/logs` |

```
members ──1:n── votes ──n:1── saturday-rides ──n:m (candidateTraceIds)── traces ──1:n── feedback
members ──1:n── weekend-poll-responses ──n:1── weekend-polls ──(date)── calendar-events
calendar-events ──1:1── attendance ──(aggregated by carreVert.ts)──► leaderboard
equipment ──n:m (items[])── equipment-orders
```

**Modelling choices**
- Denormalised names (`memberName`, `equipmentName`) in child records → cheap reads, accepted drift on rename.
- Relations are id strings, no referential integrity; deletes do not cascade.
- Month sharding only on `activity-logs` (the only node that grows unbounded).

---

## 5. Interfaces

### 5.1 Server Actions (primary write path)

| Module | Examples |
|---|---|
| `actions/auth.ts` | `loginAction`, `logoutAction`, `getCurrentSessionUserAction`, `requestAccountActivationAction` |
| `actions/rides.ts` | create ride, cast vote, close vote |
| `actions/polls.ts` | answer poll, admin poll CRUD |
| `actions/events.ts` | calendar CRUD, PDF import commit |
| `actions/members.ts`, `actions/traces.ts` | profile / trace mutations |
| `app/actions.ts` | legacy grab-bag (feedback, `submitEquipmentOrderAction`, …) |

### 5.2 Route handlers

| Path | Method | Auth | Notes |
|---|---|---|---|
| `/api/admin/**` (16 handlers) | CRUD | middleware **+** `verifyAdminRequest` | members, events, blog, equipment, attendance, hero, galerie, CSV import, GPX parse, metadata fetch |
| `/api/upload` | POST | session | Cloudinary upload |
| `/api/logs` | POST / GET / PATCH / DELETE | POST open (session optional), others admin | telemetry ingestion, review, pruning |
| `/api/rejoindre` | POST | public | trial request (Zod-validated) |
| `/api/equipements` | GET | public | catalogue |
| `/api/traces/[id]` | GET / PATCH / DELETE | GET public, writes admin (`verifyAdminRequest`) | route data |
| `/api/gpx/stats` | GET | public | GPX stats |
| `/api/calendar/ics`, `/api/calendar/subscribe.ics` | GET | public | iCalendar feed |
| `/api/auth/strava/callback` | GET | OAuth | Strava link |
| `/api/cron/create-weekend-poll` | GET/POST | `CRON_SECRET` if set | weekly poll |
| `/api/cron/sync-elevation` | GET | `CRON_SECRET` if set | **still targets Notion** (see §12) |
| `/api/cron/sync-leaderboard` | GET | **none** (see §12) | Google Sheet CSV → attendance + leaderboard |

---

## 6. Key flows

### 6.1 Login and session
```
Browser ─loginAction(email,pw)─► Server Action
   Zod validate ─► Firebase Auth signInWithEmailAndPassword (Web SDK, server side)
   ─► find /members where email matches (sync authUid if missing) ─► reject if no member
   ─► role[] + ADMIN_EMAILS ─► isAdmin
   ─► signSessionToken (HMAC-SHA256, 14 d) ─► Set-Cookie ccb_session (HttpOnly, Secure, Lax)
Later requests: middleware verifies HMAC at the edge; route handlers re-verify (defence in depth).
```
Role changes take effect at next login (token carries `isAdmin`).

### 6.2 Weekly cycle
```
Mon 06:00 UTC  cron create-weekend-poll ─► find Saturday sortie in calendar-events
               ─► close previous polls ─► create weekend-polls (distance options from event)
Mon–Fri        members answer /sondage · admin opens Saturday vote (saturday-rides: Voting)
Fri            admin closes vote ─► selectedTraceId ─► WhatsApp summary export
Sat/Sun        ride ─► pointage-express (QR) / admin toggles ─► attendance/{eventId}
Daily 05:00    cron sync-leaderboard ─► Google Sheet CSV ─► attendance + leaderboard (carreVert.ts)
```

### 6.3 Carré Vert scoring (`app/lib/carreVert.ts`)
- Weekend (Sat and/or Sun) = max **1** point; each weekday ride = **+1**.
- Fidelity = member carrés / possible carrés to date × 100.
- Two inputs (Sheet CSV via cron, live admin toggles) converge on `attendance`; leaderboard is derived.

### 6.4 Equipment order
Client cart ─► `submitEquipmentOrderAction` ─► prices/availability **re-read from `/equipment`** server-side ─► `equipment-orders` (Admin SDK only) ─► `/admin/commandes` status workflow + CSV export. No payment processing.

### 6.5 Calendar PDF import
Upload PDF ─► server parse (`pdf-parse`) ─► editable preview table ─► commit batch to `calendar-events`. Two-step to keep admins in control of OCR-ish errors.

---

## 7. Caching and freshness

| Mechanism | Where | Behaviour |
|---|---|---|
| `unstable_cache` | 14 readers in `app/lib/firebase/*` | 60 s stale-while-revalidate, tagged (`traces`, …) |
| `revalidatePath` | every Server Action / admin route after a write | Immediate purge of affected pages |
| `force-dynamic` | crons, feeds | Never cached |
| Client optimistic UI | votes, poll answers | Instant feedback, server reconciles |

Reads fetch **whole nodes** (`ref('x').once('value')`) and filter in memory. Fine at club scale, cheap thanks to the 60 s cache.

---

## 8. Security model

| Control | Implementation |
|---|---|
| Authentication | Firebase Auth (email/password, reset e-mails); member record required |
| Session | Stateless HMAC-SHA256 token, 14 days, `HttpOnly; Secure; SameSite=Lax` |
| Authorisation | `role[]` ∈ {Admin, President, WebMaster} or `ADMIN_EMAILS` → `isAdmin` |
| Perimeter | Edge middleware on `/admin/*`, `/api/admin/*` + `verifyAdminRequest` in each admin handler |
| DB access | Server uses Admin SDK (bypasses rules); browser Web SDK governed by RTDB rules |
| Storage | `storage.rules`: images only, 5 MB members / 10 MB blog, owner-or-admin writes |
| Input | Zod schemas (`app/lib/validation*`), `sanitizeHtml.ts` for rich text |
| Privacy | IP anonymiser, consent module, month-sharded logs with pruning |
| Monitoring | Sentry client/server/edge, 10 % trace sampling in prod |

---

## 9. Scale and reliability

**Load estimate.** 200 members × ~10 page views/week ≈ 2 k views/week; peak bursts ≈ 30 concurrent users Saturday 07:00–09:00. With 60 s caching, RTDB sees a few reads per minute per node — orders of magnitude under RTDB limits (200 k concurrent connections, 1 k writes/s).

**Where it breaks first (in order):**
1. Whole-node reads on `activity-logs` and `attendance` as years accumulate → payload size, not QPS.
2. Function cold starts on Vercel Hobby at the Saturday peak (perceived latency, not failure).
3. Cron fragility: Google Sheet format change silently breaks leaderboard sync.

**Failure modes**

| Failure | Impact | Mitigation today | Gap |
|---|---|---|---|
| Firebase outage | Site read-only/empty | Mock mode only in dev | No static fallback |
| Cloudinary down | Missing images | — | acceptable |
| Open-Meteo down | No weather badge | Badge degrades | — |
| Sheet CSV changed | Wrong leaderboard | Manual CSV import route | No schema check / alert |
| Bad admin write | Data loss | `scripts/backup-db.ts` (manual) | No scheduled backup |

**Observability.** Sentry for errors, `activity-logs` for behaviour, Vercel logs for crons. No alert on cron failure.

---

## 10. Trade-offs

| Decision | Chosen | Alternative | Why | Cost accepted |
|---|---|---|---|---|
| Database | Firebase RTDB | Postgres (nicode starter), Firestore | Already migrated from Notion, free tier, realtime, zero ops | No joins/constraints, whole-node reads, schema lives in code |
| Writes | Server Actions + Admin SDK | Client SDK + rules | Validation and secrets stay server-side; rules stay simple | Every write is a function invocation |
| Session | Custom HMAC cookie | Firebase ID tokens / session cookies, Auth.js | Edge-verifiable without Firebase in middleware bundle | Own crypto code; role change needs re-login; no server-side revocation |
| Hosting | Vercel | nicode VPS (Dokploy) | Edge middleware, cron, previews for free | Vendor features (cron, `unstable_cache`) tie code to Vercel |
| Attendance source | Google Sheet + live toggles | App-only | Committee already works in the sheet | Two writers on one node, sync ordering |
| Media | Cloudinary | Firebase Storage only | Transformations, free CDN | Third vendor |
| Caching | 60 s tagged cache | Realtime listeners everywhere | Cheap, SSR-friendly | Up to 60 s staleness outside revalidated paths |

---

## 11. What to revisit as it grows

| Trigger | Change |
|---|---|
| > 1 season of logs / attendance | Query by key range (`orderByKey().startAt`) instead of whole-node reads; archive past seasons |
| Second developer or more admins | Version RTDB security rules in repo (`database.rules.json`) and deploy them with `firebase deploy` |
| Payments in the shop | Move orders to a provider (Stripe/Mollie) with webhooks; never trust client totals (already true) |
| More automation | Cron health table + Sentry cron monitors |
| Leaving Vercel | Replace Vercel Cron with VPS cron/`nicode-ci`, `unstable_cache` with `use cache` / Redis |
| Relational reporting needs | Mirror RTDB to Postgres for statistics; keep RTDB for live data |

---

## 12. Known issues and doc drift (2026-11-25)

Ranked by risk. Status is tracked here; update the line when the fix lands.

| # | Issue | Status |
|---|---|---|
| 1 | `/api/cron/sync-leaderboard` had no auth; other crons checked `CRON_SECRET` only if set | Fix in [nicanac/blanmont#188](https://github.com/nicanac/blanmont/pull/188): shared `verifyCronRequest`, fails closed in production |
| 2 | Session secret fell back to `FIREBASE_SERVICE_ACCOUNT_KEY`, then to a committed string | Fix in #188: `SESSION_SECRET` (≥ 32 chars) required in production |
| 3 | RTDB rules not in the repo | Fix in #188: `database.rules.json` = live rules (deny all client access) |
| 4 | `/api/cron/sync-elevation` wrote to the legacy Notion DB | Fix in #188: ported to Firebase `/traces` |
| 5 | Admin e-mail allow-list hard-coded (incl. a personal address) | Fix in #188: `ADMIN_EMAILS` env; client uses the session's `isAdmin` |
| 6 | Google Sheet URL hard-coded | Fix in #188: `LEADERBOARD_SHEET_CSV_URL` env |
| 7 | No scheduled RTDB backup | Fix in #188: daily `/api/cron/backup-db` → Storage `backups/`, 30 days |
| 8 | Doc drift in `architecture.md` (Notion data layer, old branch convention) and `database.md` (`AdminGuard` as perimeter) | Fixed in this PR |
| 9 | Some server-side helpers (e.g. `updateTrace`, used by `PATCH /api/traces/[id]`) go through the Web SDK (`getFirebaseDatabase`); under the live deny-all rules those calls should be rejected (inferred from code + rules, not reproduced) | Open: verify, then switch them to the Admin SDK |

Until #188 is merged and its four env vars are set on Vercel, rows 1–7 describe production as it runs today.

---

## 13. Glossary (FR → EN)

| FR | Meaning |
|---|---|
| Parcours / Trace | Cycling route |
| Sortie (du samedi) | Group ride (Saturday) |
| Sondage du weekend | Weekend attendance poll |
| Carré Vert | Attendance point; annual fidelity challenge |
| Pointage express | QR-based quick attendance check-in |
| Équipements | Club kit (Gobik) |
| Rejoindre / sortie d'essai | Join the club / trial ride |
| Groupe A/B/C/VTT; V/J/B/R | Speed groups; attendance colour groups |
