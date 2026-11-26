import { createHash } from 'node:crypto';
import type {
  BankTransaction,
  BankTransactionStatus,
} from '../../types/equipment';
import { isMockMode, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';
import { updateRecord } from './update-record';
import { markOrderPaid, readEquipmentOrders } from './equipment-orders';
import { parseCoda, type CodaCredit } from '../payments/coda';
import { reconcile } from '../payments/reconcile';
import { NotFoundError, ValidationError } from '../errors';

/** In-memory store used when Firebase is not configured (local dev / tests). */
export const MOCK_BANK_TRANSACTIONS: BankTransaction[] = [];

const TRANSACTIONS_PATH = 'bank-transactions';

export interface CodaImportSummary {
  /** Credits in the file. */
  total: number;
  /** Credits already imported before (skipped). */
  duplicates: number;
  matched: number;
  unmatched: number;
}

/** Stable id, so re-importing the same statement adds nothing. */
export function bankTransactionId(
  credit: Pick<CodaCredit, 'bankRef' | 'valueDate' | 'amountCents' | 'counterpartyAccount'>
): string {
  return createHash('sha256')
    .update(`${credit.bankRef}|${credit.valueDate}|${credit.amountCents}|${credit.counterpartyAccount}`)
    .digest('hex')
    .slice(0, 20);
}

/** Transactions, newest value date first. Throws when the database read fails. */
export async function listBankTransactions(
  status?: BankTransactionStatus
): Promise<BankTransaction[]> {
  const all = isMockMode
    ? [...MOCK_BANK_TRANSACTIONS]
    : snapshotToArray<BankTransaction>(
        await getAdminDatabase().ref(TRANSACTIONS_PATH).once('value')
      );
  return all
    .filter((t) => !status || t.status === status)
    .sort(
      (a, b) => b.valueDate.localeCompare(a.valueDate) || b.importedAt.localeCompare(a.importedAt)
    );
}

/**
 * Parses a CODA statement (throws CodaError), stores its new credits and marks the
 * exactly-paid pending orders as paid on the bank value date.
 */
export async function importCodaFile(text: string): Promise<CodaImportSummary> {
  const credits = parseCoda(text);
  const known = new Set((await listBankTransactions()).map((t) => t.id));

  const fresh: (CodaCredit & { id: string })[] = [];
  for (const credit of credits) {
    const id = bankTransactionId(credit);
    if (known.has(id)) continue;
    known.add(id);
    fresh.push({ ...credit, id });
  }

  const importedAt = new Date().toISOString();
  let matched = 0;
  let unmatched = 0;
  for (const { credit, ...outcome } of reconcile(fresh, await readEquipmentOrders())) {
    const base = {
      id: credit.id,
      importedAt,
      valueDate: credit.valueDate,
      amountCents: credit.amountCents,
      counterpartyName: credit.counterpartyName,
      counterpartyIbanLast4: credit.counterpartyAccount.slice(-4),
      communication: credit.communication.slice(0, 140),
      ...(credit.reference ? { reference: credit.reference } : {}),
    };
    let transaction: BankTransaction;
    if (outcome.status === 'unmatched') {
      transaction = { ...base, status: 'unmatched', reason: outcome.reason };
    } else {
      transaction = { ...base, status: 'matched', orderId: outcome.orderId };
      if (!outcome.alreadyPaid) {
        try {
          await markOrderPaid(outcome.orderId, credit.valueDate, credit.id);
        } catch (error) {
          // The order changed since it was read: paid by this very credit (concurrent
          // import), or else left for manual review.
          const order = (await readEquipmentOrders()).find((o) => o.id === outcome.orderId);
          if (order?.bankTransactionId !== credit.id) {
            console.error(`CODA import: order ${outcome.orderId} not marked paid:`, error);
            transaction = { ...base, status: 'unmatched', reason: 'not-pending' };
          }
        }
      }
    }
    // Stored right after its order, so a crash midway leaves consistent records and a
    // re-import completes the rest. Already stored by a concurrent import: a duplicate.
    if (!(await createBankTransaction(transaction))) continue;
    if (transaction.status === 'matched') matched++;
    else unmatched++;
  }

  return { total: credits.length, duplicates: credits.length - matched - unmatched, matched, unmatched };
}

/** Create-only write. False when the record already exists (nothing written). */
async function createBankTransaction(transaction: BankTransaction): Promise<boolean> {
  if (isMockMode) {
    if (MOCK_BANK_TRANSACTIONS.some((t) => t.id === transaction.id)) return false;
    MOCK_BANK_TRANSACTIONS.push(transaction);
    return true;
  }
  // The first call may see null before the server value is known; the server then
  // retries with the stored record and the abort (undefined) leaves it untouched.
  const { committed } = await getAdminDatabase()
    .ref(`${TRANSACTIONS_PATH}/${transaction.id}`)
    .transaction((current: BankTransaction | null) => (current === null ? transaction : undefined));
  return committed;
}

/**
 * Manual match by an admin, whatever the amount: the order (which must be pending)
 * becomes paid on the transaction's value date. The credit is claimed first, so one
 * credit never pays two orders; it is released again when the order cannot be paid.
 */
export async function assignTransaction(txId: string, orderId: string): Promise<BankTransaction> {
  let previous: BankTransaction | undefined;
  const claimed = await updateRecord(MOCK_BANK_TRANSACTIONS, TRANSACTIONS_PATH, txId, (t) => {
    if (t.status === 'matched') throw new ValidationError('Transaction déjà rapprochée');
    previous = t;
    return { ...t, status: 'matched' as const, orderId, manual: true, reason: undefined };
  });
  if (!claimed || !previous) throw new NotFoundError('Transaction introuvable');
  const restore = previous;

  try {
    await markOrderPaid(orderId, claimed.valueDate, txId);
  } catch (error) {
    await updateRecord(MOCK_BANK_TRANSACTIONS, TRANSACTIONS_PATH, txId, () => restore);
    throw error;
  }
  return claimed;
}

/** Unmatched → ignored (e.g. a membership fee or a refund handled elsewhere). */
export async function ignoreTransaction(txId: string): Promise<BankTransaction> {
  const updated = await updateRecord(MOCK_BANK_TRANSACTIONS, TRANSACTIONS_PATH, txId, (t) => {
    if (t.status !== 'unmatched') {
      throw new ValidationError('Seule une transaction non rapprochée peut être ignorée');
    }
    return { ...t, status: 'ignored' as const };
  });
  if (!updated) throw new NotFoundError('Transaction introuvable');
  return updated;
}
