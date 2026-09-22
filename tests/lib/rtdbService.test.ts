import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchCollection,
  fetchRecord,
  saveRecord,
  updateRecord,
  deleteRecord,
  createRecord,
} from '@/app/lib/firebase/rtdbService';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock client isMockMode as false
vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
    snapshotToObject: vi.fn((snap, id) => {
      return snap.exists() ? { id, ...snap.val() } : null;
    }),
  };
});

describe('rtdbService (Generic Firebase Realtime Database Service Layer)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchCollection', () => {
    it('returns array of records matching path and applies filter and sort', async () => {
      const mockChildren = [
        { key: 'item-2', val: () => ({ name: 'Bravo', rank: 2 }) },
        { key: 'item-1', val: () => ({ name: 'Alpha', rank: 1 }) },
        { key: 'item-3', val: () => ({ name: 'Charlie', rank: 3 }) },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockChildren.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const items = await fetchCollection<{ id: string; name: string; rank: number }>(
        'test-collection',
        {
          filter: (i) => i.rank <= 2,
          sort: (a, b) => a.rank - b.rank,
        }
      );

      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('Alpha');
      expect(items[1].name).toBe('Bravo');
      expect(refMock).toHaveBeenCalledWith('test-collection');
    });

    it('returns empty array when collection does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const items = await fetchCollection('non-existent');
      expect(items).toEqual([]);
    });

    it('handles exceptions gracefully and returns empty array', async () => {
      const onceMock = vi.fn().mockRejectedValue(new Error('Network timeout'));
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const items = await fetchCollection('error-path');
      expect(items).toEqual([]);
    });
  });

  describe('fetchRecord', () => {
    it('returns single record with id when snapshot exists', async () => {
      const snapshot = {
        exists: () => true,
        val: () => ({ title: 'Test Trace', distance: 75 }),
      };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const record = await fetchRecord<{ id: string; title: string; distance: number }>(
        'traces',
        'trace-123'
      );
      expect(record).toEqual({ id: 'trace-123', title: 'Test Trace', distance: 75 });
      expect(refMock).toHaveBeenCalledWith('traces/trace-123');
    });

    it('returns null when record does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const record = await fetchRecord('traces', 'missing-id');
      expect(record).toBeNull();
    });
  });

  describe('saveRecord & updateRecord & deleteRecord', () => {
    it('calls db.ref(path/id).set(data)', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await saveRecord('items', 'it-1', { foo: 'bar' });
      expect(refMock).toHaveBeenCalledWith('items/it-1');
      expect(setMock).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('calls db.ref(path/id).update(data)', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await updateRecord('items', 'it-1', { foo: 'baz' });
      expect(refMock).toHaveBeenCalledWith('items/it-1');
      expect(updateMock).toHaveBeenCalledWith({ foo: 'baz' });
    });

    it('calls db.ref(path/id).remove()', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await deleteRecord('items', 'it-1');
      expect(refMock).toHaveBeenCalledWith('items/it-1');
      expect(removeMock).toHaveBeenCalled();
    });

    it('createRecord creates record with generated id and returns it', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const id = await createRecord('items', { note: 'hello' }, 'custom');
      expect(id).toMatch(/^custom_\d+$/);
      expect(refMock).toHaveBeenCalledWith(`items/${id}`);
      expect(setMock).toHaveBeenCalledWith({ note: 'hello' });
    });
  });
});
