import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import TerritoryMap from './components/carte/TerritoryMap';

const ROUTES_BACK = [
  { href: '/', label: 'Accueil', hint: 'Le prochain départ' },
  { href: '/calendrier', label: 'Calendrier', hint: 'Toutes les sorties' },
  { href: '/sondage', label: 'Sondage', hint: 'Qui roule ce week-end' },
  { href: '/members', label: 'Membres', hint: 'L’annuaire du club' },
];

/**
 * 404 — hors carte: the reader has ridden off the edge of the sheet.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden bg-paper px-4 py-16 [--sheet:1600px] sm:px-6 sm:[--sheet:2400px] lg:px-8 dark:bg-night">
      <TerritoryMap
        labels={2}
        marker="point"
        layers="relief"
        sheetClassName="w-(--sheet) left-[calc(50%-var(--sheet)*0.5)] top-[calc(50%-var(--sheet)*0.5)]"
        className="opacity-70"
      />

      <div className="neatline relative mx-auto w-full max-w-2xl bg-white/[0.97] p-8 sm:p-12 dark:bg-night-2/[0.97]">
        <h1 className="text-balance font-wide text-[clamp(2.4rem,6vw,4.25rem)] font-extrabold uppercase leading-[0.92] text-ink dark:text-snow">
          Hors carte
        </h1>
        <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-2 dark:text-snow-2">
          <span className="font-semibold text-brand dark:text-brand-soft">Erreur 404.</span> Vous
          avez quitté l&apos;itinéraire balisé. La page demandée n&apos;existe pas ou a été
          déplacée.
        </p>

        <ul className="mt-8 border-t-2 border-ink dark:border-snow-2">
          {ROUTES_BACK.map((route) => (
            <li key={route.href} className="border-b border-line dark:border-night-line">
              <Link
                href={route.href}
                className="group flex min-h-[56px] items-center justify-between gap-4 py-3"
              >
                <span>
                  <span className="block font-semiwide text-base font-extrabold uppercase text-ink group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft">
                    {route.label}
                  </span>
                  <span className="block text-xs text-ink-3 dark:text-snow-3">{route.hint}</span>
                </span>
                <ArrowRightIcon
                  className="size-4 shrink-0 text-ink transition-transform duration-300 group-hover:translate-x-1 dark:text-snow"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
