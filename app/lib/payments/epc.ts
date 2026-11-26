import { formatPaymentReference, isValidPaymentReference } from './ogm';

/**
 * EPC069-12 v2 ("SEPA QR") payload for a club payment. Spec: docs/maillots.md, "EPC QR payload".
 *
 * Belgian banking apps differ on where they read the OGM. true = structured remittance
 * field; false = unstructured field as '+++…+++' text. Switch after the bank-app tests
 * (KBC, BNP Paribas Fortis, ING, Belfius).
 */
export const OGM_IN_STRUCTURED_FIELD = true;

const MAX_PAYLOAD_BYTES = 331;
const MAX_AMOUNT_CENTS = 99_999_999_999;

const normalize = (value: string): string => value.replace(/\s+/g, '').toUpperCase();

/** ISO 13616 mod-97 check. Spaces and lower case are accepted. */
export function isValidIban(input: string): boolean {
  const iban = normalize(input);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  let remainder = 0;
  for (const ch of iban.slice(4) + iban.slice(0, 4)) {
    const value = parseInt(ch, 36); // '0'-'9' → 0-9, 'A'-'Z' → 10-35
    remainder = (remainder * (value > 9 ? 100 : 10) + value) % 97;
  }
  return remainder === 1;
}

export function isValidBic(input: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(normalize(input));
}

export interface EpcPayloadInput {
  beneficiary: string;
  iban: string;
  bic?: string;
  amountEur: number;
  /** 12-digit OGM, unformatted. */
  reference: string;
}

/** Builds the QR text; throws on any invalid input. Render with generateQrCodeSvg (level M). */
export function buildEpcPayload({ beneficiary, iban, bic, amountEur, reference }: EpcPayloadInput): string {
  const name = beneficiary.trim();
  if (!name || name.length > 70 || /[\r\n]/.test(name)) {
    throw new Error('EPC payload: beneficiary must be 1-70 characters on one line');
  }
  if (!isValidIban(iban)) throw new Error('EPC payload: invalid IBAN');
  if (bic && !isValidBic(bic)) throw new Error('EPC payload: invalid BIC');
  const cents = Math.round(amountEur * 100);
  if (!Number.isFinite(cents) || cents < 1 || cents > MAX_AMOUNT_CENTS) {
    throw new Error('EPC payload: amount must be between 0.01 and 999999999.99 EUR');
  }
  if (!isValidPaymentReference(reference)) throw new Error('EPC payload: invalid OGM');

  const lines = [
    'BCD',
    '002',
    '1', // UTF-8
    'SCT',
    bic ? normalize(bic) : '',
    name,
    normalize(iban),
    `EUR${(cents / 100).toFixed(2)}`,
    '', // purpose
    OGM_IN_STRUCTURED_FIELD ? reference : '',
    OGM_IN_STRUCTURED_FIELD ? '' : formatPaymentReference(reference),
  ];
  while (lines[lines.length - 1] === '') lines.pop();

  const payload = lines.join('\n');
  if (new TextEncoder().encode(payload).length > MAX_PAYLOAD_BYTES) {
    throw new Error('EPC payload: longer than 331 bytes');
  }
  return payload;
}
