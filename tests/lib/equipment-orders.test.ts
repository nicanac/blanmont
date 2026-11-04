import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/lib/firebase/client', () => ({
  isMockMode: true,
  snapshotToArray: vi.fn(),
}));
vi.mock('@/app/lib/firebase/admin', () => ({ getAdminDatabase: vi.fn() }));

import {
  MOCK_EQUIPMENT_ORDERS,
  createEquipmentOrder,
  deleteEquipmentOrder,
  getEquipmentOrders,
  updateEquipmentOrderStatus,
} from '@/app/lib/firebase/equipment-orders';

const base = {
  memberName: 'Jean',
  memberEmail: 'jean@example.com',
  items: [{ equipmentId: 'a', equipmentName: 'Maillot', size: 'M', quantity: 1, unitPrice: 50 }],
  totalPrice: 50,
};

describe('equipment orders (mock mode)', () => {
  it('creates, lists newest first, updates status and deletes', async () => {
    MOCK_EQUIPMENT_ORDERS.length = 0;
    const first = await createEquipmentOrder(base);
    await new Promise((r) => setTimeout(r, 5));
    const second = await createEquipmentOrder({ ...base, memberName: 'Marie' });

    expect(first.status).toBe('pending');
    const list = await getEquipmentOrders();
    expect(list.map((o) => o.id)).toEqual([second.id, first.id]);

    expect(await updateEquipmentOrderStatus(first.id, 'confirmed')).toBe(true);
    expect((await getEquipmentOrders()).find((o) => o.id === first.id)?.status).toBe('confirmed');
    expect(await updateEquipmentOrderStatus('missing', 'confirmed')).toBe(false);

    expect(await deleteEquipmentOrder(first.id)).toBe(true);
    expect(await deleteEquipmentOrder(first.id)).toBe(false);
    expect(await getEquipmentOrders()).toHaveLength(1);
  });
});
