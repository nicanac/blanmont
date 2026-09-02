'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPinIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import RideWeatherBadge from '../ui/RideWeatherBadge';

interface LiveTelemetryBarProps {
  nextRide: {
    isoDate: string;
    dateFormatted: string;
    location: string;
    departure: string;
    distances?: string;
    remarks?: string;
    gpxUrl?: string;
    isCustomEvent?: boolean;
  };
  activePoll?: {
    id: string;
    title: string;
    status: 'draft' | 'active' | 'closed';
  } | null;
}

export default function LiveTelemetryBar({
  nextRide,
  activePoll,
}: LiveTelemetryBarProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  // Calculate live countdown to the next departure
  useEffect(() => {
    if (!nextRide.isoDate) return;

    const parseDepartureTime = () => {
      // Parse "8h30" -> hours: 8, minutes: 30
      const match = nextRide.departure.match(/(\d+)\s*h\s*(\d*)/i);
      const hours = match ? parseInt(match[1], 10) : 8;
      const minutes = match && match[2] ? parseInt(match[2], 10) : 30;

      const [yr, mo, dy] = nextRide.isoDate.split('-').map(Number);
      return new Date(yr, mo - 1, dy, hours, minutes, 0);
    };

    const targetDate = parseDepartureTime();

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isPast: false,
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRide.isoDate, nextRide.departure]);

  return (
    <section className="relative bg-[#0e1117] text-white border-b border-[#262b38] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Sub-header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e03e3e] animate-ping" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#a7adbb]">
              Télémétrie du Prochain Rendez-Vous
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#a7adbb]">
              Date : <strong className="text-white">{nextRide.dateFormatted}</strong>
            </span>
            <span className="text-white/20">•</span>
            <Link
              href="/calendrier"
              className="text-xs font-semibold text-[#e03e3e] hover:underline inline-flex items-center gap-1"
            >
              <span>Calendrier Complet</span>
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 4-Panel Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 items-stretch">
          {/* 1. Compte à Rebours Départ */}
          <div className="rounded-lg border border-white/10 bg-[#161922] p-5 flex flex-col justify-between space-y-4 hover:border-[#e03e3e]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                Compte à Rebours
              </span>
              <ClockIcon className="h-4 w-4 text-[#e03e3e]" />
            </div>

            <div>
              {timeLeft.isPast ? (
                <div className="text-xl font-extrabold text-emerald-400 uppercase tracking-tight">
                  Peloton en route
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="bg-black/40 rounded p-1.5 border border-white/5">
                    <span className="block text-xl font-extrabold text-white tabular-nums">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#7d8493]">Jours</span>
                  </div>
                  <div className="bg-black/40 rounded p-1.5 border border-white/5">
                    <span className="block text-xl font-extrabold text-white tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#7d8493]">Heures</span>
                  </div>
                  <div className="bg-black/40 rounded p-1.5 border border-white/5">
                    <span className="block text-xl font-extrabold text-white tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#7d8493]">Min</span>
                  </div>
                  <div className="bg-black/40 rounded p-1.5 border border-white/5">
                    <span className="block text-xl font-extrabold text-[#e03e3e] tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#7d8493]">Sec</span>
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs text-[#a7adbb] text-center">
                Départ à <strong className="text-white">{nextRide.departure}</strong> précises
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-[#7d8493] flex items-center justify-between">
              <span>Briefing capitaine : -5 min</span>
              <span className="text-emerald-400 font-bold">● Ponctualité</span>
            </div>
          </div>

          {/* 2. Lieu de Rassemblement */}
          <div className="rounded-lg border border-white/10 bg-[#161922] p-5 flex flex-col justify-between space-y-4 hover:border-[#e03e3e]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                Lieu du Rassemblement
              </span>
              <MapPinIcon className="h-4 w-4 text-[#e03e3e]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {nextRide.location}
              </h3>
              <p className="text-xs text-[#a7adbb] line-clamp-2">
                {nextRide.remarks || 'Rassemblement sous les arbres, constitution des 3 pelotons de niveau.'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#7d8493]">Groupes : {nextRide.distances || 'A, B, C & VTT'}</span>
            </div>
          </div>

          {/* 3. Météo & Rose des Vents en Direct */}
          <div className="rounded-lg border border-white/10 bg-[#161922] p-5 flex flex-col justify-between space-y-3 hover:border-[#e03e3e]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                Atmosphère &amp; Vent
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                LIVE METEO
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <RideWeatherBadge
                isoDate={nextRide.isoDate}
                departure={nextRide.departure}
                theme="dark"
              />
            </div>
          </div>

          {/* 4. Sondage de Présence & Actions */}
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-[#161922] to-[#1a1416] p-5 flex flex-col justify-between space-y-4 hover:border-[#e03e3e] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#e03e3e]">
                Sondage Weekend
              </span>
              <span className={`h-2 w-2 rounded-full ${activePoll?.status === 'closed' ? 'bg-[#7d8493]' : 'bg-[#e03e3e] animate-ping'}`} />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-bold text-white">
                {activePoll?.title || 'Qui roule avec le club ce weekend ?'}
              </div>
              <p className="text-xs text-[#a7adbb]">
                Indiquez votre présence pour aider les capitaines à composer les groupes.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <Link
                href="/sondage"
                className="inline-flex items-center gap-2 rounded bg-[#e03e3e] hover:bg-[#c93434] text-white px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                <span>Voter</span>
              </Link>

              {nextRide.gpxUrl ? (
                <a
                  href={nextRide.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#a7adbb] hover:text-white transition-colors"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                  <span>GPX</span>
                </a>
              ) : (
                <Link
                  href="/traces"
                  className="text-xs text-[#7d8493] hover:text-white transition-colors"
                >
                  Parcours →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
