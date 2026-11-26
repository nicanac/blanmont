/**
 * Belgian structured communication (OGM, "communication structurée") for shop orders.
 * Spec: docs/maillots.md, "Payment reference".
 */

/** First digit of every reference: 1 = boutique. */
const PREFIX = '1';
const MAX_SEQUENCE = 999_999_999;

function checkDigits(base: string): string {
  return String(Number(base) % 97 || 97).padStart(2, '0');
}

/** 12-digit reference: '1' + 9-digit counter + mod-97 check (0 becomes 97). */
export function makePaymentReference(seq: number): string {
  if (!Number.isInteger(seq) || seq < 0 || seq > MAX_SEQUENCE) {
    throw new RangeError(`Payment reference sequence out of range: ${seq}`);
  }
  const base = PREFIX + String(seq).padStart(9, '0');
  return base + checkDigits(base);
}

export function isValidPaymentReference(ref: string): boolean {
  return /^\d{12}$/.test(ref) && checkDigits(ref.slice(0, 10)) === ref.slice(10);
}

/** '123456789002' → '+++123/4567/89002+++' */
export function formatPaymentReference(ref: string): string {
  return `+++${ref.slice(0, 3)}/${ref.slice(3, 7)}/${ref.slice(7)}+++`;
}

/**
 * First valid reference in free text, written plain or as 3/4/5 digit groups split by
 * slashes or spaces ('+++…+++' and '***…***' wrappers are ignored). Digits that are part
 * of a longer number never match.
 */
export function findPaymentReference(text: string): string | null {
  for (const m of text.matchAll(/(^|\D)(\d{3})[\s/]*(\d{4})[\s/]*(\d{5})(?!\d)/g)) {
    const ref = m[2] + m[3] + m[4];
    if (isValidPaymentReference(ref)) return ref;
  }
  return null;
}
