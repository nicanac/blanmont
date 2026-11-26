import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
vi.mock('@/app/lib/firebase/client', () => ({
  isMockMode: true,
  snapshotToArray: vi.fn(),
}));
vi.mock('@/app/lib/firebase/admin', () => ({ getAdminDatabase: vi.fn() }));

import { EQUIPMENT_DATA } from '@/app/data/equipment';
import type { EquipmentCampaign, EquipmentOrder } from '@/app/types/equipment';
import {
  MOCK_EQUIPMENT_CAMPAIGNS,
  buildSizeMatrix,
  createEquipmentCampaign,
  getOpenCampaign,
  isCampaignOpen,
  transitionEquipmentCampaign,
} from '@/app/lib/firebase/equipment-campaigns';

const jersey = EQUIPMENT_DATA[0];
const future = '2099-01-01T00:00:00.000Z';

describe('equipment campaigns (mock mode)', () => {
  beforeEach(() => {
    MOCK_EQUIPMENT_CAMPAIGNS.length = 0;
    jersey.stock = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  });

  it('walks open → closed → ordered → received and adds extra stock once', async () => {
    const campaign = await createEquipmentCampaign({
      title: 'Hiver 2027',
      equipmentIds: [jersey.id],
      closesAt: future,
      extraStock: { [jersey.id]: { M: 3, L: 0 } },
    });
    expect(campaign.status).toBe('open');

    await expect(transitionEquipmentCampaign(campaign.id, 'ordered')).rejects.toThrow(
      'Étape non autorisée'
    );
    await transitionEquipmentCampaign(campaign.id, 'closed');
    const ordered = await transitionEquipmentCampaign(campaign.id, 'ordered');
    expect(ordered.supplierOrderedAt).toBeTruthy();

    const received = await transitionEquipmentCampaign(campaign.id, 'received');
    expect(received.receivedAt).toBeTruthy();
    expect(jersey.stock).toMatchObject({ M: 3, L: 0 });

    await expect(transitionEquipmentCampaign(campaign.id, 'received')).rejects.toThrow();
    expect(jersey.stock.M).toBe(3);
    await expect(transitionEquipmentCampaign('missing', 'closed')).rejects.toThrow('introuvable');
  });

  it('is open only while status is open and the deadline has not passed', async () => {
    const past = await createEquipmentCampaign({ title: 'Été', equipmentIds: ['a'], closesAt: '2020-01-01T00:00:00Z' });
    expect(isCampaignOpen(past)).toBe(false);
    expect(await getOpenCampaign()).toBeNull();

    const open = await createEquipmentCampaign({ title: 'Hiver', equipmentIds: ['a'], closesAt: future });
    expect((await getOpenCampaign())?.id).toBe(open.id);
    await transitionEquipmentCampaign(open.id, 'closed');
    expect(await getOpenCampaign()).toBeNull();
  });

  it('builds the size matrix from paid orders plus extra stock', () => {
    const campaign: EquipmentCampaign = {
      id: 'c1',
      title: 'Hiver',
      equipmentIds: ['jersey', 'bib'],
      closesAt: future,
      status: 'closed',
      extraStock: { jersey: { M: 2, XL: 1 } },
      createdAt: '2026-11-01',
    };
    const order = (id: string, status: EquipmentOrder['status'], campaignId: string, size: string, qty: number, equipmentId = 'jersey'): EquipmentOrder => ({
      id,
      status,
      campaignId,
      source: 'campaign',
      memberName: id,
      memberEmail: '',
      items: [{ equipmentId, equipmentName: equipmentId.toUpperCase(), size, quantity: qty, unitPrice: 80 }],
      totalPrice: 80 * qty,
      createdAt: '2026-11-02',
    });
    const orders = [
      order('o1', 'paid', 'c1', 'M', 1, 'bib'),
      order('o2', 'paid', 'c1', 'M', 2),
      order('o3', 'delivered', 'c1', 'L', 1),
      order('o4', 'pending', 'c1', 'M', 5),
      order('o5', 'cancelled', 'c1', 'M', 5),
      order('o6', 'paid', 'other', 'M', 5),
    ];

    const matrix = buildSizeMatrix(campaign, orders);
    expect(matrix.lines).toEqual([
      { equipmentId: 'jersey', equipmentName: 'JERSEY', size: 'M', members: 2, extra: 2, total: 4 },
      { equipmentId: 'jersey', equipmentName: 'JERSEY', size: 'L', members: 1, extra: 0, total: 1 },
      { equipmentId: 'jersey', equipmentName: 'jersey', size: 'XL', members: 0, extra: 1, total: 1 },
      { equipmentId: 'bib', equipmentName: 'BIB', size: 'M', members: 1, extra: 0, total: 1 },
    ]);
    expect(matrix.unpaidOrders.map((o) => o.id)).toEqual(['o4']);
  });
});
