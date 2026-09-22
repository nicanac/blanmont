/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MemberPassClient from '@/app/profile/pass/MemberPassClient';
import { getMemberProfileAction, updateMemberEmergencyAction } from '@/app/actions';
import * as authContext from '@/app/context/AuthContext';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/app/actions', () => ({
  getMemberProfileAction: vi.fn(),
  updateMemberEmergencyAction: vi.fn(),
}));

vi.mock('@/app/lib/qrcode', () => ({
  generateQrCodeSvg: vi.fn().mockResolvedValue('<svg data-testid="qr-svg"></svg>'),
  generateQrCodeDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn().mockReturnValue('toast-1'),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('MemberPassClient (/profile/pass)', () => {
  const mockUser = {
    id: 'member-101',
    name: 'Nicolas Bruyère',
    username: 'bruyere.nicolas@gmail.com',
    email: 'bruyere.nicolas@gmail.com',
    role: ['Capitaine de route', 'Membre'],
    avatarUrl: 'https://images.unsplash.com/photo-cyclist.jpg',
  };

  const mockProfile = {
    id: 'member-101',
    name: 'Nicolas Bruyère',
    email: 'bruyere.nicolas@gmail.com',
    phone: '+32 470 11 22 33',
    photoUrl: 'https://images.unsplash.com/photo-cyclist.jpg',
    preferredGroup: 'A' as const,
    cotisation2026Status: 'paid' as const,
    cotisation2026PaidAt: '15/01/2026',
    ffbcLicenseNumber: '2026-B-998877',
    iceContactName: 'Marie Dupont',
    iceContactPhone: '+32 470 99 88 77',
    iceRelationship: 'Conjointe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      isAdmin: false,
    });

    vi.mocked(getMemberProfileAction).mockResolvedValue(mockProfile);
    vi.mocked(updateMemberEmergencyAction).mockResolvedValue({ success: true });
  });

  it('renders official member card with name, FFBC license, and 2026 cotisation status', async () => {
    render(<MemberPassClient />);

    expect(await screen.findByText('Nicolas Bruyère')).toBeInTheDocument();
    expect(screen.getByText('CC Saint-Martin Blanmont')).toBeInTheDocument();
    expect(screen.getByText('2026-B-998877')).toBeInTheDocument();
    expect(screen.getByText('En règle pour la saison')).toBeInTheDocument();
    expect(screen.getByText(/Groupe A/i)).toBeInTheDocument();
  });

  it('provides a 1-tap direct call button for the emergency contact (ICE)', async () => {
    render(<MemberPassClient />);

    expect(await screen.findByText('Marie Dupont')).toBeInTheDocument();
    expect(screen.getByText('Lien : Conjointe')).toBeInTheDocument();

    const callButton = screen.getByRole('link', {
      name: /Appel Direct ICE : \+32 470 99 88 77/i,
    });
    expect(callButton).toBeInTheDocument();
    expect(callButton).toHaveAttribute('href', 'tel:+32 470 99 88 77');

    // 112 emergency services link
    const emergency112 = screen.getByRole('link', {
      name: /Appeler le 112/i,
    });
    expect(emergency112).toHaveAttribute('href', 'tel:112');
  });

  it('allows toggling between Pointage Départ and Fiche Secours ICE QR codes', async () => {
    render(<MemberPassClient />);

    await screen.findByText('Pointage Express Départ');

    const iceTab = screen.getByRole('button', { name: /Fiche Secours ICE/i });
    act(() => {
      fireEvent.click(iceTab);
    });

    expect(
      screen.getByText('Carte Secours vCard Numérique')
    ).toBeInTheDocument();

    const pointageTab = screen.getByRole('button', { name: /Pointage Départ/i });
    act(() => {
      fireEvent.click(pointageTab);
    });

    expect(
      screen.getByText('Embarquement Sortie Club')
    ).toBeInTheDocument();
  });

  it('opens and closes the fullscreen QR code modal for departure check-in', async () => {
    render(<MemberPassClient />);

    await screen.findByText('Pointage Express Départ');

    const fullscreenBtn = screen.getByRole('button', { name: /Plein Écran/i });
    fireEvent.click(fullscreenBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('Luminosité maximale recommandée pour le scan en extérieur.')
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Fermer le plein écran' });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('allows editing emergency contact and FFBC license directly from the pass', async () => {
    render(<MemberPassClient />);

    await screen.findByText('Nicolas Bruyère');

    const editButtons = screen.getAllByRole('button', { name: /Modifier/i });
    fireEvent.click(editButtons[0]);

    expect(
      screen.getByText('Mettre à jour ma Carte & Coordonnées')
    ).toBeInTheDocument();

    const licenseInput = screen.getByPlaceholderText('ex: 2026-B-12345');
    fireEvent.change(licenseInput, { target: { value: '2026-B-554433' } });

    const saveBtn = screen.getByRole('button', { name: /Enregistrer/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateMemberEmergencyAction).toHaveBeenCalledWith(
        expect.objectContaining({
          ffbcLicenseNumber: '2026-B-554433',
        })
      );
    });
  });

  it('displays warnings and action prompt when ICE or FFBC license is missing', async () => {
    vi.mocked(getMemberProfileAction).mockResolvedValue({
      id: 'member-101',
      name: 'Nicolas Bruyère',
      email: 'bruyere.nicolas@gmail.com',
      cotisation2026Status: 'pending',
      ffbcLicenseNumber: undefined,
      iceContactName: undefined,
      iceContactPhone: undefined,
    });

    render(<MemberPassClient />);

    expect(await screen.findByText('Aucun contact ICE renseigné')).toBeInTheDocument();
    expect(screen.getByText('Renseigner mon n° de licence')).toBeInTheDocument();
    expect(screen.getByText('Cotisation en attente')).toBeInTheDocument();
  });

  it('restores member pass data from localStorage when offline', async () => {
    localStorage.setItem(
      'cc_blanmont_member_pass_cache',
      JSON.stringify({
        ...mockProfile,
        name: 'Nicolas Bruyère (Hors-Ligne)',
      })
    );

    // Simulate network failure
    vi.mocked(getMemberProfileAction).mockRejectedValue(new Error('Network error'));

    render(<MemberPassClient />);

    expect(await screen.findByText('Nicolas Bruyère (Hors-Ligne)')).toBeInTheDocument();
    expect(screen.getByText('Hors-Ligne')).toBeInTheDocument();
  });
});
