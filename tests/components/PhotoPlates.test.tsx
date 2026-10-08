/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PhotoPlates from '@/app/components/home/PhotoPlates';
import type { PhotoAlbum, HeroSlide } from '@/app/types';

describe('PhotoPlates Component (app/components/home/PhotoPlates.tsx)', () => {
  const mockAlbums: PhotoAlbum[] = [
    {
      id: 'album-1',
      title: 'Sortie des Feuilles Mortes',
      coverUrl: '/test-cover-1.jpg',
      year: 2026,
      photoCount: 42,
      createdAt: '2026-10-01',
    },
    {
      id: 'album-2',
      title: 'Ronde Printanière',
      coverUrl: '/test-cover-2.jpg',
      year: 2026,
      photoCount: 15,
      createdAt: '2026-04-12',
    },
  ];

  const mockSlides: HeroSlide[] = [];

  it('renders lead plate and secondary plates correctly', () => {
    render(
      <PhotoPlates
        albums={mockAlbums}
        slides={mockSlides}
        albumCount={mockAlbums.length}
        photoCount={57}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: /Au fil des sorties/i })).toBeInTheDocument();
    expect(screen.getByText('Planche 1')).toBeInTheDocument();
    expect(screen.getByText('Sortie des Feuilles Mortes')).toBeInTheDocument();
    expect(screen.getByText('Planche 2')).toBeInTheDocument();
    expect(screen.getByText('Ronde Printanière')).toBeInTheDocument();
  });

  it('does not have redundant top border on secondary list on mobile viewports', () => {
    const { container } = render(
      <PhotoPlates
        albums={mockAlbums}
        slides={mockSlides}
        albumCount={mockAlbums.length}
        photoCount={57}
      />
    );

    const secondaryList = container.querySelector('ol');
    expect(secondaryList).not.toBeNull();
    // Border classes should only apply bottom border on mobile, top on desktop (lg:border-t)
    expect(secondaryList?.className).toContain('border-b');
    expect(secondaryList?.className).toContain('lg:border-t');
    expect(secondaryList?.className).not.toContain('border-y border-line');
  });

  it('renders link to all gallery albums', () => {
    render(
      <PhotoPlates
        albums={mockAlbums}
        slides={mockSlides}
        albumCount={mockAlbums.length}
        photoCount={57}
      />
    );

    expect(screen.getByRole('link', { name: /Toute la galerie/i })).toHaveAttribute('href', '/galerie');
  });
});
