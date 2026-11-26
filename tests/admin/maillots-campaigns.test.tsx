/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignDetail from '@/app/admin/commandes/campagnes/components/CampaignDetail';
import CampaignForm from '@/app/admin/commandes/campagnes/components/CampaignForm';
import AdminCampaignPage from '@/app/admin/commandes/campagnes/[id]/page';
import type { EquipmentCampaign, EquipmentOrder } from '@/app/types/equipment';

const mocks = vi.hoisted(() => ({
  transitionCampaignAction: vi.fn(),
  markCampaignOrderDeliveredAction: vi.fn(),
  createCampaignAction: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock('@/app/admin/commandes/campagnes/actions', () => mocks);
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }), notFound: vi.fn() }));
vi.mock('@/app/lib/firebase/equipment-campaigns', () => ({
  getEquipmentCampaign: async () => campaign,
  buildSizeMatrix: vi.fn(),
}));
vi.mock('@/app/lib/firebase/equipment-orders', () => ({
  readEquipmentOrders: () => Promise.reject(new Error('RTDB down')),
}));
vi.mock('@/app/lib/firebase/equipment', () => ({ getEquipment: async () => [] }));
vi.mock('next/link', () => ({ default: ({ children, href }: any) => <a href={href}>{children}</a> }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/app/context/ThemeContext', () => ({ useTheme: () => ({ resolvedTheme: 'light' }) }));

const base = {
  memberName: 'Léa Martin', memberEmail: 'lea@example.com',
  items: [{ equipmentId: 'e1', equipmentName: 'Maillot', size: 'M', quantity: 1, unitPrice: 75 }],
  totalPrice: 75, createdAt: '2026-11-20T10:00:00.000Z',
};
const campaign: EquipmentCampaign = {
  id: 'c1', title: 'Printemps 2027', equipmentIds: ['e1'], closesAt: '2026-12-01T22:00:00.000Z',
  status: 'closed', createdAt: '2026-11-20T10:00:00.000Z',
};
const matrix = {
  lines: [
    { equipmentId: 'e1', equipmentName: 'Maillot', size: 'M', members: 2, extra: 1, total: 3 },
    { equipmentId: 'e1', equipmentName: 'Maillot', size: 'L', members: 1, extra: 0, total: 1 },
  ],
  unpaidOrders: [{ ...base, id: 'u1', memberName: 'Impayé Ivan', status: 'pending', paymentReference: '100000001246' } as EquipmentOrder],
};
const paid = { ...base, id: 'p1', status: 'paid' } as EquipmentOrder;

describe('CampaignDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transitionCampaignAction.mockResolvedValue({ success: true });
    mocks.markCampaignOrderDeliveredAction.mockResolvedValue({ success: true });
  });

  it('renders the stepper, the matrix totals and the unpaid warning', () => {
    render(<CampaignDetail campaign={campaign} matrix={matrix} toHandOver={[]} gobikReferences={{ e1: 'Jersey' }} />);
    expect(screen.getByText('Commandée chez Gobik', { selector: 'span' })).toBeTruthy();
    expect(screen.getByRole('listitem', { current: 'step' }).textContent).toContain('Clôturée');
    const footer = screen.getAllByRole('row').at(-1)!;
    expect(footer.textContent).toBe('Total314');
    expect(screen.getByText(/Impayé Ivan/)).toBeTruthy();
    expect(screen.queryByText('Remise aux membres')).toBeNull();
  });

  it('moves to the next step', async () => {
    render(<CampaignDetail campaign={campaign} matrix={matrix} toHandOver={[]} gobikReferences={{}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Marquer commandée chez Gobik' }));
    await waitFor(() => expect(mocks.transitionCampaignAction).toHaveBeenCalledWith('c1', 'ordered'));
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('confirms before marking received and shows the checklist', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<CampaignDetail campaign={{ ...campaign, status: 'ordered' }} matrix={matrix} toHandOver={[]} gobikReferences={{}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Marquer reçue' }));
    expect(confirm).toHaveBeenCalled();
    expect(mocks.transitionCampaignAction).not.toHaveBeenCalled();

    render(<CampaignDetail campaign={{ ...campaign, status: 'received' }} matrix={matrix} toHandOver={[paid]} gobikReferences={{}} />);
    await userEvent.click(screen.getByRole('button', { name: /comme remise/ }));
    await waitFor(() => expect(mocks.markCampaignOrderDeliveredAction).toHaveBeenCalledWith('p1'));
  });
});

describe('CampaignForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createCampaignAction.mockResolvedValue({ success: true, campaignId: 'new1' });
  });
  const equipment = [{ id: 'e1', name: 'Maillot', sizes: ['M', 'L'] }];

  it('submits title, articles, ISO deadline and non-zero extra stock', async () => {
    render(<CampaignForm equipment={equipment} />);
    await userEvent.type(screen.getByLabelText('Titre'), 'Printemps 2027');
    await userEvent.click(screen.getByLabelText('Maillot'));
    await userEvent.click(screen.getByText(/Unités supplémentaires/));
    await userEvent.type(screen.getByLabelText('M'), '2');
    await userEvent.type(screen.getByLabelText('Date de clôture'), '2030-01-15T18:00');
    await userEvent.click(screen.getByRole('button', { name: 'Créer la commande groupée' }));
    await waitFor(() => expect(mocks.createCampaignAction).toHaveBeenCalled());
    expect(mocks.createCampaignAction).toHaveBeenCalledWith({
      title: 'Printemps 2027',
      equipmentIds: ['e1'],
      closesAt: new Date('2030-01-15T18:00').toISOString(),
      extraStock: { e1: { M: 2 } },
    });
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/admin/commandes/campagnes/new1'));
  });

  it('shows the server error in an alert', async () => {
    mocks.createCampaignAction.mockResolvedValue({ success: false, error: 'Choisissez au moins un article' });
    render(<CampaignForm equipment={equipment} />);
    await userEvent.type(screen.getByLabelText('Titre'), 'Test');
    await userEvent.type(screen.getByLabelText('Date de clôture'), '2030-01-15T18:00');
    await userEvent.click(screen.getByRole('button', { name: 'Créer la commande groupée' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Choisissez au moins un article');
  });
});

describe('AdminCampaignPage', () => {
  it('says the orders could not be loaded instead of an empty size matrix', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(await AdminCampaignPage({ params: Promise.resolve({ id: 'c1' }) }));
    expect(screen.getByRole('alert').textContent).toBe(
      'Impossible de charger les commandes pour le moment. Réessayez plus tard.'
    );
  });
});
