'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useSheetMotion } from '@/app/lib/useSheetMotion';
import { useAuthOptional } from '@/app/context/AuthContext';

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
  isAuthenticated?: boolean;
}

/**
 * The attendance challenge printed literally: one green square per ride of the
 * season, filled for every ride the member turned up to.
 */
export default function CarreVertBand({
  year,
  possible,
  riders,
  isAuthenticated: isAuthenticatedProp,
}: CarreVertBandProps): React.ReactElement | null {
  const root = useRef<HTMLElement>(null);
  const auth = useAuthOptional();
  const isAuthed = isAuthenticatedProp !== undefined ? isAuthenticatedProp : Boolean(auth?.isAuthenticated);

  useSheetMotion(root, ({ gsap }, scope) => {
    if (!isAuthed) return;
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

  if (possible === 0) return null;
  if (isAuthed && riders.length === 0) return null;
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
          {isAuthed && leader ? (
            <p className="mt-6 text-sm text-white/90">
              En tête : <strong className="text-white">{leader.name}</strong>,{' '}
              <span className="tabular-nums">{leader.rides}</span> carrés sur{' '}
              <span className="tabular-nums">{possible}</span>.
            </p>
          ) : (
            <p className="mt-6 text-sm text-white/90 flex items-center gap-2">
              <LockClosedIcon className="size-4 shrink-0 text-white/80" aria-hidden="true" />
              <span>Classement nominatif réservé aux adhérents connectés.</span>
            </p>
          )}
          <Link
            href={isAuthed ? '/leaderboard' : '/login?redirect=/leaderboard'}
            className="group mt-8 inline-flex min-h-[48px] items-center gap-2.5 rounded-md border border-white px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-vert-strong"
          >
            {!isAuthed && <LockClosedIcon className="size-4" aria-hidden="true" />}
            <span>{isAuthed ? 'Voir le classement complet' : 'Espace Membre · Voir le classement'}</span>
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {isAuthed ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center rounded-sm border border-white/25 bg-black/15 p-8 sm:p-12 text-center text-white lg:col-span-7">
            <div className="mb-4 flex size-12 items-center justify-center rounded-sm border border-white/60 bg-white/10 text-white">
              <LockClosedIcon className="size-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="font-semiwide text-lg sm:text-xl font-extrabold uppercase tracking-tight text-white">
              Données d&apos;assiduité réservées aux membres
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/85 leading-relaxed">
              Pour respecter la vie privée des membres du peloton, le détail des participations individuelles et le classement annuel sont accessibles aux membres connectés.
            </p>
            <div className="mt-6">
              <Link
                href="/login?redirect=/leaderboard"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-white px-5 py-2.5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-vert-strong transition-colors hover:bg-white/90 shadow-2xs"
              >
                <LockClosedIcon className="size-4" aria-hidden="true" />
                <span>Se connecter pour voir le classement</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
