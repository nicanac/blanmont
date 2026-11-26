import { describe, expect, it } from 'vitest';
import {
  findPaymentReference,
  formatPaymentReference,
  isValidPaymentReference,
  makePaymentReference,
} from '@/app/lib/payments/ogm';
import { buildEpcPayload, isValidBic, isValidIban } from '@/app/lib/payments/epc';
import { CodaError, parseCoda } from '@/app/lib/payments/coda';
import { reconcile } from '@/app/lib/payments/reconcile';
import { codaFile, codaRecord, CODA_HEADER } from './coda-fixture';

const REF_12 = '100000001246'; // base 1000000012, 1000000012 mod 97 = 46
const REF_13 = makePaymentReference(13);

describe('OGM payment reference', () => {
  it('builds prefix 1 + 9-digit counter + mod-97 check', () => {
    expect(makePaymentReference(12)).toBe(REF_12);
    expect(REF_13).toBe('100000001347');
    expect(isValidPaymentReference(REF_12)).toBe(true);
  });

  it('uses 97 when the base is a multiple of 97', () => {
    const seq = (97 - (1_000_000_000 % 97)) % 97;
    const ref = makePaymentReference(seq);
    expect(ref.slice(10)).toBe('97');
    expect(isValidPaymentReference(ref)).toBe(true);
  });

  it('rejects out-of-range counters and bad references', () => {
    expect(() => makePaymentReference(-1)).toThrow(RangeError);
    expect(() => makePaymentReference(1_000_000_000)).toThrow(RangeError);
    expect(() => makePaymentReference(1.5)).toThrow(RangeError);
    expect(isValidPaymentReference('100000001247')).toBe(false);
    expect(isValidPaymentReference('10000000124')).toBe(false);
  });

  it('formats as +++123/4567/89002+++', () => {
    expect(formatPaymentReference('123456789002')).toBe('+++123/4567/89002+++');
  });

  it('finds the first valid reference in free text', () => {
    expect(findPaymentReference('+++100/0000/01246+++')).toBe(REF_12);
    expect(findPaymentReference('***100/0000/01246***')).toBe(REF_12);
    expect(findPaymentReference('maillot 100 0000 01246 merci')).toBe(REF_12);
    expect(findPaymentReference('Ref:100000001246')).toBe(REF_12);
    expect(findPaymentReference('+++ 100 / 0000 / 01246 +++')).toBe(REF_12);
    // invalid check digits are skipped, the next candidate wins
    expect(findPaymentReference('100000001247 puis 100000001347')).toBe(REF_13);
    // part of a longer number: no match
    expect(findPaymentReference('BE1000000012460')).toBeNull();
    expect(findPaymentReference('Maillot Jean')).toBeNull();
  });
});

describe('EPC QR payload', () => {
  const input = {
    beneficiary: 'CC Saint-Martin Blanmont',
    iban: 'be68 5390 0754 7034',
    amountEur: 79.5,
    reference: REF_12,
  };

  it('validates IBANs (ISO 13616) and BICs', () => {
    expect(isValidIban('BE68 5390 0754 7034')).toBe(true);
    expect(isValidIban('GB82 WEST 1234 5698 7654 32')).toBe(true);
    expect(isValidIban('BE68539007547035')).toBe(false);
    expect(isValidIban('BE68')).toBe(false);
    expect(isValidBic('GKCCBEBB')).toBe(true);
    expect(isValidBic('GEBABEBB036')).toBe(true);
    expect(isValidBic('GKCC')).toBe(false);
  });

  it('builds the exact payload with the OGM in the structured field', () => {
    expect(buildEpcPayload(input)).toBe(
      'BCD\n002\n1\nSCT\n\nCC Saint-Martin Blanmont\nBE68539007547034\nEUR79.50\n\n100000001246'
    );
    expect(buildEpcPayload({ ...input, bic: 'gkcc bebb', amountEur: 1234.5 })).toBe(
      'BCD\n002\n1\nSCT\nGKCCBEBB\nCC Saint-Martin Blanmont\nBE68539007547034\nEUR1234.50\n\n100000001246'
    );
  });

  it('throws on invalid input', () => {
    expect(() => buildEpcPayload({ ...input, iban: 'BE68539007547035' })).toThrow();
    expect(() => buildEpcPayload({ ...input, beneficiary: '' })).toThrow();
    expect(() => buildEpcPayload({ ...input, beneficiary: 'x'.repeat(71) })).toThrow();
    expect(() => buildEpcPayload({ ...input, beneficiary: 'a\nb' })).toThrow();
    expect(() => buildEpcPayload({ ...input, bic: 'XX' })).toThrow();
    expect(() => buildEpcPayload({ ...input, amountEur: 0 })).toThrow();
    expect(() => buildEpcPayload({ ...input, amountEur: 1_000_000_000 })).toThrow();
    expect(() => buildEpcPayload({ ...input, amountEur: Number.NaN })).toThrow();
    expect(() => buildEpcPayload({ ...input, reference: '100000001247' })).toThrow();
  });
});

