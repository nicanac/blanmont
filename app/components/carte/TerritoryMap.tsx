import React from 'react';
import { cn } from '@/app/utils/cn';
import { HeartLineMark } from '@/app/components/brand/HeartLineMark';
import { getMapLabels, getRiverLabels } from './territory';

const FULL_LAYERS = [
  'woods',
  'lakes',
  'relief',
  'relief-index',
  'water',
  'road-tertiary',
  'road-secondary',
  'road-primary',
  'road-major',
  'rail',
] as const;

const RELIEF_LAYERS = ['woods', 'relief', 'relief-index', 'water'] as const;

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

interface TerritoryMapProps {
  /**
   * Classes that size and place the 32 km square sheet inside its frame.
   * The frame should define `--sheet` (sheet edge length); Blanmont sits at the sheet centre.
   */
  sheetClassName?: string;
  /** Highest label priority to letter (0 = no lettering). */
  labels?: 0 | 1 | 2 | 3;
  /** Letter smaller villages only from md upward. */
  responsiveLabels?: boolean;
  rivers?: boolean;
  /** Print the sheet outward from the departure point on first paint. */
  develop?: boolean;
  marker?: 'hero' | 'point' | 'none';
  layers?: 'full' | 'relief';
  className?: string;
  children?: React.ReactNode;
}

/**
 * The club's territory printed as a topographic sheet: real relief (5 m contours),
 * rivers, woods, roads and rail around the Place de la Féchère. Every ink layer is an
 * SVG mask tinted by the map tokens, so the same sheet prints by day and by night.
 */
export default function TerritoryMap({
  sheetClassName = 'w-(--sheet) left-[calc(50%-var(--sheet)/2)] top-[calc(50%-var(--sheet)/2)]',
  labels = 2,
  responsiveLabels = true,
  rivers = true,
  develop = false,
  marker = 'point',
  layers = 'full',
  className,
  children,
}: TerritoryMapProps): React.ReactElement {
  const layerKeys = layers === 'full' ? FULL_LAYERS : RELIEF_LAYERS;
  const lettering = labels > 0 ? getMapLabels(labels as 1 | 2 | 3) : [];
  const riverLabels = rivers && labels > 0 ? getRiverLabels() : [];

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden bg-(--map-paper)',
        className
      )}
      aria-hidden="true"
    >
      <div className={cn('absolute aspect-square', sheetClassName)}>
        <div className={cn('absolute inset-0', develop && 'carte-develop is-developing')}>
          {layerKeys.map((key) => (
            <div key={key} className={`carte-layer carte-${key}`} />
          ))}
        </div>

        {riverLabels.map((river) => (
          <span
            key={river.name}
            className="map-label absolute left-(--x) top-(--y) -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10.5px] font-medium italic tracking-[0.16em] text-(--map-water)"
            style={{ '--x': `${river.x}%`, '--y': `${river.y}%` } as CSSVars}
          >
            {river.name}
          </span>
        ))}

        {lettering.map((label) =>
          label.rank === 'town' ? (
            <span
              key={label.name}
              className={cn(
                'map-label absolute left-(--x) top-(--y) -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[12.5px] font-bold uppercase tracking-[0.16em] text-(--map-label)',
                responsiveLabels && label.priority > 1 && 'hidden md:block'
              )}
              style={{ '--x': `${label.x}%`, '--y': `${label.y}%` } as CSSVars}
            >
              {label.name}
            </span>
          ) : (
            <span
              key={label.name}
              className={cn(
                'absolute left-(--x) top-(--y) flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap',
                responsiveLabels && label.priority > 1 && 'hidden md:flex'
              )}
              style={{ '--x': `${label.x}%`, '--y': `${label.y}%` } as CSSVars}
            >
              <span className="-ml-[3px] size-[6px] rounded-full border border-(--map-label) bg-(--map-paper)" />
              <span className="map-label text-[11px] font-medium tracking-[0.02em] text-(--map-label)">
                {label.name}
              </span>
            </span>
          )
        )}

        {marker !== 'none' && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[62%]">
            {marker === 'hero' && (
              <span className="pulse-ring absolute left-1/2 top-[58%] -ml-5 -mt-5 size-10 rounded-full border border-brand-vif" />
            )}
            <HeartLineMark
              className={cn('relative text-brand-vif', marker === 'hero' ? 'size-6' : 'size-4')}
            />
          </span>
        )}

        {children}
      </div>
    </div>
  );
}
