/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SheetHeader } from '@/app/components/carte/SheetHeader';

describe('SheetHeader Component (app/components/carte/SheetHeader.tsx)', () => {
  it('renders title, description and sheet name in cartouche', () => {
    render(
      <SheetHeader
        sheet="Parcours & GPX"
        title="Les Parcours du Peloton"
        description="Catalogue officiel des traces du club."
      />
    );

    expect(screen.getByText('Les Parcours du Peloton')).toBeDefined();
    expect(screen.getByText('Catalogue officiel des traces du club.')).toBeDefined();
    expect(screen.getByText(/Parcours & GPX/)).toBeDefined();
  });

  it('renders legend rows when provided', () => {
    render(
      <SheetHeader
        sheet="Calendrier"
        title="Calendrier des sorties"
        legend={[
          { term: 'Prochaine sortie', value: '26 septembre', hint: 'Départ 8h30' },
          { term: 'Total sorties', value: '45' },
        ]}
      />
    );

    expect(screen.getByText('Prochaine sortie')).toBeDefined();
    expect(screen.getByText('26 septembre')).toBeDefined();
    expect(screen.getByText('Départ 8h30')).toBeDefined();
    expect(screen.getByText('Total sorties')).toBeDefined();
    expect(screen.getByText('45')).toBeDefined();
  });

  it('renders actions and custom children', () => {
    render(
      <SheetHeader
        sheet="Sondage"
        title="Sondage du weekend"
        actions={<button data-testid="action-btn">Voter</button>}
      >
        <span data-testid="child-element">Informations supplémentaires</span>
      </SheetHeader>
    );

    expect(screen.getByTestId('action-btn')).toBeDefined();
    expect(screen.getByTestId('child-element')).toBeDefined();
  });

  it('renders with different color tones (vert, rouge, nuit)', () => {
    const { container: vertContainer } = render(
      <SheetHeader sheet="Carré Vert" title="Le Carré Vert" tone="vert" />
    );
    expect(vertContainer.innerHTML).toContain('bg-vert');

    const { container: rougeContainer } = render(
      <SheetHeader sheet="Vitesse" title="Groupe A" tone="rouge" />
    );
    expect(rougeContainer.innerHTML).toContain('bg-brand');

    const { container: nuitContainer } = render(
      <SheetHeader sheet="Nuit" title="Sortie Nocturne" tone="nuit" />
    );
    expect(nuitContainer.innerHTML).toContain('bg-ink');
  });

  it('embeds the territory relief map preview', () => {
    const { container } = render(
      <SheetHeader sheet="Territoire" title="Vue Territoire" focus={{ x: 60, y: 40 }} />
    );

    expect(container.querySelector('.carte-relief')).not.toBeNull();
  });
});
