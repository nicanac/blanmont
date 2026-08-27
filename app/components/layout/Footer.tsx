import Link from 'next/link';
import { getCalendarEvents } from '../../lib/firebase/calendar';
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { CalendarEvent } from '../../types';

interface ScheduledRideInfo {
  dateFormatted: string;
  location: string;
  departure: string;
  distances?: string;
  address?: string;
  group?: string;
  isCustomEvent: boolean;
}

/**
 * Calculates the next upcoming scheduled ride (prioritizing the next Saturday).
 */
function getNextScheduledRide(events: CalendarEvent[]): ScheduledRideInfo {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayIso = `${y}-${m}-${d}`;

  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const nextSaturdayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSaturday
  );
  const nextSatIso = `${nextSaturdayDate.getFullYear()}-${String(nextSaturdayDate.getMonth() + 1).padStart(2, '0')}-${String(nextSaturdayDate.getDate()).padStart(2, '0')}`;

  const nextSundayDate = new Date(
    nextSaturdayDate.getFullYear(),
    nextSaturdayDate.getMonth(),
    nextSaturdayDate.getDate() + 1
  );
  const nextSunIso = `${nextSundayDate.getFullYear()}-${String(nextSundayDate.getMonth() + 1).padStart(2, '0')}-${String(nextSundayDate.getDate()).padStart(2, '0')}`;

  // Helper to format ISO date to readable French (e.g., "Samedi 29 août")
  const formatFrenchDate = (iso: string): string => {
    const [yr, mo, dy] = iso.split('-');
    const dateObj = new Date(Number(yr), Number(mo) - 1, Number(dy));
    const formatted = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatDistances = (d?: string): string | undefined => {
    if (!d) return undefined;
    return d.toLowerCase().includes('km') ? d : `${d} km`;
  };

  // 1. Exact match on next Saturday
  const satEvent = events.find((e) => e.isoDate === nextSatIso);
  if (satEvent) {
    return {
      dateFormatted: formatFrenchDate(satEvent.isoDate),
      location: satEvent.location || 'Blanmont',
      departure: satEvent.departure || '8h30',
      distances: formatDistances(satEvent.distances),
      address: satEvent.address,
      group: satEvent.group,
      isCustomEvent: true,
    };
  }

  // 2. Exact match on next Sunday (if no Saturday event)
  const sunEvent = events.find((e) => e.isoDate === nextSunIso);
  if (sunEvent) {
    return {
      dateFormatted: formatFrenchDate(sunEvent.isoDate),
      location: sunEvent.location || 'Blanmont',
      departure: sunEvent.departure || '8h30',
      distances: formatDistances(sunEvent.distances),
      address: sunEvent.address,
      group: sunEvent.group,
      isCustomEvent: true,
    };
  }

  // 3. Closest future event >= today
  const futureEvents = events
    .filter((e) => e.isoDate >= todayIso)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  if (futureEvents.length > 0) {
    const nextEvent = futureEvents[0];
    return {
      dateFormatted: formatFrenchDate(nextEvent.isoDate),
      location: nextEvent.location || 'Blanmont',
      departure: nextEvent.departure || '8h30',
      distances: formatDistances(nextEvent.distances),
      address: nextEvent.address,
      group: nextEvent.group,
      isCustomEvent: true,
    };
  }

  // 4. Default weekly club ride at Blanmont
  return {
    dateFormatted: formatFrenchDate(nextSatIso),
    location: 'Place de Blanmont (Chastre)',
    departure: '8h30',
    distances: 'Groupes A, B, C & VTT',
    isCustomEvent: false,
  };
}

const navigation = {
  club: [
    { name: 'Présentation & Groupes', href: '/le-club' },
    { name: 'Les Membres', href: '/members' },
    { name: 'Équipements & Tenues', href: '/le-club/equipement' },
    { name: 'Classement Carré Vert', href: '/leaderboard' },
  ],
  routes: [
    { name: 'Sortie du Samedi (Vote)', href: '/saturday-ride' },
    { name: 'Tous les Parcours GPS', href: '/traces' },
    { name: 'Calendrier des Sorties', href: '/calendrier' },
    { name: 'Importer un parcours', href: '/import/strava' },
  ],
  newsAndAccount: [
    { name: 'Les News du Club', href: '/blog' },
    { name: 'Mon Espace Membre', href: '/profile' },
    { name: 'Connexion Membre', href: '/login' },
    { name: 'Administration', href: '/admin' },
  ],
};

export default async function Footer(): Promise<React.JSX.Element> {
  const events = await getCalendarEvents();
  const nextRide = getNextScheduledRide(events);

  return (
    <footer className="bg-slate-50 border-t border-slate-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:pt-20 lg:px-8">
        {/* Top Section: Brand/Info on the left, Next ride card on the right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-12 border-b border-slate-200">
          {/* Brand & Club identity */}
          <div className="space-y-4 max-w-xl">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                BLAN<span className="text-[#e03e3e]">MONT</span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-100 text-[#e03e3e]">
                CC St-Martin
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              Cyclo Club Saint-Martin Blanmont. Convivialité, passion du cyclisme sur route et
              esprit d&apos;équipe au cœur du Brabant wallon.
            </p>

            {/* Social icons */}
            <div className="flex space-x-5 pt-1">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#e03e3e] transition-colors"
                aria-label="Page Facebook du club"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#e03e3e] transition-colors"
                aria-label="Compte Instagram du club"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.53c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.strava.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#fc4c02] transition-colors"
                aria-label="Club Strava"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.925 15.772h4.172" />
                </svg>
              </a>
            </div>
          </div>

          {/* Dynamic Next Rendez-vous card linked to Calendar */}
          <div className="w-full lg:w-auto lg:min-w-[360px] lg:max-w-md">
            <Link
              href="/calendrier"
              className="group block p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-300 hover:shadow-md transition-all space-y-2.5"
              aria-label="Voir le prochain rendez-vous dans le calendrier"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
                  Prochain Rendez-vous
                </div>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {nextRide.dateFormatted}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-[#e03e3e] flex-shrink-0" />
                  <span>{nextRide.location}</span>
                </p>
                <p className="text-xs text-slate-600">
                  Départ à{' '}
                  <span className="font-semibold text-slate-800">{nextRide.departure}</span>
                  {nextRide.distances ? ` • ${nextRide.distances}` : ''}
                </p>
                {nextRide.address && (
                  <p className="text-[11px] text-slate-500 truncate">{nextRide.address}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#e03e3e]">
                <span>Voir le calendrier complet</span>
                <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Columns in 3 parts */}
        <div className="pt-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Le Club
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.club.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-slate-600 hover:text-[#e03e3e] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Parcours &amp; Sorties
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.routes.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-slate-600 hover:text-[#e03e3e] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Vie du Club
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.newsAndAccount.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-slate-600 hover:text-[#e03e3e] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs leading-5 text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Cyclo Club Saint-Martin Blanmont. Tous droits
            réservés.
          </p>
          <p className="text-xs text-slate-400 text-center sm:text-right">
            Fait avec passion pour le cyclisme à Blanmont &bull; Brabant wallon
          </p>
        </div>
      </div>
    </footer>
  );
}
