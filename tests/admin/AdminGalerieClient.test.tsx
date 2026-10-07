/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminGalerieClient from '@/app/admin/galerie/AdminGalerieClient';
import type { PhotoAlbum } from '@/app/types';

vi.mock('next/image', () => ({
  default: ({ src, alt, fill, unoptimized, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn().mockReturnValue('toast-123'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAlbums: PhotoAlbum[] = [
  {
    id: 'album-1',
    title: 'Sortie Printemps 2026',
    description: 'Belle sortie en Brabant Wallon',
    year: 2026,
    category: 'Sorties',
    coverUrl: 'https://example.com/cover1.jpg',
    photoCount: 42,
    externalAlbumUrl: 'https://photos.app.goo.gl/album1',
    featured: false,
    createdAt: '2026-03-20T10:00:00.000Z',
  },
  {
    id: 'album-2',
    title: 'Ardennes Weekend',
    description: 'Dénivelé et paysages superbes',
    year: 2025,
    category: 'Ardennes & Stages',
    coverUrl: 'https://example.com/cover2.jpg',
    photoCount: 88,
    externalAlbumUrl: '',
    featured: true,
    createdAt: '2025-05-15T10:00:00.000Z',
  },
];

describe('AdminGalerieClient Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders edition buttons in the actions column for each album', () => {
    render(<AdminGalerieClient initialAlbums={mockAlbums} />);

    const editButtons = screen.getAllByRole('button', { name: /Modifier l'album/i });
    expect(editButtons).toHaveLength(2);

    const deleteButtons = screen.getAllByRole('button', { name: /Supprimer l'album/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('opens edit modal with album data when clicking the edition button', () => {
    render(<AdminGalerieClient initialAlbums={mockAlbums} />);

    const editButtons = screen.getAllByRole('button', { name: /Modifier l'album/i });
    fireEvent.click(editButtons[0]);

    // Modal header
    expect(screen.getByRole('heading', { name: /Modifier l’album photo/i })).toBeInTheDocument();

    // Form inputs should contain album-1 values
    const titleInput = screen.getByLabelText(/Titre de l'album/i) as HTMLInputElement;
    expect(titleInput.value).toBe('Sortie Printemps 2026');

    const descInput = screen.getByLabelText(/Description \/ Récit de la sortie/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe('Belle sortie en Brabant Wallon');

    const yearInput = screen.getByLabelText(/Saison \(Année\)/i) as HTMLInputElement;
    expect(yearInput.value).toBe('2026');

    const categorySelect = screen.getByLabelText(/Thème \/ Catégorie/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('Sorties');

    const coverInput = screen.getByLabelText(/URL de l'image de couverture/i) as HTMLInputElement;
    expect(coverInput.value).toBe('https://example.com/cover1.jpg');

    const photoCountInput = screen.getByLabelText(/Nombre estimé de photos/i) as HTMLInputElement;
    expect(photoCountInput.value).toBe('42');

    // Submit button should have edit text
    expect(screen.getByRole('button', { name: /Enregistrer les modifications/i })).toBeInTheDocument();
  });

  it('submits PUT request and updates album row upon form submission in edit mode', async () => {
    const updatedAlbum: PhotoAlbum = {
      ...mockAlbums[0],
      title: 'Sortie Printemps 2026 — Modifiée',
      photoCount: 50,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, album: updatedAlbum }),
    } as any);

    render(<AdminGalerieClient initialAlbums={mockAlbums} />);

    // Click edit on first album
    const editButtons = screen.getAllByRole('button', { name: /Modifier l'album/i });
    fireEvent.click(editButtons[0]);

    // Modify title
    const titleInput = screen.getByLabelText(/Titre de l'album/i);
    fireEvent.change(titleInput, { target: { value: 'Sortie Printemps 2026 — Modifiée' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Enregistrer les modifications/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/galerie',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"id":"album-1"'),
        })
      );
    });

    // Check table has updated title
    await waitFor(() => {
      expect(screen.getByText('Sortie Printemps 2026 — Modifiée')).toBeInTheDocument();
    });
  });

  it('opens create modal with blank fields when clicking Nouvel Album', () => {
    render(<AdminGalerieClient initialAlbums={mockAlbums} />);

    const newAlbumBtn = screen.getByRole('button', { name: /Nouvel Album/i });
    fireEvent.click(newAlbumBtn);

    expect(screen.getByRole('heading', { name: /Ajouter un album photo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer l’album/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Titre de l'album/i) as HTMLInputElement;
    expect(titleInput.value).toBe('');
  });
});
