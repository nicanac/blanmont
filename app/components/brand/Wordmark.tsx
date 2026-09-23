import React from 'react';
import Link from 'next/link';
import { cn } from '@/app/utils/cn';
import { GeodeticMark } from '@/app/components/carte/GeodeticMark';

interface WordmarkProps {
  className?: string;
  size?: 'md' | 'lg';
  withSubline?: boolean;
  onDark?: boolean;
}

/**
 * Club wordmark: the geodetic point (the Place de la Féchère, where every ride
 * starts) set beside BLANMONT in expanded map capitals.
 */
export function Wordmark({
  className,
  size = 'md',
  withSubline = true,
  onDark = false,
}: WordmarkProps): React.ReactElement {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-offset-4',
        className
      )}
      aria-label="CC Saint-Martin Blanmont — accueil"
    >
      <GeodeticMark
        className={cn(
          'text-brand-vif transition-transform duration-300 ease-(--ease-stamp) group-hover:-translate-y-0.5',
          size === 'lg' ? 'size-7' : 'size-[1.15rem]'
        )}
      />
      <span
        className={cn(
          'font-wide font-extrabold uppercase leading-none tracking-[0.03em]',
          size === 'lg' ? 'text-3xl' : 'text-[1.05rem]',
          onDark ? 'text-snow' : 'text-ink dark:text-snow'
        )}
      >
        Blanmont
      </span>
      {withSubline && (
        <span
          className={cn(
            'hidden border-l pl-2.5 font-narrow text-[0.6875rem] font-semibold uppercase leading-[1.2] tracking-[0.1em] md:block',
            onDark
              ? 'border-night-line text-snow-3'
              : 'border-line text-ink-3 dark:border-night-line dark:text-snow-3'
          )}
        >
          Cyclo Club
          <br />
          Saint-Martin
        </span>
      )}
    </Link>
  );
}

export default Wordmark;
