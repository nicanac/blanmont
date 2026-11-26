/** Builds CODA v2 records (128 chars) for tests: text placed at 1-based positions. */
export function codaRecord(fields: Record<number, string>): string {
  const chars = Array<string>(128).fill(' ');
  for (const [pos, text] of Object.entries(fields)) {
    [...text].forEach((ch, i) => {
      chars[Number(pos) - 1 + i] = ch;
    });
  }
  return chars.join('');
}

export const CODA_HEADER = codaRecord({ 1: '0', 6: '261126', 128: '2' });
export const CODA_TRAILER = codaRecord({ 1: '9' });

export interface FixtureMovement {
  seq: string;
  bankRef: string;
  debit?: boolean;
  /** 15 digits, 3 implied decimals. */
  amount: string;
  /** DDMMYY */
  date?: string;
  /** 12-digit OGM in the structured field (type 101). */
  ogm?: string;
  /** Free communication parts for records 21, 22 and 23. */
  text?: [string, string?, string?];
  account?: string;
  name?: string;
}

/** A 21 record, a 22 record when text[1] is given, and a 23 record. */
export function codaMovement(m: FixtureMovement): string[] {
  const lines = [
    codaRecord({
      1: '21',
      3: m.seq,
      7: '0000',
      11: m.bankRef,
      32: m.debit ? '1' : '0',
      33: m.amount,
      48: m.date ?? '261126',
      62: m.ogm ? '1' : '0',
      63: m.ogm ? `101${m.ogm}` : (m.text?.[0] ?? ''),
    }),
  ];
  if (m.text?.[1] !== undefined) lines.push(codaRecord({ 1: '22', 3: m.seq, 11: m.text[1] }));
  lines.push(
    codaRecord({
      1: '23',
      3: m.seq,
      11: m.account ?? '',
      ...(m.account ? { 45: 'EUR' } : {}),
      48: m.name ?? '',
      83: m.text?.[2] ?? '',
    })
  );
  return lines;
}

export function codaFile(movements: FixtureMovement[], eol = '\n'): string {
  return [CODA_HEADER, ...movements.flatMap(codaMovement), CODA_TRAILER].join(eol) + eol;
}
