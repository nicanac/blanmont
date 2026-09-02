import React from 'react';
import type { Metadata } from 'next';
import { getActiveWeekendPoll, getPollResponses, getMembers } from '../lib/firebase';
import WeekendPollView from '../features/sondage/components/WeekendPollView';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const revalidate = 30; // Revalidate every 30 seconds for live poll counts

export const metadata: Metadata = {
  title: 'Sondage du Weekend | Club de Blanmont',
  description: 'Indiquez vos disponibilités et votre groupe de niveau pour les sorties vélo du weekend.',
};

export default async function SondagePage(): Promise<React.ReactElement> {
  const [activePoll, members] = await Promise.all([
    getActiveWeekendPoll(),
    getMembers(),
  ]);

  const responses = activePoll ? await getPollResponses(activePoll.id) : [];

  const saturdayCount = responses.filter(
    (r) => r.dayChoice === 'samedi' || r.dayChoice === 'les-deux'
  ).length;

  const sundayCount = responses.filter(
    (r) => r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux'
  ).length;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Title row */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Sondage du <span className="text-[#e03e3e] italic">Weekend</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              {activePoll?.description ||
                'Qui vient rouler ce weekend ? Choisissez votre jour, votre groupe de niveau et découvrez les pelotons en direct.'}
            </p>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-6">
            {/* Total Votes */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0">
                <UserGroupIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {responses.length}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Membres inscrits
                </div>
              </div>
            </div>

            {/* Saturday Pelotons */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <CalendarDaysIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {saturdayCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Samedi · 8h30
                </div>
              </div>
            </div>

            {/* Sunday Pelotons */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <ClockIcon className="h-5 w-5 text-[#3b82f6]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {sundayCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Dimanche · 9h00
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Poll Body (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <WeekendPollView poll={activePoll} responses={responses} members={members} />
      </section>
    </main>
  );
}
