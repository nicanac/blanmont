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
        name: /Quatre groupes, une seule place de départ/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/On part ensemble, on rentre ensemble/i)).toBeInTheDocument();
  });

  it('renders pace groups A, B, C, and VTT with details', () => {
    render(<GroupRoads />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('> 30 km/h')).toBeInTheDocument();

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('25 – 28 km/h')).toBeInTheDocument();

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('< 25 km/h')).toBeInTheDocument();

    expect(screen.getByText('VTT')).toBeInTheDocument();
    expect(screen.getByText('Sentiers')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Présentation des groupes/i })).toHaveAttribute(
      'href',
      '/le-club'
    );
  });
});
