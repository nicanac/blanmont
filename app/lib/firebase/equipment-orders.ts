import { EquipmentOrder, EquipmentOrderStatus } from '../../types/equipment';
import { isMockMode, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';

/** In-memory store used when Firebase is not configured (local dev / tests). */
export const MOCK_EQUIPMENT_ORDERS: EquipmentOrder[] = [];

const ORDERS_PATH = 'equipment-orders';

export const ORDER_STATUSES: EquipmentOrderStatus[] = [
  'pending',
  'confirmed',
  'delivered',
  'cancelled',
];

/**
 * Persists a new equipment order. Server-only (Admin SDK).
 */
export async function createEquipmentOrder(
  data: Omit<EquipmentOrder, 'id' | 'status' | 'createdAt'>
): Promise<EquipmentOrder> {
  const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: EquipmentOrder = {
    ...data,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isMockMode) {
    MOCK_EQUIPMENT_ORDERS.unshift(record);
    return record;
  }

  await getAdminDatabase().ref(`${ORDERS_PATH}/${id}`).set(record);
  return record;
}

/**
 * Lists all orders, newest first.
 */
export async function getEquipmentOrders(): Promise<EquipmentOrder[]> {
  if (isMockMode) {
    return [...MOCK_EQUIPMENT_ORDERS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const snapshot = await getAdminDatabase().ref(ORDERS_PATH).once('value');
    if (!snapshot.exists()) return [];
    return snapshotToArray<EquipmentOrder>(snapshot).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  } catch (error) {
    console.error('Failed to fetch equipment orders:', error);
    return [];
  }
}

export async function updateEquipmentOrderStatus(
  id: string,
  status: EquipmentOrderStatus
): Promise<boolean> {
  if (!ORDER_STATUSES.includes(status)) return false;
  const updatedAt = new Date().toISOString();

  if (isMockMode) {
    const order = MOCK_EQUIPMENT_ORDERS.find((o) => o.id === id);
    if (!order) return false;
    order.status = status;
    order.updatedAt = updatedAt;
    return true;
  }

  try {
    const orderRef = getAdminDatabase().ref(`${ORDERS_PATH}/${id}`);
    const snapshot = await orderRef.once('value');
    if (!snapshot.exists()) return false;
    await orderRef.update({ status, updatedAt });
    return true;
  } catch (error) {
    console.error(`Failed to update equipment order ${id}:`, error);
    return false;
  }
}

export async function deleteEquipmentOrder(id: string): Promise<boolean> {
  if (isMockMode) {
    const index = MOCK_EQUIPMENT_ORDERS.findIndex((o) => o.id === id);
    if (index < 0) return false;
    MOCK_EQUIPMENT_ORDERS.splice(index, 1);
    return true;
  }

  try {
    await getAdminDatabase().ref(`${ORDERS_PATH}/${id}`).remove();
    return true;
  } catch (error) {
    console.error(`Failed to delete equipment order ${id}:`, error);
    return false;
  }
}
