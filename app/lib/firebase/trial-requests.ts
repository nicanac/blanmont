import { TrialRideRequest, Member } from '../../types';
import { isMockMode, getFirebaseDatabase, ref, get, set, update, remove, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';

export const MOCK_TRIAL_REQUESTS: TrialRideRequest[] = [
  {
    id: 'trial-req-1',
    name: 'Maxime De Clercq',
    email: 'maxime.declercq@example.be',
    phone: '+32 471 23 45 67',
    preferredGroup: 'B',
    bikeType: 'Route',
    experienceLevel: 'Intermédiaire',
    firstRideDate: '2026-09-19',
    message: 'Bonjour, je roule régulièrement en solo (26 km/h) et souhaite découvrir les sorties de groupe.',
    status: 'pending',
    createdAt: '2026-09-15T09:30:00.000Z',
  },
  {
    id: 'trial-req-2',
    name: 'Camille Lambert',
    email: 'camille.lambert@example.be',
    phone: '+32 475 88 99 00',
    preferredGroup: 'C',
    bikeType: 'Gravel',
    experienceLevel: 'Débutant',
    firstRideDate: '2026-09-26',
    message: 'Reprise du vélo après quelques années, je cherche un groupe convivial et bienveillant.',
    status: 'contacted',
    mentorCaptainName: 'Marc V.',
    adminNotes: 'Contactée par WhatsApp le 18/09. Très motivée, viendra avec son gravel.',
    contactedAt: '2026-09-18T14:10:00.000Z',
    createdAt: '2026-09-17T11:15:00.000Z',
  },
  {
    id: 'trial-req-3',
    name: 'Laurent Wouters',
    email: 'laurent.wouters@example.be',
    phone: '+32 479 11 22 33',
    preferredGroup: 'A',
    bikeType: 'Route',
    experienceLevel: 'Confirmé',
    firstRideDate: '2026-09-12',
    message: 'Habitué aux sorties longues (90-110 km) à plus de 29 km/h de moyenne.',
    status: 'ride_1',
    mentorCaptainName: 'Philippe B.',
    adminNotes: 'Première sortie réussie avec le groupe A le 12/09. Bon niveau technique.',
    createdAt: '2026-09-08T16:45:00.000Z',
  },
];

export async function createTrialRequest(
  data: Omit<TrialRideRequest, 'id' | 'status' | 'createdAt'>
): Promise<TrialRideRequest> {
  const newId = `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: TrialRideRequest = {
    ...data,
    id: newId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isMockMode) {
    MOCK_TRIAL_REQUESTS.unshift(record);
    return record;
  }

  const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();

  if (typeof window === 'undefined') {
    await (db as any).ref(`trial-requests/${newId}`).set(record);
  } else {
    await set(ref(db as any, `trial-requests/${newId}`), record);
  }

  return record;
}

export async function getTrialRequests(): Promise<TrialRideRequest[]> {
  if (isMockMode) {
    return [...MOCK_TRIAL_REQUESTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref('trial-requests').once('value');
    } else {
      snapshot = await get(ref(db as any, 'trial-requests'));
    }

    if (!snapshot.exists()) return [];

    const requests = snapshotToArray<TrialRideRequest>(snapshot);
    return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Failed to fetch trial requests:', error);
    return [];
  }
}

export async function getTrialRequestById(id: string): Promise<TrialRideRequest | null> {
  if (isMockMode) {
    const found = MOCK_TRIAL_REQUESTS.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref(`trial-requests/${id}`).once('value');
    } else {
      snapshot = await get(ref(db as any, `trial-requests/${id}`));
    }

    if (!snapshot.exists()) return null;
    const val = typeof snapshot.val === 'function' ? snapshot.val() : snapshot;
    return { id, ...val };
  } catch (error) {
    console.error(`Failed to fetch trial request ${id}:`, error);
    return null;
  }
}

export async function updateTrialRequest(
  id: string,
  updates: Partial<TrialRideRequest>
): Promise<boolean> {
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isMockMode) {
    const index = MOCK_TRIAL_REQUESTS.findIndex((r) => r.id === id);
    if (index >= 0) {
      MOCK_TRIAL_REQUESTS[index] = {
        ...MOCK_TRIAL_REQUESTS[index],
        ...payload,
      };
      return true;
    }
    return false;
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    if (typeof window === 'undefined') {
      await (db as any).ref(`trial-requests/${id}`).update(payload);
    } else {
      await update(ref(db as any, `trial-requests/${id}`), payload);
    }
    return true;
  } catch (error) {
    console.error(`Failed to update trial request ${id}:`, error);
    return false;
  }
}

export async function updateTrialRequestStatus(
  id: string,
  status: TrialRideRequest['status']
): Promise<boolean> {
  const updates: Partial<TrialRideRequest> = { status };
  if (status === 'contacted') {
    updates.contactedAt = new Date().toISOString();
  }

  if (isMockMode) {
    const req = MOCK_TRIAL_REQUESTS.find((r) => r.id === id);
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();
      if (status === 'contacted' && !req.contactedAt) {
        req.contactedAt = updates.contactedAt;
      }
      return true;
    }
    return false;
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    if (typeof window === 'undefined') {
      await (db as any).ref(`trial-requests/${id}/status`).set(status);
      if (updates.contactedAt) {
        await (db as any).ref(`trial-requests/${id}/contactedAt`).set(updates.contactedAt);
      }
      await (db as any).ref(`trial-requests/${id}/updatedAt`).set(new Date().toISOString());
    } else {
      await set(ref(db as any, `trial-requests/${id}/status`), status);
      if (updates.contactedAt) {
        await set(ref(db as any, `trial-requests/${id}/contactedAt`), updates.contactedAt);
      }
      await set(ref(db as any, `trial-requests/${id}/updatedAt`), new Date().toISOString());
    }
    return true;
  } catch (error) {
    console.error('Failed to update trial request status:', error);
    return false;
  }
}

export async function deleteTrialRequest(id: string): Promise<boolean> {
  if (isMockMode) {
    const index = MOCK_TRIAL_REQUESTS.findIndex((r) => r.id === id);
    if (index >= 0) {
      MOCK_TRIAL_REQUESTS.splice(index, 1);
      return true;
    }
    return false;
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    if (typeof window === 'undefined') {
      await (db as any).ref(`trial-requests/${id}`).remove();
    } else {
      await remove(ref(db as any, `trial-requests/${id}`));
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete trial request ${id}:`, error);
    return false;
  }
}

