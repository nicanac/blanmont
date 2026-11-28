'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@/app/components/ui/Button';
import { memberTraceHref } from '@/app/lib/member-trace';
import type { WeekendTrace } from '@/app/lib/poll-share';
import type { TraceRoute } from '@/app/lib/trace-route';
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

/** Same label as the home page, the calendar and the next-ride card (#252, #259). */
export const TRACE_DOWNLOAD_LABEL = 'Télécharger la trace GPX';

function TraceFigure({ trace }: { trace: WeekendTrace }): React.ReactElement {
  const { route } = trace;
  const day = traceDayLabel(trace.isoDate);
  // "Samedi 28 novembre · GR1" when the ride has one trace per group or distance.
  const heading = trace.label ? `${day} · ${trace.label}` : day;

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
          {trace.label && (
            <>
              {' · '}
              <span className="text-brand">{trace.label}</span>
            </>
          )}
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
      {/* Member link, as on the home page: a Garmin course downloads as GPX (#246),
          any other source redirects to it; a guest is sent to the login page (#252). */}
      <a
        href={memberTraceHref(trace.eventId, trace.index)}
        aria-label={`${TRACE_DOWNLOAD_LABEL} · ${heading}`}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
      >
        <ArrowDownTrayIcon className="size-4 shrink-0" aria-hidden="true" />
        {TRACE_DOWNLOAD_LABEL}
      </a>
    </figure>
  );
}

/**
 * GPS traces the calendar lists for the poll's weekend, printed in the cartouche legend
 * column under the group breakdown: map preview, course name, distance and D+, and the GPX download.
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
          <li key={`${t.eventId}-${t.index}`}>
            <TraceFigure trace={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}
