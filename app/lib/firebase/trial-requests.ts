import { TrialRideRequest } from '../../types';
import { isMockMode, getFirebaseDatabase, ref, get, set, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';

const MOCK_TRIAL_REQUESTS: TrialRideRequest[] = [
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
    createdAt: new Date().toISOString(),
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
    MOCK_TRIAL_REQUESTS.push(record);
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

export async function updateTrialRequestStatus(
  id: string,
  status: TrialRideRequest['status']
): Promise<boolean> {
  if (isMockMode) {
    const req = MOCK_TRIAL_REQUESTS.find((r) => r.id === id);
    if (req) {
      req.status = status;
      return true;
    }
    return false;
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    if (typeof window === 'undefined') {
      await (db as any).ref(`trial-requests/${id}/status`).set(status);
    } else {
      await set(ref(db as any, `trial-requests/${id}/status`), status);
    }
    return true;
  } catch (error) {
    console.error('Failed to update trial request status:', error);
    return false;
  }
}
