/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CarreVertBand, { CarreVertRider } from '@/app/components/home/CarreVertBand';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/lib/useSheetMotion', () => ({
  useSheetMotion: vi.fn(),
}));

describe('CarreVertBand Component (app/components/home/CarreVertBand.tsx)', () => {
  const mockRiders: CarreVertRider[] = [
    { id: 'r1', name: 'Luciano Szustak', group: 'A-', rides: 24 },
    { id: 'r2', name: 'Michaël Moreaux', group: 'A', rides: 22 },
    { id: 'r3', name: 'Ludovic Gustin', group: 'A', rides: 19 },
  ];

  it('returns null when possible rides is 0', () => {
    const { container } = render(
      <CarreVertBand year={2026} possible={0} riders={mockRiders} isAuthenticated={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('Unauthenticated visitor access', () => {
    it('restricts individual rider scores and displays member access callout', () => {
      render(
        <CarreVertBand year={2026} possible={30} riders={mockRiders} isAuthenticated={false} />
      );

      // Band header should be visible
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Le Carré Vert 2026/);
      expect(screen.getByText(/30 sorties comptent déjà cette saison/i)).toBeInTheDocument();

      // Privacy lock callout should be present
      expect(screen.getByText(/Données d'assiduité réservées aux membres/i)).toBeInTheDocument();
      expect(screen.getByText(/Classement nominatif réservé aux adhérents connectés/i)).toBeInTheDocument();

      // Login links pointing to member space
      const loginLinks = screen.getAllByRole('link', { name: /se connecter|espace membre/i });
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
      expect(loginLinks[0]).toHaveAttribute('href', '/login?redirect=/leaderboard');

      // Member names and scores must NOT be exposed
      expect(screen.queryByText('Luciano Szustak')).not.toBeInTheDocument();
      expect(screen.queryByText('Michaël Moreaux')).not.toBeInTheDocument();
      expect(screen.queryByText('Ludovic Gustin')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated member access', () => {
    it('displays the leader and full podium list of riders with their carres', () => {
      render(
        <CarreVertBand year={2026} possible={30} riders={mockRiders} isAuthenticated={true} />
      );

      // Leader summary
      expect(screen.getByText(/En tête :/i)).toBeInTheDocument();
      expect(screen.getAllByText('Luciano Szustak').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('24').length).toBeGreaterThanOrEqual(1);

      // Full leaderboard link
      expect(screen.getByRole('link', { name: /voir le classement complet/i })).toHaveAttribute(
        'href',
        '/leaderboard'
      );

      // All riders visible in list
      expect(screen.getByText('Michaël Moreaux')).toBeInTheDocument();
      expect(screen.getByText('Ludovic Gustin')).toBeInTheDocument();
      expect(screen.getByText('A-')).toBeInTheDocument();
      expect(screen.getAllByText('A').length).toBeGreaterThanOrEqual(1);

      // Privacy lock callout must NOT be rendered
      expect(screen.queryByText(/Données d'assiduité réservées aux membres/i)).not.toBeInTheDocument();
    });
  });
});
