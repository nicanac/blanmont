'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser, isSessionAdmin, isSessionOwner, requireAdminSession } from '@/app/lib/auth/session';
import {
  allowedAdminSections,
  getAdminAccessMatrix,
  saveAdminAccessMatrix,
  type AdminAccessMatrix,
} from '@/app/lib/auth/admin-access';
import {
  ADMIN_SECTIONS,
  DEFAULT_ADMIN_ACCESS,
  MATRIX_ROLES,
  type AdminSection,
  type AdminSectionId,
} from '@/app/constants/admin-sections';

type MatrixResult = { success: true; matrix: AdminAccessMatrix } | { success: false; error: string };

function fail(name: string, error: unknown): { success: false; error: string } {
  console.error(`Error in ${name}:`, error);
  return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
}

/** Admin-only: the matrix plus the registries the /admin/acces page renders (rows = sections, columns = roles). */
export async function getAdminAccessAction(): Promise<
  | {
      success: true;
      matrix: AdminAccessMatrix;
      sections: readonly AdminSection[];
      roles: { key: string; label: string }[];
    }
  | { success: false; error: string }
> {
  try {
    await requireAdminSession();
    const matrix = await getAdminAccessMatrix();
    return { success: true, matrix, sections: ADMIN_SECTIONS, roles: MATRIX_ROLES };
  } catch (error) {
    return fail('getAdminAccessAction', error);
  }
}

/** Admin-only. Input: { roles: { [roleKey]: sectionId[] } }; unknown roles or sections are refused. */
export async function saveAdminAccessAction(input: unknown): Promise<MatrixResult> {
  try {
    const admin = await requireAdminSession();
    const matrix = await saveAdminAccessMatrix(input, admin);
    revalidatePath('/admin/acces');
    return { success: true, matrix };
  } catch (error) {
    return fail('saveAdminAccessAction', error);
  }
}

/** Admin-only: stores the suggested defaults (DEFAULT_ADMIN_ACCESS) as the matrix. */
export async function resetAdminAccessAction(): Promise<MatrixResult> {
  try {
    const admin = await requireAdminSession();
    const matrix = await saveAdminAccessMatrix({ roles: DEFAULT_ADMIN_ACCESS }, admin);
    revalidatePath('/admin/acces');
    return { success: true, matrix };
  } catch (error) {
    return fail('resetAdminAccessAction', error);
  }
}

/** Any session: what the current user may open (sidebar, palette, dashboard). Empty for none. Cosmetic only. */
export async function getMyAdminAccessAction(): Promise<{
  isAdmin: boolean;
  isOwner: boolean;
  sections: AdminSectionId[];
}> {
  const session = await getSessionUser();
  return {
    isAdmin: isSessionAdmin(session),
    isOwner: isSessionOwner(session),
    sections: await allowedAdminSections(session),
  };
}
