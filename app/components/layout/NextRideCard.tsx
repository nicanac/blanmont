'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPinIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

  return (
    <div className="w-full">
      <div className="group block rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-300 hover:shadow-md transition-all overflow-hidden">
        {/* Header (Clickable toggle) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Prochain Rendez-vous
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {nextRide.dateFormatted}
            </span>
            <div
              className={`rounded-full p-1 text-slate-400 group-hover:text-[#e03e3e] group-hover:bg-slate-100 transition-all ${
                isExpanded ? 'rotate-180 text-[#e03e3e] bg-slate-100' : ''
              }`}
              title={isExpanded ? 'Réduire' : 'Déplier les détails'}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Compact Summary (Always visible) */}
        <div className="px-4 sm:px-5 pb-3.5 -mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
            <MapPinIcon className="h-4 w-4 text-[#e03e3e] shrink-0" />
            <span className="truncate">{nextRide.location}</span>
          </div>

          <div className="text-slate-600 flex items-center gap-1.5">
            <span>Départ <strong className="text-slate-800">{nextRide.departure}</strong></span>
            {nextRide.distances && <span>• {nextRide.distances}</span>}
          </div>
        </div>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Address & Remarks */}
            {(nextRide.address || nextRide.remarks) && (
              <div className="space-y-1 text-xs text-slate-600">
                {nextRide.address && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Lieu de RDV :</span> {nextRide.address}
                  </p>
                )}
                {nextRide.remarks && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Remarques :</span> {nextRide.remarks}
                  </p>
                )}
              </div>
            )}

            {/* Weather Widget */}
            <div>
              <RideWeatherBadge isoDate={nextRide.isoDate} departure={nextRide.departure} />
            </div>

            {/* GPX Button */}
            {nextRide.gpxUrl && (
              <div className="pt-1">
                <a
                  href={nextRide.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-red-50 hover:bg-red-100 text-[#e03e3e] px-3 py-1.5 text-xs font-semibold border border-red-200 transition-colors"
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

            {/* Calendar redirect link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#e03e3e]">
              <Link
                href="/calendrier"
                className="inline-flex items-center justify-between w-full hover:underline"
              >
                <span>Voir le calendrier complet</span>
                <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
