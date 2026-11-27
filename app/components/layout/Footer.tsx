import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { getCalendarEvents, getNextScheduledRide } from '../../lib/firebase/calendar';
import NextRideCard from './NextRideCard';
import ThemeToggle from './ThemeToggle';
import { Wordmark } from '../brand/Wordmark';
import TerritoryMap from '../carte/TerritoryMap';
import { ScaleBar, NorthArrow } from '../carte/ScaleBar';
import { DEPARTURE_POINT, MAP_CREDITS } from '../carte/territory';
import OpenCookiePreferencesButton from '../consent/OpenCookiePreferencesButton';
import { footerNavigation } from './navigation';
import { withMemberTraceLinks } from '../../lib/member-trace';

/**
 * One footer link column. Every heading takes the height of two lines and sits on its rule
 * from the bottom, so the rules and the first links of the columns line up even when a
 * title ("Parcours & Sorties") wraps in a narrow column (#230).
 */
export function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { name: string; href: string }[];
}): React.JSX.Element {
  return (
    <div>
      <h3 className="flex min-h-11 items-end border-b border-ink pb-2 font-narrow text-xs font-bold uppercase leading-4 tracking-[0.1em] text-ink dark:border-snow-3 dark:text-snow">
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
  const events = withMemberTraceLinks(await getCalendarEvents());
  const nextRide = getNextScheduledRide(events);

  return (
    <footer
      className="border-t border-ink bg-paper transition-colors duration-200 dark:border-night-line dark:bg-night"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      {/* Carte de situation: the meeting point on the real territory.
          The sheet is centred at 62–64% of the band, so it must be at least ~128% of the
          band width to reach the left edge: 130cqw keeps it full-bleed on wide screens
          (the band is an inline-size container, so cqw tracks the band, not the viewport). */}
      <div className="@container relative h-60 overflow-hidden border-b border-line [--sheet:max(1700px,130cqw)] sm:h-64 sm:[--sheet:max(2100px,130cqw)] dark:border-night-line">
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
        {/* Brand and card keep a fixed width; the link columns take the rest (#251). */}
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="space-y-5 lg:w-80 lg:shrink-0">
            <Wordmark size="lg" withSubline={false} />
            <p className="max-w-sm text-sm leading-relaxed text-ink-2 dark:text-snow-2">
              Cyclo Club Saint-Martin Blanmont. Convivialité, passion du cyclisme sur route et
              esprit d&apos;équipe au cœur du Brabant wallon.
            </p>
            <p className="font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
              Fondé en 1978 · Brabant wallon, Belgique
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex-1">
            {footerNavigation.map((column, i) => (
              <div key={column.title} className={i === 2 ? 'col-span-2 sm:col-span-1' : undefined}>
                <FooterColumn title={column.title} items={column.items} />
              </div>
            ))}
          </div>

          {/* NextRideCard renders nothing on the homepage: the empty slot goes and the links widen. */}
          <div className="empty:hidden lg:w-72 lg:shrink-0">
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
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/confidentialite"
                className="text-xs text-ink-3 underline-offset-4 hover:text-brand hover:underline dark:text-snow-3 dark:hover:text-brand-soft"
              >
                Confidentialité
              </Link>
              <span className="text-xs text-line dark:text-night-line">·</span>
              <OpenCookiePreferencesButton variant="link">
                Gestion des cookies
              </OpenCookiePreferencesButton>
            </div>
          </div>
          <ThemeToggle variant="pill" className="self-start sm:self-auto" />
        </div>
      </div>
    </footer>
  );
}
