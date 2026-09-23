import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const WAYPOINTS = [
  {
    title: 'Choisissez votre groupe',
    text: 'A (> 30 km/h), B (25 – 28 km/h), C (< 25 km/h) ou VTT. En cas d’hésitation, le groupe le plus modéré.',
  },
  {
    title: 'Rendez-vous à 8h15',
    text: 'Un samedi matin, Place de Blanmont, un quart d’heure avant le départ : le comité vous accueille.',
  },
  {
    title: 'Un capitaine vous parraine',
    text: 'Il vous explique les relais et les trajectoires, et vous garde à l’abri du vent dans les roues.',
  },
  {
    title: 'Vous décidez',
    text: 'Après trois sorties d’essai gratuites : affiliation FFBC, tenue du club et Carré Vert.',
  },
];

/**
 * The trial-ride path drawn as a route with four waypoints, printed on a full
 * field of club red: the one drenched panel of the home sheet.
 */
export default function JoinRoute(): React.ReactElement {
  return (
    <section
      aria-labelledby="rejoindre-title"
      className="relative overflow-hidden bg-brand text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="rejoindre-title"
            className="text-balance font-wide text-[clamp(2.3rem,5.4vw,4.75rem)] font-extrabold uppercase leading-[0.9] lg:col-span-8"
          >
            Venez rouler avec nous
          </h2>
          <p className="max-w-[40ch] text-base leading-relaxed text-white lg:col-span-4">
            Trois sorties d&apos;essai gratuites et encadrées, sans engagement. Votre vélo, un
            casque, et l&apos;envie de rouler en groupe.
          </p>
        </div>

        <div className="relative mt-14">
          <span
            aria-hidden="true"
            className="absolute left-[11px] top-3 block h-[calc(100%-1.5rem)] border-l-2 border-dashed border-white/70 sm:hidden lg:left-3 lg:right-3 lg:top-[11px] lg:block lg:h-0 lg:border-l-0 lg:border-t-2"
          />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {WAYPOINTS.map((step, i) => (
              <li key={step.title} className="relative pl-10 lg:pl-0 lg:pt-12">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex size-6 items-center justify-center rounded-full border-2 border-white bg-brand font-narrow text-xs font-extrabold tabular-nums"
                >
                  {i + 1}
                </span>
                <h3 className="font-semiwide text-lg font-extrabold uppercase leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <Link
            href="/rejoindre"
            className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-md bg-white px-7 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-brand-strong transition-colors hover:bg-ink hover:text-white"
          >
            Réserver ma sortie d&apos;essai
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/le-club"
            className="inline-flex min-h-[52px] items-center rounded-md border border-white px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-brand-strong"
          >
            Découvrir le club
          </Link>
        </div>
      </div>
    </section>
  );
}
