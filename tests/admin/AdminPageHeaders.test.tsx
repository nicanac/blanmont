/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminSettingsPage from '@/app/admin/settings/page';
import AdminEquipementsPage from '@/app/admin/equipements/page';
import MemberPhotosManager from '@/app/admin/members/photos/MemberPhotosManager';
import AdminHeroPage from '@/app/admin/hero/page';
import AdminGalerieClient from '@/app/admin/galerie/AdminGalerieClient';
import { Member, PhotoAlbum } from '@/app/types';
import { DEFAULT_HERO_SETTINGS } from '@/app/constants/hero';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}));

vi.mock('@/app/admin/components/tours/adminTours', () => ({
  useAdminTours: () => ({
    startEquipementsTour: vi.fn(),
  }),
}));

vi.mock('@/app/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    uploadImage: vi.fn(),
    isUploading: false,
    progress: 0,
  }),
}));

const mockMembers: Member[] = [
  {
    id: 'm-1',
    name: 'Jérôme Galle',
    email: 'jerome@example.com',
    role: ['Traceur'],
    photoUrl: 'https://example.com/photo.jpg',
  },
];

const mockAlbums: PhotoAlbum[] = [
  {
    id: 'album-1',
    title: 'Sortie Printemps 2026',
    description: 'Belle sortie en Brabant Wallon',
    year: 2026,
    category: 'Sorties',
    coverUrl: 'https://example.com/cover.jpg',
    photoCount: 42,
    featured: true,
    createdAt: '2026-04-12T10:00:00Z',
  },
];

describe('Standardized AdminPageHeader across Admin Surfaces', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/equipements')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (url.includes('/api/admin/hero')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(DEFAULT_HERO_SETTINGS),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  it('renders standard SheetHeader cartouche on Settings page', () => {
    render(<AdminSettingsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Paramètres du Site & du Club/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Feuille · Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Administration · Configuration/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voir le site public/i })).toBeInTheDocument();
  });

  it('renders standard SheetHeader cartouche on Equipements page', async () => {
    render(<AdminEquipementsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Équipements Gobik/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Feuille · Boutique Gobik/i)).toBeInTheDocument();
    expect(screen.getByText(/Catalogue Officiel/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ajouter un équipement/i })).toBeInTheDocument();
  });

  it('renders standard SheetHeader cartouche on MemberPhotosManager page', () => {
    render(<MemberPhotosManager initialMembers={mockMembers} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Cadrage des Photos Membres/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Feuille · Portraits & Cadrage/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadrage & Portraits/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Annuaire Membres/i })).toBeInTheDocument();
  });

  it('renders standard SheetHeader cartouche on Hero page', async () => {
    render(<AdminHeroPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Bannière Hero & Télémétrie/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Feuille · Bannière Accueil/i)).toBeInTheDocument();
    expect(screen.getByText(/Page d'Accueil/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rétablir défaut/i })).toBeInTheDocument();
  });

  it('renders standard SheetHeader cartouche on Galerie page', () => {
    render(<AdminGalerieClient initialAlbums={mockAlbums} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Galeries Photos & Chroniques/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Feuille · Galeries Photos/i)).toBeInTheDocument();
    expect(screen.getByText(/1 albums/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nouvel Album/i })).toBeInTheDocument();
  });
});
