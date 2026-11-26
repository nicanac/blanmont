import type { BankTransactionReason, EquipmentOrder } from '../../types/equipment';

export type ReconcileOutcome =
  | { status: 'matched'; orderId: string }
  | { status: 'unmatched'; reason: BankTransactionReason };

type ReconcilableOrder = Pick<EquipmentOrder, 'id' | 'status' | 'totalPrice' | 'paymentReference'>;

/**
 * Exact-amount reconciliation (docs/maillots.md, "Reconciliation"). Pure: credits are
 * taken in file order, so a second credit for an order matched earlier in the same run
 * is 'not-pending'. Amounts are compared in cents.
 */
export function reconcile<C extends { reference?: string; amountCents: number }>(
  credits: C[],
  orders: ReconcilableOrder[]
): ({ credit: C } & ReconcileOutcome)[] {
  const byReference = new Map(
    orders.filter((o) => o.paymentReference).map((o) => [o.paymentReference as string, o])
  );
  const matchedNow = new Set<string>();

  const classify = (credit: C): ReconcileOutcome => {
    if (!credit.reference) return { status: 'unmatched', reason: 'no-reference' };
    const order = byReference.get(credit.reference);
    if (!order) return { status: 'unmatched', reason: 'unknown-reference' };
    if (order.status !== 'pending' || matchedNow.has(order.id)) {
      return { status: 'unmatched', reason: 'not-pending' };
    }
    if (credit.amountCents !== Math.round(order.totalPrice * 100)) {
      return { status: 'unmatched', reason: 'amount-mismatch' };
    }
    matchedNow.add(order.id);
    return { status: 'matched', orderId: order.id };
  };

  return credits.map((credit) => ({ credit, ...classify(credit) }));
}
