import {
  EquipmentOrder,
  EquipmentOrderSource,
  EquipmentOrderStatus,
} from '../../types/equipment';
import { isMockMode, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';
import { adjustEquipmentStock } from './equipment';
import { updateRecord } from './update-record';
import { makePaymentReference } from '../payments/ogm';
import { NotFoundError, ValidationError } from '../errors';

/** In-memory store used when Firebase is not configured (local dev / tests). */
export const MOCK_EQUIPMENT_ORDERS: EquipmentOrder[] = [];
let mockPaymentSequence = 0;

const ORDERS_PATH = 'equipment-orders';
const PAYMENT_COUNTER_PATH = 'counters/payment-reference';

export const ORDER_STATUSES: EquipmentOrderStatus[] = [
  'pending',
  'paid',
  'confirmed',
  'delivered',
  'cancelled',
];

/** Allowed status changes (docs/maillots.md). 'confirmed' only exists on legacy orders. */
const ORDER_TRANSITIONS: Record<EquipmentOrderStatus, EquipmentOrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['delivered', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrder(from: EquipmentOrderStatus, to: EquipmentOrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** The club's current day (Europe/Brussels) as YYYY-MM-DD, whatever the server time zone. */
export function clubToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now);
}

export type NewEquipmentOrder = Omit<
  EquipmentOrder,
  'id' | 'status' | 'createdAt' | 'source' | 'paymentReference'
> & { source: EquipmentOrderSource };

async function nextPaymentSequence(): Promise<number> {
  if (isMockMode) return ++mockPaymentSequence;
  const { committed, snapshot } = await getAdminDatabase()
    .ref(PAYMENT_COUNTER_PATH)
    .transaction((current: number | null) => (current ?? 0) + 1);
  if (!committed) throw new Error('Payment reference counter was not incremented');
  return snapshot.val() as number;
}

async function releaseStock(items: EquipmentOrder['items']): Promise<void> {
  for (const item of items) {
    await adjustEquipmentStock(item.equipmentId, item.size, item.quantity);
  }
}

async function reserveStock(items: EquipmentOrder['items']): Promise<void> {
  const reserved: EquipmentOrder['items'] = [];
  for (const item of items) {
    if (!(await adjustEquipmentStock(item.equipmentId, item.size, -item.quantity))) {
      await releaseStock(reserved);
      throw new ValidationError(`Stock insuffisant : ${item.equipmentName} (${item.size})`);
    }
    reserved.push(item);
  }
}

/**
 * Persists a new order with its payment reference. A 'stock' order reserves its units
 * first and is refused (ValidationError) when the stock is too low. Server-only (Admin SDK).
 */
export async function createEquipmentOrder(data: NewEquipmentOrder): Promise<EquipmentOrder> {
  const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (data.source === 'stock') await reserveStock(data.items);

  try {
    const paymentReference = makePaymentReference(await nextPaymentSequence());
    // JSON round-trip drops undefined optional fields, which RTDB refuses.
    const record: EquipmentOrder = JSON.parse(
      JSON.stringify({
        ...data,
        id,
        status: 'pending',
        paymentReference,
        createdAt: new Date().toISOString(),
      })
    );

    if (isMockMode) {
      MOCK_EQUIPMENT_ORDERS.unshift(record);
      return record;
    }
    await getAdminDatabase().ref(`${ORDERS_PATH}/${id}`).set(record);
    return record;
  } catch (error) {
    if (data.source === 'stock') await releaseStock(data.items);
    throw error;
  }
}

/** Lists all orders, newest first. Throws when the database read fails. */
export async function readEquipmentOrders(): Promise<EquipmentOrder[]> {
  const orders = isMockMode
    ? [...MOCK_EQUIPMENT_ORDERS]
    : snapshotToArray<EquipmentOrder>(await getAdminDatabase().ref(ORDERS_PATH).once('value'));
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Lists all orders, newest first (empty list when the read fails).
 */
export async function getEquipmentOrders(): Promise<EquipmentOrder[]> {
  try {
    return await readEquipmentOrders();
  } catch (error) {
    console.error('Failed to fetch equipment orders:', error);
    return [];
  }
}

/** A member's orders, newest first. */
export async function getOrdersByMember(memberId: string): Promise<EquipmentOrder[]> {
  // shortcut: reads every order and filters; switch to orderByChild('memberId') + .indexOn when orders reach the thousands.
  return (await getEquipmentOrders()).filter((o) => o.memberId === memberId);
}

async function transitionOrder(
  id: string,
  to: EquipmentOrderStatus,
  changes: Partial<EquipmentOrder> = {}
): Promise<EquipmentOrder> {
  const updatedAt = new Date().toISOString();
  const order = await updateRecord(MOCK_EQUIPMENT_ORDERS, ORDERS_PATH, id, (current) => {
    if (!canTransitionOrder(current.status, to)) {
      throw new ValidationError('Changement de statut non autorisé pour cette commande');
    }
    return { ...current, ...changes, status: to, updatedAt };
  });
  if (!order) throw new NotFoundError('Commande introuvable');
  return order;
}

/** pending → paid. `paidAt` is YYYY-MM-DD (defaults to today in Brussels). */
export async function markOrderPaid(
  id: string,
  paidAt: string = clubToday(),
  bankTransactionId?: string
): Promise<EquipmentOrder> {
  return transitionOrder(id, 'paid', { paidAt, bankTransactionId });
}

/** paid (or legacy confirmed) → delivered. */
export async function markOrderDelivered(id: string): Promise<EquipmentOrder> {
  return transitionOrder(id, 'delivered', { deliveredAt: new Date().toISOString() });
}

/**
 * pending | paid | confirmed → cancelled. A stock order gives its units back (a delivered
 * order cannot be cancelled). Refunding a paid order happens outside the app.
 */
export async function cancelEquipmentOrder(id: string): Promise<EquipmentOrder> {
  const order = await transitionOrder(id, 'cancelled', { cancelledAt: new Date().toISOString() });
  if (order.source === 'stock') await releaseStock(order.items);
  return order;
}

/**
 * Status change from the admin orders table. Only the allowed transitions pass, each
 * through its dedicated function so dates and stock follow.
 */
export async function updateEquipmentOrderStatus(
  id: string,
  status: EquipmentOrderStatus
): Promise<EquipmentOrder> {
  switch (status) {
    case 'paid':
      return markOrderPaid(id);
    case 'delivered':
      return markOrderDelivered(id);
    case 'cancelled':
      return cancelEquipmentOrder(id);
    default:
      throw new ValidationError('Changement de statut non autorisé pour cette commande');
  }
}

export async function deleteEquipmentOrder(id: string): Promise<boolean> {
  try {
    const order = isMockMode
      ? MOCK_EQUIPMENT_ORDERS.find((o) => o.id === id)
      : ((await getAdminDatabase().ref(`${ORDERS_PATH}/${id}`).once('value')).val() as
          | EquipmentOrder
          | null);
    if (!order) return false;

    if (isMockMode) {
      MOCK_EQUIPMENT_ORDERS.splice(MOCK_EQUIPMENT_ORDERS.indexOf(order), 1);
    } else {
      await getAdminDatabase().ref(`${ORDERS_PATH}/${id}`).remove();
    }
    // Units of a stock order still held by the club go back to stock.
    if (order.source === 'stock' && (order.status === 'pending' || order.status === 'paid')) {
      await releaseStock(order.items);
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete equipment order ${id}:`, error);
    return false;
  }
}
