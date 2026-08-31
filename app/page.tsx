import Link from 'next/link';
import {
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { PageHero } from './components/ui/PageHero';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts, getActiveWeekendPoll } from './lib/firebase';

/**
 * Landing page – Centred athletic hero with stat overlay, bento pillars showcase, and news grid.
 */
export default async function Home() {
  const [posts, activePoll] = await Promise.all([
    getBlogPosts(),
    getActiveWeekendPoll(),
  ]);

  return (
    <div className="bg-white">
      {/* ──── Hero Section ──── */}
      <div className="relative isolate">
        <PageHero
          title="Rouler ensemble, partager l'effort & la passion du peloton"
          description={
            <span>
              Dames, Hommes, Jeunes, Vététistes et vélos électriques :{' '}
              <span className="font-semibold text-white underline decoration-yellow-400 decoration-2 underline-offset-4">
                3 groupes de niveau encadrés
              </span>{' '}
              au départ de Blanmont chaque weekend dans une ambiance chaleureuse et sportive.
            </span>
          }
          badge="CC Saint-Martin Blanmont • Fondé en 1978"
          badgeIcon={<SparklesIcon className="h-4 w-4 text-yellow-400" />}
          variant="red"
          size="lg"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/traces"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-red-600 shadow-lg hover:bg-red-50 hover:scale-105 active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <GlobeAltIcon className="h-5 w-5 text-[#e03e3e]" />
              <span>Explorer les Parcours GPS</span>
            </Link>

            <Link
              href="/sondage"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-xs px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-red-700 transition-all active:scale-95"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Sondage du Weekend</span>
              {activePoll && (
                <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950">
                  Ouvert
                </span>
              )}
            </Link>

            <Link
              href="/le-club"
              className="text-sm font-semibold leading-6 text-white hover:text-red-100 px-3 py-2 transition-colors"
            >
              Découvrir le Club <span aria-hidden="true">→</span>
            </Link>
          </div>
          {/* Bottom spacing to accommodate hero image overlap */}
          <div className="h-24 sm:h-36" aria-hidden="true" />
        </PageHero>

        {/* Hero image + floating athletic stat bar */}
        <div className="relative mx-auto -mt-40 max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-gray-900/10 hover:shadow-3xl transition-shadow">
            <img
              className="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[16/7]"
              src="/images/home-hero.jpg"
              alt="Club de Blanmont – peloton cycliste sur route dans le Brabant wallon"
            />
          </div>

          {/* Desktop Single stat bar – overlaps image bottom */}
          <div className="absolute inset-x-0 -bottom-12 hidden justify-center sm:flex">
            <div className="inline-flex divide-x divide-slate-100 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 border border-slate-100">
              {[
                { value: '3 Groupes', label: 'Allures A (>30), B (25-28), C (<25) & VTT' },
                { value: 'Hebdo', label: 'Sorties encadrées Samedi & Dimanche' },
                { value: '+150', label: 'Traces GPS & Dénivelés en accès libre' },
                { value: 'Carré Vert', label: 'Challenge de fidélité amical annuel' },
              ].map((s) => (
                <div key={s.value} className="px-8 py-5 text-center">
                  <p className="text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile stat bar – stacked below the image */}
        <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3 px-4 sm:hidden">
          {[
            { value: '3 Groupes', label: 'A (>30), B, C & VTT' },
            { value: 'Hebdo', label: 'Samedi & Dimanche' },
            { value: '+150', label: 'Traces GPS en libre accès' },
            { value: 'Carré Vert', label: 'Challenge fidélité club' },
          ].map((s) => (
            <div
              key={s.value}
              className="rounded-2xl bg-white p-4 text-center shadow-md ring-1 ring-slate-900/5 border border-slate-100"
            >
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Spacer for the overlapping stat bar (desktop only) */}
        <div className="h-20 hidden sm:block" aria-hidden="true" />
      </div>

      {/* ──── Bento Showcase : La Vie du Club ──── */}
      <section className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e03e3e]">
              L&apos;Esprit Club de Blanmont
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Une organisation pensée pour tous les cyclistes
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Que vous cherchiez l&apos;émulation sportive, le plaisir d&apos;arpenter la région en groupe ou les sentiers VTT, trouvez votre place au sein du peloton.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Sorties & Calendrier */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
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
            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
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
            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
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
            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between lg:col-span-2">
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
            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-xs hover:border-red-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
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
