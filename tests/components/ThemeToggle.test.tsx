/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggle from '@/app/components/layout/ThemeToggle';
import * as ThemeContextModule from '@/app/context/ThemeContext';

describe('ThemeToggle component', () => {
  const mockSetTheme = vi.fn();
  const mockToggleTheme = vi.fn();

  function mockTheme(theme: 'light' | 'dark' | 'system', resolved: 'light' | 'dark', isMounted = true) {
    vi.spyOn(ThemeContextModule, 'useTheme').mockReturnValue({
      theme,
      resolvedTheme: resolved,
      setTheme: mockSetTheme,
      toggleTheme: mockToggleTheme,
      isMounted,
    });
  }

  it('renders unmounted placeholder when isMounted is false', () => {
    mockTheme('light', 'light', false);
    render(<ThemeToggle variant="pill" />);
    expect(screen.getByText('Thème')).toBeInTheDocument();

    const { container: iconContainer } = render(<ThemeToggle variant="icon" />);
    expect(iconContainer.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders icon variant and handles click toggle', () => {
    mockTheme('light', 'light', true);
    render(<ThemeToggle variant="icon" />);

    const button = screen.getByRole('button', { name: /passer en mode sombre/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders switch variant and handles toggle click', () => {
    mockTheme('dark', 'dark', true);
    render(<ThemeToggle variant="switch" />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(switchBtn);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders cards variant and handles explicit theme selection', () => {
    mockTheme('light', 'light', true);
    render(<ThemeToggle variant="cards" />);

    expect(screen.getByText('Mode Clair')).toBeInTheDocument();
    expect(screen.getByText('Mode Sombre')).toBeInTheDocument();
    expect(screen.getByText('Automatique')).toBeInTheDocument();

    const darkCard = screen.getByText('Mode Sombre').closest('button');
    expect(darkCard).not.toBeNull();
    fireEvent.click(darkCard!);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('renders pill variant and triggers setTheme on button click', () => {
    mockTheme('light', 'light', true);
    render(<ThemeToggle variant="pill" />);

    const sombreButton = screen.getByRole('button', { name: /sombre/i });
    fireEvent.click(sombreButton);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