describe('parseCoda', () => {
  const file = codaFile([
    {
      seq: '0001',
      bankRef: 'BANKREF00000000000001',
      amount: '000000000079500',
      ogm: REF_12,
      account: 'BE68539007547034',
      name: 'DUPONT JEAN',
    },
    {
      // OGM typed as free text, split over records 21 and 22
      seq: '0002',
      bankRef: 'BANKREF00000000000002',
      amount: '000000000050000',
      date: '011226',
      text: ['Maillot Jean'.padEnd(40, ' ') + '+++100/0000/0', '1347+++ merci', 'fin'],
      account: 'BE71096123456769',
      name: 'MARTIN MARIE',
    },
    { seq: '0003', bankRef: 'BANKREF00000000000003', debit: true, amount: '000000000010000' },
  ]);

  it('returns credits with structured and free-text references, skipping debits', () => {
    expect(parseCoda(file)).toEqual([
      {
        bankRef: 'BANKREF00000000000001',
        valueDate: '2026-11-26',
        amountCents: 7950,
        counterpartyAccount: 'BE68539007547034',
        counterpartyName: 'DUPONT JEAN',
        communication: '+++100/0000/01246+++',
        reference: REF_12,
      },
      {
        bankRef: 'BANKREF00000000000002',
        valueDate: '2026-12-01',
        amountCents: 5000,
        counterpartyAccount: 'BE71096123456769',
        counterpartyName: 'MARTIN MARIE',
        communication: 'Maillot Jean +++100/0000/01347+++ merci fin',
        reference: REF_13,
      },
    ]);
  });

  it('accepts CRLF line endings', () => {
    const crlf = file.replace(/\n/g, '\r\n');
    expect(parseCoda(crlf)).toHaveLength(2);
  });

  it('leaves the reference out when none is found', () => {
    const [credit] = parseCoda(
      codaFile([{ seq: '0001', bankRef: 'R1', amount: '000000000001000', text: ['Cotisation'] }])
    );
    expect(credit.reference).toBeUndefined();
    expect(credit.communication).toBe('Cotisation');
    expect(credit.counterpartyAccount).toBe('');
  });

  it('drops a globalised total and keeps its detail credits', () => {
    const credits = parseCoda(
      codaFile([
        { seq: '0001', bankRef: 'G1', amount: '000000000125000', glob: '1', text: ['Globalisation'] },
        { seq: '0001', detail: '0001', bankRef: 'G1', amount: '000000000079500', ogm: REF_12, account: 'BE68539007547034', name: 'DUPONT' },
        { seq: '0001', detail: '0002', bankRef: 'G1', amount: '000000000045500', text: ['Maillot'], account: 'BE71096123456769', name: 'MARTIN' },
        // a globalisation code without details stays a credit
        { seq: '0002', bankRef: 'R2', amount: '000000000010000', glob: '1', text: ['Total'] },
      ])
    );
    expect(credits.map((c) => [c.amountCents, c.counterpartyName])).toEqual([
      [7950, 'DUPONT'],
      [4550, 'MARTIN'],
      [1000, ''],
    ]);
    expect(credits[0].reference).toBe(REF_12);
  });

  it('ignores 22/23 records of another sequence number', () => {
    const lines = [
      CODA_HEADER,
      codaRecord({ 1: '21', 3: '0001', 11: 'R1', 32: '0', 33: '000000000001000', 48: '261126', 63: 'A' }),
      codaRecord({ 1: '23', 3: '0009', 11: 'BE68539007547034', 48: 'OTHER' }),
    ];
    const [credit] = parseCoda(lines.join('\n'));
    expect(credit.counterpartyName).toBe('');
  });

  it('rejects records of the wrong length or a file without record 0', () => {
    expect(() => parseCoda(CODA_HEADER + '\n' + 'x'.repeat(127))).toThrow(CodaError);
    expect(() => parseCoda(CODA_HEADER + '\n' + 'x'.repeat(127))).toThrow(/Fichier CODA invalide/);
    expect(() => parseCoda(file.split('\n').slice(1).join('\n'))).toThrow(/Fichier CODA invalide/);
    expect(() => parseCoda('')).toThrow(CodaError);
    expect(() =>
      parseCoda(codaFile([{ seq: '0001', bankRef: 'R', amount: '00000000000A000' }]))
    ).toThrow(CodaError);
  });
});

describe('reconcile', () => {
  const orders = [
    { id: 'a', status: 'pending' as const, totalPrice: 79.5, paymentReference: REF_12 },
    { id: 'b', status: 'paid' as const, totalPrice: 50, paymentReference: REF_13 },
    { id: 'c', status: 'pending' as const, totalPrice: 50, paymentReference: makePaymentReference(14) },
    { id: 'legacy', status: 'confirmed' as const, totalPrice: 10 },
  ];

  it('applies the exact-amount rule with a reason for every unmatched credit', () => {
    const credits = [
      { amountCents: 7950 },
      { amountCents: 7950, reference: makePaymentReference(99) },
      { amountCents: 5000, reference: REF_13 },
      { amountCents: 4999, reference: makePaymentReference(14) },
      { amountCents: 7950, reference: REF_12 },
      { amountCents: 7950, reference: REF_12 },
    ];
    expect(reconcile(credits, orders)).toMatchObject([
      { status: 'unmatched', reason: 'no-reference' },
      { status: 'unmatched', reason: 'unknown-reference' },
      { status: 'unmatched', reason: 'not-pending' },
      { status: 'unmatched', reason: 'amount-mismatch' },
      { status: 'matched', orderId: 'a' },
      // second payment of the same order in one file
      { status: 'unmatched', reason: 'not-pending' },
    ]);
  });

  it('matches again, without paying twice, a credit that already paid its order', () => {
    const [result] = reconcile(
      [{ id: 'tx1', amountCents: 5000, reference: REF_13 }],
      [{ ...orders[1], bankTransactionId: 'tx1' }]
    );
    expect(result).toMatchObject({ status: 'matched', orderId: 'b', alreadyPaid: true });
  });

  it('compares in cents, not floats', () => {
    const [result] = reconcile(
      [{ amountCents: 30, reference: REF_12 }],
      [{ id: 'x', status: 'pending', totalPrice: 0.1 + 0.2, paymentReference: REF_12 }]
    );
    expect(result.status).toBe('matched');
  });
});
