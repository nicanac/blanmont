import React from 'react';
import { cn } from '@/app/utils/cn';

interface ScaleBarProps {
  /** Number of kilometre segments drawn. */
  km?: number;
  /** Tailwind width class that must equal `km` kilometres at the sheet's print scale. */
  widthClassName?: string;
  className?: string;
  label?: boolean;
}

/**
 * Graphic scale of the sheet: alternating ink and paper kilometre segments.
 * Its width is derived from the same `--sheet` variable that sizes the map, so the
 * bar stays true at every breakpoint (the sheet spans 32 km).
 */
export function ScaleBar({
  km = 5,
  widthClassName = 'w-[calc(var(--sheet)*5/32)]',
  className,
  label = true,
}: ScaleBarProps): React.ReactElement {
  const segments = Array.from({ length: km }, (_, i) => i);
  return (
    <div
      className={cn('select-none', className)}
      aria-label={`Échelle graphique : ${km} kilomètres`}
      role="img"
    >
      <div className={cn('flex h-[5px] border border-ink dark:border-snow-2', widthClassName)}>
        {segments.map((i) => (
          <span
            key={i}
            className={cn(
              'h-full flex-1',
              i % 2 === 0 ? 'bg-ink dark:bg-snow-2' : 'bg-paper dark:bg-night'
            )}
          />
        ))}
      </div>
      {label && (
        <div
          className={cn(
            'mt-1 flex justify-between font-narrow text-[10px] font-semibold tabular-nums tracking-[0.04em] text-ink-2 dark:text-snow-2',
            widthClassName
          )}
        >
          <span>0</span>
          <span>{km} km</span>
        </div>
      )}
    </div>
  );
}

export function NorthArrow({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      viewBox="0 0 20 34"
      className={cn('h-8 w-5 text-ink dark:text-snow', className)}
      role="img"
      aria-label="Nord"
    >
      <path d="M10 1 17 22 10 18 3 22Z" className="fill-current" />
      <path
        d="M10 1 10 18 3 22Z"
        className="fill-paper dark:fill-night"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <text
        x="10"
        y="33"
        textAnchor="middle"
        className="fill-current font-sans text-[9px] font-bold"
      >
        N
      </text>
    </svg>
  );
}

export default ScaleBar;
