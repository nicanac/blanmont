import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import TerritoryMap from '@/app/components/carte/TerritoryMap';
import WindField from '@/app/components/carte/WindField';
import { WindRose } from '@/app/components/carte/WindRose';
import { WeatherGlyph } from '@/app/components/carte/WeatherGlyph';
import { RoadSwatch } from '@/app/components/carte/RoadSwatch';
import { ScaleBar, NorthArrow } from '@/app/components/carte/ScaleBar';
import { DEPARTURE_POINT, MAP_CREDITS } from '@/app/components/carte/territory';
import { PACE_GROUPS } from '@/app/constants/cycling';
import type { RideWeather } from '@/app/lib/weather';
import type { HeroSettings, WeekendPoll } from '@/app/types';
import type { ScheduledRideInfo } from '@/app/lib/firebase/calendar';
import { departureDateParts, windAdvice, cardinalName, formatDistance } from './homeData';
import { cn } from '@/app/utils/cn';

interface HomeCoverProps {
  nextRide: ScheduledRideInfo;
  weather: RideWeather | null;
  heroSettings: HeroSettings;
  activePoll: WeekendPoll | null;
  ridersAnnounced: number;
}

function gpxLabel(url: string): string {
  if (url.includes('strava.com')) return 'Trace sur Strava';
  if (url.includes('garmin.com')) return 'Trace sur Garmin';
  if (url.includes('komoot')) return 'Trace sur Komoot';
  return 'Télécharger la trace GPX';
}

/**
 * The cover of the sheet: the club's real territory, the forecast wind streaming
 * across it from the departure bearing, and the next departure printed as the
 * sheet's title cartouche.
 */
