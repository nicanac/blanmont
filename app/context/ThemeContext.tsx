'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isMounted: boolean;
}

const STORAGE_KEY = 'cc_blanmont_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Apply theme classes to document element (locks to light on /admin routes)
  const applyTheme = useCallback((resolved: ResolvedTheme, forceLight = false) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (!forceLight && resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Update theme and persist
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // LocalStorage may be blocked
      }

      const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
      setResolvedTheme(resolved);
      applyTheme(resolved, isAdmin);
    },
    [applyTheme, isAdmin]
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  // Initial mount: synchronize with localStorage or initial HTML attribute
  useEffect(() => {
    setIsMounted(true);
    const onAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
      setThemeState(initialTheme);

      const resolved = initialTheme === 'system' ? getSystemTheme() : initialTheme;
      setResolvedTheme(resolved);
      applyTheme(resolved, onAdmin);
    } catch {
      const fallback = getSystemTheme();
      setResolvedTheme(fallback);
      applyTheme(fallback, onAdmin);
    }
  }, [applyTheme]);

  // Handle route transitions between /admin and public site
  useEffect(() => {
    if (!isMounted) return;
    applyTheme(resolvedTheme, isAdmin);
  }, [pathname, isAdmin, resolvedTheme, isMounted, applyTheme]);

  // Listen for system theme changes if in 'system' mode
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(nextResolved);
      applyTheme(nextResolved, isAdmin);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isAdmin, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
