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
    expect(screen.getByRole('button', { name: /commander et payer/i })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /ajouter au bon de commande/i }));
    fireEvent.click(screen.getByRole('button', { name: /commander et payer/i }));
    await waitFor(() => expect(screen.getByText('+++123/4567/89002+++')).toBeInTheDocument());
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ items: [{ productId: 'm1', size: 'M', quantity: 1 }], source: 'campaign', campaignId: 'c1' }));
    expect(screen.getByText(/bientôt disponibles/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /commander et payer/i })).toBeNull();
  });

  it('builds a multi-line order: merges the same size, counts the cart against stock, removes a line', async () => {
    const bib = { ...product, id: 'b1', name: 'Cuissard', price: 20, stock: { S: 3, M: 3, L: 3 } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [product, bib] }));
    submit.mockResolvedValue({ success: true, orderId: 'abcdef123456', total: 179, paymentReference: '123456789002', epcPayload: null });
    render(<CheckoutClient memberName="Jean" campaign={null} payment={null} />);
    await waitFor(() => expect(screen.getByRole('button', { name: /^L\s*5 en stock/ })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: /^L\s*5 en stock/ }));
    const add = screen.getByRole('button', { name: /ajouter au bon de commande/i });
    fireEvent.click(add); // 1 × L
    fireEvent.click(screen.getByRole('button', { name: 'Plus' }));
    fireEvent.click(add); // + 2 × L, merged into 3 × L
    expect(screen.getByText(/3× Maillot été/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Plus' }));
    fireEvent.click(screen.getByRole('button', { name: 'Plus' }));
    expect(screen.getByRole('button', { name: /^L\s*5 en stock/ })).toBeDisabled(); // 3 in cart + 3 > 5

    fireEvent.change(screen.getByLabelText(/choisir un modèle/i), { target: { value: 'b1' } });
    fireEvent.click(screen.getByRole('button', { name: /^M\s*3 en stock/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Moins' }));
    fireEvent.click(screen.getByRole('button', { name: 'Moins' }));
    fireEvent.click(add);
    expect(screen.getAllByText(/258\.50/).length).toBeGreaterThan(0); // 3 × 79.5 + 20

    fireEvent.click(screen.getByRole('button', { name: /retirer cuissard taille m/i }));
    fireEvent.click(add);
    fireEvent.click(screen.getByRole('button', { name: /commander et payer/i }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].items).toEqual([
      { productId: 'm1', size: 'L', quantity: 3 },
      { productId: 'b1', size: 'M', quantity: 1 },
    ]);
  });
});
