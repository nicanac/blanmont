/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GroupRoads from '@/app/components/home/GroupRoads';

describe('GroupRoads Component (app/components/home/GroupRoads.tsx)', () => {
  beforeAll(() => {
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
  });

  it('renders section title and introduction', () => {
    render(<GroupRoads />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Quatre groupes route, un VTT, une seule place de départ/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/On part ensemble, on rentre ensemble/i)).toBeInTheDocument();
  });

  it('renders pace groups A, B, BC, C, and VTT with details', () => {
    render(<GroupRoads />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('> 30 km/h')).toBeInTheDocument();

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('25 – 28 km/h')).toBeInTheDocument();

    // GR3 (code BC) sits between B and C
    expect(screen.getByText('BC')).toBeInTheDocument();
    expect(screen.getByText('24 – 27 km/h')).toBeInTheDocument();

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('< 25 km/h')).toBeInTheDocument();

    expect(screen.getByText('VTT')).toBeInTheDocument();
    expect(screen.getByText('Sentiers')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Présentation des groupes/i })).toHaveAttribute(
      'href',
      '/le-club'
    );
  });

  it('allocates sufficient column width for pace groups on mobile to prevent overflow', () => {
    const { container } = render(<GroupRoads />);
    // Label column grows to the widest group name (no overlap with the road), min 6rem on mobile.
    expect(container.querySelector('ol')?.className).toContain(
      'grid-cols-[minmax(6rem,max-content)_minmax(0,1fr)]'
    );
    const listItems = container.querySelectorAll('ol > li');
    expect(listItems.length).toBe(5);
    listItems.forEach((li) => {
      expect(li.className).toContain('grid-cols-subgrid');
    });
  });
});
