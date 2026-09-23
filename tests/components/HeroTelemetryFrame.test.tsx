/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import HeroTelemetryFrame from '@/app/components/HeroTelemetryFrame';
import type { HeroSettings } from '@/app/types';

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, unoptimized: _unoptimized, priority: _priority, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const settings: HeroSettings = {
  badge: 'Peloton CC Saint-Martin · Blanmont',
  slides: [
    { id: 's1', url: '/images/slide-1.jpg', alt: 'Départ de la Féchère' },
    { id: 's2', url: '/images/slide-2.jpg', alt: 'Montée vers Chaumont' },
  ],
  cards: [
    { id: 'c1', icon: 'calendar', label: 'Sorties', value: 'Samedi 8 h 30' },
    { id: 'c2', icon: 'group', label: 'Groupes', value: 'A · B · C · VTT' },
  ],
};

const slideOf = (alt: string) => screen.getByAltText(alt).parentElement;

describe('HeroTelemetryFrame Component (app/components/HeroTelemetryFrame.tsx)', () => {
  beforeAll(() => {
    // Reduced motion: skips the parallax effect, which needs IntersectionObserver.
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the telemetry cards under the photos by default', () => {
    render(<HeroTelemetryFrame settings={settings} />);

    expect(screen.getByText('Sorties')).toBeInTheDocument();
    expect(screen.getByText('A · B · C · VTT')).toBeInTheDocument();
  });

  it('hides the telemetry cards when showCards is false but keeps the slider', () => {
    render(<HeroTelemetryFrame settings={settings} showCards={false} />);

    expect(screen.queryByText('Sorties')).not.toBeInTheDocument();
    expect(screen.queryByText('A · B · C · VTT')).not.toBeInTheDocument();
    expect(screen.getByAltText('Départ de la Féchère')).toBeInTheDocument();
    expect(screen.getByAltText('Montée vers Chaumont')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Photo suivante' })).toBeInTheDocument();
  });

  it('browses the slides with the previous, next and dot controls', () => {
    render(<HeroTelemetryFrame settings={settings} showCards={false} />);

    expect(slideOf('Départ de la Féchère')).toHaveClass('opacity-100');
    expect(slideOf('Montée vers Chaumont')).toHaveClass('opacity-0');

    fireEvent.click(screen.getByRole('button', { name: 'Photo suivante' }));
    expect(slideOf('Montée vers Chaumont')).toHaveClass('opacity-100');
    expect(slideOf('Départ de la Féchère')).toHaveClass('opacity-0');

    fireEvent.click(screen.getByRole('button', { name: 'Photo précédente' }));
    expect(slideOf('Départ de la Féchère')).toHaveClass('opacity-100');

    fireEvent.click(screen.getByRole('button', { name: 'Aller à la photo 2' }));
    expect(slideOf('Montée vers Chaumont')).toHaveClass('opacity-100');
  });

  it('auto-advances every 6 seconds and pauses while hovered', () => {
    vi.useFakeTimers();
    const { container } = render(<HeroTelemetryFrame settings={settings} showCards={false} />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(slideOf('Montée vers Chaumont')).toHaveClass('opacity-100');

    fireEvent.mouseEnter(container.firstElementChild as Element);
    act(() => {
      vi.advanceTimersByTime(12000);
    });
    expect(slideOf('Montée vers Chaumont')).toHaveClass('opacity-100');
  });

  it('hides the slider controls when there is a single photo', () => {
    render(
      <HeroTelemetryFrame settings={{ ...settings, slides: [settings.slides[0]] }} showCards={false} />
    );

    expect(screen.getByAltText('Départ de la Féchère')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Photo suivante' })).not.toBeInTheDocument();
  });

  it('renders slide images with referrerPolicy="no-referrer" to prevent CDN blocks', () => {
    render(<HeroTelemetryFrame settings={settings} showCards={false} />);
    const img = screen.getByAltText('Départ de la Féchère');
    expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
  });
});
