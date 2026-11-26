/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/app/lib/qrcode', () => ({
  generateQrCodeSvg: vi.fn().mockResolvedValue('<svg data-testid="qr"></svg>'),
}));

import PaymentCard from '@/app/components/payments/PaymentCard';
import { generateQrCodeSvg } from '@/app/lib/qrcode';

const props = {
  reference: '123456789002',
  amountEur: 79.5,
  epcPayload: 'BCD\n002',
  iban: 'BE68539007547034',
  beneficiary: 'CC Blanmont',
};

describe('PaymentCard', () => {
  it('renders the QR with level M, amount, grouped IBAN and formatted reference', async () => {
    render(<PaymentCard {...props} />);
    await waitFor(() => expect(screen.getByRole('img', { name: /qr code/i }).querySelector('svg')).not.toBeNull());
    expect(generateQrCodeSvg).toHaveBeenCalledWith('BCD\n002', { errorCorrectionLevel: 'M' });
    expect(screen.getByText('79,50 €')).toBeInTheDocument();
    expect(screen.getByText('+++123/4567/89002+++')).toBeInTheDocument();
    expect(screen.getByText(/BE68 5390 0754 7034/)).toBeInTheDocument();
    expect(screen.getByText(/reconnu automatiquement/)).toBeInTheDocument();
  });

  it('copies the reference and the unspaced IBAN', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<PaymentCard {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /copier communication structurée/i }));
    fireEvent.click(screen.getByRole('button', { name: /copier iban/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText).toHaveBeenNthCalledWith(1, '+++123/4567/89002+++');
    expect(writeText).toHaveBeenNthCalledWith(2, 'BE68539007547034');
  });

  it('falls back to the reference when the club account is missing', () => {
    render(<PaymentCard {...props} epcPayload={null} />);
    expect(screen.getByText(/bientôt disponibles/)).toBeInTheDocument();
    expect(screen.getByText('+++123/4567/89002+++')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('button', { name: /copier iban/i })).toBeNull();
  });
});
