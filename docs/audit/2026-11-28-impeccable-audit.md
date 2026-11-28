# Impeccable audit — 2026-11-28

Full UI audit of the Blanmont platform against the « La Feuille de Blanmont — Carte IGN » design system (`design-system/`, `DESIGN.md`), run with Impeccable 4.11.1 (`/impeccable audit`).

**Method.** Production build (`next build` + `next start`, v0.50.2 `9ea27b6`) on the Realtime Database emulator with the fictitious seed of `docs/manuel/scripts/seed.mjs`. 67 routes captured as visitor, member or admin: desktop 1440 px light and dark, phone 390 px light, phone dark for 14 key routes (214 full-page screenshots). Per view: axe-core (WCAG 2.2 AA), console errors, horizontal overflow, broken images, backdrop filters, radii and touch targets. Impeccable detector on the source (`impeccable detect app/`) and on the 16 public URLs. Five reviewers read every variant of every route against the design system; 118 raw findings were deduplicated to the 87 below. Evidence crops: `docs/audit/2026-11-28/`.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | colour-contrast fails on 128 of 201 audited views; unnamed icon buttons on 41 views; unlabelled form fields |
| 2 | Performance | 3 | no layout thrash or heavy animation seen; backdrop blur on the sticky navbar; not profiled (no Lighthouse run) |
| 3 | Theming | 2 | 739 stock Tailwind colours in 53 files, monospace on 320+ elements, back-office locked to day with dead dark classes |
| 4 | Responsive Design | 2 | sideways scroll on /confidentialite, /admin/logs; clipped leaderboard drawer, admin tables and event rows on phones |
| 5 | Implementation Integrity | 2 | public sheet coherent and distinctive; back-office drifts: 4 header patterns, 6+ button styles, forms differ per page |
| **Total** | | **11/20** | **Acceptable (significant work needed)** |

## Implementation Integrity Verdict

**Pass for the public sheet, fail for the back-office.** The public pages express a product-specific system that no other club site has: the SheetHeader cartouche over the real territory, the map inks, Archivo width hierarchy, legends instead of metric tiles. The detector finds no AI-slop pattern there beyond a grid it flags on the actual map. The drift is concentrated in the back-office and the member tools, where screens were built by hand: monospace type, stock Tailwind greens and ambers, hero-metric KPI tiles, four header patterns and six button styles, and copy left in English. Data truth also leaks: summer meeting times are hard-coded on four pages while the season is winter.

## Executive Summary

- Audit Health Score: **11/20** (Acceptable)
- 87 issues: **P0 0 · P1 8 · P2 63 · P3 16**, each filed as a GitHub issue (label `impeccable-audit`).
- Top issues: summer meeting times shown in winter (a newcomer arrives five hours early); campaign orders send raw product ids to Gobik; /profile unreachable by direct link; contrast below AA on most views; long cartouche titles overflow and scroll sideways on phones.
- One security finding from this audit was reported to the owner privately instead of in a public issue.
- Next: fix the P1s, then consolidate the back-office on the shared Button / Badge / page-header pieces and the spot-ink tokens.

## Detailed Findings by Severity

### P1 (8)

| ID | Issue | Category | Where | GitHub |
|---|---|---|---|---|
| F01 | 🐛 [bug] campagne: stock lines show raw ids « MaiCXPRO », « CuiCouHo » | Implementation Integrity | `/admin/commandes/campagnes/campaign_2026_maillots` | — |
| F02 | 🐛 [bug] admin membres: Actions column off-screen at 1440 px | Responsive | `/admin/members` | — |
| F03 | 🐛 [bug] leaderboard: rider drawer overflows phones, close clipped | Responsive | `/leaderboard`, `/leaderboard?year=all` | — |
| F04 | 🐛 [bug] schedule: summer times (8h15/8h30/9h00) shown in winter | Copy | `/`, `/le-club`, `/rejoindre` +1 | — |
| F05 | 🐛 [bug] cartouche: long titles overflow the panel (« Confidentialité ») | Responsive | `/confidentialite`, `/admin/equipements`, `/admin/events` +3 | — |
| F06 | 🐛 [bug] profile: opening /profile directly sends a member to login | UX | `/profile` | — |
| F07 | 🐛 [bug] a11y: icon buttons, links and form fields without accessible names | Accessibility | `/admin (all pages on phones)`, `/admin/blog/[id]/edit`, `/admin/equipements/[id]` +5 | — |
| F08 | 🐛 [bug] a11y: spot-ink text pairs below WCAG AA contrast on 128 views | Accessibility | `/`, `/calendrier`, `/le-club` +9 | — |

