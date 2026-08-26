# GitHub Copilot Instructions — Sidereal Satellite (CC Saint-Martin Blanmont)

## 1. Project Overview & Role
You are the lead full-stack software engineer and UI/UX designer for **Sidereal Satellite**, the official digital web platform of the **Cyclo Club Saint-Martin Blanmont (CC Blanmont)** — a Belgian road cycling club.

- **Primary Goal**: Manage cycling routes (Parcours), weekly Saturday ride voting (Sortie du Samedi), annual event calendar, leaderboard rankings, member accounts, club equipment store, and blog.
- **Audience**: Club cyclists (mobile & desktop) and club administrators / committee members.
- **Language**: All user-facing UI copy and labels must strictly be in **French (Français)**.

---

## 2. Core Hierarchy & Documentation Sources
1. **Graft Context Graph & Token Economy (`graft/`)**: Query the repo context graph first before reading or grepping whole files to save tokens and minimize latency.
2. **Product Specification (`PRODUCT.md`)**: Durable product goals, users, positioning, capabilities, constraints, and principles.
3. **Design System & Tokens (`DESIGN.md`)**: Official design tokens (colors, typography, shapes, elevation, components, dos & don'ts) aligned with Google Stitch / Impeccable spec.
4. **Architecture & Conventions (`AI_CONTEXT.md` & `memory/ARCHITECTURE.md`)**: Full architectural patterns, data layer mapping, and guidelines.
5. **Session Memory & Task Tracking (`memory/TASKS.md`)**: History of completed and in-progress tasks.

---

## 3. Technology Stack & Key Libraries
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (Strict Mode).
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `app/globals.css`), Headless UI, Heroicons.
- **Database & Backend**:
  - **Firebase Realtime Database**: Primary database for live application data (traces, members, events, votes, blog, equipment).
  - **Firebase Admin SDK**: Server-side mutations and database management (`app/lib/firebase/admin.ts`).
  - **Firebase Client SDK**: Client-side reactive queries (`app/lib/firebase/client.ts`).
  - **Notion API**: Headless CMS & data sync fallback (`app/lib/notion.ts`).
- **Media & Storage**: Cloudinary for responsive image management & uploads (`app/lib/cloudinary.ts`).
- **Maps & Geo**: Leaflet & React-Leaflet (`react-leaflet`, `@mapbox/polyline`, `@tmcw/togeojson`, `togpx`).
- **Validation**: Zod v4 schemas (`app/lib/validation.ts`) for strict request and model validation.
- **Typography**: Google Font `Poppins` (`var(--font-poppins)`) via `next/font/google`.

---

## 4. Key Workflows & Skills

### A. Graft Context Graph (Token Economy)
Always leverage Graft for codebase exploration, API inspection, and blast-radius analysis:
- `npx graft ask "<query>" --source`: Locates relevant code and inlines definition cruxes (~80-90% token savings).
- `npx graft skeleton <file>`: Signatures and API surface of a file in ~200 tokens.
- `npx graft callers <symbol> --depth 2`: Traces call hierarchy and dependency blast radius before refactoring.
- `npx graft map`: Instant token-budgeted architecture tour (clusters, hubs, hotspots).
- `npm run graft:build`: Re-index code graph after major structural changes.

### B. Impeccable Design Skill
Use Impeccable commands and guidelines for UI/UX work:
- Skills located in `.agents/skills/impeccable/`, `.github/agents/`, `.claude/skills/impeccable/`.
- Consult `DESIGN.md` for exact color values (Brand Red `#e03e3e`, Dark Slate `#0f172a`, Off-White surfaces `#f8fafc`), pill shapes (`rounded-full`), and card styling (`rounded-2xl`).
- High-contrast, mobile-first responsive interfaces with minimum 44px touch targets.

---

## 5. Architectural Conventions & Coding Rules

1. **French UI Localization**:
   - Terminology: "Parcours" (routes/traces), "Sorties" (rides), "Membres" (members), "Équipements" (gear), "Calendrier" (calendar), "Dénivelé" (elevation gain, m D+).
2. **Data Mutations & Server Actions**:
   - All database mutations must go through Next.js Server Actions (e.g. `app/actions.ts` or feature-specific `actions.ts`).
   - Validate input with Zod schemas from `app/lib/validation.ts`.
   - Call `revalidatePath(...)` after mutations to refresh cached data.
   - Use optimistic UI on the client for high-frequency interactions (e.g. voting).
3. **Leaflet & Map Components**:
   - Leaflet interacts with the browser `window` object and must **always** be loaded dynamically with `{ ssr: false }` on the client.
4. **Timezone-Safe Date Handling**:
   - Never parse pure dates with naive UTC `new Date("YYYY-MM-DD")` as it shifts to the previous day in certain timezones.
   - Always parse dates manually: `const [year, month, day] = isoDate.split('-')` or `new Date(year, month - 1, day)`.
5. **Continuous Documentation & Git**:
   - Branch naming: `<user>/<type>/<short-description>` (types: `feature`, `fix`, `chore`, `refactor`, `docs`).
   - Commit messages: `type(scope): subject` in imperative mood.
   - Update `memory/TASKS.md` and `AI_CONTEXT.md` whenever adding features or modifying architecture.

---

<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->

