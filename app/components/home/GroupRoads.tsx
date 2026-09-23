'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { PACE_GROUPS, type CyclingGroup } from '@/app/constants/cycling';
import { useSheetMotion } from '@/app/lib/useSheetMotion';

function Road({ group }: { group: CyclingGroup }): React.ReactElement {
  return (
    <svg
      viewBox="0 0 1000 24"
      preserveAspectRatio="none"
      className="block h-6 w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      {group === 'A' && (
        <>
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="16"
            className="stroke-brand-strong"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="11"
            className="stroke-brand-vif"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
      {group === 'B' && (
        <>
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="13"
            className="stroke-ambre-ink"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="8.5"
            className="stroke-ambre"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
      {group === 'C' && (
        <>
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="11"
            className="stroke-ink dark:stroke-snow-2"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="7"
            className="stroke-white dark:stroke-night-2"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
      {group === 'VTT' && (
        <>
          <rect x="0" y="0" width="1000" height="24" className="fill-bois dark:fill-vert/20" />
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            strokeWidth="2.5"
            strokeDasharray="14 9"
            className="stroke-ink dark:stroke-snow"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  );
}

/**
 * The legend printed at page scale: each weekend group is a road class,
 * plotted across the sheet as the reader scrolls past it.
 */
export default function GroupRoads(): React.ReactElement {
  const root = useRef<HTMLElement>(null);

  useSheetMotion(root, ({ gsap }, scope) => {
    gsap.utils.toArray<HTMLElement>('[data-road]', scope).forEach((road, index) => {
      // Roads already on screen stay printed; the rest are plotted once as they arrive.
      if (road.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      gsap.fromTo(
        road,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.1,
          delay: index * 0.04,
          ease: 'power3.out',
          scrollTrigger: { trigger: road, start: 'top 88%', once: true },
        }
      );
    });
  });

  return (
    <section
      ref={root}
      aria-labelledby="groupes-title"
      className="border-b border-line bg-paper py-20 sm:py-28 dark:border-night-line dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="groupes-title"
            className="text-balance font-wide text-[clamp(2rem,4.4vw,3.75rem)] font-extrabold uppercase leading-[0.94] text-ink lg:col-span-7 dark:text-snow"
          >
            Quatre groupes, une seule place de départ
          </h2>
          <p className="max-w-[46ch] text-base leading-relaxed text-ink-2 lg:col-span-5 dark:text-snow-2">
            « On part ensemble, on rentre ensemble. » Chaque groupe roule à son allure, encadré par
            des capitaines de route qui veillent à la sécurité et à la cohésion du peloton.
          </p>
        </div>

        <ol className="mt-12 border-t border-ink dark:border-snow-3">
          {PACE_GROUPS.map((g) => (
            <li
              key={g.id}
              className="grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-3 border-b border-line py-7 sm:grid-cols-[6rem_1fr] lg:grid-cols-[7rem_minmax(0,1fr)_17rem_minmax(0,22rem)] lg:gap-x-8 dark:border-night-line"
            >
              <span className="font-wide text-[2.6rem] font-extrabold leading-none text-ink sm:text-[3.4rem] dark:text-snow">
                {g.id}
              </span>
              <div data-road className="min-w-0">
                <Road group={g.id} />
                <p className="mt-2 font-narrow text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                  {g.roadClass}
                </p>
              </div>
              <p className="col-span-2 font-narrow text-2xl font-extrabold tabular-nums text-ink sm:text-3xl lg:col-span-1 dark:text-snow">
                {g.speed}
              </p>
              <p className="col-span-2 max-w-[44ch] text-sm leading-relaxed text-ink-2 lg:col-span-1 dark:text-snow-2">
                {g.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-3 dark:text-snow-3">
            Samedi matin : route. Dimanche matin : route et VTT. Vélos électriques bienvenus dans le
            groupe C.
          </p>
          <Link
            href="/le-club"
            className="group inline-flex min-h-[44px] items-center gap-2 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink underline decoration-ink/30 underline-offset-[0.3em] transition-colors hover:decoration-brand dark:text-snow dark:decoration-snow/30"
          >
            Présentation des groupes
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
