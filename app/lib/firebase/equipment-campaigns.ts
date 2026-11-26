import type { CampaignStatus, EquipmentCampaign, EquipmentOrder } from '../../types/equipment';
import { isMockMode, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';
import { adjustEquipmentStock } from './equipment';
import { updateRecord } from './update-record';
import { NotFoundError, ValidationError } from '../errors';

/** In-memory store used when Firebase is not configured (local dev / tests). */
export const MOCK_EQUIPMENT_CAMPAIGNS: EquipmentCampaign[] = [];

const CAMPAIGNS_PATH = 'equipment-campaigns';

/** Each status has exactly one next step (docs/maillots.md, "Status transitions"). */
const NEXT_STATUS: Record<CampaignStatus, CampaignStatus | null> = {
  open: 'closed',
  closed: 'ordered',
  ordered: 'received',
  received: null,
};

export type NewEquipmentCampaign = Pick<
  EquipmentCampaign,
  'title' | 'equipmentIds' | 'closesAt' | 'extraStock'
>;

export async function createEquipmentCampaign(
  data: NewEquipmentCampaign
): Promise<EquipmentCampaign> {
  const id = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const campaign: EquipmentCampaign = JSON.parse(
    JSON.stringify({
      ...data,
      id,
      closesAt: new Date(data.closesAt).toISOString(),
      status: 'open',
      createdAt: new Date().toISOString(),
    })
  );
  if (isMockMode) {
    MOCK_EQUIPMENT_CAMPAIGNS.unshift(campaign);
    return campaign;
  }
  await getAdminDatabase().ref(`${CAMPAIGNS_PATH}/${id}`).set(campaign);
  return campaign;
}

/** All campaigns, newest first. */
export async function getEquipmentCampaigns(): Promise<EquipmentCampaign[]> {
  const campaigns = isMockMode
    ? [...MOCK_EQUIPMENT_CAMPAIGNS]
    : snapshotToArray<EquipmentCampaign>(
        await getAdminDatabase().ref(CAMPAIGNS_PATH).once('value')
      );
  return campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEquipmentCampaign(id: string): Promise<EquipmentCampaign | null> {
  if (isMockMode) return MOCK_EQUIPMENT_CAMPAIGNS.find((c) => c.id === id) ?? null;
  const snapshot = await getAdminDatabase().ref(`${CAMPAIGNS_PATH}/${id}`).once('value');
  return snapshot.exists() ? { ...(snapshot.val() as EquipmentCampaign), id } : null;
}

/** Members can order on a campaign while it is open and its deadline has not passed. */
export function isCampaignOpen(campaign: EquipmentCampaign, now: Date = new Date()): boolean {
  return campaign.status === 'open' && now.getTime() <= Date.parse(campaign.closesAt);
}

/** The open campaign that closes first, or null. */
export async function getOpenCampaign(now: Date = new Date()): Promise<EquipmentCampaign | null> {
  const open = (await getEquipmentCampaigns()).filter((c) => isCampaignOpen(c, now));
  return open.sort((a, b) => a.closesAt.localeCompare(b.closesAt))[0] ?? null;
}

/**
 * Moves a campaign one step: open → closed → ordered (sets supplierOrderedAt) → received
 * (sets receivedAt and adds extraStock to the equipment stock). The status guard runs in
 * the transaction, so the stock is added once even if two admins click together.
 */
export async function transitionEquipmentCampaign(
  id: string,
  next: CampaignStatus
): Promise<EquipmentCampaign> {
  const now = new Date().toISOString();
  const campaign = await updateRecord(MOCK_EQUIPMENT_CAMPAIGNS, CAMPAIGNS_PATH, id, (current) => {
    if (NEXT_STATUS[current.status] !== next) {
      throw new ValidationError('Étape non autorisée pour cette commande groupée');
    }
    return {
      ...current,
      status: next,
      updatedAt: now,
      ...(next === 'ordered' ? { supplierOrderedAt: now } : {}),
      ...(next === 'received' ? { receivedAt: now } : {}),
    };
  });
  if (!campaign) throw new NotFoundError('Commande groupée introuvable');

  if (next === 'received') {
    for (const [equipmentId, sizes] of Object.entries(campaign.extraStock ?? {})) {
      for (const [size, quantity] of Object.entries(sizes)) {
        if (quantity > 0 && !(await adjustEquipmentStock(equipmentId, size, quantity))) {
          console.error(`Campaign ${id}: could not add ${quantity} × ${equipmentId} ${size} to stock`);
        }
      }
    }
  }
  return campaign;
}

export interface SizeMatrixLine {
  equipmentId: string;
  equipmentName: string;
  size: string;
  /** Units from paid (or already delivered) member orders. */
  members: number;
  /** Extra units for club stock. */
  extra: number;
  total: number;
}

export interface SizeMatrix {
  lines: SizeMatrixLine[];
  /** Campaign orders still pending payment: not counted, shown as a warning. */
  unpaidOrders: EquipmentOrder[];
}

/**
 * What to order from the supplier: paid campaign orders + extraStock, one line per
 * equipment and size, in campaign equipment order then first-seen size order.
 */
export function buildSizeMatrix(campaign: EquipmentCampaign, orders: EquipmentOrder[]): SizeMatrix {
  const own = orders.filter((o) => o.campaignId === campaign.id);
  const lines = new Map<string, SizeMatrixLine>();
  const line = (equipmentId: string, size: string, equipmentName = equipmentId): SizeMatrixLine => {
    const key = `${equipmentId}|${size}`;
    if (!lines.has(key)) {
      lines.set(key, { equipmentId, equipmentName, size, members: 0, extra: 0, total: 0 });
    }
    return lines.get(key) as SizeMatrixLine;
  };

  for (const order of own.filter((o) => o.status === 'paid' || o.status === 'delivered')) {
    for (const item of order.items) {
      const l = line(item.equipmentId, item.size, item.equipmentName);
      l.members += item.quantity;
      l.total += item.quantity;
    }
  }
  for (const [equipmentId, sizes] of Object.entries(campaign.extraStock ?? {})) {
    for (const [size, quantity] of Object.entries(sizes)) {
      if (quantity <= 0) continue;
      const l = line(equipmentId, size);
      l.extra += quantity;
      l.total += quantity;
    }
  }

  const rank = (id: string): number => {
    const index = campaign.equipmentIds.indexOf(id);
    return index < 0 ? campaign.equipmentIds.length : index;
  };
  return {
    lines: [...lines.values()].sort((a, b) => rank(a.equipmentId) - rank(b.equipmentId)),
    unpaidOrders: own.filter((o) => o.status === 'pending'),
  };
}
