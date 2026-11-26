'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/app/lib/auth/session';
import { PaymentSettingsSchema, savePaymentSettings } from '@/app/lib/firebase/payment-settings';

/** Club bank account for the payment card and EPC QR: { beneficiary, iban, bic? }. */
export async function savePaymentSettingsAction(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();
    const parsed = PaymentSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Données invalides' };
    }
    await savePaymentSettings(parsed.data);
    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
    revalidatePath('/profile/commandes');
    return { success: true };
  } catch (error) {
    console.error('Error in savePaymentSettingsAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
  }
}
