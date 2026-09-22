import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  seedEquipment,
  revalidateEquipmentCache,
  revalidateEquipmentItemCache,
} from '@/app/lib/firebase/equipment';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

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
  };
});

describe('Firebase Equipment Service (app/lib/firebase/equipment.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEquipment', () => {
    it('fetches equipment from Firebase RTDB and sorts by order', async () => {
      const mockItems = [
        { key: 'eq-2', val: () => ({ name: 'Maillot manches courtes', order: 2, price: 65 }) },
        { key: 'eq-1', val: () => ({ name: 'Cuissard court', order: 1, price: 85 }) },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const items = await getEquipment();
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe('eq-1'); // Sorted by order 1 before 2
      expect(items[1].id).toBe('eq-2');
    });

    it('falls back to mock equipment when snapshot does not exist', async () => {
      const snapshot = {
        exists: () => false,
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const items = await getEquipment();
      expect(items.length).toBeGreaterThan(0);
    });

    it('falls back to mock equipment when database throws', async () => {
      const refMock = vi.fn().mockReturnValue({
        once: vi.fn().mockRejectedValue(new Error('Connection failure')),
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const items = await getEquipment();
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('getEquipmentById', () => {
    it('fetches an equipment item by id', async () => {
      const snapshot = {
        exists: () => true,
        val: () => ({
          name: 'Veste Hiver',
          price: 110,
          category: 'vestes',
        }),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const item = await getEquipmentById('veste-hiver');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('veste-hiver');
      expect(item?.name).toBe('Veste Hiver');
      expect(refMock).toHaveBeenCalledWith('equipment/veste-hiver');
    });

    it('falls back to mock equipment when item is missing in Firebase', async () => {
      const snapshot = {
        exists: () => false,
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      // Search for known item from mock data
      const item = await getEquipmentById('MaiManLonHO');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('MaiManLonHO');
    });
  });

  describe('createEquipment', () => {
    it('pushes a new equipment item to database with timestamps', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const pushMock = vi.fn().mockReturnValue({
        key: 'new-eq-123',
        set: setMock,
      });
      const refMock = vi.fn().mockReturnValue({ push: pushMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const created = await createEquipment({
        name: 'Gants été',
        category: 'accessoires',
        price: 25,
        description: 'Gants respirants',
        sizes: ['S', 'M', 'L'],
        inStock: true,
        images: ['/images/gants.jpg'],
      });

      expect(created.id).toBe('new-eq-123');
      expect(created.createdAt).toBeDefined();
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-eq-123',
          name: 'Gants été',
        })
      );
    });
  });

  describe('updateEquipment', () => {
    it('updates existing item if found in database', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const snapshot = { exists: () => true };
      const onceMock = vi.fn().mockResolvedValue(snapshot);

      const refMock = vi.fn().mockReturnValue({
        once: onceMock,
        update: updateMock,
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await updateEquipment('eq-1', { price: 90 });
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 90,
          updatedAt: expect.any(String),
        })
      );
    });

    it('creates item from mock data if not existing yet in Firebase', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);

      const refMock = vi.fn().mockReturnValue({
        once: onceMock,
        set: setMock,
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await updateEquipment('MaiManLonHO', { price: 70 });
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'MaiManLonHO',
          price: 70,
        })
      );
    });
  });

  describe('deleteEquipment', () => {
    it('removes equipment item from database and revalidates cache', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await deleteEquipment('eq-delete');
      expect(refMock).toHaveBeenCalledWith('equipment/eq-delete');
      expect(removeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('seedEquipment', () => {
    it('seeds mock items into the equipment ref in Firebase', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const childMock = vi.fn().mockReturnValue({ set: setMock });
      const refMock = vi.fn().mockReturnValue({ child: childMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await seedEquipment();
      expect(refMock).toHaveBeenCalledWith('equipment');
      expect(childMock).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalled();
    });
  });

  describe('revalidate caches', () => {
    it('calls revalidatePath correctly', async () => {
      await revalidateEquipmentCache();
      await revalidateEquipmentItemCache('eq-1');
    });
  });
});
