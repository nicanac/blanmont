import React from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  JerseyIcon,
  TrophySquareIcon,
  RouteCalendarIcon,
  BicycleIcon,
} from './components/ui/CyclingIcons';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts, getActiveWeekendPoll, getCalendarEvents, getHeroSettings } from './lib/firebase';
import { getNextScheduledRide } from './lib/firebase/calendar';
import RideWeatherBadge from './components/ui/RideWeatherBadge';
import EditorialPhotographicMosaic from './components/v2/EditorialPhotographicMosaic';
import HeroTelemetryFrame from './components/HeroTelemetryFrame';

/**
 * Landing page — Editorial Peloton: magazine-cover hero on ink,
 * paper spreads, hairline structure, asymmetric bento, and visual chronicle spread.
 */
export default async function Home(): Promise<React.ReactElement> {
  const [posts, activePoll, events, heroSettings] = await Promise.all([
    getBlogPosts(),
    getActiveWeekendPoll(),
    getCalendarEvents(),
    getHeroSettings(),
  ]);

  const nextRide = getNextScheduledRide(events);

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200">
      {/* ──── Cover Hero (Adaptive Light / Dark) ──── */}
      <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(8rem,26vw,32rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 z-10">
          <h1 className="max-w-5xl text-[clamp(2.5rem,7.5vw,5.5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-[#101216] dark:text-white">
            <span className="cover-line"><span>Rouler ensemble,</span></span>
            <span className="cover-line"><span>partager l&apos;effort,</span></span>
            <span className="cover-line"><span className="text-[#e03e3e] italic">la passion du peloton.</span></span>
          </h1>

          <p className="cover-rise cover-rise-1 mt-6 max-w-2xl text-base sm:text-lg text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
            Dames, Hommes, Jeunes, Vététistes et vélos électriques :{' '}
            <strong className="font-semibold text-[#101216] dark:text-white">3 groupes de niveau encadrés</strong>{' '}
            au départ de Blanmont chaque weekend dans une ambiance conviviale et sportive.
          </p>

          <div className="cover-rise cover-rise-2 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/le-club"
              className="inline-flex items-center gap-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98] shadow-lg shadow-[#e03e3e]/20"
            >
              <span>Découvrir le Club &amp; Horaires</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/sondage"
              className="inline-flex items-center gap-2.5 rounded-md border border-[#e4e0d8] dark:border-white/20 bg-white dark:bg-[#161922] text-[#101216] dark:text-white hover:border-[#101216]/30 dark:hover:border-white/40 hover:bg-[#f2efe9] dark:hover:bg-[#1f242d] px-6 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors shadow-xs"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>Sondage du Weekend</span>
              {activePoll && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider leading-none ${
                  activePoll.status === 'active'
                    ? 'bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40'
                    : 'bg-black/5 dark:bg-white/10 text-[#5c6370] dark:text-[#a7adbb] border border-[#e4e0d8] dark:border-white/10'
                }`}>
                  {activePoll.status === 'active' ? 'Ouvert' : 'Clôturé'}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <HeroTelemetryFrame settings={heroSettings} />
        </div>
      </section>

      {/* ──── Section : Prochain Rendez-vous & Sondage (Distilled Editorial Spread) ──── */}
      <section className="py-16 sm:py-20 bg-[#faf8f5] dark:bg-[#0a0c10] border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Next Scheduled Ride */}
            <div className="lg:col-span-7 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-colors">
              <div className="space-y-4">
                {/* Header row: Date + Weather badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e4e0d8] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#101216] dark:text-white">
                      Prochain départ · {nextRide.dateFormatted}
                    </span>
                  </div>
                  <RideWeatherBadge isoDate={nextRide.isoDate} departure={nextRide.departure} compact />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-[1.1] text-[#101216] dark:text-white">
                    Départ {nextRide.departure} — {nextRide.location}
                  </h2>
                  <p className="text-sm text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed mt-2 max-w-[60ch]">
                    {nextRide.remarks || 'Briefing sur la Place de Blanmont, rassemblement et constitution des pelotons d\'allure.'}
                  </p>
                </div>

                {/* Inline metadata chip row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5c6370] dark:text-[#a7adbb] pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BicycleIcon className="h-4 w-4 text-[#7d8493] dark:text-[#a7adbb] shrink-0" />
                    <span>Groupes : <strong className="text-[#101216] dark:text-white">{nextRide.distances || 'Allures A, B, C & VTT'}</strong></span>
                  </span>
                  <span className="text-[#e4e0d8] dark:text-white/20">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPinIcon className="h-3.5 w-3.5 text-[#7d8493] dark:text-[#a7adbb]" />
                    <span>{nextRide.location}</span>
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-[#e4e0d8] dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                {nextRide.gpxUrl ? (
                  <a
                    href={nextRide.gpxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#f2efe9] dark:bg-white/10 hover:bg-[#e4e0d8] dark:hover:bg-white/20 text-[#101216] dark:text-white px-3.5 py-2 text-xs font-semibold transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                    <span>Télécharger la trace GPX</span>
                  </a>
                ) : (
                  <span className="text-xs text-[#7d8493] dark:text-[#a7adbb] italic">Trace disponible avant le départ</span>
                )}

                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1 text-xs text-[#e03e3e] hover:underline font-semibold"
                >
                  <span>Planning de la saison</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Right: Weekend Poll — Dark Tonal Counterpoint */}
            <div className="lg:col-span-5 rounded-lg border border-[#262b38] bg-[#101216] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header row: Live pulse status */}
                <div className="flex items-center justify-between pb-3 border-b border-[#262b38]">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${activePoll?.status === 'closed' ? 'bg-[#7d8493]' : 'bg-[#e03e3e] animate-pulse'}`} />
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#a7adbb]">
                      Sondage de présence
                    </span>
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    activePoll?.status === 'closed'
                      ? 'bg-white/10 text-[#a7adbb]'
                      : 'bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/30'
                  }`}>
                    {activePoll?.status === 'closed' ? 'Clôturé' : 'En cours'}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-[1.1] text-white">
                    {activePoll?.title || 'Qui roule avec le club ce weekend ?'}
                  </h2>
                  <p className="text-sm text-[#a7adbb] leading-relaxed mt-2">
                    Indiquez votre présence et votre allure pour aider les capitaines à composer les pelotons et ajuster les parcours.
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-[#262b38] flex items-center justify-between gap-3">
                <Link
                  href="/sondage"
                  className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98]"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>Participer au sondage</span>
                </Link>

                <Link
                  href="/sondage"
                  className="text-xs font-medium text-[#7d8493] hover:text-white transition-colors"
                >
                  Voir les réponses →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section : La Vie du Club (Distilled Editorial Spread with Giant Watermark) ──── */}
      <section className="py-20 sm:py-28 bg-[#faf8f5] dark:bg-[#0a0c10] relative overflow-hidden transition-colors duration-200">
        {/* Editorial Giant Background Typography Layer */}
        <div className="absolute top-12 left-0 right-0 overflow-hidden pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,18vw,22rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">
          {/* Section Header with exact style */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e4e0d8] dark:border-white/10 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e03e3e]">
                <SparklesIcon className="h-4 w-4" />
                Structure &amp; Allures
              </div>
              <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] dark:text-white text-balance">
                La Vie du Club de Blanmont
              </h2>
              <p className="text-base text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed">
                Une structure sportive et conviviale pensée pour que chaque cycliste prenne du plaisir à son propre rythme.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
              <ShieldCheckIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>&laquo; On part ensemble, on rentre ensemble &raquo;</span>
            </div>
          </div>

          {/* Speed & Pace Groups Strip — Distilled, No Nested Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#7d8493] dark:text-[#a7adbb]">
                Groupes de niveau &amp; allures
              </span>
              <Link
                href="/le-club"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline"
              >
                <span>Détail des allures</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Groupe A */}
              <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#e03e3e] hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors">
                      Groupe A
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                    &gt; 30 <span className="text-xs font-normal text-[#7d8493] dark:text-[#a7adbb]">km/h</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Sportif, rythmé et soutenu. Pour les cyclistes aguerris habitués aux relais dynamiques.
                  </p>
                </div>
              </div>

              {/* Groupe B */}
              <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 flex flex-col justify-between transition-all duration-300 hover:border-sky-500 hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white group-hover:text-sky-400 transition-colors">
                      Groupe B
                    </span>
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                    25 – 28 <span className="text-xs font-normal text-[#7d8493] dark:text-[#a7adbb]">km/h</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Équilibré, fluide et convivial en peloton régulier. Idéal pour progresser et rouler groupé.
                  </p>
                </div>
              </div>

              {/* Groupe C */}
              <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white group-hover:text-emerald-400 transition-colors">
                      Groupe C
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                    &lt; 25 <span className="text-xs font-normal text-[#7d8493] dark:text-[#a7adbb]">km/h</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Découverte, reprise et plaisir sans pression. Adapté aux vélos traditionnels et VAE.
                  </p>
                </div>
              </div>

              {/* Groupe VTT */}
              <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 flex flex-col justify-between transition-all duration-300 hover:border-amber-500 hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white group-hover:text-amber-400 transition-colors">
                      Groupe VTT
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] dark:text-white tracking-tight">
                    Sentiers <span className="text-xs font-normal text-[#7d8493] dark:text-[#a7adbb]">Bois &amp; Campagne</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Chemins de terre, sous-bois et sentiers vallonnés du Brabant wallon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Pillars — Clean editorial cards with architectural iconography */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Le Carré Vert */}
            <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#101216]/40 dark:hover:border-white/40 hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white transition-all duration-300 group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white shadow-2xs group-hover:shadow-md group-hover:shadow-[#e03e3e]/20">
                    <TrophySquareIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.6875rem] font-bold uppercase tracking-[0.12em] bg-[#f2efe9] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#5c6370] dark:text-[#a7adbb] transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Challenge</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors">
                    Le Carré Vert
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed mt-1.5">
                    Pointage automatique des présences à chaque sortie et palmarès annuel d&apos;assiduité récompensé à l&apos;Assemblée Générale.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[#e4e0d8] dark:border-white/10">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors"
                >
                  <span>Consulter le classement</span>
                  <ArrowRightIcon className="h-3 w-3 text-[#e03e3e] transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* 2. Calendrier */}
            <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#101216]/40 dark:hover:border-white/40 hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white transition-all duration-300 group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white shadow-2xs group-hover:shadow-md group-hover:shadow-[#e03e3e]/20">
                    <RouteCalendarIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.6875rem] font-bold uppercase tracking-[0.12em] bg-[#f2efe9] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#5c6370] dark:text-[#a7adbb] transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span>Planning</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors">
                    Calendrier &amp; Traces GPS
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed mt-1.5">
                    Sorties locales, brevets extérieurs et randos cyclotouristes avec synchronisation iCal (Apple, Google, Outlook) et traces GPX.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[#e4e0d8] dark:border-white/10">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors"
                >
                  <span>Voir le calendrier complet</span>
                  <ArrowRightIcon className="h-3 w-3 text-[#e03e3e] transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* 3. Équipements */}
            <div className="group rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#101216]/40 dark:hover:border-white/40 hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white transition-all duration-300 group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white shadow-2xs group-hover:shadow-md group-hover:shadow-[#e03e3e]/20">
                    <JerseyIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.6875rem] font-bold uppercase tracking-[0.12em] bg-[#f2efe9] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#5c6370] dark:text-[#a7adbb] transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Boutique</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors">
                    Tenues &amp; Équipements
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed mt-1.5">
                    Maillots, cuissards, vestes thermiques et accessoires officiels aux couleurs du Club de Blanmont.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[#e4e0d8] dark:border-white/10">
                <Link
                  href="/le-club/equipement"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors"
                >
                  <span>Découvrir la boutique</span>
                  <ArrowRightIcon className="h-3 w-3 text-[#e03e3e] transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section : La Traversée des Éléments (Chronique Visuelle & Grand PELOTON Backdrop) ──── */}
      <EditorialPhotographicMosaic />

      {/* ──── Club Spirit — typographic manifesto with Giant Watermark ──── */}
      <section className="py-20 sm:py-28 bg-[#f2efe9] dark:bg-[#0d0f14] border-y border-[#e4e0d8] dark:border-[#262b38] relative overflow-hidden transition-colors duration-200">
        {/* Editorial Giant Background Typography Layer */}
        <div className="absolute top-12 left-0 right-0 overflow-hidden pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,18vw,22rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            ESPRIT
          </span>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e4e0d8] dark:border-white/10 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e03e3e]">
                <HeartIcon className="h-4 w-4" />
                Manifeste &amp; Valeurs
              </div>
              <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] dark:text-white text-balance">
                L&apos;Esprit du CC Saint-Martin
              </h2>
              <p className="text-base text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed">
                La philosophie fondatrice qui guide chaque sortie, chaque relais et chaque rassemblement depuis 1978.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
              <span>Pacte de Solidarité · 1978–2026</span>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 border-b border-[#e4e0d8] dark:border-white/10 items-baseline">
              <h3 className="md:col-span-5 text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216] dark:text-white inline-flex items-center gap-3">
                <ShieldCheckIcon className="h-6 w-6 text-[#e03e3e] shrink-0" />
                Sécurité &amp; Encadrement
              </h3>
              <p className="md:col-span-7 text-sm sm:text-base text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed max-w-[65ch]">
                Des allures respectées, des capitaines attentifs et une entraide systématique en cas de coup dur ou de crevaison.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 border-b border-[#e4e0d8] dark:border-white/10 items-baseline">
              <h3 className="md:col-span-5 text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216] dark:text-white inline-flex items-center gap-3">
                <HeartIcon className="h-6 w-6 text-[#e03e3e] shrink-0" />
                Convivialité &amp; Troisième Mi-temps
              </h3>
              <p className="md:col-span-7 text-sm sm:text-base text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed max-w-[65ch]">
                Le plaisir de se retrouver sur la Place de Blanmont ou à la brasserie locale après la sortie pour débriefer dans la bonne humeur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 border-b border-[#e4e0d8] dark:border-white/10 items-baseline">
              <h3 className="md:col-span-5 text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216] dark:text-white inline-flex items-center gap-3">
                <BoltIcon className="h-6 w-6 text-[#e03e3e] shrink-0" />
                Ouvert à Tous les Profils
              </h3>
              <p className="md:col-span-7 text-sm sm:text-base text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed max-w-[65ch]">
                Cyclistes occasionnels ou compétiteurs réguliers, vélos traditionnels ou électriques : chacun trouve son peloton.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Call-To-Action Cover (Adaptive Light / Dark) ──── */}
      <section className="py-20 sm:py-28 bg-[#f2efe9] dark:bg-[#0a0c10] text-[#101216] dark:text-white border-t border-[#e4e0d8] dark:border-[#262b38] relative overflow-hidden transition-colors duration-200">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-4xl space-y-6">
            <h2 className="text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-[#101216] dark:text-white">
              Envie de rouler avec le <span className="text-[#e03e3e] italic">peloton</span> de Blanmont ?
            </h2>
            <p className="max-w-2xl text-base sm:text-lg text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Rejoignez-nous un samedi ou un dimanche matin sur la Place de Blanmont. Essai libre et sans engagement : venez tester une ou deux sorties avant de vous inscrire.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/le-club"
              className="inline-flex items-center gap-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98]"
            >
              <span>Découvrir le Club &amp; Horaires</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/sondage"
              className="inline-flex items-center gap-2.5 rounded-md border border-[#e4e0d8] dark:border-white/20 text-[#101216] dark:text-white bg-white dark:bg-[#161922] hover:border-[#101216]/40 dark:hover:border-white/40 hover:bg-[#faf8f5] dark:hover:bg-[#1f242d] px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors shadow-xs"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Sondage du Weekend</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ──── News & Blog Section ──── */}
      <HomeBlogSection posts={posts} />
    </div>
  );
}
