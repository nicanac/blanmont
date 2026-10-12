/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GalleryView from '@/app/galerie/GalleryView';
import type { PhotoAlbum } from '@/app/types';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockAlbums: PhotoAlbum[] = [
  {
    id: 'alb-1',
    title: 'Sortie Ardennaise - Liège Bastogne Liège',
    description: 'Une superbe boucle dans les vallées ardennaises.',
    year: 2026,
    category: 'Ardennes & Stages',
    coverUrl: 'https://images.unsplash.com/photo-1.jpg',
    externalAlbumUrl: 'https://photos.google.com/album-1',
    photoCount: 42,
    featured: true,
    createdAt: '2026-05-10T10:00:00Z',
    images: [
      'https://images.unsplash.com/photo-1.jpg',
      'https://images.unsplash.com/photo-2.jpg',
      'https://images.unsplash.com/photo-3.jpg',
    ],
  },
  {
    id: 'alb-2',
    title: 'La Blanmontoise Printanière',
    description: 'Ouverture officielle de la saison sur nos routes brabançonnes.',
    year: 2025,
    category: 'Sorties',
    coverUrl: 'https://images.unsplash.com/photo-4.jpg',
    photoCount: 18,
    featured: false,
    createdAt: '2025-04-12T08:00:00Z',
    images: ['https://images.unsplash.com/photo-4.jpg'],
  },
  {
    id: 'alb-3',
    title: 'Souper de Gala et Remise des Trophées',
    description: 'Célébration des lauréats du Carré Vert.',
    year: 2024,
    category: 'Événements',
    coverUrl: 'https://images.unsplash.com/photo-5.jpg',
    photoCount: 30,
    featured: false,
    createdAt: '2024-11-20T19:00:00Z',
    images: ['https://images.unsplash.com/photo-5.jpg'],
  },
];

