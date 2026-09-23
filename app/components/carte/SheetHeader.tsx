import React from 'react';
import { cn } from '@/app/utils/cn';
import TerritoryMap from './TerritoryMap';
import { formatCoordinate, territory } from './territory';

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export interface SheetLegendRow {
  term: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

export interface SheetHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Sheet name printed in the lower margin (e.g. "Calendrier"). */
  sheet: string;
  /** Key facts printed as the cartouche legend. */
  legend?: SheetLegendRow[];
  actions?: React.ReactNode;
  /** Point of the territory (sheet %, Blanmont = 50/50) centred in the band. */
  focus?: { x: number; y: number };
  /** Drench the cartouche in one map ink. */
  tone?: 'paper' | 'vert' | 'rouge' | 'nuit';
  size?: 'md' | 'lg';
  /** Extra content under the description (chips, selectors). */
  children?: React.ReactNode;
  className?: string;
}

const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LON = 111.32 * Math.cos((territory.center.lat * Math.PI) / 180);

function focusCoordinates(x: number, y: number): string {
  const half = territory.extentKm / 2;
  const lat = territory.center.lat + ((50 - y) / 50) * (half / KM_PER_DEG_LAT);
  const lon = territory.center.lon + ((x - 50) / 50) * (half / KM_PER_DEG_LON);
  return `${formatCoordinate(lat, 'lat')} · ${formatCoordinate(lon, 'lon')}`;
}

const toneStyles = {
  paper: {
    panel: 'bg-white text-ink dark:bg-night-2 dark:text-snow',
    description: 'text-ink-2 dark:text-snow-2',
    legendBorder: 'border-line dark:border-night-line',
    term: 'text-ink-3 dark:text-snow-3',
    value: 'text-ink dark:text-snow',
    hint: 'text-ink-3 dark:text-snow-3',
  },
  vert: {
    panel: 'bg-vert text-white [--nl:rgb(255_255_255/0.85)] dark:bg-vert-strong',
    description: 'text-white/90',
    legendBorder: 'border-white/25',
    term: 'text-white/80',
    value: 'text-white',
    hint: 'text-white/80',
  },
  rouge: {
    panel: 'bg-brand text-white [--nl:rgb(255_255_255/0.85)]',
    description: 'text-white/90',
    legendBorder: 'border-white/25',
    term: 'text-white/85',
    value: 'text-white',
    hint: 'text-white/85',
  },
  nuit: {
    panel: 'bg-ink text-snow [--nl:var(--color-snow-3)] dark:bg-night-3',
    description: 'text-snow-2',
    legendBorder: 'border-night-line-strong',
    term: 'text-snow-3',
    value: 'text-snow',
    hint: 'text-snow-3',
  },
} as const;

/**
 * Page cartouche: every page opens on a band of the club's real territory with its
 * title block printed on top, like the title panel of a topographic sheet.
 * Key facts sit in the cartouche legend rather than as oversized metrics.
 */
export function SheetHeader({
  title,
  description,
  sheet,
  legend,
  actions,
  focus = { x: 50, y: 50 },
  tone = 'paper',
  size = 'md',
  children,
  className,
}: SheetHeaderProps): React.ReactElement {
  const t = toneStyles[tone];
  const hasLegend = Boolean(legend && legend.length > 0);

  return (
    <header
      className={cn(
        'relative border-b border-line bg-paper dark:border-night-line dark:bg-night',
        className
      )}
    >
      <div
        className="relative h-32 overflow-hidden border-b border-line [--sheet:1500px] sm:h-40 sm:[--sheet:2300px] dark:border-night-line"
        style={{ '--fx': String(focus.x / 100), '--fy': String(focus.y / 100) } as CSSVars}
      >
        <TerritoryMap
          labels={2}
          marker="point"
          sheetClassName="w-(--sheet) left-[calc(50%-var(--sheet)*var(--fx))] top-[calc(50%-var(--sheet)*var(--fy))]"
        />
        <div
          className="map-grid absolute inset-0 opacity-70 [--grid:calc(var(--sheet)/16)] [--grid-x:calc(50%-var(--sheet)*var(--fx))] [--grid-y:calc(50%-var(--sheet)*var(--fy))]"
          aria-hidden="true"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'neatline relative -mt-14 grid shadow-md sm:-mt-20 lg:grid-cols-12',
            t.panel
          )}
        >
          <div className={cn('min-w-0 p-6 sm:p-10', hasLegend ? 'lg:col-span-8' : 'lg:col-span-12')}>
            <h1
              className={cn(
                'max-w-[20ch] text-balance font-wide font-extrabold uppercase tracking-[-0.01em]',
                size === 'lg'
                  ? 'text-[clamp(2.4rem,6vw,5.25rem)]'
                  : 'text-[clamp(2.1rem,4.8vw,4.25rem)]',
                'leading-[0.94]'
              )}
            >
              {title}
            </h1>
            {description && (
              <div
                className={cn(
                  'mt-5 max-w-[62ch] text-base leading-relaxed sm:text-lg',
                  t.description
                )}
              >
                {description}
              </div>
            )}
            {children && <div className="mt-6">{children}</div>}
            {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>

          {hasLegend && (
            <dl
              className={cn(
                'border-t px-6 py-5 sm:px-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:px-8 lg:py-9',
                t.legendBorder
              )}
            >
              {legend!.map((row) => (
                <div
                  key={row.term}
                  className={cn(
                    'border-b py-3 last:border-b-0 first:pt-0 last:pb-0',
                    t.legendBorder
                  )}
                >
                  <dt
                    className={cn(
                      'font-narrow text-[11px] font-bold uppercase tracking-[0.12em]',
                      t.term
                    )}
                  >
                    {row.term}
                  </dt>
                  <dd
                    className={cn(
                      'mt-1 font-semiwide text-base font-bold leading-snug tabular-nums',
                      t.value
                    )}
                  >
                    {row.value}
                  </dd>
                  {row.hint && <dd className={cn('mt-0.5 text-xs', t.hint)}>{row.hint}</dd>}
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 py-3 font-narrow text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
          <span>Feuille · {sheet}</span>
          <span className="tabular-nums normal-case tracking-[0.04em]">
            {focusCoordinates(focus.x, focus.y)}
          </span>
        </div>
      </div>
    </header>
  );
}

export default SheetHeader;
