/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProspectsHeader from '@/app/admin/prospects/components/ProspectsHeader';
import ProspectsTable from '@/app/admin/prospects/components/ProspectsTable';
import ProspectDetailModal from '@/app/admin/prospects/components/ProspectDetailModal';
import { TrialRideRequest, Member } from '@/app/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/admin/prospects/actions', () => ({
  updateProspectStatusAction: vi.fn().mockResolvedValue({ success: true }),
  updateProspectDetailsAction: vi.fn().mockResolvedValue({ success: true }),
  convertProspectToMemberAction: vi.fn().mockResolvedValue({ success: true, memberId: 'mem-new' }),
  deleteProspectAction: vi.fn().mockResolvedValue({ success: true }),
}));

const mockProspects: TrialRideRequest[] = [
  {
    id: 'p-1',
    name: 'Gauthier Deflandre',
    email: 'gauthier@example.com',
    phone: '0471234567',
    preferredGroup: 'B',
    bikeType: 'Route',
    experienceLevel: 'Intermédiaire',
    firstRideDate: '2026-09-26',
    message: 'Je roule depuis 2 ans.',
    status: 'pending',
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'p-2',
    name: 'Sarah Dumont',
    email: 'sarah@example.com',
    phone: '+32478998877',
    preferredGroup: 'C',
    bikeType: 'Gravel',
    experienceLevel: 'Débutant',
    firstRideDate: '2026-09-27',
    message: 'Reprise tranquille.',
    status: 'contacted',
    mentorCaptainName: 'Marc V.',
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'p-3',
    name: 'Arthur Verstraete',
    email: 'arthur@example.com',
    phone: '0479112233',
    preferredGroup: 'A',
    bikeType: 'Route',
    experienceLevel: 'Confirmé',
    status: 'converted',
    createdAt: '2026-09-10T10:00:00Z',
  },
];

const mockCaptains: Member[] = [
  {
    id: 'cap-1',
    name: 'Marc Vandevelde',
    email: 'marc@blanmont.be',
    role: ['Capitaine'],
  },
  {
    id: 'cap-2',
    name: 'Philippe Baert',
    email: 'philippe@blanmont.be',
    role: ['Capitaine'],
  },
];

describe('ProspectsHeader', () => {
  it('renders title and correct metric counts', () => {
    render(<ProspectsHeader prospects={mockProspects} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Candidatures & Sorties d'essai/i })
    ).toBeInTheDocument();

    // Check count values
    expect(screen.getByText('À contacter')).toBeInTheDocument();
    expect(screen.getByText('En cours d\'essai')).toBeInTheDocument();
    expect(screen.getByText('Convertis Membres')).toBeInTheDocument();
    expect(screen.getByText('Total Candidats')).toBeInTheDocument();
  });

  it('triggers CSV download when clicking export button', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(<ProspectsHeader prospects={mockProspects} />);

    const exportBtn = screen.getByRole('button', { name: /Exporter CSV/i });
    fireEvent.click(exportBtn);

    expect(createObjectURLMock).toHaveBeenCalled();
  });
});

describe('ProspectsTable', () => {
  it('renders table rows and handles filtering by search term', () => {
    render(<ProspectsTable initialProspects={mockProspects} captains={mockCaptains} />);

    // Renders prospects
    expect(screen.getByText('Gauthier Deflandre')).toBeInTheDocument();
    expect(screen.getByText('Sarah Dumont')).toBeInTheDocument();
    expect(screen.getByText('Arthur Verstraete')).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(/Rechercher par nom/i);
    fireEvent.change(searchInput, { target: { value: 'Sarah' } });

    expect(screen.getByText('Sarah Dumont')).toBeInTheDocument();
    expect(screen.queryByText('Gauthier Deflandre')).not.toBeInTheDocument();
  });

  it('filters by status tab', () => {
    render(<ProspectsTable initialProspects={mockProspects} captains={mockCaptains} />);

    // Click on 'À contacter' tab
    const pendingTab = screen.getByRole('button', { name: /À contacter/i });
    fireEvent.click(pendingTab);

    expect(screen.getByText('Gauthier Deflandre')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Dumont')).not.toBeInTheDocument();
    expect(screen.queryByText('Arthur Verstraete')).not.toBeInTheDocument();
  });

  it('opens detail modal when clicking a row', () => {
    render(<ProspectsTable initialProspects={mockProspects} captains={mockCaptains} />);

    const gauthierRow = screen.getByText('Gauthier Deflandre');
    fireEvent.click(gauthierRow);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Gauthier Deflandre' })).toBeInTheDocument();
  });
});

describe('ProspectDetailModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders candidate details, message, and WhatsApp action link', () => {
    const onStatusChange = vi.fn();
    const onSaveDetails = vi.fn();
    const onConvertToMember = vi.fn();
    const onDelete = vi.fn();

    render(
      <ProspectDetailModal
        isOpen={true}
        prospect={mockProspects[0]}
        captains={mockCaptains}
        onClose={vi.fn()}
        onStatusChange={onStatusChange}
        onSaveDetails={onSaveDetails}
        onConvertToMember={onConvertToMember}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Gauthier Deflandre')).toBeInTheDocument();
    expect(screen.getByText('Groupe B')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText(/Je roule depuis 2 ans/i)).toBeInTheDocument();

    // Check WhatsApp link
    const waLink = screen.getByRole('link', { name: /Message WhatsApp Pré-rempli/i });
    expect(waLink).toHaveAttribute('href', expect.stringContaining('https://wa.me/32471234567'));
    expect(waLink).toHaveAttribute('href', expect.stringContaining('CC%20Saint-Martin%20Blanmont'));
  });

  it('calls onStatusChange when clicking a pipeline step', async () => {
    const onStatusChange = vi.fn().mockResolvedValue(true);

    render(
      <ProspectDetailModal
        isOpen={true}
        prospect={mockProspects[0]}
        captains={mockCaptains}
        onClose={vi.fn()}
        onStatusChange={onStatusChange}
        onSaveDetails={vi.fn()}
        onConvertToMember={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const contactedBtn = screen.getByRole('button', { name: /Contacté/i });
    fireEvent.click(contactedBtn);

    expect(onStatusChange).toHaveBeenCalledWith('p-1', 'contacted');
  });

  it('calls onConvertToMember when user confirms conversion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onConvertToMember = vi.fn().mockResolvedValue({ success: true, memberId: 'm-100' });

    render(
      <ProspectDetailModal
        isOpen={true}
        prospect={mockProspects[0]}
        captains={mockCaptains}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onSaveDetails={vi.fn()}
        onConvertToMember={onConvertToMember}
        onDelete={vi.fn()}
      />
    );

    const convertBtn = screen.getByRole('button', { name: /Convertir en Membre Club/i });
    await fireEvent.click(convertBtn);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(onConvertToMember).toHaveBeenCalledWith('p-1');
    });
  });
});
