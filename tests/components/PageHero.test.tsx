/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PageHero } from '@/app/components/ui/PageHero';

describe('PageHero Component (app/components/ui/PageHero.tsx)', () => {
  it('renders title and description', () => {
    render(
      <PageHero
        title="Tracés & Parcours"
        description="Découvrez les plus belles routes du Brabant Wallon."
      />
    );

    expect(screen.getByText('Tracés & Parcours')).toBeDefined();
    expect(screen.getByText('Découvrez les plus belles routes du Brabant Wallon.')).toBeDefined();
  });

  it('renders badge and sheet name when provided', () => {
    render(<PageHero title="Équipements" badge="Boutique Officielle" watermark="KITS" />);

    expect(screen.getByText('Boutique Officielle')).toBeDefined();
    expect(screen.getByText(/KITS/)).toBeDefined();
  });

  it('renders custom children within hero content', () => {
    render(
      <PageHero title="Le Carré Vert">
        <button data-testid="hero-action">Rejoindre le peloton</button>
      </PageHero>
    );

    expect(screen.getByTestId('hero-action')).toBeDefined();
    expect(screen.getByText('Rejoindre le peloton')).toBeDefined();
  });

  it('prints the green variant on the woodland-green cartouche', () => {
    const { container } = render(
      <PageHero title="Variante Verte" variant="green" badge="Catégorie" />
    );

    expect(container.innerHTML).toContain('bg-vert');
  });

  it('opens every page on a band of the territory map', () => {
    const { container } = render(<PageHero title="Galerie" />);
    expect(container.querySelector('.carte-relief')).not.toBeNull();
    expect(container.querySelector('h1')?.textContent).toBe('Galerie');
  });
});
