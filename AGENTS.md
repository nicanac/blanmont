# AGENTS.md

Full-stack cycling club platform (`Club de Blanmont` / `CC Saint-Martin Blanmont`).
Tech stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Firebase Realtime Database. Package manager: `npm`.

## Global Architecture

- `app/`: Next.js App Router (pages, client/server components, server actions)
- `docs/`: Modular technical specifications and operational guides
- `scripts/`: Operational utilities (DB backups, seed scripts)
- `tests/`: Unit (Vitest) and end-to-end (Playwright) test suites
- `public/`: Static assets and media

## Detailed Conventions & Guides

- Architecture & Business Logic: [docs/architecture.md](docs/architecture.md)
- Database Schemas & Access: [docs/database.md](docs/database.md)
- Design Tokens & Typography: [DESIGN.md](DESIGN.md)
- Input Validation (Zod): [docs/validation.md](docs/validation.md)
- Admin Security & Roles: [docs/admin-guide.md](docs/admin-guide.md)
- Product Vision & Personas: [PRODUCT.md](PRODUCT.md)
- Git & Documentation Workflow: [docs/git-workflow.md](docs/git-workflow.md)

## Core Non-Negotiables

- **UI Language**: French (Français) for all user-facing text and copy. English for code, commits, and comments.
- **Visual Identity & Design System**: Strictly preserve the **"La Feuille de Blanmont — Carte IGN"** visual system specified in `DESIGN.md` and `.impeccable/design.json`. Every page, view, and component must adhere to the topographic sheet specifications:
  - **Grounds**: Day Map Paper (`bg-paper` / `#fbfbf8`), recessed paper (`bg-paper-2` / `#f0f1eb`), and nocturnal dark sheet (`bg-night` / `#0d1013`, `bg-night-2` / `#151a1f`).
  - **Spot Inks**: Route Red (`brand` / `#d63535`, map roads `brand-vif` / `#e03e3e`), Relief Bistre (`bistre` / `#b0703b`), Hydro Blue (`hydro` / `#1f6fbf`), Woodland Green (`vert` / `#2e7d45`, `bois` / `#dcebcf`), and Amber (`ambre` / `#e8962a`). Never use arbitrary saturated colors or generic SaaS blues.
  - **Typography**: Google variable font `Archivo` (`var(--font-archivo)`) with width-driven hierarchy (`font-wide` display, `font-semiwide` headlines, `font-narrow` labels/badges). Never use Poppins, Inter, or arbitrary fonts.
  - **Cartouches**: Page headers must use the `SheetHeader` component (`app/components/carte/SheetHeader.tsx`) with geodetic mark, coordinates (`50°37′23″ N · 4°38′32″ E`), and territory facts.
  - **Form Language & Precision**: Continuous 1px hairline neatlines (`border-line` / `border-night-line`), crisp 2px–6px sheet corners (`rounded-sm` to `rounded-2xl`), corner ticks (`corner-ticks`), and tabular figures (`tabular-nums`) for all cycling metrics (km, m D+, km/h, splits). Full pill radii (`rounded-full`) are strictly reserved for status chips and tags.
  - **Absolute Prohibitions**: No generic SaaS dashboards, no glassmorphism, no artificial drop-shadow blur halos, no gradient text, no uncalibrated inline styles.
- **Styling**: Tailwind CSS v4 only. Strictly follow semantic tokens in `DESIGN.md` and `app/globals.css`. No CSS modules, no inline styles.
- **Database**: Firebase RTDB is the single source of truth (Admin SDK on server, Client SDK on client).
- **Test Verification & Completion**: Whenever editing, modifying, or creating code, always run related tests, complete any missing test coverage for changed or new code, and ensure all tests pass (`npm test`) before considering the task complete.
- **Reactive Updates**: Only add new rules here reactively when an error recurs, never preemptively.
- **Documentation Git Automation**: Whenever documenting design system changes (`/impeccable document` or updates to `DESIGN.md` / `.impeccable/design.json`), automatically execute the full Git flow defined in [docs/git-workflow.md](docs/git-workflow.md):
  1. Branch: create a branch following conventions (`bash scripts/git-branch.sh docs <name>` or `<user>/docs/<name>`).
  2. Commit: commit using Conventional Commits (`docs(design): ...`).
  3. Push: push the branch to remote (`git push -u origin <branch>`).
  4. PR: create a Pull Request via GitHub CLI (`gh pr create`).
  5. Merge: merge the PR (`gh pr merge --squash --delete-branch`).
  6. Sync: return to `master` and sync (`git checkout master && git pull origin master`).

