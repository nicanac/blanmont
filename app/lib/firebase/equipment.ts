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
            // Return mock data if Firebase is empty (for initial setup)
            return getMockEquipment();
        }

        const items = snapshotToArray<Equipment>(snapshot);
        // Sort by order, then by name
        return items.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        // Fallback to mock data on error
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
        const items = getMockEquipment();
        return items.find((item) => item.id === id) || null;
    }

    try {
        const db = getAdminDatabase();
        const itemRef = db.ref(`equipment/${id}`);
        const snapshot = await itemRef.once('value');

        if (!snapshot.exists()) {
            // Fallback: check mock data
            const mockItem = getMockEquipment().find((item) => item.id === id);
            return mockItem || null;
        }

        return { id, ...snapshot.val() } as Equipment;
    } catch (error) {
        console.error('Error fetching equipment by ID:', error);
        // Fallback to mock data
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

    // Check if item exists in Firebase
    const snapshot = await itemRef.once('value');

    if (!snapshot.exists()) {
        // Item doesn't exist in Firebase yet - create it from mock data
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
        // Update existing item
        await itemRef.update({
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    }

    await revalidateEquipmentItemCache(id);
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

    for (const item of EQUIPMENT_DATA) {
        const itemRef = equipmentRef.child(item.id);
        await itemRef.set({
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    await revalidateEquipmentCache();
};

// === Mock Data for Development ===

function getMockEquipment(): Equipment[] {
    return EQUIPMENT_DATA;
}
