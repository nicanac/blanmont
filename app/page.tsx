import Link from 'next/link';
import {
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon,
  SparklesIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  HeartIcon,
  BoltIcon,
  ClockIcon,
  CheckBadgeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts, getActiveWeekendPoll, getCalendarEvents, getTraces } from './lib/firebase';
import { getNextScheduledRide } from './lib/firebase/calendar';
import RideWeatherBadge from './components/ui/RideWeatherBadge';
import { stripSuffix } from './utils/string.utils';

/**
 * Landing page – Modern, refined, athletic home page for CC Saint-Martin Blanmont.
 */
export default async function Home() {
  const [posts, activePoll, events, traces] = await Promise.all([
    getBlogPosts(),
    getActiveWeekendPoll(),
    getCalendarEvents(),
    getTraces(),
  ]);

  const nextRide = getNextScheduledRide(events);
  // Pick up to 3 high-quality / scenic traces for the preview section
  const featuredTraces = traces.slice(0, 3);

  return (
    <div className="bg-white">
      {/* ──── Hero Section (Luminous & Athletic) ──── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-50/40 pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-100">
        {/* Subtle Ambient Background Glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-red-500/8 via-rose-500/5 to-transparent rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-32 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 px-4 py-1.5 text-xs font-semibold text-slate-800 transition-colors shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e03e3e]"></span>
            </span>
            <span>CC Saint-Martin Blanmont • Fondé en 1978 • Saison 2026</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
            Rouler ensemble, partager l&apos;effort &amp; la passion du peloton
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            Dames, Hommes, Jeunes, Vététistes et vélos électriques :{' '}
            <strong className="font-semibold text-slate-900">3 groupes de niveau encadrés</strong> au départ de Blanmont chaque weekend dans une ambiance conviviale et sportive.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/sondage"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-7 py-3.5 text-sm font-semibold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-98"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Sondage du Weekend</span>
              {activePoll && (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-white leading-none">
                  {activePoll.status === 'active' ? 'Ouvert' : 'Clôturé'}
                </span>
              )}
            </Link>

            <Link
              href="/traces"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-6 py-3.5 text-sm font-semibold shadow-2xs hover:border-slate-300 transition-all active:scale-98"
            >
              <GlobeAltIcon className="h-4 w-4 text-sky-600" />
              <span>Parcours GPS (+150)</span>
            </Link>

            <Link
              href="/le-club"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-5 py-3.5 text-sm font-medium transition-colors"
            >
              <span>Le Club</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Hero Photo with Overlaid Glass Badges */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 bg-slate-900 group">
            <img
              className="aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9] w-full object-cover transition-transform duration-700 group-hover:scale-101"
              src="/images/home-hero.jpg"
              alt="Club de Blanmont – peloton cycliste sur route dans le Brabant wallon"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            {/* Overlaid Badges */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-medium shadow-sm">
                <MapPinIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                <span>Départs : Place de Blanmont • Samedi 8h30 &amp; Dimanche 9h00</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-medium shadow-sm">
                <UserGroupIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>3 allures encadrées • +150 circuits GPX</span>
              </div>
            </div>
          </div>

          {/* 4-Pillar Metric Strip (Role-Colored & Crisp) */}
          <div className="mt-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-2 sm:pt-0 flex flex-col items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#e03e3e] mb-2">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-slate-900 tabular-nums">3 Allures</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Groupes A, B, C &amp; VTT
              </p>
            </div>

            <div className="pt-2 sm:pt-0 flex flex-col items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-2">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-slate-900">Sorties Hebdo</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Samedi &amp; Dimanche
              </p>
            </div>

            <div className="pt-2 sm:pt-0 flex flex-col items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 mb-2">
                <GlobeAltIcon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-slate-900 tabular-nums">+150 Circuits</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Traces GPX en accès libre
              </p>
            </div>

            <div className="pt-2 sm:pt-0 flex flex-col items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-2">
                <TrophyIcon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-emerald-700">Le Carré Vert</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Challenge fidélité du club
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Next Ride & Live Poll Spotlight ──── */}
      <section className="py-12 bg-slate-50/60 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Next Scheduled Ride Card */}
            <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-50 text-[#e03e3e] border border-red-200/70 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
                    <span>Prochain Rendez-vous Club</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {nextRide.dateFormatted}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Départ à {nextRide.departure} • {nextRide.location}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                    {nextRide.remarks || 'Rendez-vous sur la Place de Blanmont pour le briefing et la formation des groupes d\'allure.'}
                  </p>
                </div>

                {/* Live Weather Widget preview */}
                <div className="pt-1">
                  <RideWeatherBadge isoDate={nextRide.isoDate} departure={nextRide.departure} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-medium">
                  Groupes : <strong className="text-slate-900">{nextRide.distances || 'Allures A, B, C & VTT'}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {nextRide.gpxUrl && (
                    <a
                      href={nextRide.gpxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 font-semibold transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                      <span>Trace GPX</span>
                    </a>
                  )}
                  <Link
                    href="/calendrier"
                    className="inline-flex items-center gap-1 text-[#e03e3e] hover:underline font-semibold"
                  >
                    <span>Voir le calendrier</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Weekend Poll Quick Callout */}
            <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl border border-red-200/80 bg-gradient-to-br from-red-50/70 via-white to-red-50/30 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-3 py-1 text-xs font-semibold">
                    <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Sondage de présence</span>
                  </span>
                  <span className="text-2xs uppercase tracking-wider font-bold text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded-full">
                    {activePoll?.status === 'closed' ? 'Clôturé' : 'En cours'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activePoll?.title || 'Qui roule avec le club ce weekend ?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                    Indiquez votre jour et votre groupe pour aider les capitaines de route à organiser les pelotons.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-red-100/80 flex items-center justify-between">
                <Link
                  href="/sondage"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-98"
                >
                  <span>Participer au sondage</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/saturday-ride"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Vote du Samedi →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Bento Showcase : La Vie du Club & Nos Activités ──── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#e03e3e]">
              Organisation &amp; Convivialité
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              La vie du Club de Blanmont
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Une structure sportive et conviviale pensée pour que chaque cycliste prenne du plaisir à son propre rythme.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Les 3 Groupes de Niveau (Span 2 Cols) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between lg:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    3 Allures &amp; VTT
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Groupes de niveau encadrés
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5 max-w-2xl">
                    Chaque sortie est encadrée par des capitaines de route bénévoles veillant au respect du rythme, à la sécurité et à la cohésion du groupe.
                  </p>
                </div>

                {/* 4 Distinct Speed Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-2xl bg-red-50/70 p-3 text-center border border-red-200/70">
                    <div className="font-bold text-xs text-red-950">Groupe A</div>
                    <div className="text-sm font-bold text-[#e03e3e] tabular-nums mt-0.5">&gt; 30 km/h</div>
                    <div className="text-2xs text-red-700/80 mt-0.5 font-medium">Sportif &amp; Rythmé</div>
                  </div>

                  <div className="rounded-2xl bg-sky-50/70 p-3 text-center border border-sky-200/70">
                    <div className="font-bold text-xs text-sky-950">Groupe B</div>
                    <div className="text-sm font-bold text-sky-700 tabular-nums mt-0.5">25 - 28 km/h</div>
                    <div className="text-2xs text-sky-700/80 mt-0.5 font-medium">Équilibré &amp; Peloton</div>
                  </div>

                  <div className="rounded-2xl bg-emerald-50/70 p-3 text-center border border-emerald-200/70">
                    <div className="font-bold text-xs text-emerald-950">Groupe C</div>
                    <div className="text-sm font-bold text-emerald-700 tabular-nums mt-0.5">&lt; 25 km/h</div>
                    <div className="text-2xs text-emerald-700/80 mt-0.5 font-medium">Convivial &amp; Découverte</div>
                  </div>

                  <div className="rounded-2xl bg-amber-50/70 p-3 text-center border border-amber-200/70">
                    <div className="font-bold text-xs text-amber-950">Groupe VTT</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">Sentiers</div>
                    <div className="text-2xs text-amber-700/80 mt-0.5 font-medium">Bois &amp; Campagne</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Devise du club : &laquo; On part ensemble, on rentre ensemble &raquo;</span>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-6 flex items-center justify-between">
                <Link
                  href="/le-club"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>En savoir plus sur nos allures</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
                <Link
                  href="/members"
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Voir les membres du club →
                </Link>
              </div>
            </div>

            {/* Card 2: Traces & Circuits GPS */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <GlobeAltIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-sky-50 text-sky-800 px-3 py-1 text-xs font-semibold border border-sky-200/70 tabular-nums">
                    +150 GPX
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Traces &amp; Parcours GPS
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                    Cartographie complète, profils de dénivelé et téléchargement direct pour Garmin, Wahoo, Strava et Komoot.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600">Garmin</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600">Strava</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600">Wahoo</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600">Komoot</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/traces"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Explorer le catalogue de traces</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Le Carré Vert Challenge */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <TrophyIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-semibold border border-emerald-200/70">
                    Challenge Club
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Le Carré Vert
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                    Pointage automatique des présences à chaque sortie du club et calcul du palmarès d&apos;assiduité récompensé à l&apos;Assemblée Générale.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Consulter le classement</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 4: Calendrier & Agenda */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Toute la saison
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Calendrier &amp; Événements
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                    Sorties locales, brevets extérieurs et randos cyclotouristes. Synchronisation iCal pour vos agendas Apple, Google et Outlook.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le calendrier complet</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 5: Équipements du Club */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-[#e03e3e]">
                    <CheckBadgeIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Collection 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tenues &amp; Équipements
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                    Maillots, cuissards, vestes thermiques et accessoires aux couleurs officielles du Club de Blanmont.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
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

      {/* ──── Featured Traces Section ──── */}
      {featuredTraces.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50/70 border-t border-slate-200/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#e03e3e]">
                  Traces GPS Recommandées
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                  Parcours populaires du club
                </h2>
              </div>
              <Link
                href="/traces"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                <span>Voir les 150+ parcours</span>
                <ArrowRightIcon className="h-3 w-3 text-[#e03e3e]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTraces.map((trace) => (
                <div
                  key={trace.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                    {trace.photoUrl ? (
                      <img
                        src={trace.photoUrl}
                        alt={trace.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <MapPinIcon className="h-10 w-10" />
                      </div>
                    )}
                    {/* Top direction & rating badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {trace.direction && (
                        <span className="rounded-full bg-slate-950/70 backdrop-blur-xs px-2.5 py-0.5 text-2xs font-medium text-white border border-white/10">
                          {trace.direction}
                        </span>
                      )}
                      <span className="rounded-full bg-slate-950/70 backdrop-blur-xs px-2.5 py-0.5 text-2xs font-semibold text-white border border-white/10 inline-flex items-center gap-1">
                        <StarIcon className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span>{trace.quality}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors line-clamp-1">
                      <Link href={`/traces/${trace.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {stripSuffix(trace.name, '#')}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {trace.description || "Circuit vélo vallonné dans le Brabant wallon et environs."}
                    </p>

                    <div className="flex flex-1 flex-col justify-end pt-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-slate-900 tabular-nums">{trace.distance}</span>
                          <span className="font-semibold text-slate-500">km</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-slate-800 tabular-nums">{trace.elevation}</span>
                          <span className="font-semibold text-slate-500">m D+</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 font-medium text-slate-600">
                          {trace.surface || 'Route'}
                        </span>
                        {trace.gpxUrl && (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold text-[#e03e3e]">
                            <ArrowDownTrayIcon className="h-3 w-3" />
                            <span>GPX disponible</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──── Club Spirit & Pillars ──── */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#e03e3e]">
              Nos Valeurs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              L&apos;esprit du CC Saint-Martin
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Plus qu&apos;un simple club, une communauté de passionnés réunis par le plaisir de pédaler ensemble.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Sécurité &amp; Encadrement
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Des allures respectées, des capitaines attentifs et une entraide systématique en cas de coup dur ou de crevaison.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <HeartIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Convivialité &amp; Troisième Mi-temps
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Le plaisir de se retrouver sur la Place de Blanmont ou à la brasserie locale après la sortie pour débriefer dans la bonne humeur.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BoltIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ouvert à Tous les Profils
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Cyclistes occasionnels ou compétiteurs réguliers, vélos traditionnels ou électriques : chacun trouve son peloton.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Call-To-Action Banner: Join the Club ──── */}
      <section className="py-12 sm:py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-red-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 shadow-2xs">
            <SparklesIcon className="h-3.5 w-3.5 text-red-400" />
            <span>Essai gratuit &amp; sans engagement</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight text-balance">
            Envie de rouler avec le peloton de Blanmont ?
          </h2>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            Rejoignez-nous un samedi ou un dimanche matin sur la Place de Blanmont. Venez tester une ou deux sorties librement avant de vous inscrire.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/le-club"
              className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-7 py-3.5 text-sm font-semibold shadow-lg shadow-red-900/40 transition-all active:scale-98"
            >
              <span>Découvrir le Club &amp; Horaires</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/sondage"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white px-6 py-3.5 text-sm font-semibold transition-colors"
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
