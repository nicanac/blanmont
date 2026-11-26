'use server';

import { requireAdminSession } from '@/app/lib/auth/session';
import { getPaymentSettings } from '@/app/lib/firebase/payment-settings';
import type { PaymentSettings } from '@/app/types/equipment';

/** Initial values for the client-side payment card (the settings page is a client component). */
export async function getPaymentSettingsAction(): Promise<PaymentSettings | null> {
  await requireAdminSession();
  return getPaymentSettings();
}
