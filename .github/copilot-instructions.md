# GitHub Copilot Instructions

## Must-read hierarchy

1. `.agent/rules/GEMINI.md` for the modular skill protocol, request classifier, Socratic gate, and available verification scripts—read this before you plan or code.
2. `.agent/rules/architecture.md` for role/persona, structural grounding, guardrails, and coding standards plus `.agent/rules/MEMORY.md` for the memory-bank index. Keep these open as you work so you know the source of truth, task status updates, and handoff expectations.
3. `.agent/rules/git.md` for branch/commit naming conventions every time you touch Git.

## Request handling & planning

- Label every user request using GEMINI’s classifier (question, survey/intel, simple code, complex code, design/UI) before editing files.
- For non-trivial edits, run through the Socratic gate: ask about scope, edge cases, or trade-offs, obeying the analysis → planning → solutioning → implementation phases when `{task-slug}.md` is required.
- Multi-file or architecture-impacting work must pause for planning and include the relevant `.agent` plan/task artifacts.

## Clean code & verification

- Abide by `@[skills/clean-code]`: concise, no over-commenting, logic documented where needed, and commit-level documentation updates (JSDoc, AI_CONTEXT, this file when rules change).
- Trigger the listed scripts when applicable (`lint_runner.py`, `test_runner.py`, `security_scan.py`, etc.) and report any failures; use the “5-phase deployment” mindset (prepare, backup, deploy, verify, confirm/rollback) for changes affecting deploys.
- Reference `/memory-bank` docs (PRD/TSD/TASKS) before implementing features and mark tasks done after completion.

## Git & documentation rules

- Branch format: `<username>/<type>/<short-description>` (type from feature/fix/chore/refactor/docs/hotfix).
- Commits must be `type(scope): subject` (imperative, no trailing period, max 72 characters); use `/commit-fast-conventional` tooling when available.
- Always keep `AI_CONTEXT.md` and relevant docs synced with logic or architectural updates.

## Operational safety

- Always verify environment variables, secrets, and deploy surface impact before proposing infrastructure changes.
- If standards evolve, update this file immediately so future agents inherit the same guardrails.
