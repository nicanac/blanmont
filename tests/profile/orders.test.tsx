/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/app/lib/qrcode', () => ({ generateQrCodeSvg: vi.fn().mockResolvedValue('<svg></svg>') }));

import { buildTimeline } from '@/app/profile/commandes/timeline';
import OrderCard from '@/app/profile/commandes/OrderCard';
import { formatDate } from '@/app/components/payments/format';
import type { EquipmentCampaign, EquipmentOrder } from '@/app/types/equipment';

const order: EquipmentOrder = {
  id: 'o1',
  memberName: 'Jean',
  memberEmail: 'j@x.be',
  items: [{ equipmentId: 'm1', equipmentName: 'Maillot été', size: 'M', quantity: 2, unitPrice: 79.5 }],
  totalPrice: 159,
  status: 'pending',
  createdAt: '2026-11-20T10:00:00.000Z',
  source: 'campaign',
  campaignId: 'c1',
  paymentReference: '123456789002',
};
const campaign = { id: 'c1', title: 'Hiver', supplierOrderedAt: '2026-12-02T08:00:00.000Z' } as EquipmentCampaign;

describe('buildTimeline', () => {
  it('lists five steps for a campaign order, future ones without a date', () => {
    const steps = buildTimeline({ ...order, status: 'paid', paidAt: '2026-11-22' }, campaign);
    expect(steps.map((s) => s.label)).toEqual([
      'Commandé le',
      'Payé le',
      'Commandé chez Gobik le',
      'Arrivé au club le',
      'Remis le',
    ]);
    expect(steps.map((s) => Boolean(s.date))).toEqual([true, true, true, false, false]);
  });

  it('skips the supplier steps for a stock order', () => {
    const steps = buildTimeline({ ...order, source: 'stock' });
    expect(steps.map((s) => s.label)).toEqual(['Commandé le', 'Payé le', 'Remis le']);
  });

  it('stops at the cancellation date', () => {
    const steps = buildTimeline({ ...order, status: 'cancelled', cancelledAt: '2026-11-25T09:00:00.000Z' });
    expect(steps.map((s) => s.label)).toEqual(['Commandé le', 'Annulée le']);
  });
});

describe('formatDate', () => {
  it('does not shift a bare bank value date', () => {
    expect(formatDate('2026-11-22')).toBe('22 novembre 2026');
  });
});

describe('OrderCard', () => {
  it('shows items, total, chip, dates and a collapsed Payer disclosure for a pending order', () => {
    const { container } = render(<ul><OrderCard order={order} campaign={campaign} epcPayload="BCD" iban="BE68539007547034" beneficiary="CC" /></ul>);
    expect(screen.getByText(/2 × Maillot été · taille M/)).toBeInTheDocument();
    expect(screen.getAllByText('159,00 €').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('À payer')).toBeInTheDocument();
    expect(screen.getByText('20 novembre 2026')).toBeInTheDocument();
    expect(screen.getAllByText('En attente').length).toBeGreaterThanOrEqual(2);
    const details = container.querySelector('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(within(details).getByText('Payer')).toBeInTheDocument();
  });

  it('has no payment disclosure once paid', () => {
    const { container } = render(<ul><OrderCard order={{ ...order, status: 'paid', paidAt: '2026-11-22' }} campaign={campaign} epcPayload={null} /></ul>);
    expect(container.querySelector('details')).toBeNull();
    expect(screen.getByText('Payée')).toBeInTheDocument();
  });
});
