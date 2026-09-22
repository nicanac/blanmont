/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext';
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

function ConsumerComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme, isMounted } = useTheme();

  return (
    <div>
      <span data-testid="is-mounted">{isMounted ? 'yes' : 'no'}</span>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        Set System
      </button>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
    </div>
  );
}

describe('ThemeContext & ThemeProvider', () => {
  let mediaQueryListeners: ((e: any) => void)[] = [];

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    mediaQueryListeners = [];

    vi.mocked(usePathname).mockReturnValue('/');

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, listener: any) => {
          mediaQueryListeners.push(listener);
        }),
        removeEventListener: vi.fn((event: string, listener: any) => {
          mediaQueryListeners = mediaQueryListeners.filter((l) => l !== listener);
        }),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('throws error when useTheme is consumed outside of ThemeProvider', () => {
    // Suppress console.error for expected React boundary error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ConsumerComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    spy.mockRestore();
  });

  it('initializes with default light theme and sets isMounted to true', () => {
    render(
      <ThemeProvider>
        <ConsumerComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('is-mounted')).toHaveTextContent('yes');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('restores stored theme from localStorage on initial render', () => {
    localStorage.setItem('cc_blanmont_theme', 'dark');

    render(
      <ThemeProvider>
        <ConsumerComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('allows changing theme explicitly to dark and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <ConsumerComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(localStorage.getItem('cc_blanmont_theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles theme between light and dark', () => {
    render(
      <ThemeProvider>
        <ConsumerComponent />
      </ThemeProvider>
    );

    // Initial is light -> toggle to dark
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');

    // Toggle back to light
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  it('forces light theme when on an /admin route even if dark is selected', () => {
    vi.mocked(usePathname).mockReturnValue('/admin/members');

    render(
      <ThemeProvider>
        <ConsumerComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    // State tracks dark, but DOM root is forced to light mode for admin safety
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('responds to system theme changes when theme is set to system', () => {
    render(
      <ThemeProvider>
        <ConsumerComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-system'));
    expect(screen.getByTestId('theme')).toHaveTextContent('system');

    // Simulate system switching to dark
    act(() => {
      mediaQueryListeners.forEach((listener) => listener({ matches: true } as any));
    });

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });
});
