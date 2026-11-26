'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/app/lib/auth/session';
import { getEquipmentById } from '@/app/lib/firebase/equipment';
import { createEquipmentOrder } from '@/app/lib/firebase/equipment-orders';
import { getEquipmentCampaign, isCampaignOpen } from '@/app/lib/firebase/equipment-campaigns';
import { getPaymentSettings } from '@/app/lib/firebase/payment-settings';
import { buildEpcPayload } from '@/app/lib/payments/epc';
import { RecordIdSchema } from '@/app/lib/validation';
import { ValidationError } from '@/app/lib/errors';
import { EQUIPMENT_DATA } from '@/app/data/equipment';
import type { EquipmentOrder } from '@/app/types/equipment';

const OrderInputSchema = z.object({
  productId: z.string().min(1).max(100),
  size: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(20),
  memberPhone: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(1000).optional(),
  source: z.enum(['stock', 'campaign'], { error: 'Choisissez le stock ou la commande groupée' }),
  campaignId: RecordIdSchema.optional(),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional(),
});

export type SubmitOrderResult =
  | {
      success: true;
      orderId: string;
      total: number;
      /** 12-digit OGM, unformatted. */
      paymentReference: string;
      /** EPC QR text, or null while the club account is not configured. */
      epcPayload: string | null;
    }
  | { success: false; error: string };

/**
 * Saves a club equipment order for the logged-in member. Identity comes from the session;
 * price, stock and campaign state are read server-side, never trusted from the client.
 */
export async function submitEquipmentOrderAction(input: unknown): Promise<SubmitOrderResult> {
  const session = await getSessionUser();
  if (!session) return { success: false, error: 'Connectez-vous pour commander' };

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

  if (data.source === 'campaign') {
    const campaign = data.campaignId ? await getEquipmentCampaign(data.campaignId) : null;
    if (!campaign) return { success: false, error: 'Commande groupée introuvable' };
    if (!isCampaignOpen(campaign)) {
      return { success: false, error: 'Cette commande groupée est clôturée' };
    }
    if (!campaign.equipmentIds.includes(product.id)) {
      return { success: false, error: 'Cet article ne fait pas partie de la commande groupée' };
    }
  }

  let order: EquipmentOrder;
  const total = Math.round(product.price * data.quantity * 100) / 100;
  try {
    order = await createEquipmentOrder({
      memberId: session.id,
      memberName: session.name,
      memberEmail: session.email ?? '',
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
      source: data.source,
      campaignId: data.source === 'campaign' ? data.campaignId : undefined,
    });
  } catch (error) {
    if (error instanceof ValidationError) return { success: false, error: error.message };
    console.error('Error in submitEquipmentOrderAction:', error);
    return {
      success: false,
      error: 'Impossible d’enregistrer la commande. Réessayez ou envoyez-la par email.',
    };
  }

  // The order exists from here on: a payment-card problem must not report a failure.
  let epcPayload: string | null = null;
  try {
    const settings = await getPaymentSettings();
    if (settings) {
      epcPayload = buildEpcPayload({
        ...settings,
        amountEur: total,
        reference: order.paymentReference as string,
      });
    }
  } catch (error) {
    console.error('Error building the EPC payload:', error);
  }

  revalidatePath('/admin/commandes');
  revalidatePath('/profile/commandes');
  revalidatePath('/le-club/equipement');
  return {
    success: true,
    orderId: order.id,
    total,
    paymentReference: order.paymentReference as string,
    epcPayload,
  };
}
