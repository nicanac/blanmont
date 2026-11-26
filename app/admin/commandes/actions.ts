'use server';

import { revalidatePath } from 'next/cache';
import { requireSectionAccess } from '@/app/lib/auth/admin-access';
import {
  cancelEquipmentOrder,
  clubToday,
  deleteEquipmentOrder,
  markOrderDelivered,
  markOrderPaid,
  updateEquipmentOrderStatus,
} from '@/app/lib/firebase/equipment-orders';
import { RecordIdSchema } from '@/app/lib/validation';
import type { EquipmentOrderStatus } from '@/app/types/equipment';

type ActionResult = { success: boolean; error?: string };

function revalidateOrders(): void {
  revalidatePath('/admin/commandes');
  revalidatePath('/admin/commandes/campagnes/[id]', 'page');
  revalidatePath('/profile/commandes');
  revalidatePath('/le-club/equipement');
}

/** Runs an admin order mutation: auth, id validation, revalidation, French error. */
async function runOrderAction(
  name: string,
  id: unknown,
  mutate: (id: string) => Promise<unknown>
): Promise<ActionResult> {
  try {
    await requireSectionAccess('commandes');
    const parsed = RecordIdSchema.safeParse(id);
    if (!parsed.success) return { success: false, error: 'Paramètres invalides' };
    await mutate(parsed.data);
    revalidateOrders();
    return { success: true };
  } catch (error) {
    console.error(`Error in ${name}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
  }
}

/** Status select of the orders table; only the allowed transitions pass. */
export async function updateOrderStatusAction(
  id: string,
  status: EquipmentOrderStatus
): Promise<ActionResult> {
  return runOrderAction('updateOrderStatusAction', id, (orderId) =>
    updateEquipmentOrderStatus(orderId, status)
  );
}

/** Manual payment (cash, or a transfer seen outside the CODA import): paid today. */
export async function markOrderPaidAction(id: string): Promise<ActionResult> {
  return runOrderAction('markOrderPaidAction', id, (orderId) =>
    markOrderPaid(orderId, clubToday())
  );
}

/** Handed over to the member ("Remis"). */
export async function markOrderDeliveredAction(id: string): Promise<ActionResult> {
  return runOrderAction('markOrderDeliveredAction', id, markOrderDelivered);
}

/** Cancels the order; a stock order returns its units to stock. Refunds happen outside the app. */
export async function cancelOrderAction(id: string): Promise<ActionResult> {
  return runOrderAction('cancelOrderAction', id, cancelEquipmentOrder);
}

export async function deleteOrderAction(id: string): Promise<ActionResult> {
  return runOrderAction('deleteOrderAction', id, async (orderId) => {
    if (!(await deleteEquipmentOrder(orderId))) throw new Error('Commande introuvable');
  });
}
