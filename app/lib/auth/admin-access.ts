import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { CLUB_ROLES, checkIsAdmin, normalizeRoles } from '@/app/constants/roles';
import {
  ADMIN_SECTION_IDS,
  DEFAULT_ADMIN_ACCESS,
  MATRIX_ROLES,
  sectionForPath,
  type AdminSectionId,
} from '@/app/constants/admin-sections';
import {
  getSessionUser,
  getSessionUserFromRequest,
  isSessionAdmin,
  verifyAdminRequest,
  type SessionUser,
} from './session';

/** Back-office RBAC (spec: docs/admin-rbac.md). The server is the guard; hiding UI is cosmetic. */

export { sectionForPath };

const MATRIX_NODE = 'settings/admin-access';
const CACHE_TTL_MS = 60_000;
const READ_TIMEOUT_MS = 5_000;

export interface AdminAccessMatrix {
  /** Section ids per matrix role key (MATRIX_ROLES). A missing role has no section. */
  roles: Record<string, AdminSectionId[]>;
  updatedAt: string | null;
  updatedBy: { id: string; name: string } | null;
}

// shortcut: per-instance memory cache. proxy.ts and the server actions can run in separate instances,
// so a save clears only its own instance; the others follow within CACHE_TTL_MS (spec: within a minute).
let cache: { matrix: AdminAccessMatrix; expiresAt: number } | null = null;

export function clearAdminAccessCache(): void {
  cache = null;
}

/** Keeps known roles and the sections stored as `true`; anything else in the node is ignored. */
function fromStored(raw: unknown): AdminAccessMatrix {
  const node = (raw ?? {}) as {
    roles?: Record<string, Record<string, unknown> | undefined>;
    updatedAt?: unknown;
    updatedBy?: { id?: unknown; name?: unknown } | null;
  };
  const by = node.updatedBy;
  return {
    roles: Object.fromEntries(
      MATRIX_ROLES.map(({ key }) => [key, ADMIN_SECTION_IDS.filter((id) => node.roles?.[key]?.[id] === true)])
    ),
    updatedAt: typeof node.updatedAt === 'string' ? node.updatedAt : null,
    updatedBy:
      by && typeof by.id === 'string' && typeof by.name === 'string' ? { id: by.id, name: by.name } : null,
  };
}

function defaultMatrix(): AdminAccessMatrix {
  return {
    roles: Object.fromEntries(
      MATRIX_ROLES.map(({ key }) => [key, ADMIN_SECTION_IDS.filter((id) => DEFAULT_ADMIN_ACCESS[key]?.includes(id))])
    ),
    updatedAt: null,
    updatedBy: null,
  };
}

/** The matrix from RTDB /settings/admin-access (defaults while absent). Throws when it cannot be read. */
export async function getAdminAccessMatrix(): Promise<AdminAccessMatrix> {
  if (cache && cache.expiresAt > Date.now()) return cache.matrix;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const snapshot = await Promise.race([
      getAdminDatabase().ref(MATRIX_NODE).once('value'),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('admin-access read timed out')), READ_TIMEOUT_MS);
      }),
    ]);
    const matrix = snapshot.exists() ? fromStored(snapshot.val()) : defaultMatrix();
    cache = { matrix, expiresAt: Date.now() + CACHE_TTL_MS };
    return matrix;
  } finally {
    clearTimeout(timer);
  }
}

/** Exact match on the role key, label or a synonym: no substring match ("Trésorier adjoint" is not "Trésorier"). */
export function hasMatrixRole(roles: string[] | string | null | undefined, roleKey: string): boolean {
  const def = CLUB_ROLES.find((r) => r.key === roleKey);
  if (!def) return false;
  const names = [def.key, def.label, ...def.synonyms].map((n) => n.toLowerCase());
  return normalizeRoles(roles).some((r) => names.includes(r.toLowerCase()));
}

/** Sections the session may open: admin → all; otherwise the union over its roles; none if the matrix is unreadable. */
export async function allowedAdminSections(session: SessionUser | null): Promise<AdminSectionId[]> {
  if (!session) return [];
  if (isSessionAdmin(session)) return [...ADMIN_SECTION_IDS];
  const roleKeys = MATRIX_ROLES.map((r) => r.key).filter((key) => hasMatrixRole(session.role, key));
  if (roleKeys.length === 0) return []; // no matrix role: no database read
  try {
    const { roles } = await getAdminAccessMatrix();
    const granted = new Set(roleKeys.flatMap((key) => roles[key] ?? []));
    return ADMIN_SECTION_IDS.filter((id) => granted.has(id));
  } catch (error) {
    console.error('[admin-access] Access matrix unreadable, admins only:', error);
    return [];
  }
}

export async function canAccessSection(session: SessionUser | null, id: AdminSectionId): Promise<boolean> {
  return (await allowedAdminSections(session)).includes(id);
}

/** Section guard for Server Actions. Throws the same French errors as requireAdminSession. */
export async function requireSectionAccess(id: AdminSectionId): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Non authentifié. Veuillez vous connecter.');
  }
  if (!(await canAccessSection(session, id))) {
    throw new Error('Accès refusé. Droits administrateur requis.');
  }
  return session;
}