### P2 (63)

| ID | Issue | Category | Where | GitHub |
|---|---|---|---|---|
| F09 | 💄 [ui] admin: page and section headers follow four patterns | UX | `/admin/traces`, `/admin/add-trace`, `/admin/blog/new` +9 | — |
| F10 | 🐛 [bug] admin: cartouche margin reads « Feuille · Feuille · … » | Implementation Integrity | `/admin`, `/admin/acces`, `/admin/blog` +7 | — |
| F11 | 💄 [ui] admin: ISO dates, « 83.00 € », dot decimals, « 1 pièces » | Copy | `/admin`, `/admin/blog`, `/admin/commandes` +9 | — |
| F12 | 💄 [ui] admin topbar: wrong breadcrumbs, « A › Tr… » and tiny targets | UX | `/admin/acces`, `/admin/commandes`, `/admin/commandes/banque` +9 | — |
| F13 | 💄 [ui] admin sidebar: lower sections hidden, active item off-screen | UX | `/admin/equipements`, `/admin/equipements/MaiCXPRO`, `/admin/equipements/MaiCXPRO/edit` +4 | — |
| F14 | 🐛 [bug] events mobile: ride rows cut off at the right edge | Responsive | `/admin/events` | — |
| F15 | 💄 [ui] admin mobile: role matrix and order table hide key columns | Responsive | `/admin/acces`, `/admin/commandes/campagnes/campaign_2026_maillots` | — |
| F16 | 💄 [ui] admin: hand-rolled buttons in 6+ styles, admin variants unused | Implementation Integrity | `/admin`, `/admin/traces`, `/admin/add-trace` +9 | — |
| F17 | 💄 [ui] admin: form fields, labels and file inputs differ per page | Implementation Integrity | `/admin/blog/new`, `/admin/blog/post_1/edit`, `/admin/add-trace` +9 | — |
| F18 | 💄 [ui] admin: route red on every row action, link and selected chip | Theming | `/admin/traces`, `/admin/commandes/banque`, `/admin/commandes` +3 | — |
| F19 | 🐛 [bug] equipement edit: stock inputs clip the digits (0 reads « C ») | Responsive | `/admin/equipements/MaiCXPRO/edit` | — |
| F20 | 🐛 [bug] admin membre: edit form has no phone; create form no uploader | Implementation Integrity | `/admin/members/m-julie/edit`, `/admin/members/new` | — |
| F21 | ♻️ [refactor] font: monospace face on 320+ elements (admin, pass) | Theming | `/admin/pointage-express`, `/admin/statistics`, `/admin/sondages` +9 | — |
| F22 | 💄 [ui] admin: the same filter control is drawn six different ways | Implementation Integrity | `/admin/members`, `/admin/logs`, `/admin/retours` +4 | — |
| F23 | 💄 [ui] admin: hero-metric KPI tiles on five pages | UX | `/admin/prospects`, `/admin/statistics`, `/admin/sondages` +4 | — |
| F24 | 💄 [ui] admin: English labels and options, raw enums, emoji | Copy | `/admin/logs`, `/admin/members`, `/admin/members/m-julie/edit` +8 | — |
| F25 | 🐛 [bug] admin hero: blocks #2–#4 and live preview ignored by home | Implementation Integrity | `/admin/hero`, `/` | — |
| F26 | 💄 [ui] admin paramètres: dark theme preview is unreadable | Theming | `/admin/settings`, `/admin/parametres` | — |
| F27 | 💄 [ui] admin journal: triage filter row overflows phones by 191 px | Responsive | `/admin/logs` | — |
| F28 | 💄 [ui] admin portraits: opens on an empty « Avec photo (0) » filter | UX | `/admin/members/photos` | — |
| F29 | 💄 [ui] admin statistiques: « JUI » twice, traffic-light bars, no key | Theming | `/admin/statistics` | — |
| F30 | 💄 [ui] sondage: winter poll still offers « Samedi matin · 8h30 » | UX | `/sondage` | — |
| F31 | 💄 [ui] members: phone cards are 470 px map placeholders | Responsive | `/members` | — |
| F32 | 💄 [ui] cartouche: missing on /profile/pass and blog articles | Implementation Integrity | `/profile/pass`, `/profile`, `/profile/commandes` +1 | — |
| F33 | 💄 [ui] profile/pass: raw role « Member », internal ID and ISO dates | Copy | `/profile/pass`, `/profile` | — |
| F34 | 🐛 [bug] footer: « Se connecter » offered to signed-in members | UX | `/sondage`, `/leaderboard`, `/galerie` +3 | — |
| F35 | 💄 [ui] tool pages: four different headers, a screen of blank paper | Implementation Integrity | `/traces/trace_01/edit`, `/import/strava`, `/import/garmin` +1 | — |
| F36 | 💄 [ui] sondage: raw title « Sortie du Weekend - 2026-11-28 » | Copy | `/sondage` | — |
| F37 | 💄 [ui] retours: missing-token error blames an admin, offers no fix | UX | `/retours`, `/admin/retours` | — |
| F38 | 💄 [ui] leaderboard: tied leaders shown three different ways | UX | `/leaderboard` | — |
| F39 | 💄 [ui] leaderboard: phone table stacks five labelled rows per rider | Responsive | `/leaderboard` | — |
| F40 | 💄 [ui] galerie: album badges overlap on phones | Responsive | `/galerie` | — |
| F41 | 💄 [ui] galerie: stats strip repeats the legend, « 1 saisons » | Implementation Integrity | `/galerie` | — |
| F42 | 🐛 [bug] trace-detail: admin tools and review edit shown to visitors | Implementation Integrity | `/traces/trace_01` | — |
| F43 | 💄 [ui] equipement: three competing order actions above the catalogue | UX | `/le-club/equipement` | — |
| F44 | 💄 [ui] equipement: eyebrow, icon tiles and off-system section headings | Theming | `/le-club/equipement` | — |
| F45 | 💄 [ui] home: full-bleed route-red band breaks the One Red Rule | Theming | `/` | — |
| F46 | 🐛 [bug] public pages: every tab carries the same generic <title> | Accessibility | `/le-club`, `/le-club/equipement`, `/calendrier` +2 | — |
| F47 | 💄 [ui] public pages: the GPX download is drawn five different ways | UX | `/`, `/calendrier`, `/traces` +1 | — |
| F48 | 🐛 [bug] trace-detail: no GPX download, description and map link twice | UX | `/traces/trace_01` | — |
| F49 | 💄 [ui] copy: Title Case, franglais, « ! » and typos on public pages | Copy | `/`, `/le-club`, `/le-club/equipement` +9 | — |
| F50 | 💄 [ui] le-club: « 1 ou 2 sorties » vs « Trois sorties d’essai » | Copy | `/le-club`, `/` | — |
| F51 | 💄 [ui] traces: empty catalogue blames the visitor’s filters | UX | `/traces` | — |
| F52 | 💄 [ui] traces, equipement: English words in the French UI | Copy | `/traces`, `/traces/trace_01`, `/le-club/equipement` | — |
| F53 | 💄 [ui] traces, equipement, calendrier: decimal point and mixed ranges | Copy | `/traces`, `/traces/trace_01`, `/le-club/equipement` +2 | — |
| F54 | 🐛 [bug] equipement: product photos 404 (public and admin) | Implementation Integrity | `/le-club/equipement`, `/admin/equipements`, `/admin/equipements/MaiCXPRO` +1 | — |
| F55 | 🐛 [bug] equipement: « Épuisé » shown on items in stock, double « Tous » | UX | `/le-club/equipement`, `/admin/equipements` | — |
| F56 | 💄 [ui] equipement: placeholder art overlaps labels, socks as a jersey | Implementation Integrity | `/le-club/equipement` | — |
| F57 | 💄 [ui] chips: wrapping amber pill, rect filters, red category chip | Implementation Integrity | `/confidentialite`, `/securite`, `/blog` +1 | — |
| F58 | 💄 [ui] forms: field style differs per page and text is 12 px on phones | Responsive | `/login`, `/login/forgot-password`, `/auth/action` +3 | — |
| F59 | 💄 [ui] rejoindre, securite, article: red beyond the one action | Theming | `/rejoindre`, `/securite`, `/blog/recit-la-boucle-de-lorne-sous-le-soleil` | — |
| F60 | 💄 [ui] securite: diagrams illegible on phones and off-palette | Responsive | `/securite` | — |
| F61 | 🐛 [bug] groups: names and paces hard-coded, not from group settings | Implementation Integrity | `/saturday-ride`, `/rejoindre`, `/admin/prospects` +1 | — |
| F62 | 💄 [ui] auth pages: translucent card, amber actions, not one system | Theming | `/login`, `/login/forgot-password`, `/auth/action` +2 | — |
| F63 | 💄 [ui] login, auth: 14–16 px tall recovery links on phones | Accessibility | `/login`, `/auth/action`, `/checkout` | — |
| F64 | 🐛 [bug] saturday-ride: login button loses the return to the vote | UX | `/saturday-ride`, `/checkout` | — |
| F65 | ♻️ [refactor] public pages: red buttons hand-rolled in 5 styles + glow | Implementation Integrity | `/saturday-ride`, `/login`, `/rejoindre` +3 | — |
| F66 | 💄 [ui] rejoindre, securite, confidentialite: 3 section-headline styles | Implementation Integrity | `/rejoindre`, `/securite`, `/confidentialite` | — |
| F67 | 🐛 [bug] avatars: default-avatar.png does not exist (broken image) | Implementation Integrity | `/galerie`, `/sondage`, `/retours` +2 | — |
| F68 | 💄 [ui] tokens: 739 Tailwind default colours (emerald, amber, sky…) in 53 files | Theming | `/login`, `/auth/action`, `/leaderboard` +9 | — |
| F69 | 💄 [ui] admin: night sheet locked out; dark classes are dead code | Theming | `/admin/**` | — |
| F70 | 💄 [ui] design system: frosted glass (backdrop blur) on navbar and 10 more | Theming | `/securite`, `/profile/pass`, `/le-club/equipement` +6 | — |
| F71 | ♻️ [refactor] type: 168 literal 10–11px sizes off the type ramp | Implementation Integrity |  +1 | — |

