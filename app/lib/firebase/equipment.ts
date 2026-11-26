import { unstable_cache } from 'next/cache';
import { Equipment } from '../../types/equipment';
import { isMockMode, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';
import { EQUIPMENT_DATA } from '../../data/equipment';

// === Cache Revalidation Utilities ===

/**
 * Revalidates the equipment cache
 */
export const revalidateEquipmentCache = async (): Promise<void> => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/boutique');
  revalidatePath('/admin/equipements');
};

/**
 * Revalidates a specific equipment item cache
 */
export const revalidateEquipmentItemCache = async (id: string): Promise<void> => {
  'use server';
  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/admin/equipements/${id}`);
  revalidatePath('/boutique');
  revalidatePath('/admin/equipements');
};

// === CRUD Operations ===

/**
 * Fetches all equipment items (uncached version)
 */
const getEquipmentUncached = async (): Promise<Equipment[]> => {
  if (isMockMode) {
    return getMockEquipment();
  }

  try {
    const db = getAdminDatabase();
    const equipmentRef = db.ref('equipment');
    const snapshot = await equipmentRef.once('value');

    if (!snapshot.exists()) {
      return getMockEquipment();
    }

    const items = snapshotToArray<Equipment>(snapshot);
    return items.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return getMockEquipment();
  }
};

/**
 * Fetches all equipment with caching
 */
export const getEquipment = unstable_cache(getEquipmentUncached, ['equipment'], {
  revalidate: 60,
  tags: ['equipment'],
});

/**
 * Fetches a single equipment item by ID
 */
export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  if (isMockMode) {
    return getMockEquipment().find((item) => item.id === id) || null;
  }

  try {
    const db = getAdminDatabase();
    const itemRef = db.ref(`equipment/${id}`);
    const snapshot = await itemRef.once('value');

    if (!snapshot.exists()) {
      const mockItem = getMockEquipment().find((item) => item.id === id);
      return mockItem || null;
    }

    return { id, ...snapshot.val() } as Equipment;
  } catch (error) {
    console.error('Error fetching equipment by ID:', error);
    const mockItem = getMockEquipment().find((item) => item.id === id);
    return mockItem || null;
  }
};

/**
 * Creates a new equipment item
 */
export const createEquipment = async (item: Omit<Equipment, 'id'>): Promise<Equipment> => {
  if (isMockMode) {
    throw new Error('Cannot create equipment in mock mode');
  }

  const db = getAdminDatabase();
  const equipmentRef = db.ref('equipment');
  const newItemRef = equipmentRef.push();

  const newItem: Equipment = {
    ...item,
    id: newItemRef.key!,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await newItemRef.set(newItem);
  await revalidateEquipmentCache();

  return newItem;
};

/**
 * Updates an existing equipment item
 */
export const updateEquipment = async (
  id: string,
  updates: Partial<Omit<Equipment, 'id'>>
): Promise<void> => {
  if (isMockMode) {
    throw new Error('Cannot update equipment in mock mode');
  }

  const db = getAdminDatabase();
  const itemRef = db.ref(`equipment/${id}`);

  const snapshot = await itemRef.once('value');

  if (!snapshot.exists()) {
    const mockItem = getMockEquipment().find((item) => item.id === id);
    if (mockItem) {
      const fullItem: Equipment = {
        ...mockItem,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await itemRef.set(fullItem);
    } else {
      throw new Error(`Equipment item ${id} not found`);
    }
  } else {
    await itemRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  await revalidateEquipmentItemCache(id);
};

/**
 * Adds `delta` (negative to reserve) to /equipment/{id}/stock/{size} in an RTDB transaction.
 * Returns false, writing nothing, when the stock would go below 0.
 */
export const adjustEquipmentStock = async (
  equipmentId: string,
  size: string,
  delta: number
): Promise<boolean> => {
  if (isMockMode) {
    const item = getMockEquipment().find((i) => i.id === equipmentId);
    const next = (item?.stock[size] ?? 0) + delta;
    if (!item || next < 0) return false;
    item.stock[size] = next;
    return true;
  }

  const { committed, snapshot } = await getAdminDatabase()
    .ref(`equipment/${equipmentId}/stock/${size}`)
    .transaction((current: number | null) => {
      // The first call may see null before the server value is known; the server retries
      // when it differs. A real null means no stock: a reservation then writes nothing.
      if (current === null) return delta >= 0 ? delta : null;
      const next = Number(current) + delta;
      return next < 0 ? undefined : next;
    });
  return committed && typeof snapshot.val() === 'number';
};

/**
 * Deletes an equipment item
 */
export const deleteEquipment = async (id: string): Promise<void> => {
  if (isMockMode) {
    throw new Error('Cannot delete equipment in mock mode');
  }

  const db = getAdminDatabase();
  const itemRef = db.ref(`equipment/${id}`);
  await itemRef.remove();
  await revalidateEquipmentCache();
};

/**
 * Seeds the database with initial equipment data
 */
export const seedEquipment = async (): Promise<void> => {
  if (isMockMode) {
    throw new Error('Cannot seed equipment in mock mode');
  }

  const db = getAdminDatabase();
  const equipmentRef = db.ref('equipment');

  const promises = EQUIPMENT_DATA.map((item) => {
    const itemRef = equipmentRef.child(item.id);
    return itemRef.set({
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  await Promise.all(promises);
  await revalidateEquipmentCache();
};

// === Mock Data for Development ===

function getMockEquipment(): Equipment[] {
  return EQUIPMENT_DATA;
}
