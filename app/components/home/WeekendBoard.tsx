import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { RoadSwatch } from '@/app/components/carte/RoadSwatch';
import { PACE_GROUPS } from '@/app/constants/cycling';
import type { WeekendPoll } from '@/app/types';
import type { PollTally } from './homeData';
import { departureDateParts, humanizePollTitle } from './homeData';
import CountUp from './CountUp';
import { cn } from '@/app/utils/cn';

interface WeekendBoardProps {
  poll: WeekendPoll | null;
  tally: PollTally;
}

function TallyBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: 'ink' | 'brand';
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[9rem_1fr_3rem]">
      <span className="font-narrow text-sm font-semibold text-ink dark:text-snow">{label}</span>
      <span
        className="relative h-3 border border-ink/80 bg-paper dark:border-snow-3 dark:bg-night"
        aria-hidden="true"
      >
        <span
          data-bar
          className={cn(
            'absolute inset-y-0 left-0 w-(--w) origin-left',
            tone === 'brand' ? 'bg-brand' : 'bg-ink dark:bg-snow-2'
          )}
          style={{ '--w': `${pct}%` } as React.CSSProperties}
        />
      </span>
      <span className="text-right font-narrow text-lg font-extrabold tabular-nums text-ink dark:text-snow">
        <CountUp value={value} />
      </span>
    </div>
  );
}

/**
 * The weekend survey sheet: who has announced a ride on Saturday and Sunday,
 * and how the riders spread across the four groups.
 */
export default function WeekendBoard({ poll, tally }: WeekendBoardProps): React.ReactElement {
  const open = poll?.status === 'active';
  const weekend = poll ? departureDateParts(poll.weekendIsoDate) : null;
  const maxDay = Math.max(tally.saturday, tally.sunday, 1);
  const maxGroup = Math.max(...Object.values(tally.byGroup), 1);

  return (
    <section
      aria-labelledby="weekend-title"
      className="border-b border-ink bg-white dark:border-night-line-strong dark:bg-night-2"
    >
      <div className="mx-auto grid max-w-7xl lg:grid-cols-12">
        <div className="border-b border-line px-4 py-12 sm:px-6 lg:col-span-5 lg:border-b-0 lg:border-r lg:px-8 lg:py-16 dark:border-night-line">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.1em]',
                open
                  ? 'border-vert/30 bg-vert-tint text-vert dark:border-vert-vif/30 dark:bg-vert/15 dark:text-vert-vif'
                  : 'border-line bg-paper-2 text-ink-3 dark:border-night-line dark:bg-night-3 dark:text-snow-3'
              )}
            >
              <span
                className={cn('size-1.5 rounded-full', open ? 'bg-vert-vif' : 'bg-ink-3')}
                aria-hidden="true"
              />
              {open ? 'Sondage ouvert' : poll ? 'Sondage clôturé' : 'Pas de sondage en cours'}
            </span>
            {weekend && (
              <span className="font-narrow text-xs font-semibold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                Week-end du {weekend.dayMonth}
              </span>
            )}
          </div>
          <h2
            id="weekend-title"
            className="mt-5 max-w-[16ch] text-balance font-wide text-[clamp(1.9rem,3.4vw,2.9rem)] font-extrabold uppercase leading-[0.95] text-ink dark:text-snow"
          >
            Qui roule ce week-end&nbsp;?
          </h2>
          {poll?.title && (
            <p className="mt-3 font-semibold text-ink dark:text-snow">
              {humanizePollTitle(poll.title)}
            </p>
          )}
          <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-ink-2 dark:text-snow-2">
            Indiquez votre présence et votre allure : les capitaines composent les pelotons et
            ajustent les parcours à partir de ce relevé.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="/sondage"
              className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-colors hover:bg-brand-strong"
            >
              {open ? 'Répondre au sondage' : 'Voir le sondage'}
              <ArrowRightIcon
                className="size-4 transition-transform duration-300 ease-(--ease-plot) group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/calendrier"
              className="inline-flex min-h-[44px] items-center font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink underline decoration-ink/30 underline-offset-[0.3em] transition-colors hover:decoration-brand dark:text-snow dark:decoration-snow/30"
            >
              Calendrier de la saison
            </Link>
          </div>
        </div>

        <div className="px-4 py-12 sm:px-6 lg:col-span-7 lg:px-10 lg:py-16" data-tally>
          <h3 className="font-narrow text-xs font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
            Relevé des présences
          </h3>
          {tally.total === 0 ? (
            <p className="mt-4 max-w-[46ch] text-sm text-ink-2 dark:text-snow-2">
              Aucune réponse pour l&apos;instant. Soyez le premier à annoncer votre sortie&nbsp;: le
              relevé se remplit en direct.
            </p>
          ) : (
            <>
              <div className="mt-5 space-y-3">
                <TallyBar label="Samedi" value={tally.saturday} max={maxDay} tone="brand" />
                <TallyBar label="Dimanche" value={tally.sunday} max={maxDay} tone="ink" />
              </div>
              <p className="mt-3 text-xs text-ink-3 dark:text-snow-3">
                {tally.riders} cycliste{tally.riders > 1 ? 's' : ''} annoncé
                {tally.riders > 1 ? 's' : ''}
                {tally.both > 0 && ` · dont ${tally.both} les deux jours`}
                {tally.absent > 0 && ` · ${tally.absent} absent${tally.absent > 1 ? 's' : ''}`}
              </p>

              <h3 className="mt-9 font-narrow text-xs font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                Par groupe
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {PACE_GROUPS.map((g) => (
                  <li key={g.id} className="border-t border-ink pt-3 dark:border-snow-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-wide text-xl font-extrabold text-ink dark:text-snow">
                        {g.id}
                      </span>
                      <RoadSwatch group={g.id} className="w-10" />
                    </div>
                    <p className="mt-2 font-narrow text-3xl font-extrabold tabular-nums leading-none text-ink dark:text-snow">
                      <CountUp value={tally.byGroup[g.id]} />
                    </p>
                    <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                      {tally.byGroup[g.id] === maxGroup && tally.byGroup[g.id] > 0
                        ? 'Le plus fourni'
                        : g.speed}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
