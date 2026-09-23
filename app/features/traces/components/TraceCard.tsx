'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trace } from '../../../types';
import { stripSuffix } from '../../../utils/string.utils';
import { parseDirection } from '../../../utils/direction';
import { ArrowDownTrayIcon, StarIcon } from '@heroicons/react/20/solid';
import { HeartLineMark } from '../../../components/brand/HeartLineMark';

interface TraceCardProps {
  trace: Trace;
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  imageOverlay?: React.ReactNode;
}

/** A drawn compass arrow pointing along the route's outbound bearing. */
function BearingArrow({ bearing }: { bearing: number }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden="true" focusable="false">
      <g transform={`rotate(${bearing} 8 8)`}>
        <path d="M8 1.5 12 9.5 8 7.6 4 9.5Z" fill="currentColor" />
        <line
          x1="8"
          y1="7.6"
          x2="8"
          y2="14.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default function TraceCard({ trace, ...props }: TraceCardProps) {
  const direction = parseDirection(trace.direction);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden border border-line bg-white transition-colors duration-200 hover:border-ink dark:border-night-line dark:bg-night-2 dark:hover:border-snow-3 ${props.className || ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-2 sm:aspect-auto sm:h-52 dark:border-night-line dark:bg-night-3">
        {trace.photoUrl ? (
          <Image
            src={trace.photoUrl}
            alt={trace.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-(--ease-plot) group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-paper-2 dark:bg-night-3">
            <HeartLineMark className="size-7 text-brand-vif" title="Aperçu de parcours indisponible" />
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-sm bg-ink/85 px-2 py-1 font-narrow text-xs font-bold tabular-nums text-white">
          <StarIcon className="size-3.5 text-jaune" aria-hidden="true" />
          <span>
            {trace.quality}
            <span className="sr-only"> sur 5</span>
          </span>
        </div>
        {direction ? (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-sm bg-ink/85 px-2 py-1 font-narrow text-xs font-bold uppercase tracking-[0.06em] text-white">
            <BearingArrow bearing={direction.bearing} />
            {direction.label}
          </div>
        ) : (
          trace.direction && (
            <div className="absolute right-2.5 top-2.5 rounded-sm bg-ink/85 px-2 py-1 font-narrow text-xs font-bold text-white">
              {trace.direction}
            </div>
          )
        )}
        {props.imageOverlay}
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4 sm:p-5">
        <h3 className="line-clamp-1 font-semiwide text-base font-extrabold text-ink transition-colors duration-150 group-hover:text-brand dark:text-white dark:group-hover:text-brand-soft">
          <Link href={`/traces/${trace.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {stripSuffix(trace.name, '#')}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-2 dark:text-snow-2">
          {trace.description || 'Circuit vélo autour de Blanmont.'}
        </p>
        <div className="flex flex-1 flex-col justify-end pt-2">
          <dl className="flex items-end justify-between border-t border-ink pt-2.5 dark:border-snow-3">
            <div className="flex items-baseline gap-1">
              <dt className="sr-only">Distance</dt>
              <dd className="font-narrow text-xl font-extrabold tabular-nums text-ink dark:text-white">
                {trace.distance}{' '}
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3">km</span>
              </dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt className="sr-only">Dénivelé</dt>
              <dd className="font-narrow text-xl font-extrabold tabular-nums text-bistre-ink dark:text-bistre-soft">
                {trace.elevation ?? '—'}{' '}
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3">m D+</span>
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center gap-2">
            {trace.surface && (
              <span className="inline-flex items-center rounded-sm border border-line bg-paper px-2 py-0.5 font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink dark:border-night-line dark:bg-night dark:text-white">
                {trace.surface}
              </span>
            )}
            {trace.start && (
              <span className="inline-flex items-center truncate rounded-sm px-1 py-0.5 text-xs italic text-ink-3 dark:text-snow-3">
                {trace.start}
              </span>
            )}
          </div>
        </div>
      </div>
      {props.children}

      {props.footer
        ? props.footer
        : trace.gpxUrl && (
            <div className="border-t border-line bg-paper px-4 py-1.5 dark:border-night-line dark:bg-night">
              <a
                href={trace.gpxUrl}
                target="_blank"
                className="relative z-10 flex min-h-[44px] items-center justify-center gap-1.5 font-narrow text-xs font-bold uppercase tracking-[0.07em] text-brand transition-colors duration-150 hover:text-brand-strong dark:text-brand-soft"
                download
              >
                <ArrowDownTrayIcon className="size-3.5" aria-hidden="true" />
                <span>Télécharger GPX</span>
              </a>
            </div>
          )}
    </div>
  );
}
