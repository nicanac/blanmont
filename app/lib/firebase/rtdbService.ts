import {
  isMockMode,
  getFirebaseDatabase,
  ref,
  get,
  set,
  update,
  remove,
  snapshotToArray,
  snapshotToObject,
} from './client';

/**
 * Universal isomorphic snapshot reader that transparently handles both
 * Node.js server (Firebase Admin SDK) and browser client (Firebase Web SDK).
 */
export async function getIsomorphicSnapshot(path: string): Promise<any> {
  if (typeof window === 'undefined') {
    const { getAdminDatabase } = await import('./admin');
    const db = getAdminDatabase();
    return await db.ref(path).once('value');
  } else {
    const db = getFirebaseDatabase();
    const dbRef = ref(db, path);
    return await get(dbRef);
  }
}

export interface FetchCollectionOptions<T> {
  filter?: (item: T) => boolean;
  sort?: (a: T, b: T) => number;
}

/**
 * Fetches an entire collection from Firebase RTDB isomorphically.
 */
export async function fetchCollection<T>(
  path: string,
  options?: FetchCollectionOptions<T>
): Promise<T[]> {
  if (isMockMode) return [];

  try {
    const snapshot = await getIsomorphicSnapshot(path);
    if (!snapshot.exists()) return [];

    let items = snapshotToArray<T>(snapshot);

    if (options?.filter) {
      items = items.filter(options.filter);
    }

    if (options?.sort) {
      items = items.sort(options.sort);
    }

    return items;
  } catch (error) {
    console.error(`[rtdbService] Error fetching collection from "${path}":`, error);
    return [];
  }
}

/**
 * Fetches a single record by ID from Firebase RTDB isomorphically.
 */
export async function fetchRecord<T>(path: string, id: string): Promise<T | null> {
  if (isMockMode || !id) return null;

  try {
    const snapshot = await getIsomorphicSnapshot(`${path}/${id}`);
    if (!snapshot.exists()) return null;

    return snapshotToObject<T>(snapshot, id);
  } catch (error) {
    console.error(`[rtdbService] Error fetching record from "${path}/${id}":`, error);
    return null;
  }
}

/**
 * Saves (overwrites) a record in Firebase RTDB isomorphically.
 */
export async function saveRecord<T extends Record<string, unknown>>(
  path: string,
  id: string,
  data: T
): Promise<void> {
  if (isMockMode) {
    console.log(`[rtdbService:mock] saveRecord ${path}/${id}`, data);
    return;
  }

  try {
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      await db.ref(`${path}/${id}`).set(data);
    } else {
      const db = getFirebaseDatabase();
      const targetRef = ref(db, `${path}/${id}`);
      await set(targetRef, data);
    }
  } catch (error) {
    console.error(`[rtdbService] Error saving record to "${path}/${id}":`, error);
    throw error;
  }
}

/**
 * Updates (shallow merge) a record in Firebase RTDB isomorphically.
 */
export async function updateRecord<T extends Record<string, unknown>>(
  path: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  if (isMockMode) {
    console.log(`[rtdbService:mock] updateRecord ${path}/${id}`, data);
    return;
  }

  try {
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      await db.ref(`${path}/${id}`).update(data);
    } else {
      const db = getFirebaseDatabase();
      const targetRef = ref(db, `${path}/${id}`);
      await update(targetRef, data);
    }
  } catch (error) {
    console.error(`[rtdbService] Error updating record in "${path}/${id}":`, error);
    throw error;
  }
}

/**
 * Deletes a record from Firebase RTDB isomorphically.
 */
export async function deleteRecord(path: string, id: string): Promise<void> {
  if (isMockMode) {
    console.log(`[rtdbService:mock] deleteRecord ${path}/${id}`);
    return;
  }

  try {
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      await db.ref(`${path}/${id}`).remove();
    } else {
      const db = getFirebaseDatabase();
      const targetRef = ref(db, `${path}/${id}`);
      await remove(targetRef);
    }
  } catch (error) {
    console.error(`[rtdbService] Error deleting record from "${path}/${id}":`, error);
    throw error;
  }
}

/**
 * Generates an ID and creates a new record in Firebase RTDB.
 */
export async function createRecord<T extends Record<string, unknown>>(
  path: string,
  data: T,
  idPrefix?: string
): Promise<string> {
  const id = `${idPrefix || path}_${Date.now()}`;
  await saveRecord(path, id, data);
  return id;
}
