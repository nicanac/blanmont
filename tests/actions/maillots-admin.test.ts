import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationError } from '@/app/lib/errors';

const { requireSectionAccess, orders, campaigns, bank, savePaymentSettings } = vi.hoisted(() => ({
  requireSectionAccess: vi.fn(),
  orders: {
    markOrderPaid: vi.fn(),
    markOrderDelivered: vi.fn(),
    cancelEquipmentOrder: vi.fn(),
    updateEquipmentOrderStatus: vi.fn(),
    deleteEquipmentOrder: vi.fn(),
  },
  campaigns: { createEquipmentCampaign: vi.fn(), transitionEquipmentCampaign: vi.fn() },
  bank: { importCodaFile: vi.fn(), assignTransaction: vi.fn(), ignoreTransaction: vi.fn() },
  savePaymentSettings: vi.fn(),
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidatePath: vi.fn() }));
vi.mock('@/app/lib/auth/admin-access', () => ({
  requireSectionAccess: (...args: unknown[]) => requireSectionAccess(...args),
}));
vi.mock('@/app/lib/firebase/equipment-orders', () => ({ ...orders, clubToday: () => '2026-11-26' }));
vi.mock('@/app/lib/firebase/equipment-campaigns', () => campaigns);
vi.mock('@/app/lib/firebase/bank-transactions', () => bank);
vi.mock('@/app/lib/firebase/payment-settings', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/lib/firebase/payment-settings')>()),
  savePaymentSettings,
}));

import {
  cancelOrderAction,
  deleteOrderAction,
  markOrderDeliveredAction,
  markOrderPaidAction,
  updateOrderStatusAction,
} from '@/app/admin/commandes/actions';
import {
  createCampaignAction,
  markCampaignOrderDeliveredAction,
  transitionCampaignAction,
} from '@/app/admin/commandes/campagnes/actions';
import {
  assignTransactionAction,
  ignoreTransactionAction,
  importCodaAction,
} from '@/app/admin/commandes/banque/actions';
import { savePaymentSettingsAction } from '@/app/admin/settings/payment-actions';

const allMocks = [
  ...Object.values(orders),
  ...Object.values(campaigns),
  ...Object.values(bank),
  savePaymentSettings,
];

const codaForm = (bytes: Uint8Array | string) => {
  const form = new FormData();
  form.set('file', new File([bytes as BlobPart], 'releve.cod'));
  return form;
};

const validCampaign = {
  title: 'Hiver 2027',
  equipmentIds: ['MaiManLonHO'],
  closesAt: '2099-01-01T00:00:00.000Z',
  extraStock: { MaiManLonHO: { M: 2 } },
};

