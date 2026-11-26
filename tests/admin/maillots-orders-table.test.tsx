/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrdersTable, { type OrderTransitions } from '@/app/admin/commandes/components/OrdersTable';
import type { EquipmentOrder } from '@/app/types/equipment';

const actions = vi.hoisted(() => ({
  markOrderPaidAction: vi.fn(),
  markOrderDeliveredAction: vi.fn(),
  cancelOrderAction: vi.fn(),
  deleteOrderAction: vi.fn(),
}));
vi.mock('@/app/admin/commandes/actions', () => actions);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/app/context/ThemeContext', () => ({ useTheme: () => ({ resolvedTheme: 'light' }) }));

const base = {
  memberName: 'Léa Martin', memberEmail: 'lea@example.com',
  items: [{ equipmentId: 'e1', equipmentName: 'Maillot', size: 'M', quantity: 1, unitPrice: 75 }],
  totalPrice: 75, createdAt: '2026-11-20T10:00:00.000Z',
};
const transitions: OrderTransitions = {
  pending: ['paid', 'cancelled'],
  paid: ['delivered', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
const orders: EquipmentOrder[] = [
  { ...base, id: 'o1', status: 'pending', source: 'campaign', paymentReference: '100000001246' },
  { ...base, id: 'o2', memberName: 'Paul Durand', status: 'paid', paidAt: '2026-11-22', paymentReference: '100000002342' },
  { ...base, id: 'o3', memberName: 'Zoé Petit', status: 'delivered', deliveredAt: '2026-11-25T09:00:00.000Z' },
];

describe('OrdersTable (maillots)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.markOrderPaidAction.mockResolvedValue({ success: true });
    actions.cancelOrderAction.mockResolvedValue({ success: true });
    actions.markOrderDeliveredAction.mockResolvedValue({ success: true });
  });

  it('shows French status chips, OGM, source and dates', () => {
    render(<OrdersTable initialOrders={orders} transitions={transitions} />);
    expect(screen.getAllByText('En attente de paiement').length).toBeGreaterThan(0);
    expect(screen.getByText('+++100/0000/01246+++')).toBeTruthy();
    expect(screen.getByText('Commande groupée')).toBeTruthy();
    expect(screen.getByText(/Payé 22\/11\/2026/)).toBeTruthy();
    expect(screen.getByText(/Remis 25\/11\/2026/)).toBeTruthy();
  });

  it('offers only the actions allowed by the transitions', () => {
    render(<OrdersTable initialOrders={orders} transitions={transitions} />);
    expect(screen.getAllByRole('button', { name: 'Marquer payé' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Remis' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Annuler' })).toHaveLength(2);
  });

  it('marks an order paid and updates the row', async () => {
    render(<OrdersTable initialOrders={orders} transitions={transitions} />);
    await userEvent.click(screen.getByRole('button', { name: 'Marquer payé' }));
    await waitFor(() => expect(actions.markOrderPaidAction).toHaveBeenCalledWith('o1'));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Marquer payé' })).toBeNull());
  });

  it('warns about refunds when cancelling a paid order, and aborts on refusal', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<OrdersTable initialOrders={[orders[1]]} transitions={transitions} />);
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(confirm.mock.calls[0][0]).toContain('remboursement à faire hors application');
    expect(actions.cancelOrderAction).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    await waitFor(() => expect(actions.cancelOrderAction).toHaveBeenCalledWith('o2'));
  });

  it('does not warn about refunds for an unpaid order', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<OrdersTable initialOrders={[orders[0]]} transitions={transitions} />);
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(confirm.mock.calls[0][0]).not.toContain('remboursement');
  });
});
