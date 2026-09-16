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
- **Styling**: Tailwind CSS v4 only. Strictly follow typographic roles in `DESIGN.md`. No CSS modules, no inline styles.
- **Database**: Firebase RTDB is the single source of truth (Admin SDK on server, Client SDK on client).
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