export async function convertTrialRequestToMember(
  id: string,
  memberOverrides?: Partial<Member>
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  try {
    const prospect = await getTrialRequestById(id);
    if (!prospect) {
      return { success: false, error: 'Demande de sortie d\'essai introuvable' };
    }

    const newMemberId = `member_${Date.now()}`;
    const newMemberData: Member = {
      id: newMemberId,
      name: prospect.name,
      email: prospect.email,
      phone: prospect.phone,
      role: ['Membre'],
      bio: prospect.message || `Candidat issu des sorties d'essai (Groupe ${prospect.preferredGroup} - ${prospect.bikeType}).`,
      photoUrl: '',
      ...memberOverrides,
    };

    if (isMockMode) {
      await updateTrialRequest(id, {
        status: 'converted',
        convertedMemberId: newMemberId,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, memberId: newMemberId };
    }

    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();

    // Create member record in /members
    if (typeof window === 'undefined') {
      await (db as any).ref(`members/${newMemberId}`).set({
        ...newMemberData,
        createdAt: new Date().toISOString(),
      });
    } else {
      await set(ref(db as any, `members/${newMemberId}`), {
        ...newMemberData,
        createdAt: new Date().toISOString(),
      });
    }

    // Update trial request status to 'converted'
    await updateTrialRequest(id, {
      status: 'converted',
      convertedMemberId: newMemberId,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, memberId: newMemberId };
  } catch (error) {
    console.error(`Failed to convert trial request ${id} to member:`, error);
    return { success: false, error: String(error) };
  }
}
