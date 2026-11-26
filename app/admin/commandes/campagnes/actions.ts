'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminSession } from '@/app/lib/auth/session';
import {
  createEquipmentCampaign,
  transitionEquipmentCampaign,
} from '@/app/lib/firebase/equipment-campaigns';
import { markOrderDelivered } from '@/app/lib/firebase/equipment-orders';
import { RecordIdSchema } from '@/app/lib/validation';

type ActionResult = { success: boolean; error?: string };

/** A size used as an RTDB key (no '/', '.', '#', '$', '[' or ']'). */
const SizeSchema = z.string().regex(/^[^./#$[\]]{1,20}$/, 'Taille invalide');

const CampaignInputSchema = z
  .object({
    title: z.string().trim().min(2, 'Titre requis').max(100, 'Titre trop long'),
    equipmentIds: z.array(RecordIdSchema).min(1, 'Choisissez au moins un article').max(50),
    /** ISO date-time; send new Date(localValue).toISOString() from a datetime-local input. */
    closesAt: z
      .string()
      .refine((value) => Date.parse(value) > Date.now(), 'La clôture doit être dans le futur'),
    extraStock: z
      .record(RecordIdSchema, z.record(SizeSchema, z.number().int().min(0).max(999)))
      .optional(),
  })
  .refine(
    (data) => Object.keys(data.extraStock ?? {}).every((id) => data.equipmentIds.includes(id)),
    'Le stock supplémentaire doit porter sur les articles de la campagne'
  );

const NextStatusSchema = z.enum(['closed', 'ordered', 'received']);

function revalidateCampaigns(): void {
  revalidatePath('/admin/commandes/campagnes');
  revalidatePath('/admin/commandes/campagnes/[id]', 'page');
  revalidatePath('/admin/commandes');
  revalidatePath('/le-club/equipement');
  revalidatePath('/checkout');
  revalidatePath('/profile/commandes');
}

function fail(name: string, error: unknown): { success: false; error: string } {
  console.error(`Error in ${name}:`, error);
  return { success: false, error: error instanceof Error ? error.message : 'Erreur' };
}

export async function createCampaignAction(
  input: unknown
): Promise<{ success: true; campaignId: string } | { success: false; error: string }> {
  try {
    await requireAdminSession();
    const parsed = CampaignInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Données invalides' };
    }
    const campaign = await createEquipmentCampaign(parsed.data);
    revalidateCampaigns();
    return { success: true, campaignId: campaign.id };
  } catch (error) {
    return fail('createCampaignAction', error);
  }
}

/** One step forward: 'closed', then 'ordered' (Gobik), then 'received' (adds extra stock). */
export async function transitionCampaignAction(
  id: string,
  next: 'closed' | 'ordered' | 'received'
): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const parsedId = RecordIdSchema.safeParse(id);
    const parsedNext = NextStatusSchema.safeParse(next);
    if (!parsedId.success || !parsedNext.success) {
      return { success: false, error: 'Paramètres invalides' };
    }
    await transitionEquipmentCampaign(parsedId.data, parsedNext.data);
    revalidateCampaigns();
    return { success: true };
  } catch (error) {
    return fail('transitionCampaignAction', error);
  }
}

/** Distribution checklist: one member's order handed over. */
export async function markCampaignOrderDeliveredAction(orderId: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
    const parsed = RecordIdSchema.safeParse(orderId);
    if (!parsed.success) return { success: false, error: 'Paramètres invalides' };
    await markOrderDelivered(parsed.data);
    revalidateCampaigns();
    return { success: true };
  } catch (error) {
    return fail('markCampaignOrderDeliveredAction', error);
  }
}
