'use server';

import { revalidatePath } from 'next/cache';
import {
  updateTrialRequestStatus,
  updateTrialRequest,
  deleteTrialRequest,
  convertTrialRequestToMember,
} from '@/app/lib/firebase/trial-requests';
import { TrialRideStatus, Member } from '@/app/types';
import { requireSectionAccess } from '@/app/lib/auth/admin-access';
import { isSessionAdmin } from '@/app/lib/auth/session';

export async function updateProspectStatusAction(
  id: string,
  status: TrialRideStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSectionAccess('prospects');
    if (!id) return { success: false, error: 'Identifiant manquant' };
    const success = await updateTrialRequestStatus(id, status);
    if (!success) {
      return { success: false, error: 'Échec de la mise à jour du statut' };
    }
    revalidatePath('/admin/prospects');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error in updateProspectStatusAction:', error);
    return { success: false, error: 'Erreur lors de la mise à jour du statut' };
  }
}

export async function updateProspectDetailsAction(
  id: string,
  data: {
    adminNotes?: string;
    mentorCaptainId?: string;
    mentorCaptainName?: string;
    status?: TrialRideStatus;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSectionAccess('prospects');
    if (!id) return { success: false, error: 'Identifiant manquant' };
    const success = await updateTrialRequest(id, data);
    if (!success) {
      return { success: false, error: 'Échec de la sauvegarde des informations' };
    }
    revalidatePath('/admin/prospects');
    return { success: true };
  } catch (error) {
    console.error('Error in updateProspectDetailsAction:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}

export async function convertProspectToMemberAction(
  id: string,
  overrides?: Partial<Member>
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  try {
    const session = await requireSectionAccess('prospects');
    if (!id) return { success: false, error: 'Identifiant manquant' };
    // Overrides can carry roles or identity fields: admin-only, like role assignment.
    if (overrides && !isSessionAdmin(session)) {
      return { success: false, error: 'Seul un administrateur peut personnaliser la fiche du nouveau membre (rôles, e-mail).' };
    }
    const res = await convertTrialRequestToMember(id, overrides);
    if (!res.success) {
      return { success: false, error: res.error || 'Échec de la conversion en membre' };
    }
    revalidatePath('/admin/prospects');
    revalidatePath('/admin/members');
    revalidatePath('/admin');
    return res;
  } catch (error) {
    console.error('Error in convertProspectToMemberAction:', error);
    return { success: false, error: 'Erreur lors de la conversion' };
  }
}

export async function deleteProspectAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSectionAccess('prospects');
    if (!id) return { success: false, error: 'Identifiant manquant' };
    const success = await deleteTrialRequest(id);
    if (!success) {
      return { success: false, error: 'Échec de la suppression' };
    }
    revalidatePath('/admin/prospects');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteProspectAction:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
