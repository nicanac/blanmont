/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/admin/members',
}));

import MembersTable from '@/app/admin/members/components/MembersTable';
import type { Member } from '@/app/types';

const members = [
  { id: 'm1', name: 'Adrien Delforge', email: 'adrien@example.be', role: ['Member'] },
  { id: 'm2', name: 'Alain Chavée', email: 'alain@example.be', role: ['Member'] },
] as unknown as Member[];

describe('MembersTable search bar (#233)', () => {
  it('has a real width on desktop instead of shrinking to an icon', () => {
    render(<MembersTable initialMembers={members} />);
    const bar = document.getElementById('members-search-bar');
    expect(bar).not.toBeNull();
    expect(bar!.className).toContain('lg:w-64');
    expect(bar!.className).toContain('lg:shrink-0');
    expect(bar!.className).not.toContain('flex-1');
  });

  it('widens on focus and stays wide while a query is typed', () => {
    render(<MembersTable initialMembers={members} />);
    const bar = document.getElementById('members-search-bar')!;
    expect(bar.className).toContain('lg:focus-within:w-96');
    expect(bar.getAttribute('data-expanded')).toBeNull();

    const input = screen.getByRole('textbox', { name: 'Rechercher par nom, rôle ou email' });
    fireEvent.change(input, { target: { value: 'Alain' } });
    expect(bar.getAttribute('data-expanded')).toBe('true');
    expect(bar.className).toContain('lg:data-expanded:w-96');
    expect(screen.queryByText('Adrien Delforge')).toBeNull();
    expect(screen.getAllByText('Alain Chavée').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Effacer' }));
    expect(bar.getAttribute('data-expanded')).toBeNull();
  });
});
