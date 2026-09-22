/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import FirstArrivalLoader from '@/app/components/ui/FirstArrivalLoader';

describe('FirstArrivalLoader Component (app/components/ui/FirstArrivalLoader.tsx)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    // Default matchMedia: no reduced motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing if prefers-reduced-motion is true', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    const { container } = render(<FirstArrivalLoader />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if ccb_first_arrival_shown is already in sessionStorage', () => {
    sessionStorage.setItem('ccb_first_arrival_shown', 'true');

    const { container } = render(<FirstArrivalLoader />);
    expect(container.firstChild).toBeNull();
  });

  it('renders loader intro on first arrival and runs progress timers', () => {
    render(<FirstArrivalLoader />);

    expect(screen.getByText('Cyclo Club Saint-Martin • Brabant Wallon')).toBeDefined();
    expect(screen.getByRole('button', { name: /passer l'intro/i })).toBeDefined();

    // Fast-forward 250ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Fast-forward through completion
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Marked in sessionStorage
    expect(sessionStorage.getItem('ccb_first_arrival_shown')).toBe('true');
  });

  it('allows user to skip the introduction immediately', () => {
    render(<FirstArrivalLoader />);

    const skipButton = screen.getByRole('button', { name: /passer l'intro/i });
    fireEvent.click(skipButton);

    expect(sessionStorage.getItem('ccb_first_arrival_shown')).toBe('true');

    // Advance exit transition
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should disappear
    expect(screen.queryByText('Cyclo Club Saint-Martin • Brabant Wallon')).toBeNull();
  });
});
