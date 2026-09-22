/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import {
  JerseyIcon,
  TrophySquareIcon,
  RouteCalendarIcon,
  BicycleIcon,
  ClubCrestIcon,
  CrownIcon,
  PodiumMedalIcon,
} from '@/app/components/ui/CyclingIcons';

describe('CyclingIcons Components (app/components/ui/CyclingIcons.tsx)', () => {
  it('renders JerseyIcon with custom className and SVG attributes', () => {
    const { container } = render(<JerseyIcon className="h-8 w-8 text-red-500" data-testid="jersey-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('class')).toContain('h-8 w-8 text-red-500');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders TrophySquareIcon representing Le Carré Vert', () => {
    const { container } = render(<TrophySquareIcon className="h-6 w-6" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(container.querySelector('rect')).not.toBeNull();
  });

  it('renders RouteCalendarIcon for calendar trajectories', () => {
    const { container } = render(<RouteCalendarIcon />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(2);
  });

  it('renders BicycleIcon and ClubCrestIcon with default classes', () => {
    const { container: bikeContainer } = render(<BicycleIcon />);
    expect(bikeContainer.querySelector('svg')?.getAttribute('class')).toBe('h-5 w-5');

    const { container: crestContainer } = render(<ClubCrestIcon />);
    expect(crestContainer.querySelector('svg')?.getAttribute('class')).toBe('h-5 w-5');
  });

  it('renders CrownIcon and PodiumMedalIcon for Hall of Fame and Leaderboard podiums', () => {
    const { container: crownContainer } = render(<CrownIcon className="h-6 w-6 text-amber-500" />);
    expect(crownContainer.querySelector('svg')?.getAttribute('class')).toContain('h-6 w-6 text-amber-500');

    const { container: medalContainer } = render(<PodiumMedalIcon className="h-5 w-5 text-emerald-600" />);
    expect(medalContainer.querySelector('svg')?.getAttribute('class')).toContain('h-5 w-5 text-emerald-600');
  });
});

