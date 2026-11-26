import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationError } from '@/app/lib/errors';

const createEquipmentOrder = vi.fn();
const getEquipmentById = vi.fn();
const getSessionUser = vi.fn();
const getEquipmentCampaign = vi.fn();
const getPaymentSettings = vi.fn();

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
vi.mock('@/app/lib/auth/session', () => ({
  getSessionUser: (...args: unknown[]) => getSessionUser(...args),
}));
vi.mock('@/app/lib/firebase/equipment-orders', () => ({
  createEquipmentOrder: (...args: unknown[]) => createEquipmentOrder(...args),
}));
vi.mock('@/app/lib/firebase/equipment', () => ({
  getEquipmentById: (...args: unknown[]) => getEquipmentById(...args),
}));
vi.mock('@/app/lib/firebase/equipment-campaigns', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/lib/firebase/equipment-campaigns')>()),
  getEquipmentCampaign: (...args: unknown[]) => getEquipmentCampaign(...args),
}));
vi.mock('@/app/lib/firebase/payment-settings', () => ({
  getPaymentSettings: (...args: unknown[]) => getPaymentSettings(...args),
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

const session = { id: 'member-7', name: 'Jean Dupont', email: 'jean@example.com', role: ['Member'], isAdmin: false, iat: 0, exp: 0 };
const line = { productId: 'maillot-1', size: 'M', quantity: 2 };
const validInput = { items: [line], source: 'stock' };
const campaign = {
  id: 'campaign_1',
  title: 'Hiver',
  equipmentIds: ['maillot-1'],
  closesAt: '2099-01-01T00:00:00.000Z',
  status: 'open',
  createdAt: '2026-11-01',
};

describe('submitEquipmentOrderAction', () => {
  beforeEach(() => {
    [createEquipmentOrder, getEquipmentById, getSessionUser, getEquipmentCampaign, getPaymentSettings].forEach((m) => m.mockReset());
    getSessionUser.mockResolvedValue(session);
    getEquipmentById.mockResolvedValue(product);
    getPaymentSettings.mockResolvedValue({ beneficiary: 'CC Saint-Martin Blanmont', iban: 'BE68539007547034' });
    getEquipmentCampaign.mockResolvedValue(campaign);
    createEquipmentOrder.mockImplementation(async (data) => ({
      ...data,
      id: 'order_1',
      status: 'pending',
      paymentReference: '100000001246',
      createdAt: '2026-11-04T00:00:00.000Z',
    }));
  });

  it('rejects an anonymous member', async () => {
    getSessionUser.mockResolvedValue(null);
    expect(await submitEquipmentOrderAction(validInput)).toEqual({
      success: false,
      error: 'Connectez-vous pour commander',
    });
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('saves the order for the session member with the server-side price and returns the payment data', async () => {
    const result = await submitEquipmentOrderAction({
      ...validInput,
      price: 1,
      memberName: 'Someone else',
      memberEmail: 'other@example.com',
    });
    expect(result).toEqual({
      success: true,
      orderId: 'order_1',
      total: 159,
      paymentReference: '100000001246',
      epcPayload: 'BCD\n002\n1\nSCT\n\nCC Saint-Martin Blanmont\nBE68539007547034\nEUR159.00\n\n100000001246',
    });
    const saved = createEquipmentOrder.mock.calls[0][0];
    expect(saved).toMatchObject({
      memberId: 'member-7',
      memberName: 'Jean Dupont',
      memberEmail: 'jean@example.com',
      source: 'stock',
      totalPrice: 159,
    });
    expect(saved.campaignId).toBeUndefined();
    expect(saved.items[0]).toMatchObject({ equipmentId: 'maillot-1', size: 'M', unitPrice: 79.5 });
  });

  it('saves several lines as one order with one total', async () => {
    const bib = { ...product, id: 'cuissard-1', name: 'Cuissard', price: 24.9, sizes: ['M', 'L'] };
    getEquipmentById.mockImplementation(async (id: string) => (id === bib.id ? bib : product));
    const result = await submitEquipmentOrderAction({
      ...validInput,
      items: [{ ...line, quantity: 3 }, { productId: 'cuissard-1', size: 'L', quantity: 1 }],
    });
    expect(result).toMatchObject({ success: true, total: 263.4 });
    const saved = createEquipmentOrder.mock.calls[0][0];
    expect(saved.totalPrice).toBe(263.4);
    expect(saved.items).toHaveLength(2);
    expect(saved.items[1]).toMatchObject({ equipmentId: 'cuissard-1', size: 'L', quantity: 1, unitPrice: 24.9 });
  });

  it('rejects an empty cart and refuses the whole order when one line is invalid', async () => {
    expect(await submitEquipmentOrderAction({ ...validInput, items: [] })).toMatchObject({ success: false });
    expect(
      (await submitEquipmentOrderAction({ ...validInput, items: [line, { ...line, size: 'XXXL' }] })).success
    ).toBe(false);
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('refuses a group order when one line is outside the campaign', async () => {
    const other = { ...product, id: 'veste-1', name: 'Veste' };
    getEquipmentById.mockImplementation(async (id: string) => (id === other.id ? other : product));
    const result = await submitEquipmentOrderAction({
      ...validInput,
      source: 'campaign',
      campaignId: 'campaign_1',
      items: [line, { productId: 'veste-1', size: 'M', quantity: 1 }],
    });
    expect(result).toEqual({ success: false, error: 'Veste ne fait pas partie de la commande groupée' });
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('returns a null QR payload while the club account is not configured', async () => {
    getPaymentSettings.mockResolvedValue(null);
    const result = await submitEquipmentOrderAction(validInput);
    expect(result).toMatchObject({ success: true, epcPayload: null });
  });

  it('accepts an order on the open campaign', async () => {
    const result = await submitEquipmentOrderAction({ ...validInput, source: 'campaign', campaignId: 'campaign_1' });
    expect(result.success).toBe(true);
    expect(createEquipmentOrder.mock.calls[0][0]).toMatchObject({ source: 'campaign', campaignId: 'campaign_1' });
  });

  it('refuses closed, expired, unknown or unrelated campaigns', async () => {
    const order = { ...validInput, source: 'campaign', campaignId: 'campaign_1' };
    getEquipmentCampaign.mockResolvedValue({ ...campaign, status: 'closed' });
    expect(await submitEquipmentOrderAction(order)).toMatchObject({ error: 'Cette commande groupée est clôturée' });
    getEquipmentCampaign.mockResolvedValue({ ...campaign, closesAt: '2020-01-01T00:00:00.000Z' });
    expect(await submitEquipmentOrderAction(order)).toMatchObject({ error: 'Cette commande groupée est clôturée' });
    getEquipmentCampaign.mockResolvedValue({ ...campaign, equipmentIds: ['other'] });
    expect((await submitEquipmentOrderAction(order)).success).toBe(false);
    getEquipmentCampaign.mockResolvedValue(null);
    expect(await submitEquipmentOrderAction(order)).toMatchObject({ error: 'Commande groupée introuvable' });
    expect(await submitEquipmentOrderAction({ ...order, campaignId: undefined })).toMatchObject({ success: false });
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('requires a source and rejects a filled honeypot', async () => {
    expect((await submitEquipmentOrderAction({ ...validInput, source: undefined })).success).toBe(false);
    expect((await submitEquipmentOrderAction({ ...validInput, website: 'http://spam' })).success).toBe(false);
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('rejects an unknown size and unavailable items', async () => {
    expect((await submitEquipmentOrderAction({ ...validInput, items: [{ ...line, size: 'XXXL' }] })).success).toBe(false);
    getEquipmentById.mockResolvedValue({ ...product, isAvailable: false });
    expect((await submitEquipmentOrderAction(validInput)).success).toBe(false);
    expect(createEquipmentOrder).not.toHaveBeenCalled();
  });

  it('rejects out-of-range quantities', async () => {
    expect((await submitEquipmentOrderAction({ ...validInput, items: [{ ...line, quantity: 0 }] })).success).toBe(false);
    expect((await submitEquipmentOrderAction({ ...validInput, items: [{ ...line, quantity: 99 }] })).success).toBe(false);
  });

  it('shows the stock message and hides other persistence errors', async () => {
    createEquipmentOrder.mockRejectedValue(new ValidationError('Stock insuffisant : Maillot été (M)'));
    expect(await submitEquipmentOrderAction(validInput)).toEqual({
      success: false,
      error: 'Stock insuffisant : Maillot été (M)',
    });
    createEquipmentOrder.mockRejectedValue(new Error('db down'));
    const result = await submitEquipmentOrderAction(validInput);
    expect(result.success).toBe(false);
    expect(result).not.toMatchObject({ error: 'db down' });
  });
});
