/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BankClient from '@/app/admin/commandes/banque/components/BankClient';
import type { BankTransaction } from '@/app/types/equipment';

const mocks = vi.hoisted(() => ({
  importCodaAction: vi.fn(),
  assignTransactionAction: vi.fn(),
  ignoreTransactionAction: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock('@/app/admin/commandes/banque/actions', () => mocks);
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const tx: BankTransaction = {
  id: 't1', importedAt: '2026-11-26T08:00:00.000Z', valueDate: '2026-11-25', amountCents: 7500,
  counterpartyName: 'MARTIN LEA', counterpartyIbanLast4: '1234', communication: 'maillot',
  status: 'unmatched', reason: 'no-reference',
};
const pendingOrders = [{ id: 'o1', memberName: 'Léa Martin', paymentReference: '100000001246', totalPrice: 75 }];

describe('BankClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assignTransactionAction.mockResolvedValue({ success: true });
    mocks.ignoreTransactionAction.mockResolvedValue({ success: true });
  });

  it('lists unmatched credits with reason, masked IBAN and amount', () => {
    render(<BankClient unmatched={[tx]} matched={[]} pendingOrders={pendingOrders} />);
    expect(screen.getByText('Sans référence')).toBeTruthy();
    expect(screen.getByText(/\*\*\*\*1234/)).toBeTruthy();
    expect(screen.getByText('75,00 €')).toBeTruthy();
  });

  it('imports a CODA file and announces the summary', async () => {
    mocks.importCodaAction.mockResolvedValue({ success: true, summary: { total: 5, duplicates: 1, matched: 3, unmatched: 1 } });
    render(<BankClient unmatched={[]} matched={[]} pendingOrders={[]} />);
    const file = new File(['x'], 'extrait.cod', { type: 'text/plain' });
    await userEvent.upload(screen.getByLabelText(/Fichier CODA/), file);
    // jsdom does not count userEvent-uploaded files for `required`, so submit the form directly
    fireEvent.submit(screen.getByRole('button', { name: 'Importer' }).closest('form')!);
    await waitFor(() => expect(mocks.importCodaAction).toHaveBeenCalled());
    const body = mocks.importCodaAction.mock.calls[0][0] as FormData;
    expect(body.has('file')).toBe(true);
    expect((await screen.findByText(/1 doublon ignoré/)).closest('[aria-live]')?.textContent).toContain('3 rapprochées · 1 à traiter');
  });

  it('shows an import error', async () => {
    mocks.importCodaAction.mockResolvedValue({ success: false, error: 'Fichier CODA invalide' });
    render(<BankClient unmatched={[]} matched={[]} pendingOrders={[]} />);
    await userEvent.upload(screen.getByLabelText(/Fichier CODA/), new File(['x'], 'a.cod'));
    // jsdom does not count userEvent-uploaded files for `required`, so submit the form directly
    fireEvent.submit(screen.getByRole('button', { name: 'Importer' }).closest('form')!);
    expect(await screen.findByText('Fichier CODA invalide')).toBeTruthy();
  });

  it('assigns a credit to a pending order and can ignore one', async () => {
    render(<BankClient unmatched={[tx]} matched={[]} pendingOrders={pendingOrders} />);
    const assign = screen.getByRole('button', { name: 'Associer à une commande' });
    expect((assign as HTMLButtonElement).disabled).toBe(true);
    await userEvent.selectOptions(screen.getByLabelText(/Commande à associer/), 'o1');
    await userEvent.click(assign);
    await waitFor(() => expect(mocks.assignTransactionAction).toHaveBeenCalledWith('t1', 'o1'));

    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }));
    expect(confirm).toHaveBeenCalledWith('Ignorer ce virement ? Il ne sera plus proposé au rapprochement.');
    expect(mocks.ignoreTransactionAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }));
    await waitFor(() => expect(mocks.ignoreTransactionAction).toHaveBeenCalledWith('t1'));
  });
});
