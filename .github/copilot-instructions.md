# GitHub Copilot Instructions

## 1. Type Safety & TypeScript
- **Strict Interfaces**: Every component prop, API response, and data model **MUST** have a defined interface.
- **No `any`**: Explicitly forbid the use of `any`. Use `unknown` or specific generics if dynamic typing is truly needed.
- **Centralized Types**: Import shared interfaces (e.g., `Trace`, `Member`, `SaturdayRide`) from `@/app/types`. Do not redefine them inline.

## 2. Documentation Standards
- **JSDoc Required**: All exported functions, hooks, and components must have JSDoc comments explaining:
  - Purpose of the function.
  - `@param` descriptions.
  - `@returns` description.
- **Complex Logic**: Add inline comments explaining *why* complex logic exists (e.g., specific Notion API workarounds).

## 3. Next.js & React Best Practices
- **Server vs. Client**: default to **Server Components**. Add `'use client'` only when hook usage (state, effects) or event listeners are required.
- **Server Actions**: Use Server Actions (`'use server'`) for form submissions and mutations. Do not use API routes (`pages/api`) unless creating a public webhook.
- **Optimistic UI**: When implementing mutative actions (like Voting), implement `useOptimistic` or local state overrides to provide instant feedback.

## 4. Notion API Integration Rules
- **Access Pattern**: **NEVER** import `@notionhq/client` directly in UI components. ALL database interactions must live in `@/app/lib/notion.ts`.
- **Property Access**: Always safely access Notion properties (e.g., `page.properties.Name?.title?.[0]?.plain_text`). Use the existing helpers to map raw responses to domain objects.
- **Mock Mode**: Always consider `process.env.NOTION_TOKEN` might be missing. Ensure standard functions gracefully fallback or return mock data if `isMockMode` is true.
- **Status Properties**: Remember that Notion "Status" fields are objects: `{ status: { name: 'Value' } }`. They are distinct from "Select" fields.

## 5. Styling
- **CSS Modules**: Use `*.module.css` for component-level styling.
- **Variables**: Reuse global variables from `globals.css` (e.g., `--foreground`, `--accent`) to maintain design consistency.
- **Responsiveness**: Mobile-first media queries are preferred.

## 6. Testing & Debugging
- **Debug Scripts**: If you create a standalone debug script, place it in the `/debug-scripts/` folder with the prefix `debug-`. Do not put it in `app/`.

## 7. Version Control
- **Branch Naming**: When suggesting git commands or branch creations, ALWAYS follow the pattern `user_name/type/feature_explanation_name`.
  - Example: `nicolas_bruyere/feature/trace-filtering`
  - Valid types: `feature`, `fix`, `chore`, `refactor`, `docs`.
- **Commit Messages**: When generating commit messages, use the Semantic Commit pattern: `type(scope): subject`.
  - Example: `feature(trace): add filter by distance`
  - Keep the subject short and imperative (e.g., "add" not "added").

## 8. Continuous Documentation
- **Update Rule**: Whenever you modify code (new features, refactors, bug fixes), you **MUST** simultaneously update:
  1.  Relevant **JSDoc** comments.
  2.  `AI_CONTEXT.md` (if architectural or business logic changes).
  3.  This file (`.github/copilot-instructions.md`) if coding standards evolve.
