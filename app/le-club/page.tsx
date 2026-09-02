import Image from 'next/image';
import Link from 'next/link';
import {
  UserGroupIcon,
  MapPinIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  HeartIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function LeClubPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          {/* Title row */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              L&apos;Esprit du <span className="text-[#e03e3e] italic">Peloton</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              « On part ensemble, on rentre ensemble ». Un club cyclo convivial fondé sur le plaisir de rouler en groupe, le respect des allures et l&apos;entraide sur les routes du Brabant wallon.
            </p>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-6">
            {/* 4 Groups */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0">
                <UserGroupIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  4 allures
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Groupes A, B, C &amp; VTT
                </div>
              </div>
            </div>

            {/* Departure */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <MapPinIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Place de Blanmont
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Samedi 8h30 · Dimanche 9h00
                </div>
              </div>
            </div>

            {/* Trial */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <HeartIcon className="h-5 w-5 text-[#3b82f6]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Essai libre
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Sans engagement
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Main Content Spread (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e03e3e]">
            <SparklesIcon className="h-4 w-4" />
            <span>Nos 4 Groupes de Niveau</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#101216]">
            Trouvez le peloton qui correspond à votre rythme
          </h2>
          <p className="text-sm text-[#5c6370] leading-relaxed">
            Chaque groupe est encadré par des capitaines de route expérimentés qui veillent à la sécurité, à l&apos;allure et à la bonne humeur générale.
          </p>
        </div>

        {/* 4 Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Groupe A */}
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-[#e03e3e]/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e] font-extrabold text-sm">
                    A
                  </span>
                  <h3 className="text-xl font-bold text-[#101216]">Le groupe des A</h3>
                </div>
                <span className="rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-xs font-bold tabular-nums">
                  &gt; 30 km/h
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#3a3f4a] leading-relaxed">
                Groupe dynamique et sportif. Allure soutenue, sorties rythmées et participation fréquente aux randos et classiques extérieures. Traces GPS envoyées à l&apos;avance via le groupe WhatsApp.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e4e0d8] flex items-center justify-between text-xs text-[#7d8493]">
              <span>Capitaines : Lucien &amp; Laurent</span>
              <span className="font-semibold text-[#101216]">Traces GPS</span>
            </div>
          </div>

          {/* Groupe B */}
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-sky-400/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 font-extrabold text-sm">
                    B
                  </span>
                  <h3 className="text-xl font-bold text-[#101216]">Le groupe des B</h3>
                </div>
                <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 text-xs font-bold tabular-nums">
                  25 – 28 km/h
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#3a3f4a] leading-relaxed">
                Le cœur du peloton de Blanmont. Circuits équilibrés et variés évitant les grands axes, départs vent de face pour un retour fluide et groupé. Esprit d&apos;équipe garanti.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e4e0d8] flex items-center justify-between text-xs text-[#7d8493]">
              <span>Capitaines : Dany, Philippe &amp; René</span>
              <span className="font-semibold text-[#101216]">Circuits variés</span>
            </div>
          </div>

          {/* Groupe C */}
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-emerald-400/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 font-extrabold text-sm">
                    C
                  </span>
                  <h3 className="text-xl font-bold text-[#101216]">Le groupe des C</h3>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold tabular-nums">
                  &lt; 25 km/h
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#3a3f4a] leading-relaxed">
                Allure modérée idéale pour progresser, reprendre le vélo ou rouler sans pression de chrono. Tout le monde s&apos;attend, avec l&apos;objectif de franchir le cap des 100 km en cours de saison.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e4e0d8] flex items-center justify-between text-xs text-[#7d8493]">
              <span>Capitaines : Les 2 Joël &amp; Michel</span>
              <span className="font-semibold text-[#101216]">Accessible à tous</span>
            </div>
          </div>

          {/* Groupe VTT */}
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-amber-400/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 font-extrabold text-sm">
                    VTT
                  </span>
                  <h3 className="text-xl font-bold text-[#101216]">Le groupe des VTT</h3>
                </div>
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-bold">
                  Sentiers &amp; Bois
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#3a3f4a] leading-relaxed">
                Exploration des chemins de terre, sous-bois et bosses de la région. Regroupement systématique au sommet des côtes et entraide technique sur les passages délicats.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e4e0d8] flex items-center justify-between text-xs text-[#7d8493]">
              <span>Capitaines : Nicolas, Pascal &amp; Jean</span>
              <span className="font-semibold text-[#101216]">Chemins &amp; Nature</span>
            </div>
          </div>
        </div>

        {/* ──── Photo Bento Grid ──── */}
        <div className="space-y-4 pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#101216]">La Vie du Club en Images</h3>
            <span className="text-xs font-semibold text-[#7d8493]">Sorties &amp; Convivialité</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#e4e0d8] bg-[#161922]">
              <Image
                src="/images/home-hero.jpg"
                alt="Peloton sur la route"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#e4e0d8] bg-[#161922]">
              <Image
                src="/images/IMG_8019.JPG"
                alt="Sortie VTT"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#e4e0d8] bg-[#161922]">
              <Image
                src="/images/IMG_5777.JPG"
                alt="Groupe de cyclistes"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#e4e0d8] bg-[#161922]">
              <Image
                src="/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg"
                alt="Ambiance club"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* ──── Join Club CTA Cover ──── */}
        <div className="rounded-lg border border-[#262b38] bg-[#101216] text-white p-8 sm:p-12 relative overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-3 max-w-2xl relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Prêt à rouler avec nous ?
            </h3>
            <p className="text-sm text-[#a7adbb] leading-relaxed">
              Venez nous rejoindre un samedi ou un dimanche matin sur la Place de Blanmont. Vous pouvez tester 1 ou 2 sorties librement avant toute décision d&apos;adhésion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <a
              href="mailto:info@blanmont.be?subject=Demande%20d'adh%C3%A9sion%20au%20Club%20de%20Blanmont&body=Bonjour,%0A%0AJe%20souhaite%20rejoindre%20le%20club%20ou%20faire%20une%20sortie%20d'essai.%0A%0ANom%20et%20pr%C3%A9nom%20:%0AT%C3%A9l%C3%A9phone%20:%0AGroupe%20souhait%C3%A9%20(A,%20B,%20C,%20VTT)%20:%0A%0AMerci%20!"
              className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
            >
              <EnvelopeIcon className="h-4 w-4" />
              <span>Contacter le club</span>
            </a>
            <Link
              href="/calendrier"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Voir le calendrier</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
