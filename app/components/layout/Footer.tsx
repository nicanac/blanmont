import Link from 'next/link';
import { getCalendarEvents } from '../../lib/firebase/calendar';
import { CalendarEvent } from '../../types';
import NextRideCard, { type ScheduledRideInfo } from './NextRideCard';

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
      isoDate: satEvent.isoDate,
      dateFormatted: formatFrenchDate(satEvent.isoDate),
      location: satEvent.location || 'Blanmont',
      departure: satEvent.departure || '8h30',
      distances: formatDistances(satEvent.distances),
      address: satEvent.address,
      remarks: satEvent.remarks,
      gpxUrl: satEvent.gpxUrl,
      group: satEvent.group,
      isCustomEvent: true,
    };
  }

  // 2. Exact match on next Sunday (if no Saturday event)
  const sunEvent = events.find((e) => e.isoDate === nextSunIso);
  if (sunEvent) {
    return {
      isoDate: sunEvent.isoDate,
      dateFormatted: formatFrenchDate(sunEvent.isoDate),
      location: sunEvent.location || 'Blanmont',
      departure: sunEvent.departure || '8h30',
      distances: formatDistances(sunEvent.distances),
      address: sunEvent.address,
      remarks: sunEvent.remarks,
      gpxUrl: sunEvent.gpxUrl,
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
      isoDate: nextEvent.isoDate,
      dateFormatted: formatFrenchDate(nextEvent.isoDate),
      location: nextEvent.location || 'Blanmont',
      departure: nextEvent.departure || '8h30',
      distances: formatDistances(nextEvent.distances),
      address: nextEvent.address,
      remarks: nextEvent.remarks,
      gpxUrl: nextEvent.gpxUrl,
      group: nextEvent.group,
      isCustomEvent: true,
    };
  }

  // 4. Default weekly club ride at Blanmont
  return {
    isoDate: nextSatIso,
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
        {/* Top Section: Brand/Info on the left, Next ride card on the right (50/50 split on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start pb-12 border-b border-slate-200">
          {/* Brand & Club identity */}
          <div className="space-y-4">
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
          </div>

          {/* Dynamic Next Rendez-vous card linked to Calendar (Expandable) */}
          <NextRideCard nextRide={nextRide} />
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
