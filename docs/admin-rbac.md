# Back-office access control (RBAC)

Status: v1 spec, 2026-11-26. Decisions (Nico): one switch per section, roles and the matrix are admin-only, suggested defaults, a change takes effect within a minute.

## Model

- **Admin** (`checkIsAdmin` / `isSessionAdmin`, unchanged) has every access, always. It is not in the matrix and cannot be restricted.
- Every other role of `CLUB_ROLES` (`app/constants/roles.ts`) gets, per **admin section**, access or no access. Access = see the pages **and** run the actions/APIs of that section. A member with several roles gets the union.
- **Admin-only, never in the matrix:** the `/admin/acces` page and its action, and **assigning roles to members** (role selector in Membres and any action/API that changes `role`), so a delegated role can never grant itself Admin.
- `/admin` (dashboard) is open to anyone with at least one section. Admins get the full dashboard; other roles get links to their sections only (`DelegatedDashboard`), so no club-wide data (members, prospects) is loaded for them.

## Sections

`app/constants/admin-sections.ts` is the single registry: `{ id, label (FR), group (sidebar group), pages: path prefixes under /admin, apis: path prefixes under /api/admin }`. Ids are the admin folder names (statistics, retours, sondages, events, pointage-express, carre-vert, groupes, members, prospects, sorties-essai, blog, galerie, hero, equipements, commandes, settings, parametres, logs, traces…; `commandes` covers campagnes and banque). Every page folder under `app/admin` and every route under `app/api/admin` must map to exactly one section or to admin-only; a test walks the filesystem and fails on an unmapped path. Unknown paths are **denied** (fail closed).

The club payment account card moves from `/admin/settings` to `/admin/commandes/banque` (section `commandes`), so the Trésorier does not need Paramètres.

## Storage

RTDB `/settings/admin-access`: `{ roles: { [roleKey]: { [sectionId]: true } }, updatedAt, updatedBy }`. When the node is absent the code uses `DEFAULT_ADMIN_ACCESS`:

| Role | Sections |
| --- | --- |
| Trésorier | commandes, equipements |
| Capitaine de Route | sondages, events, pointage-express, carre-vert |
| Secrétaire | members, prospects, blog, galerie |
| Président | every section |
| Member | none |

## Enforcement (server is the guard, UI hiding is cosmetic)

- `app/lib/auth/admin-access.ts`: `getAdminAccessMatrix()` (Admin SDK, in-memory cache 60 s, cleared on save), `allowedAdminSections(session)`, `canAccessSection(session, id)`, `sectionForPath(pathname)`, `requireSectionAccess(id)` for server actions (same French errors as `requireAdminSession`), `verifySectionRequest(request, id)` for API routes. If the matrix cannot be read: admins only (fail closed).
- `middleware.ts`: no session → login / 401 (unchanged); admin → pass; otherwise resolve the section from the path and check the matrix (60 s cache); denied page → redirect to `/admin?acces=refuse` (or `/` when the user has no section at all); denied API → 403. Check in `node_modules/next/dist/docs` how this Next version lets middleware/proxy read the database (Node runtime) and keep the cache per instance.
- Every `requireAdminSession()` / `verifyAdminRequest()` in admin actions and `/api/admin` routes becomes the section guard of its folder, except the admin-only operations above, which keep the admin guard.

## UI

- `/admin/acces` (admin-only, sidebar group "Configuration"): matrix rows = sections grouped like the sidebar, columns = non-admin roles, plus a locked "Admin — accès total" column; checkboxes; « Enregistrer »; « Rétablir les valeurs suggérées »; last change date and author.
- Sidebar, command palette, dashboard and `AdminGuard` only show what the user may open (from a `getMyAdminAccessAction()` returning `{ isAdmin, sections }`).
- French copy, Carte IGN design system.


## Owner (added 2026-11-26)

- **Paramètres** (`/admin/settings`, `/admin/parametres` and their actions/APIs) is **owner-only**: not in the matrix, not open to other admins.
- Owner = a session whose **authenticated login email** (Firebase Auth, verified) is in the server env var `OWNER_EMAILS` (comma-separated, case-insensitive). Never compare against the editable member-record email: an admin can edit member emails. If the session does not carry the authenticated email today, add it at login (signed cookie), from the verified ID token.
- `OWNER_EMAILS` unset → nobody is owner (fail closed): Paramètres shows « Réservé au propriétaire du site ».
- The email is never written in the repo (public); it lives in Vercel env and `.env.local`.
- The owner is also an admin (everything else stays as above). `/admin/acces` stays admin-only.
