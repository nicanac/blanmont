/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ConditionalFooter from '@/app/components/layout/ConditionalFooter';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('ConditionalFooter Component (app/components/layout/ConditionalFooter.tsx)', () => {
  it('renders footer children on public routes (e.g., /)', () => {
    vi.spyOn(navigation, 'usePathname').mockReturnValue('/');

    render(
      <ConditionalFooter>
        <footer data-testid="public-footer">Site Public Footer</footer>
      </ConditionalFooter>
    );

    expect(screen.getByTestId('public-footer')).toBeDefined();
    expect(screen.getByText('Site Public Footer')).toBeDefined();
  });

  it('renders footer children on public nested routes (e.g., /traces/123)', () => {
    vi.spyOn(navigation, 'usePathname').mockReturnValue('/traces/123');

    render(
      <ConditionalFooter>
        <footer data-testid="public-footer">Site Public Footer</footer>
      </ConditionalFooter>
    );

    expect(screen.getByTestId('public-footer')).toBeDefined();
  });

  it('hides footer (returns null) on admin routes (e.g., /admin)', () => {
    vi.spyOn(navigation, 'usePathname').mockReturnValue('/admin');

    const { container } = render(
      <ConditionalFooter>
        <footer data-testid="public-footer">Site Public Footer</footer>
      </ConditionalFooter>
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('public-footer')).toBeNull();
  });

  it('hides footer on nested admin routes (e.g., /admin/members)', () => {
    vi.spyOn(navigation, 'usePathname').mockReturnValue('/admin/members');

    const { container } = render(
      <ConditionalFooter>
        <footer data-testid="public-footer">Site Public Footer</footer>
      </ConditionalFooter>
    );

    expect(container.firstChild).toBeNull();
  });
});
