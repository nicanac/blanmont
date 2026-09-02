'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPinIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import RideWeatherBadge from '../ui/RideWeatherBadge';

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

export default function NextRideCard({ nextRide, defaultExpanded = false }: NextRideCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const pathname = usePathname();

  // Deduplicate: On homepage (/), next ride is already featured in the main body spread
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="w-full">
      <div className="group block rounded-lg bg-[#161922] border border-[#262b38] hover:border-[#e03e3e]/40 transition-colors overflow-hidden shadow-xl">
        {/* Header (Clickable toggle) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse shrink-0" />
            <span className="font-bold text-xs uppercase tracking-[0.08em] text-white">
              Prochain Rendez-vous
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#a7adbb] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full whitespace-nowrap">
              {nextRide.dateFormatted}
            </span>
            <div
              className={`rounded-full p-1 text-[#7d8493] group-hover:text-[#e03e3e] transition-all ${
                isExpanded ? 'rotate-180 text-[#e03e3e]' : ''
              }`}
              title={isExpanded ? 'Réduire' : 'Déplier les détails'}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Compact Summary (Always visible) */}
        <div className="px-4 sm:px-5 pb-4 -mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white truncate">
            <MapPinIcon className="h-4 w-4 text-[#e03e3e] shrink-0" />
            <span className="truncate">{nextRide.location}</span>
          </div>

          <div className="text-[#a7adbb] flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5 text-[#7d8493]" />
            <span>
              Départ <strong className="text-[#f5f6f8]">{nextRide.departure}</strong>
            </span>
            {nextRide.distances && <span>• {nextRide.distances}</span>}
          </div>
        </div>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-[#262b38] space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Address & Remarks */}
            {(nextRide.address || nextRide.remarks) && (
              <div className="space-y-1.5 text-xs text-[#a7adbb] rounded-md bg-white/[0.03] border border-white/5 p-3">
                {nextRide.address && (
                  <p className="text-xs text-[#a7adbb]">
                    <span className="font-semibold text-white">Lieu de RDV :</span>{' '}
                    <span className="text-[#7d8493]">{nextRide.address}</span>
                  </p>
                )}
                {nextRide.remarks && (
                  <p className="text-xs text-[#a7adbb]">
                    <span className="font-semibold text-white">Remarques :</span> {nextRide.remarks}
                  </p>
                )}
              </div>
            )}

            {/* Dark Weather Widget */}
            <div>
              <RideWeatherBadge
                isoDate={nextRide.isoDate}
                departure={nextRide.departure}
                theme="dark"
              />
            </div>

            {/* GPX Download Button */}
            {nextRide.gpxUrl && (
              <div className="pt-1">
                <a
                  href={nextRide.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full rounded-md bg-[#e03e3e]/10 hover:bg-[#e03e3e]/20 text-[#e03e3e] px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-[#e03e3e]/30 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  <span>
                    {nextRide.gpxUrl.includes('strava.com')
                      ? 'Trace GPS (Strava)'
                      : nextRide.gpxUrl.includes('garmin.com')
                      ? 'Trace GPS (Garmin Connect)'
                      : nextRide.gpxUrl.includes('komoot')
                      ? 'Trace GPS (Komoot)'
                      : 'Télécharger la trace GPX'}
                  </span>
                </a>
              </div>
            )}

            {/* Calendar link */}
            <div className="pt-2 border-t border-[#262b38] flex items-center justify-between text-xs font-semibold text-[#e03e3e]">
              <Link
                href="/calendrier"
                className="inline-flex items-center justify-between w-full hover:underline group/link"
              >
                <span>Voir le calendrier complet</span>
                <ArrowRightIcon className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