export default function HomeCover({
  nextRide,
  weather,
  heroSettings,
  activePoll,
  ridersAnnounced,
}: HomeCoverProps): React.ReactElement {
  const date = departureDateParts(nextRide.isoDate);
  const forecast = weather?.isAvailable ? weather : null;
  const advice = windAdvice(forecast);
  const distance = formatDistance(nextRide.distances);
  const pollOpen = activePoll?.status === 'active';
  const atClubSquare = !nextRide.address || /f[ée]ch[èe]re/i.test(nextRide.address);

  return (
    <section
      aria-labelledby="depart-title"
      className="relative isolate border-b border-ink bg-(--map-paper) dark:border-night-line-strong"
    >
      {/* The territory sheet */}
      <div className="relative h-[46svh] min-h-[300px] overflow-hidden [--ax:57%] [--ay:50%] [--sheet:1400px] sm:[--sheet:1900px] lg:absolute lg:inset-0 lg:h-auto lg:[--ax:71%] lg:[--ay:46%] lg:[--sheet:max(2700px,calc(var(--ax)*2+100px))]">
        <TerritoryMap
          develop
          labels={3}
          marker="hero"
          sheetClassName="w-(--sheet) left-[calc(var(--ax)-var(--sheet)/2)] top-[calc(var(--ay)-var(--sheet)/2)]"
        >
          <span className="absolute left-1/2 top-1/2 ml-5 -translate-y-[85%] whitespace-nowrap">
            <span className="map-label block font-wide text-[15px] font-extrabold uppercase leading-none tracking-[0.12em] text-(--map-label)">
              Blanmont
            </span>
            <span className="map-label mt-1 block text-[11px] font-medium italic leading-none text-(--map-label)">
              {DEPARTURE_POINT.name}
            </span>
          </span>
        </TerritoryMap>
        <div
          className="map-grid pointer-events-none absolute inset-0 [--grid:calc(var(--sheet)/16)] [--grid-x:calc(var(--ax)-var(--sheet)/2)] [--grid-y:calc(var(--ay)-var(--sheet)/2)]"
          aria-hidden="true"
        />
        {forecast && <WindField fromDeg={forecast.windDirection} speedKmh={forecast.windSpeed} />}
      </div>

      {/* Title cartouche */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:min-h-[calc(100svh-4rem-5.5rem)] lg:items-center lg:px-8 lg:py-12">
        <div className="neatline relative -mt-12 w-full max-w-[37rem] bg-white/[0.97] p-6 shadow-lg sm:p-9 lg:mt-0 dark:bg-night-2/[0.97]">
          <h1 id="depart-title" className="text-ink dark:text-snow">
            <span className="sr-only">Prochain départ du CC Saint-Martin Blanmont : </span>
            <span className="block font-wide text-[clamp(1.35rem,2.5vw,2rem)] font-extrabold uppercase leading-none tracking-[0.01em]">
              {date.weekday} {date.dayMonth}
            </span>
            <span className="mt-2 block text-balance font-wide text-[clamp(2.75rem,6.4vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.015em] tabular-nums">
              Départ {nextRide.departure}
            </span>
          </h1>
          <p className="mt-4 text-base text-ink-2 dark:text-snow-2">
            {atClubSquare ? (
              <>
                <span className="font-semibold text-ink dark:text-snow">
                  {DEPARTURE_POINT.clubName}
                </span>
                <span className="italic"> · la Féchère, {DEPARTURE_POINT.commune}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-ink dark:text-snow">{nextRide.location}</span>
                <span> · {nextRide.address}</span>
              </>
            )}
          </p>

          <dl className="mt-6 grid grid-cols-1 border-t border-ink sm:grid-cols-2 dark:border-snow-3">
            <div className="flex items-center gap-3 border-b border-line py-3.5 sm:border-r sm:pr-4 dark:border-night-line">
              <WeatherGlyph
                code={forecast?.weatherCode}
                className="size-8 text-ink dark:text-snow"
              />
              <div className="min-w-0">
                <dt className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                  Météo au départ
                </dt>
                <dd className="text-sm font-semibold text-ink dark:text-snow">
                  {forecast ? (
                    <>
                      <span className="tabular-nums">{forecast.temperature} °C</span> ·{' '}
                      {forecast.condition}
                      {forecast.precipitationProb > 0 && (
                        <span className="font-normal text-hydro dark:text-hydro-soft">
                          {' '}
                          · pluie {forecast.precipitationProb} %
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-normal text-ink-3 dark:text-snow-3">
                      Prévisions disponibles à J-14
                    </span>
                  )}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-line py-3.5 sm:pl-4 dark:border-night-line">
              {forecast ? (
                <WindRose fromDeg={forecast.windDirection} />
              ) : (
                <WindRose fromDeg={0} className="opacity-40" />
              )}
              <div className="min-w-0">
                <dt className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                  Vent
                </dt>
                <dd className="text-sm font-semibold text-ink dark:text-snow">
                  {forecast ? (
                    <>
                      De {cardinalName(forecast.windCardinal)} ·{' '}
                      <span className="tabular-nums">{forecast.windSpeed} km/h</span>
                    </>
                  ) : (
                    <span className="font-normal text-ink-3 dark:text-snow-3">À venir</span>
                  )}
                </dd>
              </div>
            </div>
            {advice && (
              <div className="border-b border-line py-3 sm:col-span-2 dark:border-night-line">
                <dt className="sr-only">Conseil de route</dt>
                <dd className="text-sm italic text-ink-2 dark:text-snow-2">{advice}</dd>
              </div>
            )}
            <div className="py-3.5 sm:col-span-2">
              <dt className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                Groupes{distance ? ` · ${distance}` : ''}
              </dt>
              <dd className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {PACE_GROUPS.map((g) => (
                  <span key={g.id} className="flex items-center gap-2">
                    <RoadSwatch group={g.id} className="w-8" />
                    <span className="font-narrow text-sm font-bold text-ink dark:text-snow">
                      {g.id}
                    </span>
                    <span className="font-narrow text-xs tabular-nums text-ink-3 dark:text-snow-3">
                      {g.speed.replace(' km/h', '')}
                    </span>
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {pollOpen ? (
              <Link
                href="/sondage"
                className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-colors hover:bg-brand-strong"
              >
                Je roule ce week-end
                <ArrowRightIcon
                  className="size-4 transition-transform duration-300 ease-(--ease-plot) group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <Link
                href="/calendrier"
                className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-colors hover:bg-brand-strong"
              >
                Voir le calendrier
                <ArrowRightIcon
                  className="size-4 transition-transform duration-300 ease-(--ease-plot) group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            )}
            {nextRide.gpxUrl && (
              <a
                href={nextRide.gpxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-ink px-5 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
              >
                <ArrowDownTrayIcon className="size-4" aria-hidden="true" />
                {gpxLabel(nextRide.gpxUrl)}
              </a>
            )}
            {pollOpen && ridersAnnounced > 0 && (
              <span className="font-narrow text-sm text-ink-3 dark:text-snow-3">
                <strong className="tabular-nums text-ink dark:text-snow">{ridersAnnounced}</strong>{' '}
                déjà annoncé{ridersAnnounced > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <p className="mt-6 border-t border-line pt-4 text-sm text-ink-2 dark:border-night-line dark:text-snow-2">
            Première sortie avec nous ? Trois sorties d&apos;essai offertes, sans engagement.{' '}
            <Link
              href="/rejoindre"
              className="font-bold text-brand underline decoration-brand/40 underline-offset-[0.25em] transition-colors hover:decoration-brand dark:text-brand-soft"
            >
              Rejoindre le club
            </Link>
          </p>
        </div>
      </div>

      {/* Lower sheet margin: standing information (managed in admin) + scale */}
      <div className="relative border-t border-ink bg-paper/[0.96] dark:border-night-line-strong dark:bg-night/[0.96]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:flex-1 lg:gap-x-0">
            {heroSettings.cards.map((card, idx) => (
              <div
                key={card.id || idx}
                className={cn(
                  'min-w-0',
                  idx > 0 && 'lg:border-l lg:border-line lg:pl-5 dark:lg:border-night-line',
                  idx < 3 && 'lg:pr-5'
                )}
              >
                <dt className="truncate font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                  {card.label}
                </dt>
                <dd className="truncate text-sm font-semibold text-ink dark:text-snow">
                  {card.value}
                  {card.detail ? (
                    <span className="font-normal text-ink-3 dark:text-snow-3"> {card.detail}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex items-end justify-between gap-5 lg:justify-end">
            <p className="max-w-[18rem] text-[10.5px] leading-snug text-ink-3 lg:text-right dark:text-snow-3">
              {MAP_CREDITS}
            </p>
            <div className="flex shrink-0 items-end gap-3 [--sheet:1400px] sm:[--sheet:1900px] lg:[--sheet:2700px]">
              <ScaleBar km={2} widthClassName="w-[calc(var(--sheet)*2/32)]" />
              <NorthArrow className="h-7" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
