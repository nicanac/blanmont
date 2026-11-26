/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import MaillotsTutorialModal from '@/app/admin/commandes/components/MaillotsTutorialModal';
import MaillotsPageHeader from '@/app/admin/commandes/components/MaillotsPageHeader';
import OrderHowTo from '@/app/components/payments/OrderHowTo';
import PaymentCard from '@/app/components/payments/PaymentCard';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('MaillotsTutorialModal', () => {
  it('renders the five steps and switches between them', () => {
    render(<MaillotsTutorialModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText(/Guide Trésorier/i)).toBeInTheDocument();
    expect(screen.getByText(/Une seule fois : le compte du club/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /2\. Paiements/ }));
    expect(screen.getByText('Déjà payée ou annulée')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /3\. Commander/ }));
    expect(screen.getByText(/Marquer commandée chez Gobik/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /4\. Distribuer/ }));
    expect(screen.getByText(/Remise aux membres/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /5\. Cas particuliers/ }));
    expect(screen.getByText(/Confidentialité/)).toBeInTheDocument();
  });

  it('opens at the requested tab', () => {
    render(<MaillotsTutorialModal isOpen onClose={vi.fn()} initialTab="order" />);
    expect(screen.getByText(/Clôturer la commande/)).toBeInTheDocument();
  });
});

describe('MaillotsPageHeader', () => {
  it('opens the tutorial from the header button at the page step', () => {
    render(<MaillotsPageHeader initialTab="payments" title="Banque du club" badge={{ icon: BuildingLibraryIcon, label: '0 à traiter' }} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(document.getElementById('maillots-tutorial-btn')!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Rapprocher : import CODA/)).toBeInTheDocument();
  });
});

describe('Member order help', () => {
  it('shows the four steps, the delay warning and the treasurer contact', () => {
    render(<OrderHowTo />);
    expect(screen.getByRole('heading', { name: 'Comment commander et payer' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText(/en général dans la semaine/)).toBeInTheDocument();
    expect(screen.getByText(/trésorier du club/)).toBeInTheDocument();
    expect(screen.queryByText('Arrivé au club le')).not.toBeInTheDocument();
  });

  it('explains each date on the orders page', () => {
    render(<OrderHowTo showDates />);
    expect(screen.getByText('Commandé chez Gobik le')).toBeInTheDocument();
    expect(screen.getByText('Remis le')).toBeInTheDocument();
  });

  it('reminds the exact amount and structured communication on the payment card', () => {
    render(<PaymentCard reference="123456789002" amountEur={10} epcPayload={null} />);
    expect(screen.getByText(/Montant exact et communication structurée obligatoires/)).toBeInTheDocument();
  });
});
