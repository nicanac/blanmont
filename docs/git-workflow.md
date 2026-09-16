# Git Workflow & Release Guide

Operational guide for branching, commits, pull requests, and automated documentation flows for the **CC Saint-Martin Blanmont** codebase.

---

## 1. Branching Strategy

All branches are cut from `master` and follow a strict naming convention:

```bash
<username>/<type>/<kebab-case-name>
```

### Branch Helper Script
Use the built-in helper script (or equivalent git command):

```bash
npm run branch <type> <name>
# or
bash scripts/git-branch.sh <type> <name>
```

### Valid Types
- `feature`, `feat`: New user-facing or platform features.
- `fix`, `bugfix`: Bug fixes and defect repairs.
- `docs`: Documentation, design specs, or guide changes.
- `refactor`: Code improvements that do not change functionality or fix bugs.
- `style`: Formatting, spacing, whitespace (no functional logic changes).
- `test`: Adding or correcting tests.
- `perf`: Performance optimizations.
- `ci`: CI configuration and deployment automation.
- `chore`: Tooling, dependencies, routine maintenance.

---

## 2. Commit Conventions

We strictly follow **Conventional Commits**:

```text
<type>(<scope>): <short imperative summary>

[optional body describing what and why]

[optional footer(s)]
```

### Examples
- `feat(sondages): auto-create weekend poll on Mondays with manual sync & editing (#99)`
- `fix(calendar): prevent mobile line break and fix truncation in shortcut pill (#97)`
- `docs(design): update DESIGN.md and design tokens`

### Rules
1. Atomic staging: Only stage files that belong to the commit.
2. English commits: Commit messages and code comments are always in English.
3. No secrets or tokens committed.

---

## 3. Pull Requests & Merging

All changes are integrated into `master` via GitHub Pull Requests using GitHub CLI (`gh`):

### 1. Push branch
```bash
git push -u origin <branch-name>
```

### 2. Create Pull Request
```bash
gh pr create --base master --title "<type>(<scope>): <summary>" --body "## Summary\n\n- Details..."
```

### 3. Squash Merge & Cleanup
Once reviewed / verified, merge via squash and delete the remote branch:
```bash
gh pr merge <pr-number-or-url> --squash --delete-branch
```

### 4. Sync Local Master
Always return to `master` and pull the latest changes:
```bash
git checkout master && git pull origin master
```

---

## 4. Documentation Git Automation

Whenever documenting or updating the design system (`/impeccable document` or updates to `DESIGN.md` / `.impeccable/design.json`), agents and contributors must execute the full automated flow without stopping:

1. **Branch**: Create branch `<username>/docs/<name>` (e.g. `nicnac/docs/update-design-system`).
2. **Commit**: Stage changes and commit using Conventional Commits (`docs(design): ...`).
3. **Push**: `git push -u origin <branch>`.
4. **PR**: Create Pull Request with `gh pr create`.
5. **Merge**: Merge via `gh pr merge --squash --delete-branch`.
6. **Sync**: Return to `master` and pull latest (`git checkout master && git pull origin master`).
