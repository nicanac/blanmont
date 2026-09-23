import React from 'react';
import { SheetHeader } from '../carte/SheetHeader';

interface PageHeroProps {
  title: React.ReactNode;
  description?: string | React.ReactNode;
  badge?: string;
  badgeIcon?: React.ReactNode;
  variant?: 'red' | 'green' | 'blue' | 'gray' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  /** Printed as the sheet name in the cartouche margin. */
  watermark?: string;
  children?: React.ReactNode;
}

const toneByVariant = {
  light: 'paper',
  red: 'paper',
  blue: 'paper',
  gray: 'paper',
  green: 'vert',
  dark: 'nuit',
} as const;

/**
 * Compatibility wrapper: pages that still call PageHero now open on the
 * territory cartouche (SheetHeader).
 */
export function PageHero({
  title,
  description,
  badge,
  badgeIcon,
  variant = 'light',
  size = 'md',
  watermark = 'Blanmont',
  children,
}: PageHeroProps): React.ReactElement {
  const tone = toneByVariant[variant];
  return (
    <SheetHeader
      title={title}
      description={description}
      sheet={watermark}
      tone={tone}
      size={size === 'lg' ? 'lg' : 'md'}
    >
      {(badge || children) && (
        <div className="flex flex-wrap items-center gap-3">
          {badge && (
            <span
              className={
                tone === 'paper'
                  ? 'inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-2 dark:border-night-line dark:bg-night-3 dark:text-snow-2'
                  : 'inline-flex items-center gap-2 rounded-full border border-white/35 px-3 py-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-white'
              }
            >
              {badgeIcon}
              {badge}
            </span>
          )}
          {children}
        </div>
      )}
    </SheetHeader>
  );
}

export default PageHero;
