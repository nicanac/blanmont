/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const submit = vi.fn();
vi.mock('@/app/checkout/actions', () => ({ submitEquipmentOrderAction: (...a: unknown[]) => submit(...a) }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams('product=m1') }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/app/lib/qrcode', () => ({ generateQrCodeSvg: vi.fn().mockResolvedValue('<svg></svg>') }));
vi.mock('@/app/components/equipment/GobikSizeGuide', () => ({ default: () => null }));

import CheckoutClient from '@/app/checkout/CheckoutClient';

const product = { id: 'm1', name: 'Maillot été', category: 'Maillot', description: 'd', price: 79.5, sizes: ['S', 'M', 'L'], stock: { S: 0, M: 1, L: 5 }, imageUrl: '', isAvailable: true };
const campaign = { id: 'c1', title: 'Hiver', closesAt: '2026-12-12T19:00:00.000Z', equipmentIds: ['m1'] };

beforeEach(() => {
  submit.mockReset();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [product] }));
});

describe('CheckoutClient', () => {
  it('shows the member name, no name/email inputs, and defaults to the group order', async () => {
    render(<CheckoutClient memberName="Jean Martin" campaign={campaign} payment={null} />);
    expect(screen.getByText('Jean Martin')).toBeInTheDocument();
    expect(screen.queryByLabelText(/adresse email/i)).toBeNull();
    expect(await screen.findByRole('radio', { name: /commande groupée « hiver »/i }, { timeout: 5000 })).toBeChecked();
    expect(screen.getByText(/clôture le 12 décembre 2026/i)).toBeInTheDocument();
  });

  it('stock mode: only sizes with enough stock are selectable and show remaining units', async () => {
    render(<CheckoutClient memberName="Jean" campaign={null} payment={null} />);
    expect(screen.getByText(/aucune commande groupée ouverte/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /^L\s*5 en stock/ })).toBeEnabled());
    expect(screen.getByRole('button', { name: /^S\s*0 en stock/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Plus' }));
    expect(screen.getByRole('button', { name: /^M\s*1 en stock/ })).toBeDisabled();
  });

  it('submits a campaign order and shows the payment card', async () => {
    submit.mockResolvedValue({ success: true, orderId: 'abcdef123456', total: 79.5, paymentReference: '123456789002', epcPayload: null });
    render(<CheckoutClient memberName="Jean" campaign={campaign} payment={null} />);
    await screen.findByRole('radio', { name: /commande groupée/i }, { timeout: 5000 }); // product list loaded
    fireEvent.click(screen.getByRole('button', { name: /commander et payer/i }));
    await waitFor(() => expect(screen.getByText('+++123/4567/89002+++')).toBeInTheDocument());
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ productId: 'm1', source: 'campaign', campaignId: 'c1' }));
    expect(screen.getByText(/bientôt disponibles/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /commander et payer/i })).toBeNull();
  });
});
