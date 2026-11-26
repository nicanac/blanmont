'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminSession } from '@/app/lib/auth/session';
import {
  assignTransaction,
  ignoreTransaction,
  importCodaFile,
  type CodaImportSummary,
} from '@/app/lib/firebase/bank-transactions';
import { RecordIdSchema } from '@/app/lib/validation';

type ActionResult = { success: boolean; error?: string };

// Next's server-action body limit is 1 MB for the whole multipart request: keep room for its overhead.
const MAX_CODA_BYTES = 1_000_000 - 20_000;

const CodaFileSchema = z
  .instanceof(File, { error: 'Choisissez un fichier CODA' })
  .refine((file) => file.size > 0, 'Le fichier est vide')
  .refine((file) => file.size <= MAX_CODA_BYTES, 'Fichier trop volumineux (1 Mo maximum)');

function revalidateBank(): void {
  revalidatePath('/admin/commandes/banque');
  revalidatePath('/admin/commandes');
  revalidatePath('/admin/commandes/campagnes/[id]', 'page');
  revalidatePath('/profile/commandes');
}

function fail(name: string, error: unknown): { success: false; error: string } {
  console.error(`Error in ${name}:`, error);
  return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
}

/** Form field `file`: a CODA statement, parsed in memory and never stored as a file. */
export async function importCodaAction(
  formData: FormData
): Promise<{ success: true; summary: CodaImportSummary } | { success: false; error: string }> {
  try {
    await requireAdminSession();
    const parsed = CodaFileSchema.safeParse(formData.get('file'));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const text = new TextDecoder('latin1').decode(await parsed.data.arrayBuffer());
    const summary = await importCodaFile(text);
    revalidateBank();
    return { success: true, summary };
  } catch (error) {
    return fail('importCodaAction', error);
  }
}

/** Manual match of an unmatched or ignored credit to a pending order, whatever the amount. */
export async function assignTransactionAction(
  txId: string,
  orderId: string
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const tx = RecordIdSchema.safeParse(txId);
    const order = RecordIdSchema.safeParse(orderId);
    if (!tx.success || !order.success) return { success: false, error: 'Paramètres invalides' };
    await assignTransaction(tx.data, order.data);
    revalidateBank();
    return { success: true };
  } catch (error) {
    return fail('assignTransactionAction', error);
  }
}

export async function ignoreTransactionAction(txId: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const tx = RecordIdSchema.safeParse(txId);
    if (!tx.success) return { success: false, error: 'Paramètres invalides' };
    await ignoreTransaction(tx.data);
    revalidateBank();
    return { success: true };
  } catch (error) {
    return fail('ignoreTransactionAction', error);
  }
}
