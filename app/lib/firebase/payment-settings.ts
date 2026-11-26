import { z } from 'zod';
import type { PaymentSettings } from '../../types/equipment';
import { isMockMode } from './client';
import { getAdminDatabase } from './admin';
import { isValidBic, isValidIban } from '../payments/epc';

const SETTINGS_PATH = 'settings/payment';
let mockPaymentSettings: PaymentSettings | null = null;

const compact = (value: string): string => value.replace(/\s+/g, '').toUpperCase();

export const PaymentSettingsSchema = z.object({
  beneficiary: z
    .string()
    .trim()
    .min(1, 'Bénéficiaire requis')
    .max(70, 'Bénéficiaire : 70 caractères maximum')
    .regex(/^[^\r\n]*$/, 'Bénéficiaire sur une seule ligne'),
  iban: z.string().transform(compact).refine(isValidIban, 'IBAN invalide'),
  bic: z
    .string()
    .transform(compact)
    .refine((bic) => bic === '' || isValidBic(bic), 'BIC invalide')
    .transform((bic) => bic || undefined)
    .optional(),
});

export type PaymentSettingsInput = z.input<typeof PaymentSettingsSchema>;

/** The club account, or null while not configured. */
export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  if (isMockMode) return mockPaymentSettings;
  const snapshot = await getAdminDatabase().ref(SETTINGS_PATH).once('value');
  return snapshot.exists() ? (snapshot.val() as PaymentSettings) : null;
}

/** Validates (ISO 13616 IBAN, beneficiary ≤ 70 chars; throws ZodError) and saves. */
export async function savePaymentSettings(input: PaymentSettingsInput): Promise<PaymentSettings> {
  const parsed = PaymentSettingsSchema.parse(input);
  const settings: PaymentSettings = JSON.parse(
    JSON.stringify({ ...parsed, updatedAt: new Date().toISOString() })
  );
  if (isMockMode) {
    mockPaymentSettings = settings;
    return settings;
  }
  await getAdminDatabase().ref(SETTINGS_PATH).set(settings);
  return settings;
}
