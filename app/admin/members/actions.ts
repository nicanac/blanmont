'use server';

import { revalidatePath } from 'next/cache';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { delegatedMemberChangeError, requireSectionAccess } from '@/app/lib/auth/admin-access';
import { planMembersImport, type MemberImportPlan } from '@/app/lib/members-csv';

type Failure = { success: false; error: string };

/** Plan from the file and the stored members, re-checked for the session (never the client's preview). */
async function buildPlan(csv: unknown): Promise<{ plan: MemberImportPlan; ref: ReturnType<ReturnType<typeof getAdminDatabase>['ref']> }> {
  const session = await requireSectionAccess('members');
  if (typeof csv !== 'string') throw new Error('Fichier invalide.');
  const ref = getAdminDatabase().ref('members');
  const stored = ((await ref.once('value')).val() ?? {}) as Record<string, Record<string, unknown>>;
  const existing = new Map(Object.entries(stored));
  const plan = planMembersImport(csv, existing);

  // Same rules as the members API for a delegated (non-admin) session: no admin account, no officer email.
  plan.updates = plan.updates.filter(({ line, id, changes }) => {
    const reason = delegatedMemberChangeError(session, existing.get(id) ?? null, changes);
    if (reason) plan.rejected.push({ line, reason });
    return !reason;
  });
  plan.creates = plan.creates.filter(({ line, values }) => {
    const reason = delegatedMemberChangeError(session, { role: ['Member'] }, values);
    if (reason) plan.rejected.push({ line, reason });
    return !reason;
  });
  plan.rejected.sort((a, b) => a.line - b.line);
  return { plan, ref };
}

function failure(error: unknown): Failure {
  console.error('[members-csv] Import failed:', error);
  return { success: false, error: error instanceof Error ? error.message : 'Import impossible pour le moment.' };
}

/** Step 1: what the file would create, update and reject. Writes nothing. */
export async function previewMembersCsvAction(csv: string): Promise<{ success: true; plan: MemberImportPlan } | Failure> {
  try {
    return { success: true, plan: (await buildPlan(csv)).plan };
  } catch (error) {
    return failure(error);
  }
}

/** Step 2: plans the file again and writes it in one multi-path update. */
export async function importMembersCsvAction(
  csv: string
): Promise<{ success: true; created: number; updated: number; rejected: number } | Failure> {
  try {
    const { plan, ref } = await buildPlan(csv);
    const now = new Date().toISOString();
    const paths: Record<string, unknown> = {};
    for (const { id, changes } of plan.updates) {
      for (const [field, value] of Object.entries(changes)) paths[`${id}/${field}`] = value;
      paths[`${id}/updatedAt`] = now;
    }
    for (const { values } of plan.creates) {
      // Same defaults as POST /api/admin/members; a new member is always a plain Member.
      paths[ref.push().key as string] = {
        bio: '',
        photoUrl: '/images/default-avatar.png',
        cotisation2026Status: 'pending',
        preferredGroup: 'B',
        ...values,
        role: ['Member'],
        createdAt: now,
      };
    }
    if (Object.keys(paths).length > 0) await ref.update(paths);
    revalidatePath('/admin/members');
    return { success: true, created: plan.creates.length, updated: plan.updates.length, rejected: plan.rejected.length };
  } catch (error) {
    return failure(error);
  }
}
