'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@/app/components/ui/Button';
import type { WeekendTrace } from '@/app/lib/poll-share';
import type { TraceRoute } from '@/app/lib/trace-route';
import { isWebUiLink } from '@/app/lib/urlUtils';
import { formatFrenchDate } from '@/app/utils/date';
import { cn } from '@/app/utils/cn';

// Leaflet touches `window`: client only, loaded only when a trace can be drawn.
const MapPreview = dynamic(() => import('@/app/components/ui/MapPreview'), {
  ssr: false,
  loading: () => <div className="size-full bg-paper-2 dark:bg-night-3" />,
});

const NBSP = ' ';
const km = new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const metres = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 0 });

/** "Samedi 28 novembre". */
export function traceDayLabel(isoDate: string): string {
  const label = formatFrenchDate(isoDate, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: undefined,
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "104,7 km · 523 m D+" (French decimal comma, non-breaking space before units). */
export function traceFacts(route: Pick<TraceRoute, 'distanceKm' | 'elevationM'>): string {
  const parts = [`${km.format(route.distanceKm)}${NBSP}km`];
  if (route.elevationM !== undefined) parts.push(`${metres.format(route.elevationM)}${NBSP}m D+`);
  return parts.join(' · ');
}

/** Visible label of the trace link, by source. */
export function traceLinkLabel(url: string): string {
  if (/garmin\.com/i.test(url)) return 'Ouvrir sur Garmin Connect';
  if (/strava\.com/i.test(url)) return 'Ouvrir sur Strava';
  if (/komoot/i.test(url)) return 'Ouvrir sur Komoot';
  return 'Télécharger la trace GPX';
}

function TraceFigure({ trace }: { trace: WeekendTrace }): React.ReactElement {
  const { route } = trace;
  const day = traceDayLabel(trace.isoDate);
  const linkLabel = traceLinkLabel(trace.url);
  const LinkIcon = isWebUiLink(trace.url) ? ArrowTopRightOnSquareIcon : ArrowDownTrayIcon;

  return (
    <figure className="space-y-3">
      {route && (
        // Static preview: the caption below carries the facts for assistive tech.
        <div className="h-56 overflow-hidden rounded-sm border border-line dark:border-night-line">
          <MapPreview
            summaryPolyline={route.polyline}
            interactive={false}
            strokeWeight={3}
            className="min-h-0 [&_.leaflet-container]:rounded-none"
          />
        </div>
      )}
      <figcaption className="space-y-1">
        <span className="block font-narrow text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
          {day}
        </span>
        {route?.name && (
          <span className="block break-words font-semiwide text-sm font-extrabold leading-tight text-ink dark:text-snow">
            {route.name}
          </span>
        )}
        {route && (
          <span className="block font-narrow text-xs font-bold tabular-nums text-ink-2 dark:text-snow-2">
            {traceFacts(route)}
          </span>
        )}
      </figcaption>
      <a
        href={trace.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${linkLabel} · ${day} (nouvel onglet)`}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
      >
        <LinkIcon className="size-4 shrink-0" aria-hidden="true" />
        {linkLabel}
      </a>
    </figure>
  );
}

/**
 * GPS traces the calendar lists for the poll's weekend, printed in the cartouche legend
 * column under the group breakdown: map preview, course name, distance and D+, and the link.
 */
export default function WeekendTraces({
  traces,
}: {
  traces: readonly WeekendTrace[];
}): React.ReactElement | null {
  if (traces.length === 0) return null;
  return (
    <section aria-labelledby="sondage-traces" className="space-y-3">
      <h2
        id="sondage-traces"
        className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3"
      >
        {traces.length > 1 ? 'Tracés GPS du week-end' : 'Tracé GPS du week-end'}
      </h2>
      <ul className="space-y-6">
        {traces.map((t) => (
          <li key={`${t.isoDate}-${t.url}`}>
            <TraceFigure trace={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}
