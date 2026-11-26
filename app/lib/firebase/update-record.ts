import { isMockMode } from './client';
import { getAdminDatabase } from './admin';

/**
 * Atomic read-modify-write of the record `${path}/${id}` (RTDB transaction; the mock
 * store in mock mode). `apply` throws to refuse the change, and that error is rethrown.
 * Returns null when the record does not exist.
 */
export async function updateRecord<T extends { id: string }>(
  mockStore: T[],
  path: string,
  id: string,
  apply: (current: T) => T
): Promise<T | null> {
  // JSON round-trip drops undefined fields: RTDB refuses them, and dropping deletes the key.
  const next = (current: T): T => JSON.parse(JSON.stringify(apply(current)));

  if (isMockMode) {
    const index = mockStore.findIndex((record) => record.id === id);
    if (index < 0) return null;
    mockStore[index] = next(mockStore[index]);
    return mockStore[index];
  }

  const state: { refusal?: unknown } = {};
  const { committed, snapshot } = await getAdminDatabase()
    .ref(`${path}/${id}`)
    .transaction((current: T | null) => {
      state.refusal = undefined;
      // The first call may see null before the server value is known: writing null is a
      // no-op when the record is really missing, otherwise the server retries with the value.
      if (current === null) return null;
      try {
        return next({ ...current, id });
      } catch (error) {
        state.refusal = error;
        return undefined; // abort
      }
    });
  if (state.refusal) throw state.refusal;
  return committed && snapshot.exists() ? { ...(snapshot.val() as T), id } : null;
}
