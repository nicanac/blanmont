'use server';

import { requireSectionAccess } from '@/app/lib/auth/admin-access';
import { getPaymentSettings } from '@/app/lib/firebase/payment-settings';
import type { PaymentSettings } from '@/app/types/equipment';

/** Initial values for the client-side payment card (shown on /admin/commandes/banque). */
export async function getPaymentSettingsAction(): Promise<PaymentSettings | null> {
  await requireSectionAccess('commandes');
  return getPaymentSettings();
}
