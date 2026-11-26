import { describe, it, expect, vi } from 'vitest';

const getOpenCampaign = vi.fn();
vi.mock('@/app/lib/firebase/equipment-campaigns', () => ({ getOpenCampaign: () => getOpenCampaign() }));

import { GET } from '@/app/api/equipements/campagne-ouverte/route';

describe('GET /api/equipements/campagne-ouverte', () => {
  it('returns only the public fields', async () => {
    getOpenCampaign.mockResolvedValue({ id: 'c1', title: 'Hiver', closesAt: 'x', equipmentIds: ['m1'], status: 'open', extraStock: { m1: { M: 2 } }, createdAt: 'y' });
    expect(await (await GET()).json()).toEqual({ id: 'c1', title: 'Hiver', closesAt: 'x', equipmentIds: ['m1'] });
  });

  it('returns null when no campaign is open', async () => {
    getOpenCampaign.mockResolvedValue(null);
    expect(await (await GET()).json()).toBeNull();
  });
});
