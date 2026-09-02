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
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-white leading-none">
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
          {/* Photo container */}
          <div className="relative overflow-hidden rounded-lg border border-white/15 shadow-2xl bg-[#101216]">
            <img
              className="aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9] w-full object-cover"
              src="/images/home-hero.jpg"
              alt="Club de Blanmont – peloton cycliste sur route dans le Brabant wallon"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10]/80 via-transparent to-black/20 pointer-events-none" />

            {/* Live overlay tag */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0a0c10]/80 backdrop-blur-md px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#f5f6f8] border border-white/15 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
                Peloton CC Blanmont · Saison 2026
              </span>
            </div>
          </div>

          {/* Floating HUD Stat Strip */}
          <div className="relative -translate-y-6 sm:-translate-y-8 -mb-4 sm:-mb-6 px-3 sm:px-6 z-10">
            <dl className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border border-white/15 bg-[#161922]/95 backdrop-blur-md shadow-2xl divide-y divide-white/10 sm:divide-y-0 sm:divide-x sm:divide-white/10">
              <div className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="rounded-md bg-[#e03e3e]/10 border border-[#e03e3e]/25 p-2 text-[#e03e3e] shrink-0 mt-0.5">
                  <MapPinIcon className="h-4 w-4" />
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Départ</dt>
                  <dd className="mt-0.5 text-sm font-bold text-white leading-tight">Place de Blanmont</dd>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="rounded-md bg-white/5 border border-white/10 p-2 text-[#f5f6f8] shrink-0 mt-0.5">
                  <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Samedi</dt>
                  <dd className="mt-0.5 text-sm font-bold text-white tabular-nums leading-tight">8h30 <span className="text-xs font-normal text-[#a7adbb]">· Route</span></dd>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="rounded-md bg-white/5 border border-white/10 p-2 text-[#f5f6f8] shrink-0 mt-0.5">
                  <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Dimanche</dt>
                  <dd className="mt-0.5 text-sm font-bold text-white tabular-nums leading-tight">9h00 <span className="text-xs font-normal text-[#a7adbb]">· Route &amp; VTT</span></dd>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="rounded-md bg-white/5 border border-white/10 p-2 text-[#f5f6f8] shrink-0 mt-0.5">
                  <UserGroupIcon className="h-4 w-4 text-[#e03e3e]" />
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7d8493]">Groupes d&apos;allure</dt>
                  <dd className="mt-0.5 text-sm font-bold text-white leading-tight">A, B, C &amp; VTT</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

      </section>

      {/* ──── Next Ride & Live Poll (Paper spread) ──── */}
      <section className="py-16 sm:py-24 bg-[#faf8f5] border-b border-[#e4e0d8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Next Scheduled Ride */}
            <div className="lg:col-span-7 rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]">
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
                    <span>Prochain rendez-vous</span>
                  </div>
                  <span className="text-xs font-semibold text-[#5c6370] bg-[#f2efe9] px-3 py-1 rounded-full">
                    {nextRide.dateFormatted}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-[1.1] text-[#101216]">
                    Départ à {nextRide.departure} — {nextRide.location}
                  </h2>
                  <p className="text-sm sm:text-base text-[#3a3f4a] leading-relaxed mt-2 max-w-[65ch]">
                    {nextRide.remarks || 'Rendez-vous sur la Place de Blanmont pour le briefing et la formation des groupes d\'allure.'}
                  </p>
                </div>

                {/* Live Weather Widget preview */}
                <div className="pt-1">
                  <RideWeatherBadge isoDate={nextRide.isoDate} departure={nextRide.departure} />
                </div>
              </div>

              <div className="pt-5 border-t border-[#e4e0d8] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-[#3a3f4a] font-medium">
                  Groupes : <strong className="text-[#101216]">{nextRide.distances || 'Allures A, B, C & VTT'}</strong>
                </div>

                <div className="flex items-center gap-3">
                  {nextRide.gpxUrl && (
                    <a
                      href={nextRide.gpxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#f2efe9] hover:bg-[#e4e0d8] text-[#101216] px-3 py-1.5 font-semibold transition-colors"
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

            {/* Right: Weekend Poll — dark tonal counterpoint */}
            <div className="lg:col-span-5 rounded-lg border border-[#262b38] bg-[#101216] text-white p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]">
                    <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                    <span>Sondage de présence</span>
                  </span>
                  <span className="text-[0.625rem] uppercase tracking-[0.08em] font-bold text-white bg-[#e03e3e] px-2.5 py-0.5 rounded-full">
                    {activePoll?.status === 'closed' ? 'Clôturé' : 'En cours'}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-[1.1] text-white">
                    {activePoll?.title || 'Qui roule avec le club ce weekend ?'}
                  </h2>
                  <p className="text-sm text-[#a7adbb] leading-relaxed mt-2">
                    Indiquez votre jour et votre groupe pour aider les capitaines de route à organiser les pelotons.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#262b38] flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/sondage"
                  className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors active:scale-[0.98]"
                >
                  <span>Participer au sondage</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/saturday-ride"
                  className="text-xs font-medium text-[#7d8493] hover:text-white transition-colors"
                >
                  Vote du Samedi →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Asymmetric Bento : La Vie du Club ──── */}
      <section className="py-16 sm:py-24 bg-[#faf8f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading — no eyebrow, the heading speaks */}
          <div className="max-w-2xl space-y-3">
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-[-0.025em] leading-[1.02] text-[#101216] text-balance">
              La vie du Club de Blanmont
            </h2>
            <p className="text-sm sm:text-base text-[#3a3f4a] leading-relaxed max-w-[65ch]">
              Une structure sportive et conviviale pensée pour que chaque cycliste prenne du plaisir à son propre rythme.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Les groupes de niveau — wide paper card */}
            <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between lg:col-span-7">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e]">
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#f2efe9] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#5c6370]">
                    3 Allures &amp; VTT
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216]">
                    Groupes de niveau encadrés
                  </h3>
                  <p className="text-sm text-[#3a3f4a] leading-relaxed mt-2 max-w-[65ch]">
                    Chaque sortie est encadrée par des capitaines de route bénévoles veillant au respect du rythme, à la sécurité et à la cohésion du groupe.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="group rounded-lg bg-white border border-[#e4e0d8] p-3 flex flex-col items-center text-center transition-all duration-300 ease-out hover:border-[#e03e3e] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#e03e3e]/10">
                    <span className="rounded-full bg-[#101216] px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white transition-colors duration-200 group-hover:bg-[#e03e3e]">
                      Groupe A
                    </span>
                    <div className="mt-1.5 text-sm font-bold tabular-nums text-[#101216]">&gt; 30 km/h</div>
                    <div className="mt-0.5 text-[0.6875rem] font-medium text-[#5c6370]">Sportif &amp; Rythmé</div>
                  </div>

                  <div className="group rounded-lg bg-white border border-[#e4e0d8] p-3 flex flex-col items-center text-center transition-all duration-300 ease-out hover:border-[#e03e3e] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#e03e3e]/10">
                    <span className="rounded-full bg-[#101216] px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white transition-colors duration-200 group-hover:bg-[#e03e3e]">
                      Groupe B
                    </span>
                    <div className="mt-1.5 text-sm font-bold tabular-nums text-[#101216]">25 - 28 km/h</div>
                    <div className="mt-0.5 text-[0.6875rem] font-medium text-[#5c6370]">Équilibré &amp; Peloton</div>
                  </div>

                  <div className="group rounded-lg bg-white border border-[#e4e0d8] p-3 flex flex-col items-center text-center transition-all duration-300 ease-out hover:border-[#e03e3e] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#e03e3e]/10">
                    <span className="rounded-full bg-[#101216] px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white transition-colors duration-200 group-hover:bg-[#e03e3e]">
                      Groupe C
                    </span>
                    <div className="mt-1.5 text-sm font-bold tabular-nums text-[#101216]">&lt; 25 km/h</div>
                    <div className="mt-0.5 text-[0.6875rem] font-medium text-[#5c6370]">Convivial &amp; Découverte</div>
                  </div>

                  <div className="group rounded-lg bg-white border border-[#e4e0d8] p-3 flex flex-col items-center text-center transition-all duration-300 ease-out hover:border-[#e03e3e] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#e03e3e]/10">
                    <span className="rounded-full bg-[#101216] px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white transition-colors duration-200 group-hover:bg-[#e03e3e]">
                      Groupe VTT
                    </span>
                    <div className="mt-1.5 text-sm font-bold text-[#101216]">Sentiers</div>
                    <div className="mt-0.5 text-[0.6875rem] font-medium text-[#5c6370]">Bois &amp; Campagne</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-[#5c6370] font-medium">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Devise du club : &laquo; On part ensemble, on rentre ensemble &raquo;</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#e4e0d8] mt-6 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href="/le-club"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>En savoir plus sur nos allures</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
                <Link
                  href="/members"
                  className="text-xs text-[#5c6370] hover:text-[#101216] font-medium"
                >
                  Voir les membres du club →
                </Link>
              </div>
            </div>

            {/* Le Carré Vert — dark tonal card */}
            <div className="rounded-lg border border-[#262b38] bg-[#101216] text-white p-6 sm:p-8 flex flex-col justify-between lg:col-span-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-400">
                    <TrophyIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-400/10 text-emerald-400 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] border border-emerald-400/20">
                    Challenge Club
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.015em] text-white">
                    Le Carré Vert
                  </h3>
                  <p className="text-sm text-[#a7adbb] leading-relaxed mt-2">
                    Pointage automatique des présences à chaque sortie du club et calcul du palmarès d&apos;assiduité récompensé à l&apos;Assemblée Générale.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#262b38] mt-6">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Consulter le classement</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Calendrier — paper card */}
            <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between lg:col-span-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-500/10 text-amber-700">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#f2efe9] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#5c6370]">
                    Toute la saison
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216]">
                    Calendrier &amp; Événements
                  </h3>
                  <p className="text-sm text-[#3a3f4a] leading-relaxed mt-2">
                    Sorties locales, brevets extérieurs et randos cyclotouristes. Synchronisation iCal pour vos agendas Apple, Google et Outlook.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#e4e0d8] mt-6">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le calendrier complet</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Équipements — wide paper card with red icon */}
            <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between lg:col-span-7">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e]">
                    <CheckBadgeIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#f2efe9] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#5c6370]">
                    Collection 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.015em] text-[#101216]">
                    Tenues &amp; Équipements
                  </h3>
                  <p className="text-sm text-[#3a3f4a] leading-relaxed mt-2 max-w-[65ch]">
                    Maillots, cuissards, vestes thermiques et accessoires aux couleurs officielles du Club de Blanmont.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#e4e0d8] mt-6">
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
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30">
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