## Codebase Navigation (Graft)

Use the pre-computed repo graph in `graft/` instead of scanning entire source files:
- `graft ask "<question>" --source`: Semantic retrieval with inlined code crux.
- `graft grep "<symbol>"`: Exhaustive symbol/caller find.
- `graft skeleton <file>`: Function/type signatures overview (~10x cheaper than reading file).
- `graft callers <symbol>`: Dependency and blast-radius tracing.
- Run `graft build` to refresh the index after major refactors.

<!-- super-board:begin v3.0.4 (managed; edits inside are overwritten on upgrade) -->
## Super Board

Board: Backlog · Ready · Building · QA · Review · Blocked · Done. Labels route: `qa` skips Building · `bug`, `feature`, none → built first.

| When | Use | NEVER |
|---|---|---|
| Set up / repair the board | `/super-board onboard` | DON'T hand-edit config mid-run |
| Check tickets before a run | `/super-board lint` | NEVER run with AC-less tickets |
| Drain the board | `/super-board run` | NEVER build, test or merge from the orchestrator |
| Board state / halt | `/super-board status` · `/super-board stop` | |
| Build one ticket | `/super-build` | NEVER build outside the card's worktree |
| QA a branch, or a live URL alone | `/super-qa` · `/super-qa <url>` | NEVER mark QA pass without evidence |
| Review a PR, merge | `/super-review` | NEVER `gh pr merge` direct — merge gate only |
| File bugs from Sentry, PostHog, PRs | `/super-collect` | DON'T file without a verifier pass |
| UI polish | `/ui-refine-loop` (human runs it) | board NEVER runs it |
| Diagram / explainer page | `/visual` | |
| Commit, pull, push this branch | `/git-sync` | NEVER force push or rebase shared history |

| Rule | Value |
|---|---|
| Config | `.claude/super-board/configs/<slug>.json` |
| Isolation | 1 card · 1 worktree · 1 branch |
| Merge | auto for normal changes · money, auth, destructive schema (DROP/TRUNCATE/RENAME) → human · PR > 400 changed lines → human |
| Migrations | additive → robot migrates allowed DBs only · live DB ALWAYS → 🙋 needs you |
| Blocked card | block-template comment · last line `blocked-by:` · 🙋 = needs you |
| Secrets | NEVER read `.env`; key names via `.claude/bin/super-board-env-check.sh` |

## Writing (super-board)

| Thing | Format → `.claude/skills/super-board/references/writing-standard.md` |
|---|---|
| Commit, PR title | `<emoji> [type] scope: subject` + short bullets · ✨ feat 🐛 fix 🔧 chore ♻️ refactor 🧪 test 📝 docs |
| PR body | blocks: status · Problem · Solution · AC + proof · history · Before\|After · Risk — `super-board-pr-body.sh` |
| Ticket | Problem · Context · Fix · AC · Risk · Blocked by → `docs/agents/issue-tracker.md` |
| Comment | `[role] [label] status` · Did · ✅ Done · ❌ Not done · Next · ≤ 8 lines |

- NEVER chain steps with arrows. One step per line, lettered under Where.
- NEVER link screenshots. Embed a raw URL pinned to a sha.
- DON'T list files in comments. DON'T write "Not verified" or "Next" in a PR body.
<!-- super-board:end -->