### P3 (16)

| ID | Issue | Category | Where | GitHub |
|---|---|---|---|---|
| F72 | ♻️ [refactor] admin: unknown tokens ambre-dark, paper-3, vert-light | Theming | `/admin/events`, `/admin/events/import` | — |
| F73 | 💄 [ui] admin pointage: fixed bar covers the sidebar, halo shadow | Implementation Integrity | `/admin/pointage-express` | — |
| F74 | 💄 [ui] profile: the member's own card drawn three different ways | Implementation Integrity | `/profile`, `/profile/pass`, `/sondage` | — |
| F75 | 💄 [ui] import/garmin, trace edit: emoji controls, « 10MB », red tab | Copy | `/import/garmin`, `/traces/trace_01/edit` | — |
| F76 | 💄 [ui] sondage: groups and question headings disagree within the poll | Implementation Integrity | `/sondage` | — |
| F77 | 💄 [ui] leaderboard: bold names in the table mean nothing visible | UX | `/leaderboard` | — |
| F78 | 💄 [ui] leaderboard: season switcher offers empty 2027, wraps on phones | Responsive | `/leaderboard` | — |
| F79 | 💄 [ui] home, calendrier: key facts cut by ellipsis | Responsive | `/`, `/calendrier` | — |
| F80 | 💄 [ui] footer: scale plate hides towns, theme toggle colours swapped | Implementation Integrity | `/`, `/le-club`, `/le-club/equipement` +9 | — |
| F81 | 💄 [ui] blog post: title, photo, text and share box on 3 left edges | UX | `/blog/recit-la-boucle-de-lorne-sous-le-soleil` | — |
| F82 | 💄 [ui] securite: page built from identical card grids, labels doubled | UX | `/securite` | — |
| F83 | 💄 [ui] a11y: invalid legend markup, unlabelled chart, heading jumps | Accessibility | `/`, `/admin/statistics`, `/sondage` +3 | — |
| F84 | ♻️ [refactor] tokens: hard-coded hex/rgba colours (Strava, WhatsApp, charts) | Theming | `/import/strava`, `/members`, `/calendrier` +4 | — |
| F85 | ♻️ [refactor] layout: internal design brief shipped in every page's HTML | Implementation Integrity |  +1 | — |
| F86 | ♻️ [refactor] design system: remove dead Poppins config and unused PageHero | Implementation Integrity |  +1 | — |
| F87 | 💄 [ui] home: eyebrow and repeated date above « Qui roule ce week-end ? » | Implementation Integrity | `/` | — |

