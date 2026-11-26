import { findPaymentReference, formatPaymentReference, isValidPaymentReference } from './ogm';

/**
 * Belgian CODA v2 bank statement parser (credits only). Positions below are the spec's
 * 1-based inclusive ones (docs/maillots.md, "CODA parsing"); slice() takes (start - 1, end).
 */

export interface CodaCredit {
  /** Bank reference of the movement (21, pos. 11-31). */
  bankRef: string;
  /** Value date, YYYY-MM-DD. */
  valueDate: string;
  amountCents: number;
  counterpartyAccount: string;
  counterpartyName: string;
  communication: string;
  /** Valid 12-digit OGM, from the structured field or found in the free text. */
  reference?: string;
}

export class CodaError extends Error {
  constructor(detail: string) {
    super(`Fichier CODA invalide : ${detail}`);
    this.name = 'CodaError';
  }
}

interface Movement {
  seq: string;
  line: number;
  bankRef: string;
  credit: boolean;
  amountCents: number;
  valueDate: string;
  structuredRef: string | null;
  communication: [string, string, string];
  account: string;
  name: string;
}

function parseValueDate(ddmmyy: string, line: number): string {
  const [dd, mm, yy] = [ddmmyy.slice(0, 2), ddmmyy.slice(2, 4), ddmmyy.slice(4, 6)];
  if (!/^\d{6}$/.test(ddmmyy) || +dd < 1 || +dd > 31 || +mm < 1 || +mm > 12) {
    throw new CodaError(`date de valeur illisible (ligne ${line})`);
  }
  return `20${yy}-${mm}-${dd}`;
}

export function parseCoda(text: string): CodaCredit[] {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.length > 0);
  const badLine = lines.findIndex((l) => l.length !== 128);
  if (badLine >= 0) throw new CodaError(`ligne ${badLine + 1} ne fait pas 128 caractères`);
  if (!lines.some((l) => l[0] === '0')) throw new CodaError('enregistrement 0 manquant');

  const movements: Movement[] = [];
  let current: Movement | null = null;
  lines.forEach((l, index) => {
    const kind = l.slice(0, 2);
    const seq = l.slice(2, 6);
    if (kind === '21') {
      const amount = l.slice(32, 47);
      if (!/^\d{15}$/.test(amount)) throw new CodaError(`montant illisible (ligne ${index + 1})`);
      const structured = l[61] === '1' && ['101', '102'].includes(l.slice(62, 65));
      current = {
        seq,
        line: index + 1,
        bankRef: l.slice(10, 31).trim(),
        credit: l[31] === '0',
        amountCents: Math.round(Number(amount) / 10), // 3 implied decimals
        valueDate: parseValueDate(l.slice(47, 53), index + 1),
        structuredRef: structured ? l.slice(65, 77) : null,
        communication: [l.slice(62, 115), '', ''],
        account: '',
        name: '',
      };
      movements.push(current);
    } else if (kind === '22' && current?.seq === seq) {
      current.communication[1] = l.slice(10, 63);
    } else if (kind === '23' && current?.seq === seq) {
      // 11-47 may end with the account currency ("BE68…   EUR"): keep the account only.
      current.account = l.slice(10, 47).trim().split(/\s+/)[0] ?? '';
      current.name = l.slice(47, 82).trim();
      current.communication[2] = l.slice(82, 125);
    }
  });

  return movements
    .filter((m) => m.credit)
    .map((m) => {
      const freeText = m.communication.join('').replace(/\s+/g, ' ').trim();
      const structured =
        m.structuredRef && isValidPaymentReference(m.structuredRef) ? m.structuredRef : null;
      const reference = structured ?? findPaymentReference(freeText);
      return {
        bankRef: m.bankRef,
        valueDate: m.valueDate,
        amountCents: m.amountCents,
        counterpartyAccount: m.account,
        counterpartyName: m.name,
        communication: structured ? formatPaymentReference(structured) : freeText,
        ...(reference ? { reference } : {}),
      };
    });
}
