/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import HomeSlider from '@/app/components/home/HomeSlider';
import type { HeroSettings } from '@/app/types';

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, unoptimized: _unoptimized, priority: _priority, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const heroSettings: HeroSettings = {
  badge: 'Peloton CC Saint-Martin · Blanmont',
  slides: [
    { id: 's1', url: '/images/slide-1.jpg', alt: 'Départ de la Féchère' },
    { id: 's2', url: '/images/slide-2.jpg', alt: 'Montée vers Chaumont' },
  ],
  cards: [{ id: 'c1', icon: 'calendar', label: 'Sorties', value: 'Samedi 8 h 30' }],
};

describe('HomeSlider Component (app/components/home/HomeSlider.tsx)', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
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

  it('prints the photo slider as its own labelled band of the home', () => {
    render(<HomeSlider heroSettings={heroSettings} />);

    const band = screen.getByRole('region', { name: 'Le peloton en photos' });
    expect(within(band).getByAltText('Départ de la Féchère')).toBeInTheDocument();
    expect(within(band).getByAltText('Montée vers Chaumont')).toBeInTheDocument();
    expect(within(band).getByText('Peloton CC Saint-Martin · Blanmont')).toBeInTheDocument();
    expect(within(band).getByRole('button', { name: 'Photo suivante' })).toBeInTheDocument();
  });

  it('does not repeat the information cards already printed in the cover', () => {
    render(<HomeSlider heroSettings={heroSettings} />);

    expect(screen.queryByText('Sorties')).not.toBeInTheDocument();
    expect(screen.queryByText('Samedi 8 h 30')).not.toBeInTheDocument();
  });
});
