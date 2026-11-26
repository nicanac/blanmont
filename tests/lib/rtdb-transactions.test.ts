import { describe, expect, it, vi } from 'vitest';

const { store } = vi.hoisted(() => ({ store: {} as Record<string, unknown> }));

/** Mimics the RTDB transaction protocol: a first call on the (empty) local cache, then a retry with the server value when it differs. */
function fakeRef(path: string) {
  return {
    transaction: async (update: (current: unknown) => unknown) => {
      const server = store[path] ?? null;
      let next = update(null);
      if (server !== null) next = update(structuredClone(server));
      if (next === undefined) {
        return { committed: false, snapshot: { val: () => server, exists: () => server !== null } };
      }
      store[path] = next;
      return { committed: true, snapshot: { val: () => next, exists: () => next !== null } };
    },
  };
}

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
vi.mock('@/app/lib/firebase/client', () => ({ isMockMode: false, snapshotToArray: vi.fn() }));
vi.mock('@/app/lib/firebase/admin', () => ({ getAdminDatabase: () => ({ ref: fakeRef }) }));

import { adjustEquipmentStock } from '@/app/lib/firebase/equipment';
import { updateRecord } from '@/app/lib/firebase/update-record';

describe('RTDB transactions (Admin SDK path)', () => {
  it('reserves stock only when enough is left', async () => {
    store['equipment/j/stock/M'] = 2;
    expect(await adjustEquipmentStock('j', 'M', -2)).toBe(true);
    expect(store['equipment/j/stock/M']).toBe(0);
    expect(await adjustEquipmentStock('j', 'M', -1)).toBe(false);
    expect(store['equipment/j/stock/M']).toBe(0);

    expect(await adjustEquipmentStock('j', 'XL', -1)).toBe(false);
    expect(await adjustEquipmentStock('j', 'XL', 3)).toBe(true);
    expect(store['equipment/j/stock/XL']).toBe(3);
  });

  it('updates an existing record, refuses through apply and reports a missing one', async () => {
    store['things/a'] = { id: 'a', status: 'open', note: 'x' };
    const updated = await updateRecord([], 'things', 'a', (t: { id: string; status: string; note?: string }) => ({
      ...t,
      status: 'closed',
      note: undefined,
    }));
    expect(updated).toEqual({ id: 'a', status: 'closed' });

    await expect(
      updateRecord([], 'things', 'a', () => {
        throw new Error('refused');
      })
    ).rejects.toThrow('refused');
    expect(await updateRecord([], 'things', 'missing', (t) => t)).toBeNull();
  });
});
