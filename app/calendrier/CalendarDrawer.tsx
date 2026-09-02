'use client';

import { useEffect } from 'react';
import { CalendarEvent } from '../types';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import RideWeatherBadge from '../components/ui/RideWeatherBadge';
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  MapIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

type AttendeeInfo = { name: string; group: string };

interface CalendarDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  attendees?: AttendeeInfo[];
}

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGroupBadgeClass(group: string): string {
  const g = group.toUpperCase();
  if (g.includes('A')) return 'bg-red-50 text-red-700 border-red-200';
  if (g.includes('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (g.includes('C')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (g.includes('VTT')) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-[#f2efe9] text-[#5c6370] border-[#e4e0d8]';
}

export default function CalendarDrawer({
  event,
  open,
  onClose,
  attendees = [],
}: CalendarDrawerProps): React.ReactElement | null {
  const { isAdmin } = useAuth();

  // Handle Escape key and lock background scroll
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!event || !open) return null;

  // Format Date in French
  const [yr, mo, dy] = event.isoDate.split('-');
  const dateObj = new Date(Number(yr), Number(mo) - 1, Number(dy));
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location} ${event.address || ''}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#e4e0d8]">
          {/* Header */}
          <div className="bg-[#f2efe9] border-b border-[#e4e0d8] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 id="drawer-title" className="text-xl font-extrabold text-[#101216] tracking-tight">
                  {event.location}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.06em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                    {isWeekend ? 'Sortie Club' : 'Événement'}
                  </span>
                  <span className="text-xs font-semibold text-[#5c6370] capitalize">
                    {dateStr}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md p-2 text-[#5c6370] hover:text-[#101216] hover:bg-[#e4e0d8]/60 transition-colors shrink-0"
                aria-label="Fermer le panneau"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Weather & Wind forecast widget */}
            <div>
              <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} />
            </div>

            {/* GPX / Garmin / Strava Trace Section */}
            {event.gpxUrl && (
              <div className="rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-[#e03e3e]" />
                    <span className="text-xs font-bold text-[#101216]">
                      Parcours GPS de la sortie
                    </span>
                  </div>
                  <span className="rounded-full bg-[#e03e3e]/10 px-2.5 py-0.5 text-xs font-bold text-[#e03e3e]">
                    {event.gpxUrl.includes('strava.com')
                      ? 'Strava'
                      : event.gpxUrl.includes('garmin.com')
                        ? 'Garmin Connect'
                        : event.gpxUrl.includes('komoot')
                          ? 'Komoot'
                          : 'GPX'}
                  </span>
                </div>

                <p className="text-xs text-[#3a3f4a] leading-relaxed">
                  {event.gpxUrl.includes('strava.com')
                    ? 'Consulter l’itinéraire et télécharger la trace sur Strava.'
                    : event.gpxUrl.includes('garmin.com')
                      ? 'Envoyer le parcours directement sur votre compteur ou GPS Garmin.'
                      : event.gpxUrl.includes('komoot')
                        ? 'Consulter et télécharger la trace sur Komoot.'
                        : 'Télécharger le fichier GPX pour votre compteur GPS.'}
                </p>

                <a
                  href={event.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full min-h-[44px] rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white py-2.5 px-4 text-xs font-semibold uppercase tracking-[0.06em] shadow-xs transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>
                    {event.gpxUrl.includes('strava.com')
                      ? 'Ouvrir sur Strava'
                      : event.gpxUrl.includes('garmin.com')
                        ? 'Ouvrir sur Garmin'
                        : event.gpxUrl.includes('komoot')
                          ? 'Ouvrir sur Komoot'
                          : 'Télécharger le fichier GPX'}
                  </span>
                </a>
              </div>
            )}

            {/* Google Maps link card */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative w-full rounded-md overflow-hidden border border-[#e4e0d8] bg-[#f2efe9] p-4 hover:border-[#101216]/30 transition-all text-center flex flex-col items-center justify-center gap-2 min-h-[44px]"
            >
              <div className="rounded-full bg-white p-2 text-[#e03e3e] shadow-xs group-hover:scale-105 transition-transform">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#101216] shadow-xs border border-[#e4e0d8]">
                <span>Voir le point de rassemblement sur Google Maps</span>
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-[#5c6370]" />
              </span>
            </a>

            {/* Details Grid */}
            <div className="rounded-md border border-[#e4e0d8] bg-[#f2efe9]/70 p-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 text-[#5c6370] shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-[#5c6370] uppercase tracking-wider block">
                    Heure de départ
                  </span>
                  <span className="font-bold text-[#101216] tabular-nums">{event.departure}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapIcon className="h-4 w-4 text-[#5c6370] shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-[#5c6370] uppercase tracking-wider block">
                    Distances
                  </span>
                  <span className="font-bold text-[#101216] tabular-nums">
                    {event.distances ? `${event.distances} km` : 'Non spécifié'}
                  </span>
                </div>
              </div>

              {event.group && (
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-4 w-4 text-[#5c6370] shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-[#5c6370] uppercase tracking-wider block">
                      Groupe
                    </span>
                    <span className="font-bold text-[#101216]">{event.group}</span>
                  </div>
                </div>
              )}

              {event.address && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-4 w-4 text-[#5c6370] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-[#5c6370] uppercase tracking-wider block">
                      Adresse de rassemblement
                    </span>
                    <span className="font-medium text-[#101216]">{event.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks & Alternatives */}
            {(event.remarks || event.alternative) && (
              <div className="space-y-3">
                {event.remarks && (
                  <div className="rounded-md border border-[#e4e0d8] bg-white p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#101216]">
                      <InformationCircleIcon className="h-4 w-4 text-[#3b82f6]" />
                      <span>Remarques</span>
                    </div>
                    <p className="text-xs text-[#3a3f4a] leading-relaxed">{event.remarks}</p>
                  </div>
                )}

                {event.alternative && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-1">
                    <div className="text-xs font-bold text-amber-900">Alternative</div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {event.alternative}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Attendance / Participation Section */}
            <div className="border-t border-[#e4e0d8] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#101216]">
                  <UserGroupIcon className="h-4 w-4 text-emerald-600" />
                  <span>Présents enregistrés ({attendees.length})</span>
                </div>

                <Link
                  href="/sondage"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  <span>Voter sur le sondage</span>
                </Link>
              </div>

              {attendees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[...attendees]
                    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
                    .map((att, idx) => {
                      const initials = getInitials(att.name);
                      return (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#e4e0d8] bg-[#faf8f5] px-2.5 py-1.5 text-xs text-[#101216] shadow-2xs hover:border-[#101216]/30 transition-colors"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#161922] text-xs font-bold text-white shrink-0 select-none">
                            {initials}
                          </span>
                          <span className="font-semibold text-[#101216]">{att.name}</span>
                          {att.group && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-bold border uppercase tracking-wider ${getGroupBadgeClass(
                                att.group
                              )}`}
                            >
                              {att.group}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-xs text-[#5c6370]">
                  Aucun membre n&apos;a encore enregistré sa présence pour cette date.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#e4e0d8] flex justify-between items-center bg-[#f2efe9]">
            {isAdmin ? (
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="min-h-[44px] inline-flex items-center justify-center rounded-md bg-[#101216] px-4 py-2 text-xs font-semibold text-white hover:bg-[#161922] transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                <span>Modifier dans l&apos;admin</span>
              </Link>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] bg-white px-6 py-2 text-xs font-semibold text-[#101216] hover:bg-[#faf8f5] hover:border-[#101216]/30 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
