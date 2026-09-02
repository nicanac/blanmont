import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  HeartIcon,
  BoltIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts, getActiveWeekendPoll, getCalendarEvents } from './lib/firebase';
import { getNextScheduledRide } from './lib/firebase/calendar';
import RideWeatherBadge from './components/ui/RideWeatherBadge';

/**
 * Landing page — Editorial Peloton: magazine-cover hero on ink,
 * paper spreads, hairline structure, asymmetric bento.
 */
export default async function Home() {
  const [posts, activePoll, events] = await Promise.all([
    getBlogPosts(),
    getActiveWeekendPoll(),
    getCalendarEvents(),
  ]);

  const nextRide = getNextScheduledRide(events);

  return (
    <div className="bg-[#faf8f5]">
      {/* ──── Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white">
        <div className="pointer-events-none absolute -top-40 -right-24 w-[560px] h-[560px] bg-[#e03e3e]/15 rounded-full blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
          <h1 className="max-w-5xl text-[clamp(2.5rem,7.5vw,5.5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
            <span className="cover-line"><span>Rouler ensemble,</span></span>
            <span className="cover-line"><span>partager l&apos;effort,</span></span>
            <span className="cover-line"><span className="text-[#e03e3e] italic">la passion du peloton.</span></span>
          </h1>

          <p className="cover-rise cover-rise-1 mt-6 max-w-2xl text-base sm:text-lg text-[#a7adbb] leading-relaxed">
            Dames, Hommes, Jeunes, Vététistes et vélos électriques :{' '}
            <strong className="font-semibold text-[#f5f6f8]">3 groupes de niveau encadrés</strong>{' '}
            au départ de Blanmont chaque weekend dans une ambiance conviviale et sportive.
          </p>

          <div className="cover-rise cover-rise-2 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/sondage"
              className="inline-flex items-center gap-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98]"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Sondage du Weekend</span>
              {activePoll && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white leading-none">
                  {activePoll.status === 'active' ? 'Ouvert' : 'Clôturé'}
                </span>
              )}
            </Link>

            <Link
              href="/le-club"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 text-[#f5f6f8] hover:border-white/50 hover:bg-white/5 px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors"
            >
              <span>Découvrir le Club</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>


        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          {/* Photo & Telemetry Unified Frame */}
          <div className="overflow-hidden rounded-lg border border-[#262b38] bg-[#101216] shadow-2xl">
            {/* Hard-cropped photo */}
            <div className="relative">
              <img
                className="aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9] w-full object-cover"
                src="/images/home-hero.jpg"
                alt="Club de Blanmont – peloton cycliste sur route dans le Brabant wallon"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101216] via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Photo Caption Badge */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0a0c10]/85 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#f5f6f8] border border-white/10 shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                  Peloton CC Saint-Martin · Blanmont
                </span>
              </div>
            </div>

            {/* Seamless Telemetry Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-t border-white/10 bg-[#161922]">
              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <div className="rounded-md bg-[#e03e3e]/10 border border-[#e03e3e]/25 p-2 text-[#e03e3e] shrink-0">
                  <MapPinIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Rassemblement</div>
                  <div className="mt-0.5 text-sm font-bold text-white leading-tight">Place de Blanmont</div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <div className="rounded-md bg-white/5 border border-white/10 p-2 text-[#f5f6f8] shrink-0">
                  <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Samedi</div>
                  <div className="mt-0.5 text-sm font-bold text-white tabular-nums leading-tight">8h30 <span className="text-xs font-normal text-[#a7adbb]">· Route</span></div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <div className="rounded-md bg-white/5 border border-white/10 p-2 text-[#f5f6f8] shrink-0">
                  <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Dimanche</div>
                  <div className="mt-0.5 text-sm font-bold text-white tabular-nums leading-tight">9h00 <span className="text-xs font-normal text-[#a7adbb]">· Route &amp; VTT</span></div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                <div className="rounded-md bg-white/5 border border-white/10 p-2 text-[#f5f6f8] shrink-0">
                  <UserGroupIcon className="h-4 w-4 text-[#e03e3e]" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Allures</div>
                  <div className="mt-0.5 text-sm font-bold text-white leading-tight">Groupes A, B, C &amp; VTT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section : Prochain Rendez-vous & Sondage (Distilled Editorial Spread) ──── */}
      <section className="py-16 sm:py-20 bg-[#faf8f5] border-b border-[#e4e0d8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Next Scheduled Ride */}
            <div className="lg:col-span-7 rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header row: Date + Weather badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e4e0d8]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#101216]">
                      Prochain départ · {nextRide.dateFormatted}
                    </span>
                  </div>
                  <RideWeatherBadge isoDate={nextRide.isoDate} departure={nextRide.departure} compact />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-[1.1] text-[#101216]">
                    Départ {nextRide.departure} — {nextRide.location}
                  </h2>
                  <p className="text-sm text-[#3a3f4a] leading-relaxed mt-2 max-w-[60ch]">
                    {nextRide.remarks || 'Briefing sur la Place de Blanmont, rassemblement et constitution des pelotons d\'allure.'}
                  </p>
                </div>

                {/* Inline metadata chip row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5c6370] pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🚲</span>
                    <span>Groupes : <strong className="text-[#101216]">{nextRide.distances || 'Allures A, B, C & VTT'}</strong></span>
                  </span>
                  <span className="text-[#e4e0d8]">•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPinIcon className="h-3.5 w-3.5 text-[#7d8493]" />
                    <span>{nextRide.location}</span>
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-[#e4e0d8] flex flex-wrap items-center justify-between gap-3">
                {nextRide.gpxUrl ? (
                  <a
                    href={nextRide.gpxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#f2efe9] hover:bg-[#e4e0d8] text-[#101216] px-3.5 py-2 text-xs font-semibold transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                    <span>Télécharger la trace GPX</span>
                  </a>
                ) : (
                  <span className="text-xs text-[#7d8493] italic">Trace disponible avant le départ</span>
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

      {/* ──── Section : La Vie du Club (Distilled Editorial Spread) ──── */}
      <section className="py-16 sm:py-24 bg-[#faf8f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[#e4e0d8] pb-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-[-0.025em] leading-[1.02] text-[#101216] text-balance">
                La vie du Club de Blanmont
              </h2>
              <p className="text-sm sm:text-base text-[#3a3f4a] leading-relaxed max-w-[65ch]">
                Une structure sportive et conviviale pensée pour que chaque cycliste prenne du plaisir à son propre rythme.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5c6370] shrink-0">
              <ShieldCheckIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>&laquo; On part ensemble, on rentre ensemble &raquo;</span>
            </div>
          </div>

          {/* Speed & Pace Groups Strip — Distilled, No Nested Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#7d8493]">
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
              <div className="group rounded-lg border border-[#e4e0d8] bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#e03e3e] hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                      Groupe A
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] tabular-nums tracking-tight">
                    &gt; 30 <span className="text-xs font-normal text-[#7d8493]">km/h</span>
                  </div>
                  <p className="text-xs text-[#5c6370] leading-relaxed">
                    Sportif, rythmé et soutenu. Pour les cyclistes aguerris habitués aux relais dynamiques.
                  </p>
                </div>
              </div>

              {/* Groupe B */}
              <div className="group rounded-lg border border-[#e4e0d8] bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:border-sky-500 hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] group-hover:text-sky-600 transition-colors">
                      Groupe B
                    </span>
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] tabular-nums tracking-tight">
                    25 – 28 <span className="text-xs font-normal text-[#7d8493]">km/h</span>
                  </div>
                  <p className="text-xs text-[#5c6370] leading-relaxed">
                    Équilibré, fluide et convivial en peloton régulier. Idéal pour progresser et rouler groupé.
                  </p>
                </div>
              </div>

              {/* Groupe C */}
              <div className="group rounded-lg border border-[#e4e0d8] bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] group-hover:text-emerald-600 transition-colors">
                      Groupe C
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] tabular-nums tracking-tight">
                    &lt; 25 <span className="text-xs font-normal text-[#7d8493]">km/h</span>
                  </div>
                  <p className="text-xs text-[#5c6370] leading-relaxed">
                    Découverte, reprise et plaisir sans pression. Adapté aux vélos traditionnels et VAE.
                  </p>
                </div>
              </div>

              {/* Groupe VTT */}
              <div className="group rounded-lg border border-[#e4e0d8] bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:border-amber-500 hover:-translate-y-0.5 hover:shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] group-hover:text-amber-600 transition-colors">
                      Groupe VTT
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#101216] tracking-tight">
                    Sentiers <span className="text-xs font-normal text-[#7d8493]">Bois &amp; Campagne</span>
                  </div>
                  <p className="text-xs text-[#5c6370] leading-relaxed">
                    Chemins de terre, sous-bois et sentiers vallonnés du Brabant wallon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Pillars — Perfectly balanced, no dead space */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Le Carré Vert */}
            <div className="group rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#101216]/40 hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <TrophyIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Challenge
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                    Le Carré Vert
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] leading-relaxed mt-1.5">
                    Pointage automatique des présences à chaque sortie et palmarès annuel d&apos;assiduité récompensé à l&apos;Assemblée Générale.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[#e4e0d8]">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Consulter le classement</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* 2. Calendrier */}
            <div className="group rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#101216]/40 hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-600 border border-sky-200/60">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    Planning
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                    Calendrier &amp; Traces GPS
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] leading-relaxed mt-1.5">
                    Sorties locales, brevets extérieurs et randos cyclotouristes avec synchronisation iCal (Apple, Google, Outlook) et traces GPX.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[#e4e0d8]">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le calendrier complet</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* 3. Équipements */}
            <div className="group rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#101216]/40 hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-600 border border-amber-200/60">
                    <CheckBadgeIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Boutique
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                    Tenues &amp; Équipements
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] leading-relaxed mt-1.5">
                    Maillots, cuissards, vestes thermiques et accessoires officiels aux couleurs du Club de Blanmont.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[#e4e0d8]">
                <Link
                  href="/le-club/equipement"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Découvrir la boutique</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Club Spirit — typographic manifesto ──── */}
      <section className="py-16 sm:py-24 bg-[#f2efe9] border-y border-[#e4e0d8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <h2 className="max-w-3xl text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-[-0.025em] leading-[1.02] text-[#101216] text-balance">
            L&apos;esprit du CC Saint-Martin
          </h2>

          <div className="border-t border-[#e4e0d8]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 border-b border-[#e4e0d8] items-baseline">
              <h3 className="md:col-span-5 text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216] inline-flex items-center gap-3">
                <ShieldCheckIcon className="h-6 w-6 text-[#e03e3e] shrink-0" />
                Sécurité &amp; Encadrement
              </h3>
              <p className="md:col-span-7 text-sm sm:text-base text-[#3a3f4a] leading-relaxed max-w-[65ch]">
                Des allures respectées, des capitaines attentifs et une entraide systématique en cas de coup dur ou de crevaison.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 border-b border-[#e4e0d8] items-baseline">
              <h3 className="md:col-span-5 text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216] inline-flex items-center gap-3">
                <HeartIcon className="h-6 w-6 text-[#e03e3e] shrink-0" />
                Convivialité &amp; Troisième Mi-temps
              </h3>
              <p className="md:col-span-7 text-sm sm:text-base text-[#3a3f4a] leading-relaxed max-w-[65ch]">
                Le plaisir de se retrouver sur la Place de Blanmont ou à la brasserie locale après la sortie pour débriefer dans la bonne humeur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 border-b border-[#e4e0d8] items-baseline">
              <h3 className="md:col-span-5 text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216] inline-flex items-center gap-3">
                <BoltIcon className="h-6 w-6 text-[#e03e3e] shrink-0" />
                Ouvert à Tous les Profils
              </h3>
              <p className="md:col-span-7 text-sm sm:text-base text-[#3a3f4a] leading-relaxed max-w-[65ch]">
                Cyclistes occasionnels ou compétiteurs réguliers, vélos traditionnels ou électriques : chacun trouve son peloton.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Call-To-Action Cover (Ink) ──── */}
      <section className="py-20 sm:py-28 bg-[#0a0c10] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 bg-[#e03e3e]/20 rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
              Rejoindre le club
            </div>
            <h2 className="text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-white">
              Envie de rouler avec le <span className="text-[#e03e3e] italic">peloton</span> de Blanmont ?
            </h2>
            <p className="max-w-2xl text-base sm:text-lg text-[#a7adbb] leading-relaxed">
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
              className="inline-flex items-center gap-2.5 rounded-md border border-white/25 text-[#f5f6f8] hover:border-white/50 hover:bg-white/5 px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors"
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
