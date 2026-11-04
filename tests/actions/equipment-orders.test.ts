import { beforeEach, describe, expect, it, vi } from 'vitest';

const createEquipmentOrder = vi.fn();
const getEquipmentById = vi.fn();

vi.mock('@/app/lib/firebase/equipment-orders', () => ({
  createEquipmentOrder: (...args: unknown[]) => createEquipmentOrder(...args),
}));
vi.mock('@/app/lib/firebase/equipment', () => ({
  getEquipmentById: (...args: unknown[]) => getEquipmentById(...args),
}));

import { submitEquipmentOrderAction } from '@/app/checkout/actions';

const product = {
  id: 'maillot-1',
  name: 'Maillot été',
  category: 'Maillot',
  description: '',
  price: 79.5,
  sizes: ['S', 'M', 'L'],
  stock: {},
  imageUrl: '',
  isAvailable: true,
};

const validInput = {
  productId: 'maillot-1',
  size: 'M',
  quantity: 2,
  memberName: 'Jean Dupont',
  memberEmail: 'jean@example.com',
};

describe('submitEquipmentOrderAction', () => {
  beforeEach(() => {
    createEquipmentOrder.mockReset();
    getEquipmentById.mockReset();
    getEquipmentById.mockResolvedValue(product);
    createEquipmentOrder.mockImplementation(async (data) => ({
      ...data,
      id: 'order_1',
      status: 'pending',
      createdAt: '2026-11-04T00:00:00.000Z',
    }));
  });

  it('saves the order with the server-side price and total', async () => {
    const result = await submitEquipmentOrderAction({ ...validInput, price: 1 });
    expect(result).toEqual({ success: true, orderId: 'order_1', total: 159 });
    const saved = createEquipmentOrder.mock.calls[0][0];
    expect(saved.items[0]).toMatchObject({ equipmentId: 'maillot-1', size: 'M', unitPrice: 79.5 });
    expect(saved.totalPrice).toBe(159);
  });

  it('rejects an invalid email', async () => {
    const result = await submitEquipmentOrderAction({ ...validInput, memberEmail: 'nope' });
    expect(result.success).toBe(false);
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('rejects a filled honeypot', async () => {
    const result = await submitEquipmentOrderAction({ ...validInput, website: 'http://spam' });
    expect(result.success).toBe(false);
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('rejects an unknown size and unavailable items', async () => {
    expect((await submitEquipmentOrderAction({ ...validInput, size: 'XXXL' })).success).toBe(false);
    getEquipmentById.mockResolvedValue({ ...product, isAvailable: false });
    expect((await submitEquipmentOrderAction(validInput)).success).toBe(false);
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('rejects out-of-range quantities', async () => {
    expect((await submitEquipmentOrderAction({ ...validInput, quantity: 0 })).success).toBe(false);
    expect((await submitEquipmentOrderAction({ ...validInput, quantity: 99 })).success).toBe(false);
  });

  it('returns a friendly error when persistence fails', async () => {
    createEquipmentOrder.mockRejectedValue(new Error('db down'));
    const result = await submitEquipmentOrderAction(validInput);
    expect(result.success).toBe(false);
  });
});
