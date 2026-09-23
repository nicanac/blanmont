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
            'inline-flex size-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] items-center justify-center rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 opacity-50',
            className
          )}
          aria-hidden="true"
        />
      );
    }
    if (variant === 'pill') {
      return (
        <div className={cn('inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line px-3 py-1.5 text-xs text-ink-3 dark:text-snow-3', className)}>
          <span className="h-4 w-4 rounded-sm bg-paper-2 dark:bg-night-3 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Thème</span>
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
          'group relative inline-flex size-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] items-center justify-center rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 hover:border-ink/40 dark:hover:border-snow-3 text-ink dark:text-snow transition-colors duration-200 active:translate-y-px cursor-pointer',
          className
        )}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        <span className="sr-only">
          {isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        </span>
        {isDark ? (
          <SunIcon className="h-[18px] w-[18px] text-ambre group-hover:rotate-45 transition-transform duration-500 ease-(--ease-plot)" />
        ) : (
          <MoonIcon className="h-[18px] w-[18px] text-ink-2 group-hover:text-ink group-hover:-rotate-12 transition-transform duration-500 ease-(--ease-plot)" />
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
        desc: 'Carte de jour : papier blanc, lettrage noir et encres de la carte, lisible en plein soleil',
        icon: SunIcon,
      },
      {
        value: 'dark',
        title: 'Mode Sombre',
        desc: 'Carte de nuit : fond nuit et encres atténuées pour consulter le soir sans éblouissement',
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
                'group relative flex flex-col justify-between rounded-md border p-5 text-left transition-colors cursor-pointer',
                isSelected
                  ? 'border-brand bg-brand-tint dark:bg-brand/10 ring-1 ring-brand'
                  : 'border-line dark:border-night-line bg-white dark:bg-night-2 hover:border-ink/30 dark:hover:border-white/30'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-sm border transition-colors',
                    isSelected
                      ? 'border-brand/30 bg-brand text-white'
                      : 'border-line dark:border-night-line bg-paper-2 dark:bg-night text-ink dark:text-snow-3 group-hover:text-brand'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Actif
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-semiwide text-sm font-bold uppercase tracking-[0.04em] text-ink dark:text-white">
                  {opt.title}
                </h4>
                <p className="mt-1 text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
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
          'relative inline-flex min-h-[44px] min-w-[44px] h-8 w-14 sm:h-7 sm:w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          isDark ? 'bg-night-2 border-night-line' : 'bg-line',
          className
        )}
      >
        <span className="sr-only">Changer de thème</span>
        <span
          className={cn(
            'pointer-events-none flex h-6 w-6 md:h-6 md:w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            isDark ? 'translate-x-7 bg-night text-snow' : 'translate-x-0 text-ink'
          )}
        >
          {isDark ? (
            <MoonIcon className="h-3.5 w-3.5 text-brand" />
          ) : (
            <SunIcon className="h-3.5 w-3.5 text-ambre" />
          )}
        </span>
      </button>
    );
  }

  // Refined Pill toggle (Default for Footer)
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md p-0.5 border transition-colors',
        'bg-white dark:bg-night-2 border-line dark:border-night-line',
        className
      )}
      role="group"
      aria-label="Sélecteur de thème"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'flex items-center gap-1.5 rounded-sm px-3.5 py-2 min-h-[44px] sm:min-h-[36px] font-narrow text-xs font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer',
          resolvedTheme === 'light' && theme !== 'system'
            ? 'bg-ink text-white shadow-xs'
            : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white'
        )}
        title="Activer le mode clair"
      >
        <SunIcon className="h-3.5 w-3.5 text-ambre" />
        <span className="text-xs">Clair</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'flex items-center gap-1.5 rounded-sm px-3.5 py-2 min-h-[44px] sm:min-h-[36px] font-narrow text-xs font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer',
          resolvedTheme === 'dark' && theme !== 'system'
            ? 'bg-brand text-white shadow-xs'
            : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white'
        )}
        title="Activer le mode sombre"
      >
        <MoonIcon className="h-3.5 w-3.5" />
        <span className="text-xs">Sombre</span>
      </button>
    </div>
  );
}
