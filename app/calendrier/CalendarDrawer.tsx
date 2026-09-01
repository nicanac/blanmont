'use client';

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
} from '@heroicons/react/24/outline';

type AttendeeInfo = { name: string; group: string };

interface CalendarDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  attendees?: AttendeeInfo[];
}

export default function CalendarDrawer({
  event,
  open,
  onClose,
  attendees = [],
}: CalendarDrawerProps) {
  const { isAdmin } = useAuth();
  if (!event || !open) return null;

  // Format Date in French
  const [yr, mo, dy] = event.isoDate.split('-');
  const dateObj = new Date(Number(yr), Number(mo) - 1, Number(dy));
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-[#f2efe9] border-b border-[#e4e0d8] p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#e03e3e] px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
                  Sortie Club
                </span>
                {isAdmin && (
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-[#e03e3e] hover:bg-red-100 transition-colors"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:text-[#3a3f4a] hover:bg-slate-200 transition-colors"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <h2 className="text-xl font-extrabold text-[#101216] tracking-tight">
              {event.location}
            </h2>
            <p className="text-xs font-medium text-[#5c6370] capitalize mt-1">
              {dateStr}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Weather & Wind forecast widget */}
            <div>
              <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} />
            </div>

            {/* GPX / Garmin / Strava Trace Section */}
            {event.gpxUrl && (
              <div className="rounded-md border border-red-200 bg-red-50/50 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-[#e03e3e]" />
                    <span className="text-xs font-bold text-[#101216]">
                      Trace GPS du parcours
                    </span>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-[#e03e3e]">
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
                      ? 'Envoyer le parcours directement sur votre compteur/GPS Garmin.'
                      : event.gpxUrl.includes('komoot')
                        ? 'Consulter et télécharger la trace sur Komoot.'
                        : 'Télécharger le fichier GPX pour votre compteur GPS.'}
                </p>

                <a
                  href={event.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#e03e3e] hover:bg-[#c93434] text-white py-2.5 text-xs font-bold shadow-xs transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>
                    {event.gpxUrl.includes('strava.com')
                      ? 'Ouvrir la trace sur Strava'
                      : event.gpxUrl.includes('garmin.com')
                        ? 'Ouvrir sur Garmin Connect'
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
              className="group block relative w-full h-28 rounded-md overflow-hidden border border-[#e4e0d8] bg-[#f2efe9] p-4 hover:border-red-300 transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="rounded-full bg-white p-2 text-[#e03e3e] shadow-xs group-hover:scale-110 transition-transform">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#101216] shadow-xs">
                <span>Voir le lieu sur Google Maps</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3 text-slate-400" />
              </span>
            </a>

            {/* Details Grid */}
            <div className="rounded-md border border-[#efece5] bg-[#f2efe9]/70 p-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-[#5c6370] uppercase tracking-wider block">
                    Heure de départ
                  </span>
                  <span className="font-bold text-[#101216] tabular-nums">{event.departure}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapIcon className="h-4 w-4 text-slate-400 shrink-0" />
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
                  <UserGroupIcon className="h-4 w-4 text-slate-400 shrink-0" />
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
                  <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
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
                      <InformationCircleIcon className="h-4 w-4 text-blue-600" />
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

            {/* Attendance Section */}
            {attendees.length > 0 && (
              <div className="border-t border-[#efece5] pt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#101216]">
                  <UserGroupIcon className="h-4 w-4 text-emerald-600" />
                  <span>Présents enregistrés ({attendees.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {attendees
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((att, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200"
                      >
                        {att.name}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#efece5] flex justify-between items-center bg-[#f2efe9]">
            {isAdmin ? (
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Modifier dans l&apos;administration
              </Link>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="rounded-full border border-[#e4e0d8] bg-white px-5 py-2 text-xs font-semibold text-[#3a3f4a] hover:bg-[#f2efe9] transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