describe('GalleryView Component (app/galerie/GalleryView.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders telemetry strip with total photos, albums, and seasons count', () => {
    render(<GalleryView initialAlbums={mockAlbums} />);

    expect(screen.getByText('Clichés numérisés')).toBeDefined();
    // 42 + 18 + 30 = 90
    expect(screen.getByText('90')).toBeDefined();
    expect(screen.getByText('Chroniques & albums')).toBeDefined();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('Saisons archivées')).toBeDefined();
  });

  it('renders album cards with title, tags, and photo count', () => {
    render(<GalleryView initialAlbums={mockAlbums} />);

    expect(screen.getByText('Sortie Ardennaise - Liège Bastogne Liège')).toBeDefined();
    expect(screen.getByText('La Blanmontoise Printanière')).toBeDefined();
    expect(screen.getByText('Souper de Gala et Remise des Trophées')).toBeDefined();

    expect(screen.getByText('42 photos')).toBeDefined();
    expect(screen.getByText('18 photos')).toBeDefined();
    expect(screen.getByText('À la Une')).toBeDefined();
  });

  it('filters albums by search input', () => {
    render(<GalleryView initialAlbums={mockAlbums} />);

    const searchInput = screen.getByPlaceholderText(/Rechercher une sortie/i);
    fireEvent.change(searchInput, { target: { value: 'Ardennaise' } });

    expect(screen.getByText('Sortie Ardennaise - Liège Bastogne Liège')).toBeDefined();
    expect(screen.queryByText('La Blanmontoise Printanière')).toBeNull();
    expect(screen.queryByText('Souper de Gala et Remise des Trophées')).toBeNull();
  });

  it('filters albums by season', () => {
    render(<GalleryView initialAlbums={mockAlbums} />);

    const season2025Button = screen.getByRole('button', { name: /2025/i });
    fireEvent.click(season2025Button);

    expect(screen.queryByText('Sortie Ardennaise - Liège Bastogne Liège')).toBeNull();
    expect(screen.getByText('La Blanmontoise Printanière')).toBeDefined();
    expect(screen.queryByText('Souper de Gala et Remise des Trophées')).toBeNull();
  });

  it('filters albums by category', () => {
    render(<GalleryView initialAlbums={mockAlbums} />);

    const eventCategoryButton = screen.getByRole('button', { name: /Événements/i });
    fireEvent.click(eventCategoryButton);

    expect(screen.queryByText('Sortie Ardennaise - Liège Bastogne Liège')).toBeNull();
    expect(screen.queryByText('La Blanmontoise Printanière')).toBeNull();
    expect(screen.getByText('Souper de Gala et Remise des Trophées')).toBeDefined();
  });

  it('resets filters when clicking reset button', () => {
    render(<GalleryView initialAlbums={mockAlbums} />);

    const searchInput = screen.getByPlaceholderText(/Rechercher une sortie/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentTitle' } });

    expect(screen.getByText(/Aucun album ne correspond à votre recherche/i)).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /Voir tous les albums/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('Sortie Ardennaise - Liège Bastogne Liège')).toBeDefined();
  });

  it('opens and closes album detail modal (planche contact) when authenticated', () => {
    render(<GalleryView initialAlbums={mockAlbums} isAuthenticated={true} />);

    const explorerButtons = screen.getAllByRole('button', { name: /Explorer/i });
    fireEvent.click(explorerButtons[0]);

    // Modal opens with album title as aria-labelledby
    expect(screen.getByRole('dialog', { name: /Sortie Ardennaise - Liège Bastogne Liège/i })).toBeDefined();
    expect(screen.getByText('Cliquez sur une photo pour l\'agrandir en plein écran :')).toBeDefined();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Fermer l'album/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Cliquez sur une photo pour l\'agrandir en plein écran :')).toBeNull();
  });

  it('opens fullscreen lightbox when clicking a contact sheet photo when authenticated', () => {
    render(<GalleryView initialAlbums={mockAlbums} isAuthenticated={true} />);

    // Open modal
    const explorerButtons = screen.getAllByRole('button', { name: /Explorer/i });
    fireEvent.click(explorerButtons[0]);

    // Click photo thumbnail
    const photoThumbs = screen.getAllByAltText(/Photo 1/i);
    fireEvent.click(photoThumbs[0]);

    // Lightbox opens
    expect(screen.getByRole('dialog', { name: /Visionneuse plein écran/i })).toBeDefined();
    expect(screen.getByText(/Photo 1 sur 3/i)).toBeDefined();

    // Next button
    const nextBtn = screen.getByRole('button', { name: /Photo suivante/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Photo 2 sur 3/i)).toBeDefined();

    // Close lightbox with escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Visionneuse plein écran/i })).toBeNull();
  });

  describe('Privacy & Member access control', () => {
    const mixedAlbums: PhotoAlbum[] = [
      {
        ...mockAlbums[0],
        id: 'priv-1',
        title: 'Sortie Privée Peloton',
        isPublic: false,
      },
      {
        ...mockAlbums[1],
        id: 'pub-1',
        title: 'Album Public Découverte',
        isPublic: true,
      },
    ];

    it('displays privacy banner and member lock badges when unauthenticated', () => {
      render(<GalleryView initialAlbums={mixedAlbums} isAuthenticated={false} />);

      // Privacy banner should be present
      expect(screen.getByText(/Archives photographiques réservées aux membres/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /Connexion membre/i })).toHaveAttribute(
        'href',
        '/login?redirect=/galerie'
      );

      // Private album should have "Membres" badge and "Accès membre" button
      expect(screen.getByText('Sortie Privée Peloton')).toBeDefined();
      expect(screen.getByText('Membres')).toBeDefined();
      expect(screen.getByRole('button', { name: /Accès membre/i })).toBeDefined();

      // Public album should have "Public" badge and "Explorer" button
      expect(screen.getByText('Album Public Découverte')).toBeDefined();
      expect(screen.getByText('Public')).toBeDefined();
      expect(screen.getByRole('button', { name: /Explorer/i })).toBeDefined();
    });

    it('restricts contact sheet and displays locked message when clicking a private album while unauthenticated', () => {
      render(<GalleryView initialAlbums={mixedAlbums} isAuthenticated={false} />);

      const privateBtn = screen.getByRole('button', { name: /Accès membre/i });
      fireEvent.click(privateBtn);

      // Modal opens with lock notice
      expect(screen.getByText(/Album réservé aux membres connectés/i)).toBeDefined();
      expect(
        screen.getByText(/Les photographies et souvenirs de cette sortie sont réservés aux cyclistes adhérents/i)
      ).toBeDefined();
      expect(screen.getByRole('link', { name: /Se connecter pour voir les photos/i })).toHaveAttribute(
        'href',
        '/login?redirect=/galerie'
      );

      // Private photos contact sheet instructions must NOT be present
      expect(screen.queryByText(/Cliquez sur une photo pour l'agrandir en plein écran/i)).toBeNull();
    });

    it('hides privacy banner and allows exploring all albums when authenticated', () => {
      render(<GalleryView initialAlbums={mixedAlbums} isAuthenticated={true} />);

      // Privacy banner should NOT be present
      expect(screen.queryByText(/Archives photographiques réservées aux membres/i)).toBeNull();

      // All albums have explorer buttons
      const explorerButtons = screen.getAllByRole('button', { name: /Explorer/i });
      expect(explorerButtons.length).toBe(2);

      // Opening private album allows viewing photos
      fireEvent.click(explorerButtons[0]);
      expect(screen.getByText('Cliquez sur une photo pour l\'agrandir en plein écran :')).toBeDefined();
      expect(screen.queryByText(/Album réservé aux membres du club/i)).toBeNull();
    });
  });
});
