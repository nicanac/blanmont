/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Footer.tsx is an async server component: keep its data and map modules out of this test.
vi.mock('@/app/lib/firebase/calendar', () => ({
  getCalendarEvents: vi.fn(),
  getNextScheduledRide: vi.fn(),
}));
vi.mock('@/app/components/carte/TerritoryMap', () => ({ default: () => null }));
vi.mock('@/app/components/layout/NextRideCard', () => ({ default: () => null }));
vi.mock('@/app/components/layout/ThemeToggle', () => ({ default: () => null }));
vi.mock('@/app/components/consent/OpenCookiePreferencesButton', () => ({ default: () => null }));

import { FooterColumn } from '@/app/components/layout/Footer';

describe('FooterColumn (app/components/layout/Footer.tsx)', () => {
  it('gives every heading the same two-line height, text on the rule (#230)', () => {
    render(
      <div>
        <FooterColumn title="Le Club" items={[{ name: 'Rejoindre', href: '/rejoindre' }]} />
        <FooterColumn
          title="Parcours & Sorties"
          items={[{ name: 'Calendrier des Sorties', href: '/calendrier' }]}
        />
      </div>
    );

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    for (const heading of headings) {
      // Same min height and bottom alignment: the rules line up whether a title wraps or not.
      expect(heading.className).toContain('min-h-11');
      expect(heading.className).toContain('items-end');
      expect(heading.className).toContain('border-b');
    }
  });

  it('renders each link of the column', () => {
    render(
      <FooterColumn
        title="Parcours & Sorties"
        items={[
          { name: 'Tous les Parcours GPS', href: '/traces' },
          { name: 'Calendrier des Sorties', href: '/calendrier' },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Tous les Parcours GPS' }).getAttribute('href')).toBe(
      '/traces'
    );
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
