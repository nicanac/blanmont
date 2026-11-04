'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/app/lib/auth/session';
import {
  deleteEquipmentOrder,
  updateEquipmentOrderStatus,
  ORDER_STATUSES,
} from '@/app/lib/firebase/equipment-orders';
import type { EquipmentOrderStatus } from '@/app/types/equipment';

type ActionResult = { success: boolean; error?: string };

export async function updateOrderStatusAction(
  id: string,
  status: EquipmentOrderStatus
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    if (!id || !ORDER_STATUSES.includes(status)) {
      return { success: false, error: 'Paramètres invalides' };
    }
    const ok = await updateEquipmentOrderStatus(id, status);
    if (!ok) return { success: false, error: 'Commande introuvable' };
    revalidatePath('/admin/commandes');
    return { success: true };
  } catch (error) {
    console.error('Error in updateOrderStatusAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
  }
}

export async function deleteOrderAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
    if (!id) return { success: false, error: 'Identifiant manquant' };
    const ok = await deleteEquipmentOrder(id);
    if (!ok) return { success: false, error: 'Commande introuvable' };
    revalidatePath('/admin/commandes');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteOrderAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
  }
}