/** Section guard for API route handlers: same shape and 401/403 answers as verifyAdminRequest. */
export async function verifySectionRequest(
  request: NextRequest,
  id: AdminSectionId
): Promise<{ authorized: true; user: SessionUser } | { authorized: false; response: NextResponse }> {
  const session = await getSessionUserFromRequest(request);
  if (session && (await canAccessSection(session, id))) {
    return { authorized: true, user: session };
  }
  // Denied (an admin always passes above): verifyAdminRequest answers 401/403 and records the security alert.
  return verifyAdminRequest(request);
}

const AdminAccessInputSchema = z.object({
  roles: z.partialRecord(
    z.enum(MATRIX_ROLES.map((r) => r.key) as [string, ...string[]]),
    z.array(z.enum(ADMIN_SECTION_IDS as [AdminSectionId, ...AdminSectionId[]])).max(ADMIN_SECTION_IDS.length)
  ),
});

/**
 * Validates and stores the matrix ({ roles: { [roleKey]: sectionId[] } }), with updatedAt/updatedBy.
 * Unknown role keys or section ids are rejected. Admin-only (checked again here).
 */
export async function saveAdminAccessMatrix(
  input: unknown,
  adminSession: SessionUser
): Promise<AdminAccessMatrix> {
  if (!isSessionAdmin(adminSession)) {
    throw new Error('Accès refusé. Droits administrateur requis.');
  }
  const parsed = AdminAccessInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Matrice d’accès invalide : rôle ou section inconnu.');
  }
  const roles = Object.fromEntries(
    MATRIX_ROLES.map(({ key }) => [key, ADMIN_SECTION_IDS.filter((id) => parsed.data.roles[key]?.includes(id))])
  );
  const matrix: AdminAccessMatrix = {
    roles,
    updatedAt: new Date().toISOString(),
    updatedBy: { id: adminSession.id, name: adminSession.name },
  };
  await getAdminDatabase()
    .ref(MATRIX_NODE)
    .set({
      roles: Object.fromEntries(
        Object.entries(roles).map(([key, ids]) => [key, Object.fromEntries(ids.map((id) => [id, true]))])
      ),
      updatedAt: matrix.updatedAt,
      updatedBy: matrix.updatedBy,
    });
  clearAdminAccessCache();
  return matrix;
}

interface MemberFields {
  role?: unknown;
  email?: unknown;
  authUid?: unknown;
  isAdmin?: unknown;
}

function grantsAdmin(member: MemberFields | null | undefined): boolean {
  if (!member) return false;
  return checkIsAdmin({
    role: normalizeRoles(member.role as string[] | string | null),
    email: typeof member.email === 'string' ? member.email : null,
    isAdmin: member.isAdmin === true,
  });
}

const roleSignature = (roles: unknown): string =>
  normalizeRoles(roles as string[] | string | null)
    .map((r) => r.toLowerCase())
    .sort()
    .join('|') || 'member';

/**
 * Role assignment stays admin-only, even for a role that has the members section: a delegated (non-admin)
 * session may not change roles or the login link (authUid), touch an account with admin rights, or create
 * one (e.g. by setting an ADMIN_EMAILS address). Returns the French refusal, or null when allowed.
 */
export function delegatedMemberChangeError(
  session: SessionUser,
  stored: MemberFields | null,
  changes: MemberFields
): string | null {
  if (isSessionAdmin(session)) return null;
  if (grantsAdmin(stored)) return 'Seul un administrateur peut modifier un compte administrateur.';
  if ('role' in changes && roleSignature(changes.role) !== roleSignature(stored?.role)) {
    return 'Seul un administrateur peut attribuer des rôles.';
  }
  if (
    'email' in changes &&
    isOfficer(stored) &&
    String(changes.email ?? '').trim().toLowerCase() !== String(stored?.email ?? '').trim().toLowerCase()
  ) {
    // The login email decides who logs in as this officer.
    return 'Seul un administrateur peut modifier l’email d’un responsable.';
  }
  if ('authUid' in changes && (changes.authUid ?? null) !== (stored?.authUid ?? null)) {
    return 'Seul un administrateur peut modifier le compte de connexion d’un membre.';
  }
  if (grantsAdmin({ ...stored, ...changes })) {
    return 'Seul un administrateur peut attribuer des droits administrateur.';
  }
  return null;
}

function isOfficer(stored: MemberFields | null): boolean {
  return MATRIX_ROLES.some(({ key }) => key !== 'Member' && hasMatrixRole(stored?.role as string[] | string | null, key));
}

/** Setting a password means logging in as that member: only an admin may do it for an admin or an officer. */
export function delegatedPasswordResetError(session: SessionUser, stored: MemberFields | null): string | null {
  if (isSessionAdmin(session)) return null;
  return grantsAdmin(stored) || isOfficer(stored)
    ? 'Seul un administrateur peut réinitialiser le mot de passe d’un responsable.'
    : null;
}
