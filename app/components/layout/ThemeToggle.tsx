'use client';

import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme, Theme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  variant?: 'pill' | 'switch' | 'cards' | 'icon';
  className?: string;
}

export default function ThemeToggle({ variant = 'pill', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) {
    // Avoid hydration mismatch by rendering static placeholder
    if (variant === 'icon') {
      return (
        <div
          className={cn(
            'inline-flex h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] items-center justify-center rounded-full border border-[#e4e0d8] dark:border-white/10 bg-black/5 dark:bg-white/5 opacity-50',
            className
          )}
          aria-hidden="true"
        />
      );
    }
    if (variant === 'pill') {
      return (
        <div className={cn('inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs text-muted-foreground', className)}>
          <span className="h-4 w-4 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">Thème</span>
        </div>
      );
    }
    return null;
  }

  // Refined Circular Icon Toggle (Designed for Header Navbar Desktop & Mobile)
  if (variant === 'icon') {
    const isDark = resolvedTheme === 'dark';

    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'group relative inline-flex h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] items-center justify-center rounded-full border border-[#e4e0d8] dark:border-white/10 bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] text-[#101216] dark:text-white transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] active:scale-95 cursor-pointer',
          className
        )}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        <span className="sr-only">
          {isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        </span>
        {isDark ? (
          <SunIcon className="h-4.5 w-4.5 text-amber-400 group-hover:text-amber-300 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <MoonIcon className="h-4.5 w-4.5 text-[#5c6370] group-hover:text-[#101216] group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
    );
  }

  // Large visual cards selector (for Admin Settings page)
  if (variant === 'cards') {
    const options: { value: Theme; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
      {
        value: 'light',
        title: 'Mode Clair',
        desc: 'Fond papier chaud (#faf8f5), typographie encre et esthétique aérée',
        icon: SunIcon,
      },
      {
        value: 'dark',
        title: 'Mode Sombre',
        desc: 'Fond encre profonde (#0a0c10), couverture magazine et accents rouges',
        icon: MoonIcon,
      },
      {
        value: 'system',
        title: 'Automatique',
        desc: 'Suit automatiquement les préférences système de votre appareil',
        icon: ComputerDesktopIcon,
      },
    ];

    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
        {options.map((opt) => {
          const isSelected = theme === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                'group relative flex flex-col justify-between rounded-xl border p-5 text-left transition-all cursor-pointer',
                isSelected
                  ? 'border-[#e03e3e] bg-[#e03e3e]/5 ring-2 ring-[#e03e3e]/20 shadow-sm'
                  : 'border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] hover:border-[#101216]/30 dark:hover:border-white/30'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
                    isSelected
                      ? 'border-[#e03e3e]/30 bg-[#e03e3e] text-white'
                      : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-[#0a0c10] text-[#101216] dark:text-[#a7adbb] group-hover:text-[#e03e3e]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e03e3e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Actif
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-[#101216] dark:text-white">
                  {opt.title}
                </h4>
                <p className="mt-1 text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact toggle switch (slider)
  if (variant === 'switch') {
    const isDark = resolvedTheme === 'dark';

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Basculer le thème clair ou sombre"
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e03e3e]',
          isDark ? 'bg-[#161922] border-[#262b38]' : 'bg-[#e4e0d8]',
          className
        )}
      >
        <span className="sr-only">Changer de thème</span>
        <span
          className={cn(
            'pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            isDark ? 'translate-x-7 bg-[#0a0c10] text-[#f5f6f8]' : 'translate-x-0 text-[#101216]'
          )}
        >
          {isDark ? (
            <MoonIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
          ) : (
            <SunIcon className="h-3.5 w-3.5 text-amber-500" />
          )}
        </span>
      </button>
    );
  }

  // Refined Pill toggle (Default for Footer)
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full p-1 border transition-colors',
        'bg-white/80 dark:bg-[#161922] border-[#e4e0d8] dark:border-[#262b38] shadow-xs',
        className
      )}
      role="group"
      aria-label="Sélecteur de thème"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
          resolvedTheme === 'light' && theme !== 'system'
            ? 'bg-[#101216] text-white shadow-xs'
            : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
        )}
        title="Activer le mode clair"
      >
        <SunIcon className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[11px]">Clair</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
          resolvedTheme === 'dark' && theme !== 'system'
            ? 'bg-[#e03e3e] text-white shadow-xs'
            : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
        )}
        title="Activer le mode sombre"
      >
        <MoonIcon className="h-3.5 w-3.5" />
        <span className="text-[11px]">Sombre</span>
      </button>
    </div>
  );
}
