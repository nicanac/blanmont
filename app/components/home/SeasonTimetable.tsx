import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import type { CalendarEvent } from '@/app/types';
import { departureDateParts, formatDistance, humanizeAddress } from './homeData';

interface SeasonTimetableProps {
  events: CalendarEvent[];
  totalThisSeason: number;
}

/**
 * The season as a road book timetable: date, meeting place, distance, departure.
 */
export default function SeasonTimetable({
  events,
  totalThisSeason,
}: SeasonTimetableProps): React.ReactElement | null {
  if (events.length === 0) return null;

  return (
    <section
      aria-labelledby="saison-title"
      className="border-b border-line bg-paper py-20 sm:py-24 dark:border-night-line dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="saison-title"
            className="max-w-[14ch] text-balance font-wide text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold uppercase leading-[0.94] text-ink dark:text-snow"
          >
            Les prochaines sorties
          </h2>
          <p className="max-w-[38ch] text-sm text-ink-2 sm:text-right dark:text-snow-2">
            {totalThisSeason} sorties au programme cette saison, route et VTT, au départ de Blanmont
            ou en randonnée extérieure.
          </p>
        </div>

        <div className="mt-10 border-t-2 border-ink dark:border-snow-2">
          <div className="hidden grid-cols-[9rem_minmax(0,1fr)_8rem_6rem_7rem] gap-6 border-b border-ink py-2.5 font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 md:grid dark:border-snow-3 dark:text-snow-3">
            <span>Date</span>
            <span>Rendez-vous</span>
            <span>Distances</span>
            <span>Départ</span>
            <span className="text-right">Détail</span>
          </div>
          <ol>
            {events.map((event) => {
              const d = departureDateParts(event.isoDate);
              const distance = formatDistance(event.distances);
              const away = event.location && !/blanmont/i.test(event.location);
              const address = humanizeAddress(event.address);
              return (
                <li key={event.id} className="border-b border-line dark:border-night-line">
                  <Link
                    href={`/calendrier?event=${encodeURIComponent(event.id)}`}
                    className="group grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-white md:grid-cols-[9rem_minmax(0,1fr)_8rem_6rem_7rem] md:gap-6 dark:hover:bg-night-2"
                  >
                    <span className="row-span-2 flex items-baseline gap-2 md:row-span-1">
                      <span className="font-narrow text-xs font-bold uppercase text-ink-3 dark:text-snow-3">
                        {d.weekdayShort}
                      </span>
                      <span className="font-wide text-2xl font-extrabold tabular-nums leading-none text-ink dark:text-snow">
                        {d.day}
                      </span>
                      <span className="hidden font-narrow text-sm font-semibold text-ink-2 md:inline dark:text-snow-2">
                        {d.monthShort}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-bold text-ink group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft">
                        {event.location || 'Blanmont'}
                        <span className="font-normal text-ink-3 md:hidden dark:text-snow-3">
                          {' '}
                          · {d.monthShort}
                        </span>
                      </span>
                      {address && (
                        <span
                          className={
                            away
                              ? 'block truncate text-xs italic text-ink-3 dark:text-snow-3'
                              : 'block truncate text-xs text-ink-3 dark:text-snow-3'
                          }
                        >
                          {address}
                        </span>
                      )}
                    </span>
                    <span className="hidden font-narrow text-sm font-semibold tabular-nums text-ink-2 md:block dark:text-snow-2">
                      {distance ?? '—'}
                    </span>
                    <span className="font-narrow text-lg font-extrabold tabular-nums text-ink md:text-base dark:text-snow">
                      {event.departure || '—'}
                    </span>
                    <span className="col-start-2 flex items-center gap-2 text-xs text-ink-3 md:col-start-auto md:justify-end dark:text-snow-3">
                      <span className="md:hidden">{distance}</span>
                      {event.gpxUrl && (
                        <span className="inline-flex items-center gap-1 font-semibold text-hydro dark:text-hydro-soft">
                          GPX
                          <ArrowUpRightIcon className="size-3" aria-hidden="true" />
                        </span>
                      )}
                      <ArrowRightIcon
                        className="hidden size-4 text-ink transition-transform duration-300 group-hover:translate-x-1 md:block dark:text-snow"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8">
          <Link
            href="/calendrier"
            className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md border border-ink px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
          >
            Tout le calendrier
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
