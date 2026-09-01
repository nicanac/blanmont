import Link from 'next/link';
import { getCalendarEvents, getNextScheduledRide } from '../../lib/firebase/calendar';
import NextRideCard from './NextRideCard';

const navigation = {
  club: [
    { name: 'Présentation & Groupes', href: '/le-club' },
    { name: 'Les Membres', href: '/members' },
    { name: 'Équipements & Tenues', href: '/le-club/equipement' },
    { name: 'Classement Carré Vert', href: '/leaderboard' },
  ],
  routes: [
    { name: 'Sondage du Weekend', href: '/sondage' },
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
