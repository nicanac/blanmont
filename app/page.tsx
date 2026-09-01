import Link from 'next/link';
import {
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts, getActiveWeekendPoll } from './lib/firebase';

/**
 * Landing page – Clean, quiet, and refined athletic home page.
 */
export default async function Home() {
  const [posts, activePoll] = await Promise.all([
    getBlogPosts(),
    getActiveWeekendPoll(),
  ]);

  return (
    <div className="bg-white">
      {/* ──── Hero Section (Quiet & Refined) ──── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-100">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
            <SparklesIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>CC Saint-Martin Blanmont • Fondé en 1978</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight text-balance">
            Rouler ensemble, partager l&apos;effort &amp; la passion du peloton
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
            Dames, Hommes, Jeunes, Vététistes et vélos électriques :{' '}
            <span className="font-semibold text-slate-800">3 groupes de niveau encadrés</span> au départ de Blanmont chaque weekend dans une ambiance conviviale et sportive.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/sondage"
              className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-98"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Sondage du Weekend</span>
              {activePoll && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white leading-none">
                  Ouvert
                </span>
              )}
            </Link>

            <Link
              href="/le-club"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 text-sm font-medium shadow-2xs transition-all active:scale-98"
            >
              <span>Découvrir le Club</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <Link
              href="/calendrier"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors flex items-center gap-1.5"
            >
              <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
              <span>Calendrier des Sorties</span>
            </Link>
          </div>
        </div>

        {/* Clean Hero Photo */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/70 bg-slate-900 group">
            <img
              className="aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9] w-full object-cover transition-transform duration-700 group-hover:scale-101"
              src="/images/home-hero.jpg"
              alt="Club de Blanmont – peloton cycliste sur route dans le Brabant wallon"
            />
          </div>

          {/* 4-Pillar Metric Strip (Calm & Clean) */}
          <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-2xs grid grid-cols-2 lg:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-2 sm:pt-0">
              <p className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">3 Groupes</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Allures A, B, C &amp; VTT
              </p>
            </div>
            <div className="pt-2 sm:pt-0">
              <p className="text-lg sm:text-xl font-bold text-slate-900">Hebdo</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Samedi &amp; Dimanche
              </p>
            </div>
            <div className="pt-2 sm:pt-0">
              <p className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">+150</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Traces GPX en accès libre
              </p>
            </div>
            <div className="pt-2 sm:pt-0">
              <p className="text-lg sm:text-xl font-bold text-emerald-700">Carré Vert</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Challenge de fidélité club
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Bento Showcase : La Vie du Club ──── */}
      <section className="py-16 sm:py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Organisation &amp; Convivialité
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              La vie du Club de Blanmont
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Une structure conviviale pensée pour que chaque cycliste prenne du plaisir à son propre rythme.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Sorties & Calendrier */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Samedi &amp; Dimanche
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Calendrier &amp; Rendez-vous
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    Départs réguliers depuis la Place de Blanmont avec météo en direct et synchronisation agenda (Apple, Google &amp; Outlook).
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le calendrier</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 2: Sondage Weekend */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-xs font-medium border border-emerald-200/60">
                    QCM Interactif
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sondage de Présence
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    Indiquez vos disponibilités et votre groupe de niveau avant chaque weekend pour faciliter l&apos;organisation des pelotons.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/sondage"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Répondre au sondage</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 3: Catalogue Parcours GPS */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <GlobeAltIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
                    +150 Circuits
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Parcours &amp; Traces GPS
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    Cartographie, profils altimétriques et téléchargement direct des fichiers GPX pour compteurs Garmin, Wahoo &amp; Strava.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/traces"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Explorer les traces</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 4: Les 3 Groupes */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between lg:col-span-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <UserGroupIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    3 Allures &amp; VTT
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Groupes de niveau encadrés
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    Du groupe A sportif (&gt;&nbsp;30&nbsp;km/h) aux groupes B (25-28&nbsp;km/h) et C (&lt;&nbsp;25&nbsp;km/h), chaque peloton est encadré par des capitaines de route bienveillants.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                    <div className="font-semibold text-xs text-slate-900">Groupe A</div>
                    <div className="text-xs text-slate-500 tabular-nums">&gt;&nbsp;30&nbsp;km/h</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                    <div className="font-semibold text-xs text-slate-900">Groupe B</div>
                    <div className="text-xs text-slate-500 tabular-nums">25 - 28&nbsp;km/h</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                    <div className="font-semibold text-xs text-slate-900">Groupe C</div>
                    <div className="text-xs text-slate-500 tabular-nums">&lt;&nbsp;25&nbsp;km/h</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                    <div className="font-semibold text-xs text-slate-900">VTT</div>
                    <div className="text-xs text-slate-500">Sentiers &amp; Bois</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/le-club"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>En savoir plus sur nos groupes</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Card 5: Carré Vert */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <TrophyIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Fidélité Club
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Le Carré Vert
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    Pointage des présences aux sorties du club et calcul du palmarès de fidélité pour l&apos;Assemblée Générale.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le classement</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── News & Blog Section ──── */}
      <HomeBlogSection posts={posts} />
    </div>
  );
}