## Patterns & Systemic Issues

- **Hand-built screens instead of the kit.** `Button`, `Badge` and `SheetHeader` exist, yet buttons are hand-rolled in 5 styles on public pages and 6+ in the back-office, filters are drawn six ways, form fields differ on every form (no shared Input). Most visible inconsistencies trace back to this.
- **Stock palette and type outside the tokens.** 739 Tailwind default colour classes (emerald, amber, red, gray, sky, indigo…), 25 raw hex values, 168 literal 10–11 px sizes, monospace on 320+ elements.
- **Facts hard-coded in copy.** Meeting times, group names and paces are typed into pages instead of read from `weekendSchedule` and the group settings, so they contradict the live data by season.
- **French formatting.** Dot decimals, ISO dates, English enum values (« Member », « Road », « Done ») and Title Case labels appear across public, member and admin pages.
- **Dark mode pairing.** Public pages mostly pair well; red labels on recessed cells and a few sections have no night pair, and the back-office is locked to the day sheet.

## Positive Findings

- The public sheet is distinctive and coherent: real territory map, cartouche with legend, map inks with meaning, Archivo width hierarchy, tabular metrics on the home and calendar.
- Global focus ring, skip link, `prefers-reduced-motion` respected (map develop, wind field, counters).
- Night sheet on public pages is well paired: map layers reprint in night inks, text contrast holds on most surfaces.
- No console errors that break a view; no broken layout on the home page at any width.
- `design-system/` package with tokens, role pairs and component cards, now mirrored in DESIGN.md and the Impeccable sidecar.

## Recommended Actions

1. **[P1] `/impeccable harden`**: schedule and group facts from settings (F04, F61), /profile direct load (F06), campaign product names (F01), cartouche long titles (F05).
2. **[P1] `/impeccable audit`** then fix: contrast pairs and accessible names (F07, F08), re-run axe until 0 serious.
3. **[P1] `/impeccable adapt`**: leaderboard drawer, admin members table, admin events rows, admin logs and role matrix on phones.
4. **[P2] `/impeccable distill`**: back-office on one header, one button set, one filter and one field component; remove hero-metric tiles.
5. **[P2] `/impeccable colorize`**: replace stock Tailwind colours and hex values with spot-ink tokens; drop monospace.
6. **[P2] `/impeccable clarify`**: French copy, number and date formats, empty and error states.
7. **[P2] `/impeccable typeset`**: micro type steps on the ramp, section headline styles unified.
8. **[P3] `/impeccable polish`**: remaining P3s, then re-run `/impeccable audit`.

Re-run `/impeccable audit` after the fixes to see the score improve.
