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
        {/* Ambient red glow */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Title row */}
          <div className="space-y-4 max-w-3xl pb-10 border-b border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#f5f6f8]">
              <span className={`h-2 w-2 rounded-full ${activePoll?.status === 'active' ? 'bg-[#10b981] animate-pulse' : 'bg-[#e03e3e]'}`} />
              {activePoll
                ? activePoll.status === 'closed'
                  ? 'Sondage Clôturé'
                  : `Sondage Actif · Weekend du ${activePoll.weekendIsoDate}`
                : 'Saison 2026 · Sorties Weekend'}
            </div>

            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Sondage du <span className="text-[#e03e3e] italic">Weekend</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              {activePoll?.description ||
                'Qui vient rouler ce weekend ? Choisissez votre jour, votre groupe de niveau et découvrez les pelotons en direct.'}
            </p>
          </div>

          {/* Telemetry ribbon on Ink */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {/* Total Votes */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0 mt-0.5">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#e03e3e]">
                  Participations
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {responses.length} réponses enregistrées
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Membres déclarés pour ce weekend
                </p>
              </div>
            </div>

            {/* Saturday Pelotons */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Samedi Matin
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {saturdayCount} cyclistes
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Départ officiel 8h30 · Place de Blanmont
                </p>
              </div>
            </div>

            {/* Sunday Pelotons */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <ClockIcon className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Dimanche Matin
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {sundayCount} cyclistes
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Départ dominical 9h00 · Place de Blanmont
                </p>
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
