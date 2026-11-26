import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
vi.mock('@/app/lib/firebase/client', () => ({
  isMockMode: true,
  snapshotToArray: vi.fn(),
}));
vi.mock('@/app/lib/firebase/admin', () => ({ getAdminDatabase: vi.fn() }));

import { CodaError } from '@/app/lib/payments/coda';
import {
  MOCK_EQUIPMENT_ORDERS,
  createEquipmentOrder,
  markOrderPaid,
} from '@/app/lib/firebase/equipment-orders';
import {
  MOCK_BANK_TRANSACTIONS,
  assignTransaction,
  ignoreTransaction,
  importCodaFile,
  listBankTransactions,
} from '@/app/lib/firebase/bank-transactions';
import { getPaymentSettings, savePaymentSettings } from '@/app/lib/firebase/payment-settings';
import { codaFile } from './coda-fixture';

const newOrder = (totalPrice: number) =>
  createEquipmentOrder({
    memberId: 'm1',
    memberName: 'Jean',
    memberEmail: 'jean@example.com',
    items: [{ equipmentId: 'x', equipmentName: 'Maillot', size: 'M', quantity: 1, unitPrice: totalPrice }],
    totalPrice,
    source: 'campaign',
  });

describe('bank transactions (mock mode)', () => {
  beforeEach(() => {
    MOCK_EQUIPMENT_ORDERS.length = 0;
    MOCK_BANK_TRANSACTIONS.length = 0;
  });

  it('imports a CODA file, matches exact payments and skips a re-import', async () => {
    const a = await newOrder(79.5);
    const b = await newOrder(50);
    const file = codaFile([
      { seq: '0001', bankRef: 'R1', amount: '000000000079500', ogm: a.paymentReference, account: 'BE68539007547034', name: 'JEAN' },
      { seq: '0002', bankRef: 'R2', amount: '000000000040000', ogm: b.paymentReference },
      { seq: '0003', bankRef: 'R3', amount: '000000000025000', text: ['Cotisation 2027'] },
      { seq: '0004', bankRef: 'R4', amount: '000000000079500', ogm: a.paymentReference },
      { seq: '0005', bankRef: 'R5', amount: '000000000079500', debit: true },
    ]);

    expect(await importCodaFile(file)).toEqual({ total: 4, duplicates: 0, matched: 1, unmatched: 3 });

    const paid = MOCK_EQUIPMENT_ORDERS.find((o) => o.id === a.id);
    const matchedTx = MOCK_BANK_TRANSACTIONS.find((t) => t.status === 'matched');
    expect(paid).toMatchObject({ status: 'paid', paidAt: '2026-11-26', bankTransactionId: matchedTx?.id });
    expect(matchedTx).toMatchObject({ orderId: a.id, counterpartyIbanLast4: '7034', amountCents: 7950 });
    expect(matchedTx?.id).toMatch(/^[0-9a-f]{20}$/);
    expect(JSON.stringify(MOCK_BANK_TRANSACTIONS)).not.toContain('BE68539007547034');
    expect((await listBankTransactions('unmatched')).map((t) => t.reason).sort()).toEqual([
      'amount-mismatch',
      'no-reference',
      'not-pending',
    ]);

    expect(await importCodaFile(file)).toEqual({ total: 4, duplicates: 4, matched: 0, unmatched: 0 });
    expect(MOCK_BANK_TRANSACTIONS).toHaveLength(4);
  });

  it('lets an admin assign or ignore an unmatched credit', async () => {
    const b = await newOrder(50);
    await importCodaFile(
      codaFile([
        { seq: '0001', bankRef: 'R1', amount: '000000000040000', ogm: b.paymentReference, date: '021226' },
        { seq: '0002', bankRef: 'R2', amount: '000000000025000', text: ['Cotisation'] },
      ])
    );
    const [mismatch, noRef] = ['amount-mismatch', 'no-reference'].map(
      (reason) => MOCK_BANK_TRANSACTIONS.find((t) => t.reason === reason)!
    );

    const assigned = await assignTransaction(mismatch.id, b.id);
    expect(assigned).toMatchObject({ status: 'matched', orderId: b.id, manual: true });
    expect(assigned.reason).toBeUndefined();
    expect(MOCK_EQUIPMENT_ORDERS.find((o) => o.id === b.id)).toMatchObject({
      status: 'paid',
      paidAt: '2026-12-02',
      bankTransactionId: mismatch.id,
    });
    await expect(assignTransaction(mismatch.id, b.id)).rejects.toThrow('déjà rapprochée');

    expect((await ignoreTransaction(noRef.id)).status).toBe('ignored');
    await expect(ignoreTransaction(noRef.id)).rejects.toThrow();
    await expect(ignoreTransaction('missing')).rejects.toThrow('introuvable');
  });

  it('rejects an invalid file', async () => {
    await expect(importCodaFile('not a coda file')).rejects.toBeInstanceOf(CodaError);
  });

  it('never lets one credit pay two orders, even on concurrent assigns', async () => {
    const [a, b] = [await newOrder(45), await newOrder(45)];
    await importCodaFile(codaFile([{ seq: '0001', bankRef: 'R1', amount: '000000000045000', text: ['Maillot'] }]));
    const [tx] = MOCK_BANK_TRANSACTIONS;

    const results = await Promise.allSettled([assignTransaction(tx.id, a.id), assignTransaction(tx.id, b.id)]);
    expect(results.map((r) => r.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(MOCK_EQUIPMENT_ORDERS.filter((o) => o.status === 'paid')).toHaveLength(1);
  });

  it('releases the credit when the order cannot be paid', async () => {
    const order = await newOrder(45);
    await markOrderPaid(order.id);
    await importCodaFile(codaFile([{ seq: '0001', bankRef: 'R1', amount: '000000000045000', text: ['Maillot'] }]));
    const [tx] = MOCK_BANK_TRANSACTIONS;

    await expect(assignTransaction(tx.id, order.id)).rejects.toThrow('non autorisé');
    expect(MOCK_BANK_TRANSACTIONS[0]).toEqual(tx);
  });

  it('completes an import stopped after paying an order, without paying twice', async () => {
    const order = await newOrder(45);
    const file = codaFile([{ seq: '0001', bankRef: 'R1', amount: '000000000045000', ogm: order.paymentReference }]);
    await importCodaFile(file);
    const paid = MOCK_EQUIPMENT_ORDERS.find((o) => o.id === order.id);
    MOCK_BANK_TRANSACTIONS.length = 0; // the record was never written

    expect(await importCodaFile(file)).toEqual({ total: 1, duplicates: 0, matched: 1, unmatched: 0 });
    expect(MOCK_BANK_TRANSACTIONS).toMatchObject([{ status: 'matched', orderId: order.id }]);
    expect(MOCK_EQUIPMENT_ORDERS.find((o) => o.id === order.id)).toEqual(paid);
  });

  it('stores one record when the same file is imported twice at once', async () => {
    const order = await newOrder(45);
    const file = codaFile([{ seq: '0001', bankRef: 'R1', amount: '000000000045000', ogm: order.paymentReference }]);

    const summaries = await Promise.all([importCodaFile(file), importCodaFile(file)]);
    expect(MOCK_BANK_TRANSACTIONS).toMatchObject([{ status: 'matched', orderId: order.id }]);
    expect(summaries.map((s) => [s.matched, s.duplicates]).sort()).toEqual([[0, 1], [1, 0]]);
  });
});

describe('payment settings (mock mode)', () => {
  it('validates and normalizes the club account', async () => {
    expect(await getPaymentSettings()).toBeNull();
    await expect(savePaymentSettings({ beneficiary: 'CC', iban: 'BE68539007547035' })).rejects.toThrow();
    await expect(
      savePaymentSettings({ beneficiary: 'x'.repeat(71), iban: 'BE68539007547034' })
    ).rejects.toThrow();

    const saved = await savePaymentSettings({
      beneficiary: ' CC Saint-Martin Blanmont ',
      iban: 'be68 5390 0754 7034',
      bic: '',
    });
    expect(saved).toMatchObject({ beneficiary: 'CC Saint-Martin Blanmont', iban: 'BE68539007547034' });
    expect('bic' in saved).toBe(false);
    expect(await getPaymentSettings()).toEqual(saved);
  });
});
