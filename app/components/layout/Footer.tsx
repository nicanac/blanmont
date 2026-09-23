import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { getCalendarEvents, getNextScheduledRide } from '../../lib/firebase/calendar';
import NextRideCard from './NextRideCard';
import ThemeToggle from './ThemeToggle';
import { Wordmark } from '../brand/Wordmark';
import TerritoryMap from '../carte/TerritoryMap';
import { ScaleBar, NorthArrow } from '../carte/ScaleBar';
import { DEPARTURE_POINT, MAP_CREDITS } from '../carte/territory';

const navigation = {
  club: [
    { name: 'Rejoindre le Club (3 essais gratuits)', href: '/rejoindre' },
    { name: 'Présentation & Groupes', href: '/le-club' },
    { name: 'Charte de Sécurité Peloton', href: '/securite' },
    { name: 'Galerie Photos & Chroniques', href: '/galerie' },
    { name: 'Les Membres', href: '/members' },
    { name: 'Équipements & Tenues', href: '/le-club/equipement' },
    { name: 'Classement Carré Vert', href: '/leaderboard' },
  ],
  routes: [
    { name: 'Sondage du Weekend', href: '/sondage' },
    { name: 'Sortie du Samedi (Vote)', href: '/saturday-ride' },
    // Masqué temporairement / Hidden for now:
    // { name: 'Tous les Parcours GPS', href: '/traces' },
    { name: 'Calendrier des Sorties', href: '/calendrier' },
    // { name: 'Importer un parcours', href: '/import/strava' },
  ],
  newsAndAccount: [
    { name: 'Les News du Club', href: '/blog' },
    { name: 'Mon Espace Membre', href: '/profile' },
    { name: 'Connexion Membre', href: '/login' },
    { name: 'Administration', href: '/admin' },
  ],
};

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { name: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="border-b border-ink pb-2 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink dark:border-snow-3 dark:text-snow">
        {title}
      </h3>
      <ul role="list" className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className="text-sm leading-6 text-ink-2 underline-offset-[0.3em] transition-colors hover:text-brand hover:underline dark:text-snow-2 dark:hover:text-brand-soft"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer(): Promise<React.JSX.Element> {
  const events = await getCalendarEvents();
  const nextRide = getNextScheduledRide(events);

  return (
    <footer
      className="border-t border-ink bg-paper transition-colors duration-200 dark:border-night-line dark:bg-night"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      {/* Carte de situation: the meeting point on the real territory */}
      <div className="relative h-60 overflow-hidden border-b border-line [--sheet:1700px] sm:h-64 sm:[--sheet:2100px] dark:border-night-line">
        <TerritoryMap
          labels={2}
          marker="point"
          sheetClassName="w-(--sheet) left-[calc(62%-var(--sheet)/2)] top-[calc(46%-var(--sheet)/2)] sm:left-[calc(64%-var(--sheet)/2)]"
        />
        <div className="relative mx-auto flex h-full max-w-7xl items-end justify-between gap-6 px-4 pb-5 sm:px-6 lg:px-8">
          <div className="neatline max-w-sm bg-white/95 p-5 pl-6 dark:bg-night-2/95">
            <p className="font-wide text-lg font-extrabold uppercase leading-tight text-ink dark:text-snow">
              {DEPARTURE_POINT.clubName}
            </p>
            <p className="mt-1 text-sm text-ink-2 dark:text-snow-2">
              Rendez-vous de toutes les sorties ·{' '}
              <span className="italic">{DEPARTURE_POINT.name}</span>, {DEPARTURE_POINT.postcode}{' '}
              {DEPARTURE_POINT.commune}
            </p>
            <p className="mt-2 font-narrow text-xs tabular-nums text-ink-3 dark:text-snow-3">
              {DEPARTURE_POINT.coordinates}
            </p>
            <a
              href={DEPARTURE_POINT.osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-brand underline-offset-[0.3em] hover:underline dark:text-brand-soft"
            >
              Voir sur la carte
              <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="hidden items-end gap-4 bg-paper/85 px-3 py-2 sm:flex dark:bg-night/85">
            <ScaleBar km={5} />
            <NorthArrow />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <Wordmark size="lg" withSubline={false} />
            <p className="max-w-sm text-sm leading-relaxed text-ink-2 dark:text-snow-2">
              Cyclo Club Saint-Martin Blanmont. Convivialité, passion du cyclisme sur route et
              esprit d&apos;équipe au cœur du Brabant wallon.
            </p>
            <p className="font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
              Fondé en 1978 · Brabant wallon, Belgique
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterColumn title="Le Club" items={navigation.club} />
            <FooterColumn title="Parcours & Sorties" items={navigation.routes} />
            <div className="col-span-2 sm:col-span-1">
              <FooterColumn title="Vie du Club" items={navigation.newsAndAccount} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <NextRideCard nextRide={nextRide} />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-night-line">
          <div className="space-y-1">
            <p className="text-xs text-ink-3 dark:text-snow-3">
              &copy; {new Date().getFullYear()} Cyclo Club Saint-Martin Blanmont. Tous droits
              réservés.
            </p>
            <p className="text-[11px] leading-snug text-ink-3 dark:text-snow-3">{MAP_CREDITS}</p>
          </div>
          <ThemeToggle variant="pill" />
        </div>
      </div>
    </footer>
  );
}
