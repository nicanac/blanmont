/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminGuard from '@/app/admin/components/AdminGuard';
import AdminEmptyState from '@/app/admin/components/AdminEmptyState';
import * as AuthContextModule from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AdminGuard component', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  it('renders loading state when auth is loading', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    expect(screen.getByText(/Vérification des accès/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=/admin');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders access denied when authenticated user is not admin', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'mem-1', name: 'Member', role: ['Member'] } as any,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    expect(screen.getByText(/Accès Refusé/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when user is an administrator', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', name: 'Admin User', role: ['Admin'] } as any,
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminGuard>
        <div>Admin Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByText('Admin Protected Content')).toBeInTheDocument();
  });
});

describe('AdminEmptyState component', () => {
  it('renders icon, title, description, actions, and tip', () => {
    const handleActionClick = vi.fn();

    render(
      <AdminEmptyState
        icon={CalendarIcon}
        title="Aucun événement trouvé"
        description="Créez votre première sortie pour remplir le calendrier."
        primaryAction={{
          label: 'Nouvel événement',
          onClick: handleActionClick,
          icon: PlusIcon,
        }}
        secondaryAction={{
          label: 'Importer CSV',
          href: '/admin/events/import',
        }}
        tip="Vous pouvez importer plusieurs dates en un seul clic."
      />
    );

    expect(screen.getByText('Aucun événement trouvé')).toBeInTheDocument();
    expect(screen.getByText(/Créez votre première sortie/)).toBeInTheDocument();
    expect(screen.getByText(/Conseil pratique :/i)).toBeInTheDocument();
    expect(screen.getByText(/Vous pouvez importer plusieurs dates/)).toBeInTheDocument();

    // Click primary button action
    const primaryBtn = screen.getByRole('button', { name: /nouvel événement/i });
    fireEvent.click(primaryBtn);
    expect(handleActionClick).toHaveBeenCalledTimes(1);

    // Verify secondary link href
    const secondaryLink = screen.getByRole('link', { name: /importer csv/i });
    expect(secondaryLink).toHaveAttribute('href', '/admin/events/import');
  });
});
