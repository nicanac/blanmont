/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentSettingsCard from '@/app/admin/settings/components/PaymentSettingsCard';

const mocks = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }));
vi.mock('@/app/admin/settings/payment-read-action', () => ({ getPaymentSettingsAction: mocks.get }));
vi.mock('@/app/admin/settings/payment-actions', () => ({ savePaymentSettingsAction: mocks.save }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const IBAN = 'BE68539007547034';

describe('PaymentSettingsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockResolvedValue({ beneficiary: 'CC Blanmont', iban: IBAN });
    mocks.save.mockResolvedValue({ success: true });
  });

  it('loads the saved account and renders the 1,00 € test QR', async () => {
    render(<PaymentSettingsCard />);
    await waitFor(() => expect((screen.getByLabelText('IBAN') as HTMLInputElement).value).toBe(IBAN));
    const qr = await screen.findByRole('img', { name: /1,00 €/ });
    expect(qr.querySelector('svg')).toBeTruthy();
  });

  it('hints on an invalid IBAN and blocks saving', async () => {
    mocks.get.mockResolvedValue(null);
    render(<PaymentSettingsCard />);
    await userEvent.type(screen.getByLabelText('IBAN'), 'BE00123');
    expect(screen.getByText(/IBAN invalide/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('saves without an empty BIC', async () => {
    render(<PaymentSettingsCard />);
    await waitFor(() => expect((screen.getByLabelText('IBAN') as HTMLInputElement).value).toBe(IBAN));
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ beneficiary: 'CC Blanmont', iban: IBAN }));
  });
});
