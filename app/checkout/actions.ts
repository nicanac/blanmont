'use server';

import { z } from 'zod';
import { getEquipmentById } from '@/app/lib/firebase/equipment';
import { createEquipmentOrder } from '@/app/lib/firebase/equipment-orders';
import { EQUIPMENT_DATA } from '@/app/data/equipment';

const OrderInputSchema = z.object({
  productId: z.string().min(1).max(100),
  size: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(20),
  memberName: z.string().trim().min(2, 'Nom requis').max(100),
  memberEmail: z.string().trim().email('Email invalide').max(200),
  memberPhone: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(1000).optional(),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional(),
});

export type SubmitOrderResult =
  | { success: true; orderId: string; total: number }
  | { success: false; error: string };

/**
 * Saves a club equipment order. Price and availability are read server-side,
 * never trusted from the client.
 */
export async function submitEquipmentOrderAction(input: unknown): Promise<SubmitOrderResult> {
  const parsed = OrderInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Données invalides' };
  }
  const data = parsed.data;

  const product =
    (await getEquipmentById(data.productId)) ||
    EQUIPMENT_DATA.find((item) => item.id === data.productId) ||
    null;

  if (!product) return { success: false, error: 'Article introuvable' };
  if (!product.isAvailable) return { success: false, error: 'Cet article n’est plus disponible' };
  if (!product.sizes.includes(data.size)) return { success: false, error: 'Taille invalide' };

  try {
    const total = Math.round(product.price * data.quantity * 100) / 100;
    const order = await createEquipmentOrder({
      memberName: data.memberName,
      memberEmail: data.memberEmail,
      memberPhone: data.memberPhone || undefined,
      items: [
        {
          equipmentId: product.id,
          equipmentName: product.name,
          size: data.size,
          quantity: data.quantity,
          unitPrice: product.price,
        },
      ],
      totalPrice: total,
      notes: data.notes || undefined,
    });
    return { success: true, orderId: order.id, total };
  } catch (error) {
    console.error('Error in submitEquipmentOrderAction:', error);
    return {
      success: false,
      error: 'Impossible d’enregistrer la commande. Réessayez ou envoyez-la par email.',
    };
  }
}