describe('jersey admin actions', () => {
  beforeEach(() => {
    [requireSectionAccess, ...allMocks].forEach((m) => m.mockReset());
    requireSectionAccess.mockResolvedValue({ id: 'admin', isAdmin: true });
    allMocks.forEach((m) => m.mockResolvedValue({}));
    orders.deleteEquipmentOrder.mockResolvedValue(true);
    bank.importCodaFile.mockResolvedValue({ total: 1, duplicates: 0, matched: 1, unmatched: 0 });
  });

  it('refuses every action to a non-admin', async () => {
    requireSectionAccess.mockRejectedValue(new Error('Accès refusé. Droits administrateur requis.'));
    const results = await Promise.all([
      markOrderPaidAction('order_1'),
      markOrderDeliveredAction('order_1'),
      cancelOrderAction('order_1'),
      updateOrderStatusAction('order_1', 'paid'),
      deleteOrderAction('order_1'),
      createCampaignAction(validCampaign),
      transitionCampaignAction('campaign_1', 'closed'),
      markCampaignOrderDeliveredAction('order_1'),
      importCodaAction(codaForm('0')),
      assignTransactionAction('tx', 'order_1'),
      ignoreTransactionAction('tx'),
      savePaymentSettingsAction({ beneficiary: 'CC', iban: 'BE68539007547034' }),
    ]);
    for (const result of results) {
      expect(result).toEqual({ success: false, error: 'Accès refusé. Droits administrateur requis.' });
    }
    allMocks.forEach((m) => expect(m).not.toHaveBeenCalled());
  });

  it('marks paid today, delivered and cancelled', async () => {
    expect(await markOrderPaidAction('order_1')).toEqual({ success: true });
    expect(orders.markOrderPaid).toHaveBeenCalledWith('order_1', '2026-11-26');
    expect(await markOrderDeliveredAction('order_1')).toEqual({ success: true });
    expect(orders.markOrderDelivered).toHaveBeenCalledWith('order_1');
    expect(await cancelOrderAction('order_1')).toEqual({ success: true });
    expect(orders.cancelEquipmentOrder).toHaveBeenCalledWith('order_1');
  });

  it('rejects malformed ids and reports refused transitions', async () => {
    expect(await markOrderPaidAction('a/b')).toEqual({ success: false, error: 'Paramètres invalides' });
    expect(orders.markOrderPaid).not.toHaveBeenCalled();
    orders.updateEquipmentOrderStatus.mockRejectedValue(
      new ValidationError('Changement de statut non autorisé pour cette commande')
    );
    expect(await updateOrderStatusAction('order_1', 'confirmed')).toEqual({
      success: false,
      error: 'Changement de statut non autorisé pour cette commande',
    });
  });

  it('validates campaign input', async () => {
    campaigns.createEquipmentCampaign.mockResolvedValue({ id: 'campaign_9' });
    expect(await createCampaignAction(validCampaign)).toEqual({ success: true, campaignId: 'campaign_9' });
    expect(campaigns.createEquipmentCampaign).toHaveBeenCalledWith(validCampaign);

    expect((await createCampaignAction({ ...validCampaign, closesAt: '2020-01-01' })).success).toBe(false);
    expect((await createCampaignAction({ ...validCampaign, extraStock: { Other: { M: 1 } } })).success).toBe(false);
    expect((await createCampaignAction({ ...validCampaign, equipmentIds: [] })).success).toBe(false);
    expect(campaigns.createEquipmentCampaign).toHaveBeenCalledTimes(1);

    expect(await transitionCampaignAction('campaign_1', 'open' as 'closed')).toEqual({
      success: false,
      error: 'Paramètres invalides',
    });
    expect(await transitionCampaignAction('campaign_1', 'received')).toEqual({ success: true });
    expect(campaigns.transitionEquipmentCampaign).toHaveBeenCalledWith('campaign_1', 'received');
  });

  it('imports a CODA upload decoded as latin1 and caps its size', async () => {
    const result = await importCodaAction(codaForm(new Uint8Array([0x30, 0xe9])));
    expect(result).toEqual({ success: true, summary: { total: 1, duplicates: 0, matched: 1, unmatched: 0 } });
    expect(bank.importCodaFile).toHaveBeenCalledWith('0é');

    const tooBig = await importCodaAction(codaForm(new Uint8Array(1_000_000 - 20_000 + 1)));
    expect(tooBig).toEqual({ success: false, error: 'Fichier trop volumineux (1 Mo maximum)' });
    expect((await importCodaAction(new FormData())).success).toBe(false);
    expect(bank.importCodaFile).toHaveBeenCalledTimes(1);
  });

  it('assigns and ignores transactions', async () => {
    expect(await assignTransactionAction('abc123', 'order_1')).toEqual({ success: true });
    expect(bank.assignTransaction).toHaveBeenCalledWith('abc123', 'order_1');
    expect(await ignoreTransactionAction('abc123')).toEqual({ success: true });
    expect(bank.ignoreTransaction).toHaveBeenCalledWith('abc123');
  });

  it('validates the club account before saving', async () => {
    expect(await savePaymentSettingsAction({ beneficiary: 'CC', iban: 'BE68539007547035' })).toEqual({
      success: false,
      error: 'IBAN invalide',
    });
    expect(savePaymentSettings).not.toHaveBeenCalled();
    expect(await savePaymentSettingsAction({ beneficiary: 'CC', iban: 'be68 5390 0754 7034' })).toEqual({
      success: true,
    });
    expect(savePaymentSettings).toHaveBeenCalledWith({ beneficiary: 'CC', iban: 'BE68539007547034' });
  });
});
