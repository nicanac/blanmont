import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
vi.mock('@/app/lib/firebase/client', () => ({
  isMockMode: true,
  snapshotToArray: vi.fn(),
}));
vi.mock('@/app/lib/firebase/admin', () => ({ getAdminDatabase: vi.fn() }));

import { EQUIPMENT_DATA } from '@/app/data/equipment';
import { isValidPaymentReference } from '@/app/lib/payments/ogm';
import {
  MOCK_EQUIPMENT_ORDERS,
  cancelEquipmentOrder,
  clubToday,
  createEquipmentOrder,
  deleteEquipmentOrder,
  getEquipmentOrders,
  getOrdersByMember,
  markOrderDelivered,
  markOrderPaid,
  updateEquipmentOrderStatus,
} from '@/app/lib/firebase/equipment-orders';

const jersey = EQUIPMENT_DATA[0];
const item = (size: string, quantity: number) => ({
  equipmentId: jersey.id,
  equipmentName: jersey.name,
  size,
  quantity,
  unitPrice: jersey.price,
});
const base = {
  memberId: 'member-1',
  memberName: 'Jean',
  memberEmail: 'jean@example.com',
  items: [item('M', 1)],
  totalPrice: 83,
  source: 'campaign' as const,
};

describe('equipment orders (mock mode)', () => {
  beforeEach(() => {
    MOCK_EQUIPMENT_ORDERS.length = 0;
    jersey.stock = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  });

  it('creates with a unique payment reference, lists newest first and deletes', async () => {
    const first = await createEquipmentOrder(base);
    await new Promise((r) => setTimeout(r, 5));
    const second = await createEquipmentOrder({ ...base, memberName: 'Marie', memberId: 'member-2' });

    expect(first.status).toBe('pending');
    expect(isValidPaymentReference(first.paymentReference as string)).toBe(true);
    expect(second.paymentReference).not.toBe(first.paymentReference);
    expect('memberPhone' in first).toBe(false); // undefined fields are dropped (RTDB refuses them)

    expect((await getEquipmentOrders()).map((o) => o.id)).toEqual([second.id, first.id]);
    expect((await getOrdersByMember('member-2')).map((o) => o.id)).toEqual([second.id]);

    expect(await deleteEquipmentOrder(first.id)).toBe(true);
    expect(await deleteEquipmentOrder(first.id)).toBe(false);
    expect(await getEquipmentOrders()).toHaveLength(1);
  });

  it('enforces the status transitions and sets the dates', async () => {
    const order = await createEquipmentOrder(base);

    await expect(markOrderDelivered(order.id)).rejects.toThrow('Changement de statut non autorisé');
    const paid = await markOrderPaid(order.id, '2026-11-20', 'tx-1');
    expect(paid).toMatchObject({ status: 'paid', paidAt: '2026-11-20', bankTransactionId: 'tx-1' });
    await expect(markOrderPaid(order.id, '2026-11-21')).rejects.toThrow();

    const delivered = await markOrderDelivered(order.id);
    expect(delivered.status).toBe('delivered');
    expect(delivered.deliveredAt).toBeTruthy();
    await expect(cancelEquipmentOrder(order.id)).rejects.toThrow();

    await expect(updateEquipmentOrderStatus('missing', 'paid')).rejects.toThrow('Commande introuvable');
  });

  it('routes the admin status select through the allowed transitions', async () => {
    const order = await createEquipmentOrder(base);
    await expect(updateEquipmentOrderStatus(order.id, 'confirmed')).rejects.toThrow();
    const paid = await updateEquipmentOrderStatus(order.id, 'paid');
    expect(paid.paidAt).toBe(clubToday());

    const legacy = { ...base, id: 'legacy', status: 'confirmed' as const, createdAt: '2025-01-01' };
    MOCK_EQUIPMENT_ORDERS.push(legacy);
    expect((await updateEquipmentOrderStatus('legacy', 'delivered')).status).toBe('delivered');
  });

  it('reserves stock for stock orders, rejects overselling and restores on cancel', async () => {
    jersey.stock.M = 2;
    const order = await createEquipmentOrder({ ...base, source: 'stock', items: [item('M', 2)] });
    expect(jersey.stock.M).toBe(0);

    await expect(createEquipmentOrder({ ...base, source: 'stock' })).rejects.toThrow('Stock insuffisant');
    expect(MOCK_EQUIPMENT_ORDERS).toHaveLength(1);

    const cancelled = await cancelEquipmentOrder(order.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancelledAt).toBeTruthy();
    expect(jersey.stock.M).toBe(2);
  });

  it('rolls back a partial reservation', async () => {
    jersey.stock.M = 1;
    await expect(
      createEquipmentOrder({ ...base, source: 'stock', items: [item('M', 1), item('L', 1)] })
    ).rejects.toThrow('Stock insuffisant');
    expect(jersey.stock).toMatchObject({ M: 1, L: 0 });
  });

  it('gives the units of a deleted pending stock order back', async () => {
    jersey.stock.S = 1;
    const order = await createEquipmentOrder({ ...base, source: 'stock', items: [item('S', 1)] });
    expect(jersey.stock.S).toBe(0);
    await deleteEquipmentOrder(order.id);
    expect(jersey.stock.S).toBe(1);
  });

  it('takes the club day in Brussels', () => {
    expect(clubToday(new Date('2026-11-25T23:30:00Z'))).toBe('2026-11-26');
  });
});
