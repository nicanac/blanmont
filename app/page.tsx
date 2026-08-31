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
 * Landing page – Clean, light, airy athletic hero with spacious photo, metric strip, bento showcase, and news grid.
 */
export default async function Home() {
  const [posts, activePoll] = await Promise.all([
    getBlogPosts(),
    getActiveWeekendPoll(),
  ]);

  return (
    <div className="bg-white">
      {/* ──── Hero Section (Light & Airy) ──── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-100">
        {/* Subtle ambient light glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200/80 px-4 py-1.5 text-xs font-bold text-[#e03e3e] shadow-xs">
            <SparklesIcon className="h-4 w-4 text-amber-500" />
            <span>CC Saint-Martin Blanmont • Fondé en 1978</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Rouler ensemble, partager l&apos;effort &amp; la passion du peloton
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-3xl text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
            Dames, Hommes, Jeunes, Vététistes et vélos électriques :{' '}
            <strong className="text-slate-800 font-semibold">3 groupes de niveau encadrés</strong> au départ de Blanmont chaque weekend dans une ambiance conviviale et sportive.
          </p>

          {/* Action Buttons (Light & Streamlined) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/sondage"
              className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Sondage du Weekend</span>
              {activePoll && (
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[10px] font-black uppercase text-white">
                  Ouvert
                </span>
              )}
            </Link>

            <Link
              href="/le-club"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <span>Découvrir le Club</span>
              <ArrowRightIcon className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/calendrier"
              className="text-xs font-semibold text-slate-500 hover:text-[#e03e3e] px-4 py-3 transition-colors flex items-center gap-1.5"
            >
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Calendrier des Sorties</span>
            </Link>
          </div>
        </div>

        {/* Clean Hero Photo (No awkward overlaps) */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
          <div className="relative overflow-hidden rounded-3xl shadow-xl border border-slate-200/80 bg-slate-900 group">
            <img
              className="aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9] w-full object-cover transition-transform duration-700 group-hover:scale-102"
              src="/images/home-hero.jpg"
              alt="Club de Blanmont – peloton cycliste sur route dans le Brabant wallon"
            />
          </div>

          {/* 4-Pillar Metric Strip */}
          <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-2 sm:pt-0">
              <p className="text-xl sm:text-2xl font-black text-slate-900">3 Groupes</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Allures A (&gt;30), B (25-28), C (&lt;25) &amp; VTT
              </p>
            </div>
            <div className="pt-2 sm:pt-0">
              <p className="text-xl sm:text-2xl font-black text-slate-900">Hebdo</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Sorties Samedi &amp; Dimanche
              </p>
            </div>
            <div className="pt-2 sm:pt-0">
              <p className="text-xl sm:text-2xl font-black text-slate-900">+150</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Traces GPS en accès libre
              </p>
            </div>
            <div className="pt-2 sm:pt-0">
              <p className="text-xl sm:text-2xl font-black text-emerald-600">Carré Vert</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Challenge de fidélité amical
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Bento Showcase : La Vie du Club ──── */}
      <section className="py-16 sm:py-24 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e03e3e]">
              L&apos;Esprit Club de Blanmont
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Une organisation pensée pour tous les cyclistes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Que vous cherchiez l&apos;émulation sportive, le plaisir d&apos;arpenter la région en groupe ou les sentiers VTT, trouvez votre place au sein du peloton.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Sorties & Calendrier */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e] group-hover:scale-110 transition-transform">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    Samedi &amp; Dimanche
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors">
                    Calendrier &amp; Départs
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    Départs réguliers depuis la Place de Blanmont (Chastre) avec synchronisation agenda 1-clic (Apple &amp; Google Calendar) et prévisions météo Open-Meteo.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Consulter le calendrier des sorties</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 2: Sondage Weekend */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-bold">
                    QCM Interactif
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors">
                    Sondage de Présence
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    Indiquez votre jour et votre groupe de niveau avant chaque weekend. Visualisez la liste des coureurs inscrits en temps réel.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/sondage"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Répondre au sondage du weekend</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 3: Catalogue Parcours GPS */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <GlobeAltIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-[11px] font-bold">
                    +150 Circuits
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors">
                    Bibliothèque de Parcours
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    Cartographie interactive, profils d&apos;élévation (m D+), filtres par distance et téléchargement immédiat des fichiers GPX pour compteurs.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/traces"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Explorer les traces GPX</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 4: Les 3 Groupes */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between lg:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-bold">
                    Pour tous les niveaux
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors">
                    3 Groupes d&apos;allure &amp; Section VTT
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    Du groupe A sportif (&gt; 30 km/h) aux groupes B (25-28 km/h) et C (&lt; 25 km/h) encadrés par nos capitaines de route, chacun progresse en sécurité et rentre groupé.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                    <div className="font-bold text-xs text-red-600">Groupe A</div>
                    <div className="text-[11px] text-slate-500 font-medium">&gt; 30 km/h</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                    <div className="font-bold text-xs text-blue-600">Groupe B</div>
                    <div className="text-[11px] text-slate-500 font-medium">25 - 28 km/h</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                    <div className="font-bold text-xs text-emerald-600">Groupe C</div>
                    <div className="text-[11px] text-slate-500 font-medium">&lt; 25 km/h</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                    <div className="font-bold text-xs text-amber-600">VTT</div>
                    <div className="text-[11px] text-slate-500 font-medium">Sentiers &amp; Bois</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/le-club"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Découvrir l&apos;encadrement et les capitaines</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 5: Carré Vert */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
                    <TrophyIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-[11px] font-bold">
                    Fidélité Club
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors">
                    Le Carré Vert
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    Pointage des présences aux sorties du club et calcul du palmarès de fidélité pour l&apos;Assemblée Générale.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le classement de la saison</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
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
