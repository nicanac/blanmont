'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useSheetMotion } from '@/app/lib/useSheetMotion';

export interface CarreVertRider {
  id: string;
  name: string;
  group: string;
  rides: number;
}

interface CarreVertBandProps {
  year: number;
  possible: number;
  riders: CarreVertRider[];
}

/**
 * The attendance challenge printed literally: one green square per ride of the
 * season, filled for every ride the member turned up to.
 */
export default function CarreVertBand({
  year,
  possible,
  riders,
}: CarreVertBandProps): React.ReactElement | null {
  const root = useRef<HTMLElement>(null);

  useSheetMotion(root, ({ gsap }, scope) => {
    gsap.utils.toArray<HTMLElement>('[data-carres]', scope).forEach((row) => {
      const squares = row.querySelectorAll('[data-on]');
      if (squares.length === 0 || row.getBoundingClientRect().top < window.innerHeight) return;
      gsap.fromTo(
        squares,
        { opacity: 0.12, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'power3.out',
          stagger: { each: 0.018 },
          scrollTrigger: { trigger: row, start: 'top 90%', once: true },
        }
      );
    });
  });

  if (riders.length === 0 || possible === 0) return null;
  const leader = riders[0];

  return (
    <section
      ref={root}
      aria-labelledby="carre-vert-title"
      className="bg-vert text-white dark:bg-vert-strong"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <h2
            id="carre-vert-title"
            className="text-balance font-wide text-[clamp(2.2rem,4.6vw,4rem)] font-extrabold uppercase leading-[0.92]"
          >
            Le Carré Vert {year}
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-white/90">
            Un carré par sortie roulée. {possible} sorties comptent déjà cette saison, et
            l&apos;assiduité est récompensée chaque année à l&apos;Assemblée générale.
          </p>
          <p className="mt-6 text-sm text-white/90">
            En tête : <strong className="text-white">{leader.name}</strong>,{' '}
            <span className="tabular-nums">{leader.rides}</span> carrés sur{' '}
            <span className="tabular-nums">{possible}</span>.
          </p>
          <Link
            href="/leaderboard"
            className="group mt-8 inline-flex min-h-[48px] items-center gap-2.5 rounded-md border border-white px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-vert-strong"
          >
            Voir le classement complet
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        <ol className="border-t border-white/60 lg:col-span-7">
          {riders.map((rider, index) => (
            <li
              key={rider.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)_3rem] items-center gap-x-3 gap-y-2 border-b border-white/25 py-3.5 sm:grid-cols-[2.25rem_11rem_minmax(0,1fr)_3rem] sm:gap-x-4"
            >
              <span className="font-narrow text-lg font-extrabold tabular-nums text-white/85">
                {index + 1}
              </span>
              <span className="min-w-0 truncate text-sm font-semibold">
                {rider.name}
                {rider.group && (
                  <span className="ml-1.5 font-narrow text-xs font-bold text-white/90">
                    {rider.group}
                  </span>
                )}
              </span>
              <span
                data-carres
                className="col-span-3 row-start-2 flex flex-wrap gap-[3px] sm:col-span-1 sm:row-start-auto"
                role="img"
                aria-label={`${rider.rides} sorties sur ${possible}`}
              >
                {Array.from({ length: Math.max(possible, rider.rides) }, (_, i) =>
                  i < rider.rides ? (
                    <span key={i} data-on className="size-2 bg-white sm:size-[9px]" />
                  ) : (
                    <span key={i} className="size-2 border border-white/35 sm:size-[9px]" />
                  )
                )}
              </span>
              <span className="col-start-3 row-start-1 text-right font-narrow text-xl font-extrabold tabular-nums sm:col-start-auto sm:row-start-auto">
                {rider.rides}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
