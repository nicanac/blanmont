'use client';
import GpxStatsDisplay from '../ui/GpxStatsDisplay';
import { isWebUiLink } from '@/app/lib/urlUtils';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRightIcon, ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import RideWeatherBadge from '../ui/RideWeatherBadge';
import { useTheme } from '../../context/ThemeContext';
import { HeartLineMark } from '../brand/HeartLineMark';
import { cn } from '../../utils/cn';

export interface ScheduledRideInfo {
  isoDate: string;
  dateFormatted: string;
  location: string;
  departure: string;
  distances?: string;
  address?: string;
  remarks?: string;
  gpxUrl?: string;
  group?: string;
  isCustomEvent: boolean;
}

interface NextRideCardProps {
  nextRide: ScheduledRideInfo;
  defaultExpanded?: boolean;
}

function gpxLabel(url: string): string {
  if (url.includes('strava.com')) return 'Trace GPS (Strava)';
  if (url.includes('garmin.com')) return 'Trace GPS (Garmin Connect)';
  if (url.includes('komoot')) return 'Trace GPS (Komoot)';
  return 'Télécharger la trace GPX';
}

export default function NextRideCard({ nextRide, defaultExpanded = false }: NextRideCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  // On the homepage the next departure is already the cover of the sheet
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="w-full">
      <div className="group border border-ink bg-white transition-colors dark:border-night-line-strong dark:bg-night-2">
        <div
          className="scale-strip h-[3px] opacity-80 [--seg:14px] dark:opacity-40"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-paper dark:hover:bg-night-3"
          aria-expanded={isExpanded}
        >
          <span className="flex items-center gap-2">
            <HeartLineMark className="size-3.5 text-brand-vif" />
            <span className="font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink dark:text-snow">
              Prochain Rendez-vous
            </span>
          </span>
          <ChevronDownIcon
            className={cn(
              'size-4 text-ink-3 transition-transform duration-200 group-hover:text-brand',
              isExpanded && 'rotate-180 text-brand'
            )}
            aria-hidden="true"
          />
        </button>

        <div className="space-y-1 px-4 pb-4">
          <p className="font-semiwide text-base font-extrabold uppercase leading-tight text-ink dark:text-snow">
            {nextRide.dateFormatted}
          </p>
          <p className="text-sm text-ink-2 dark:text-snow-2">
            <span className="font-semibold text-ink dark:text-snow">{nextRide.location}</span>
          </p>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Départ{' '}
            <strong className="tabular-nums text-ink dark:text-snow">{nextRide.departure}</strong>
            {nextRide.distances && <span> · {nextRide.distances}</span>}
          </p>
        </div>

        {isExpanded && (
          <div className="space-y-3.5 border-t border-line px-4 pb-4 pt-3.5 dark:border-night-line">
            {(nextRide.address || nextRide.remarks) && (
              <dl className="space-y-1.5 text-xs">
                {nextRide.address && (
                  <div>
                    <dt className="inline font-semibold text-ink dark:text-snow">Lieu de RDV :</dt>{' '}
                    <dd className="inline text-ink-2 dark:text-snow-2">{nextRide.address}</dd>
                  </div>
                )}
                {nextRide.remarks && (
                  <div>
                    <dt className="inline font-semibold text-ink dark:text-snow">Remarques :</dt>{' '}
                    <dd className="inline text-ink-2 dark:text-snow-2">{nextRide.remarks}</dd>
                  </div>
                )}
              </dl>
            )}

            <RideWeatherBadge
              isoDate={nextRide.isoDate}
              departure={nextRide.departure}
              theme={resolvedTheme === 'dark' ? 'dark' : 'paper'}
            />

            {nextRide.gpxUrl && (
              <div className={cn('pt-1', !isWebUiLink(nextRide.gpxUrl) && 'space-y-3')}>
                <GpxStatsDisplay url={nextRide.gpxUrl} />
                <a
                  href={nextRide.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md border border-ink px-3 font-narrow text-xs font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
                >
                  <ArrowDownTrayIcon className="size-3.5" aria-hidden="true" />
                  <span>{gpxLabel(nextRide.gpxUrl)}</span>
                </a>
              </div>
            )}

            <Link
              href="/calendrier"
              className="group/link flex min-h-[44px] items-center justify-between border-t border-line pt-2 text-xs font-bold text-brand dark:border-night-line dark:text-brand-soft"
            >
              <span>Voir le calendrier complet</span>
              <ArrowRightIcon
                className="size-3.5 transition-transform group-hover/link:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
