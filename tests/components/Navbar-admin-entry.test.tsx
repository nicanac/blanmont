/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '@/app/components/layout/Navbar';
import { getMyAdminAccessAction } from '@/app/admin/acces/actions';

const auth = vi.hoisted(() => ({ isAdmin: false, roles: ['Trésorier'] as string[] }));

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('@/app/components/layout/ThemeToggle', () => ({ default: () => null }));
vi.mock('@/app/admin/acces/actions', () => ({ getMyAdminAccessAction: vi.fn() }));
vi.mock('@/app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Jean Trésorier', role: auth.roles },
    logout: vi.fn(),
    isAuthenticated: true,
    isAdmin: auth.isAdmin,
  }),
}));

const access = vi.mocked(getMyAdminAccessAction);

/** Opens the desktop "Mon Compte" panel. */
function openAccountMenu(): void {
  const button = screen.getAllByText('Mon Compte')[0].closest('button');
  if (!button) throw new Error('Mon Compte button not found');
  fireEvent.click(button);
}

describe('Navbar Admin entry', () => {
  beforeEach(() => {
    auth.isAdmin = false;
    auth.roles = ['Trésorier'];
    access.mockReset();
  });

  it('shows Admin to an officer whose role opens a back-office section', async () => {
    access.mockResolvedValue({ isAdmin: false, isOwner: false, sections: ['commandes'] });
    render(<Navbar />);
    await waitFor(() => expect(access).toHaveBeenCalled());
    openAccountMenu();
    expect(await screen.findByRole('link', { name: /Admin/ })).toHaveAttribute('href', '/admin');
  });

  it('hides Admin when the role opens no section', async () => {
    auth.roles = ['Member'];
    access.mockResolvedValue({ isAdmin: false, isOwner: false, sections: [] });
    render(<Navbar />);
    await waitFor(() => expect(access).toHaveBeenCalled());
    openAccountMenu();
    await screen.findByText('Connecté en tant que');
    expect(screen.queryByRole('link', { name: /Admin/ })).toBeNull();
  });

  it('shows Admin to an admin without asking the server', async () => {
    auth.isAdmin = true;
    render(<Navbar />);
    openAccountMenu();
    expect(await screen.findByRole('link', { name: /Admin/ })).toHaveAttribute('href', '/admin');
    expect(access).not.toHaveBeenCalled();
  });
});
