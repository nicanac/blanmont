/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HomeBlogSection from '@/app/components/shared/HomeBlogSection';
import { BlogPost } from '@/app/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('HomeBlogSection Component (app/components/shared/HomeBlogSection.tsx)', () => {
  const mockPosts: BlogPost[] = [
    {
      id: 'post-1',
      title: 'Nouveaux Équipements 2026',
      excerpt: 'Découvrez la nouvelle livrée du club pour la saison.',
      content: 'Contenu détaillé...',
      coverImage: 'https://images.blanmont.be/cover1.jpg',
      author: 'Fabian Capitaine',
      authorAvatar: '/avatar1.jpg',
      publishedAt: '2026-03-01T10:00:00Z',
      category: 'Actualités',
      slug: 'nouveaux-equipements-2026',
      isPublished: true,
    },
    {
      id: 'post-2',
      title: 'Compte-rendu Sortie Namur',
      excerpt: 'Belle affluence sous le soleil printanier.',
      content: 'Contenu Namur...',
      coverImage: 'https://images.blanmont.be/cover2.jpg',
      author: 'Nicolas Bruyere',
      publishedAt: '2026-02-25T10:00:00Z',
      category: 'Sorties',
      slug: 'compte-rendu-sortie-namur',
      isPublished: true,
    },
  ];

  it('renders null when posts array is empty or undefined', () => {
    const { container: c1 } = render(<HomeBlogSection posts={[]} />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<HomeBlogSection posts={undefined as any} />);
    expect(c2.firstChild).toBeNull();
  });

  it('renders featured post with title, excerpt, and category', () => {
    render(<HomeBlogSection posts={mockPosts} />);

    expect(screen.getByText('Nouveaux Équipements 2026')).toBeDefined();
    expect(screen.getByText('Découvrez la nouvelle livrée du club pour la saison.')).toBeDefined();
    expect(screen.getByText('Actualités')).toBeDefined();
    expect(screen.getByText('À la une')).toBeDefined();
  });

  it('renders secondary posts in the index column', () => {
    render(<HomeBlogSection posts={mockPosts} />);

    expect(screen.getByText('Compte-rendu Sortie Namur')).toBeDefined();
    expect(screen.getByText('Belle affluence sous le soleil printanier.')).toBeDefined();
    expect(screen.getByText('Sorties')).toBeDefined();
  });

  it('contains link to the full blog archive', () => {
    render(<HomeBlogSection posts={mockPosts} />);

    const blogLink = screen.getByRole('link', { name: /toutes les actualités/i });
    expect(blogLink).toBeDefined();
    expect(blogLink.getAttribute('href')).toBe('/blog');
  });
});
