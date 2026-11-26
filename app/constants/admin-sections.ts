import { CLUB_ROLES } from './roles';

/**
 * Back-office sections (RBAC registry, spec: docs/admin-rbac.md). Client-safe: no server imports.
 * `pages` are path prefixes under /admin, `apis` path prefixes under /api/admin; every page folder
 * and API route must map to exactly one section, to ADMIN_ONLY_PATHS or to OWNER_ONLY_PATHS
 * (tests/lib/admin-sections.test.ts walks the filesystem). Unknown paths are denied.
 */
export const ADMIN_SECTIONS = [
  { id: 'statistics', label: 'Statistiques', group: "Vue d'ensemble", pages: ['/admin/statistics'], apis: [] },
  { id: 'retours', label: 'Retours visuels', group: "Vue d'ensemble", pages: ['/admin/retours'], apis: [] },
  { id: 'sondages', label: 'Sondages Weekend', group: 'Rituels & Sorties', pages: ['/admin/sondages'], apis: [] },
  { id: 'events', label: 'Événements & Sorties', group: 'Rituels & Sorties', pages: ['/admin/events'], apis: ['/api/admin/events'] },
  {
    id: 'traces',
    label: 'Traces & Parcours GPS',
    group: 'Rituels & Sorties',
    pages: ['/admin/traces', '/admin/add-trace'],
    apis: ['/api/admin/add-trace', '/api/admin/parse-gpx', '/api/admin/fetch-metadata'],
  },
  {
    id: 'pointage-express',
    label: 'Pointage Express',
    group: 'Rituels & Sorties',
    pages: ['/admin/pointage-express'],
    // Also called by the Carré Vert attendance panel: a role needs this section to edit attendance there.
    apis: ['/api/admin/attendance'],
  },
  { id: 'carre-vert', label: 'Pointage Carré Vert', group: 'Rituels & Sorties', pages: ['/admin/carre-vert'], apis: ['/api/admin/import-csv'] },
  { id: 'blog', label: 'Articles & Blog', group: 'Contenu & Médias', pages: ['/admin/blog'], apis: ['/api/admin/blog'] },
  { id: 'galerie', label: 'Galeries Photos', group: 'Contenu & Médias', pages: ['/admin/galerie'], apis: ['/api/admin/galerie'] },
  { id: 'hero', label: 'Bannière Accueil', group: 'Contenu & Médias', pages: ['/admin/hero'], apis: ['/api/admin/hero'] },
  // Includes Portraits & Cadrage (/admin/members/photos).
  { id: 'members', label: 'Membres du Club', group: 'Gestion du Club', pages: ['/admin/members'], apis: ['/api/admin/members'] },
  // /admin/sorties-essai only redirects to /admin/prospects.
  { id: 'prospects', label: 'Candidatures & Essais', group: 'Gestion du Club', pages: ['/admin/prospects', '/admin/sorties-essai'], apis: [] },
  { id: 'groupes', label: 'Groupes & Pelotons', group: 'Gestion du Club', pages: ['/admin/groupes'], apis: ['/api/admin/group-settings'] },
  { id: 'equipements', label: 'Équipements Club', group: 'Gestion du Club', pages: ['/admin/equipements'], apis: ['/api/admin/equipements'] },
  // Orders, group campaigns and the bank (CODA import + club payment account).
  { id: 'commandes', label: 'Commandes Équipement', group: 'Gestion du Club', pages: ['/admin/commandes'], apis: [] },
  // Its data API is /api/logs (outside /api/admin), guarded in the handler.
  { id: 'logs', label: "Journal d'Activité", group: 'Gestion du Club', pages: ['/admin/logs'], apis: [] },
] as const satisfies readonly { id: string; label: string; group: string; pages: readonly string[]; apis: readonly string[] }[];

export type AdminSection = (typeof ADMIN_SECTIONS)[number];
export type AdminSectionId = AdminSection['id'];

export const ADMIN_SECTION_IDS: AdminSectionId[] = ADMIN_SECTIONS.map((s) => s.id);

/** Admin-only, never in the matrix: the access matrix itself. */
export const ADMIN_ONLY_PATHS = { pages: ['/admin/acces'], apis: [] as string[] };

/** Owner-only (OWNER_EMAILS), not open to other admins: Paramètres and its API. */
export const OWNER_ONLY_PATHS = {
  pages: ['/admin/settings', '/admin/parametres'],
  apis: ['/api/admin/feedback-settings', '/api/admin/feedback-token'],
};

export const ADMIN_ONLY = 'admin-only';
export const OWNER_ONLY = 'owner-only';
/** /admin itself: open to anyone with at least one section. */
export const DASHBOARD = 'dashboard';

export type PathAccess = AdminSectionId | typeof ADMIN_ONLY | typeof OWNER_ONLY | typeof DASHBOARD;

const PREFIXES: [string, PathAccess][] = [
  ...ADMIN_SECTIONS.flatMap((s) => [...s.pages, ...s.apis].map((p): [string, PathAccess] => [p, s.id])),
  ...[...ADMIN_ONLY_PATHS.pages, ...ADMIN_ONLY_PATHS.apis].map((p): [string, PathAccess] => [p, ADMIN_ONLY]),
  ...[...OWNER_ONLY_PATHS.pages, ...OWNER_ONLY_PATHS.apis].map((p): [string, PathAccess] => [p, OWNER_ONLY]),
];

/** What guards a back-office path; null for an unknown path, which callers must deny. */
export function sectionForPath(pathname: string): PathAccess | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path === '/admin') return DASHBOARD;
  const match = PREFIXES.find(([prefix]) => path === prefix || path.startsWith(prefix + '/'));
  return match ? match[1] : null;
}

/** What the current user may open, as returned by getMyAdminAccessAction (app/admin/acces/actions.ts). */
export interface MyAdminAccess {
  isAdmin: boolean;
  isOwner: boolean;
  sections: readonly string[];
}

/**
 * Whether the back-office UI (sidebar, palette, dashboard) should offer a link. Cosmetic only:
 * proxy.ts and the action/API guards decide. Same rules as the proxy, owner-only pages included.
 */
export function canOpenAdminPath(access: MyAdminAccess, href: string): boolean {
  const target = sectionForPath(href);
  if (target === OWNER_ONLY) return access.isOwner;
  if (access.isAdmin) return true;
  if (target === DASHBOARD) return access.sections.length > 0;
  return target !== null && target !== ADMIN_ONLY && access.sections.includes(target);
}

/** Roles that appear in the matrix: every club role without built-in admin rights (Admin, Président). */
export const MATRIX_ROLES = CLUB_ROLES.filter((r) => !r.isAdmin).map(({ key, label }) => ({ key, label }));

/** Suggested matrix, used while /settings/admin-access is absent (Président is an admin role: implicit all). */
export const DEFAULT_ADMIN_ACCESS: Record<string, AdminSectionId[]> = {
  'Capitaine de Route': ['sondages', 'events', 'pointage-express', 'carre-vert'],
  Trésorier: ['commandes', 'equipements'],
  Secrétaire: ['members', 'prospects', 'blog', 'galerie'],
  Member: [],
};
