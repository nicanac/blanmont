# Project audit — 2026-11-04

Brain project: "Blanmont – Sidereal Satellite (CC Blanmont club app)" (cortex/projects, in progress).
Audited commit: `076cc14` (origin/master).

## Health checks

| Check | Result |
| --- | --- |
| `tsc --noEmit` | 0 errors |
| `vitest run` | 120 files, 840 tests, all passing |
| `eslint .` | 213 errors, 325 warnings |
| `npm audit --omit=dev` | 32 vulns: 5 critical, 10 high, 16 moderate, 1 low |
| CI | None. `.github/workflows/` only holds agent prompt `.md` files |
| Production build | Not re-run in this audit (last recorded: 104 routes, see `memory/TASKS.md`) |

Lint errors by rule: `no-explicit-any` 104, `no-unused-vars` 85, `set-state-in-effect` 7, `no-unescaped-entities` 5, others 12.
Direct dependencies flagged: `next` (critical), `zod`, `form-data`, `@xmldom/xmldom`; transitive via `togpx` (`xmldom`), `protobufjs`, `fast-xml-parser`.

## Done (from repo history and `memory/TASKS.md`)

- "Carte IGN" redesign and `SheetHeader` across all pages
- Weekend poll (QCM) with admin suite and WhatsApp export
- MUI/Emotion removed, Tailwind v4 only, toasts via sonner
- Calendar `.ics` feed, Open-Meteo weather, 2-step PDF import
- HMAC session cookies, `middleware.ts`, admin API authorization, blog XSS fix
- Carré Vert leaderboard, equipment gestion, Chart.js stats
- Sentry, privacy gating of Carré Vert and photo albums to logged-in members
- Graft context graph, super-board tooling

## To do

1. **P1** Upgrade `next` and run `npm audit fix`; re-run tsc, vitest and build.
2. **P1** Add a CI workflow (lint, tsc, vitest, build) and protect `master`.
3. **P2** Fix the 213 lint errors, then gate CI on lint.
4. **P2** Triage 17 open PRs (mostly stale "Palette" a11y PRs, plus #142, #80, #81) and issue #155 (mobile collisions on home).
5. **P2** Persist shop orders (checkout is `mailto:` only) and add an admin view for `/rejoindre` leads (both rated Weak in `ROADMAP.md`).
6. **P3** Repo hygiene: remove tracked `build*.log/txt`, `lint_output.txt`, `temp_komoot.html`, `appglobals.css`, empty `tools.yaml`, `scraper.py`, `scraped_albums.json`, leaderboard CSVs.
7. **P3** Fix stale docs: README still says Notion CMS and Poppins; `package.json` name is `sidereal-satellite`; `ROADMAP.md` cites 514 tests (actual 840); `memory/TASKS.md` still lists PDF import as in progress.
8. **P3** Review `storage.rules` (public read on `members/` photos) and reduce 96 `any` usages in `app/`.
9. **Backlog** `ROADMAP.md` features: offline PWA, safety pass, hazard reporting, Strava challenges, multi-season archive.

## Notes

- Local `master` was 166 commits behind `origin/master`; fast-forwarded before auditing.
- 74 remote branches exist; many look merged or abandoned and could be pruned.

## Resolution (same day)

| Item | Outcome |
| --- | --- |
| Dependency vulnerabilities | Fixed in #174: 0 critical/high remain (13 moderate). Also fixed an Edge middleware deploy failure caused by the Next 16.4 bundler |
| CI | Added in #175; lint (errors only), type check, tests, build and audit all block |
| Lint | 213 errors fixed in #176 (warnings remain) |
| Stale PRs / issue #155 | 18 stale PRs closed; #155 fixed in #177 |
| Repo hygiene, docs, storage rules | #178 (storage rules still need `firebase deploy --only storage`) |
| Still open | Persist shop orders, admin view for trial-ride leads, ROADMAP features, `cyclo-blanmont.be` DNS (points at Neodomaine, not Vercel), branch protection |
