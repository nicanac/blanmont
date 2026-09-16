import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  PhoneIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { PelotonRoadDiagram, HalfWheelingDiagram } from './SafetyDiagrams';
import SecuriteInteractive from './SecuriteInteractive';

export const metadata: Metadata = {
  title: 'Sécurité en Peloton & Code 43bis | CC Saint-Martin Blanmont',
  description:
    'Règles de sécurité en peloton, Code de la route belge (Art. 43bis), gestuelle normalisée et protocoles d’urgence du Cyclo Club Saint-Martin Blanmont.',
};

export default function SecuritePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200">
      {/* ──── Editorial Cover Hero (Adaptive Light / Dark) ──── */}
      <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          {/* Top row: Title + Action CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-[#e4e0d8] dark:border-white/10">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] dark:text-white text-balance">
                Sécurité en <span className="text-[#e03e3e] italic">Peloton</span>
              </h1>

              <p className="max-w-2xl text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                « On part ensemble, on rentre ensemble ». Règles de circulation belge (Art. 43bis), gestuelle officielle du peloton et protocoles d&apos;urgence du Cyclo Club Saint-Martin Blanmont.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="#urgence"
                className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white font-semibold uppercase tracking-[0.06em] text-[0.8125rem] px-6 py-3 transition-colors shadow-md active:scale-98"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Protocole d&apos;Urgence (112)</span>
              </a>
            </div>
          </div>

          {/* Stat Strip (Editorial Unified Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-6">
            {/* Regulatory highlight */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                <ShieldCheckIcon className="h-5 w-5 text-[#e03e3e]" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#e03e3e]">
                  Code de la route belge
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl sm:text-2xl font-extrabold text-[#101216] dark:text-white tracking-tight truncate">
                    Article 43bis
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse shrink-0" title="Cadre légal en vigueur" />
                </div>
                <div className="text-xs uppercase tracking-[0.06em] text-[#5c6370] dark:text-[#a7adbb] font-semibold truncate tabular-nums">
                  Double file dès 15 · Capitaines C3
                </div>
              </div>
            </div>

            {/* Peloton scale */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                <UsersIcon className="h-5 w-5 text-[#101216] dark:text-white" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  15 à 50
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Cyclistes par groupe encadré
                </div>
              </div>
            </div>

            {/* Emergency & ICE */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                <PhoneIcon className="h-5 w-5 text-[#101216] dark:text-white" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  112
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Secours d&apos;urgence &amp; fiche ICE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Sticky Jump Navigator Bar ──── */}
      <nav
        aria-label="Sommaire de la charte"
        className="sticky top-16 z-30 bg-white/95 dark:bg-[#0a0c10]/95 backdrop-blur-md border-b border-[#e4e0d8] dark:border-[#262b38] py-2.5 px-4 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[#5c6370] text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
            Aller à :
          </span>
          <a
            href="#art43bis"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Code Art. 43bis
          </a>
          <a
            href="#demi-roue"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Roue Croisée
          </a>
          <a
            href="#signaux"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Signaux
          </a>
          <a
            href="#relais"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Relais
          </a>
          <a
            href="#urgence"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Urgence 112
          </a>
          <a
            href="#materiel"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Checklist
          </a>
        </div>
      </nav>

      {/* ──── Main Editorial Content ──── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-16">
        {/* ──── Section 1 : Cadre Légal (Article 43bis) ──── */}
        <section id="art43bis" className="space-y-8 scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col (7 cols): Linear Editorial Clauses (No Nested Cards) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
                  L&apos;Article 43bis du Code Belge
                </h2>
                <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                  L&apos;Arrêté Royal du 1er décembre 1975 confère au groupe cycliste un statut spécifique qui
                  protège l&apos;allure collective tout en encadrant ses devoirs sur la chaussée.
                </p>
              </div>

              {/* Clean Typographic Clauses Divided by Hairlines */}
              <div className="divide-y divide-[#e4e0d8] dark:divide-[#262b38] border-t border-b border-[#e4e0d8] dark:border-[#262b38]">
                {/* Clause 1 */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#101216] dark:text-white">
                      Seuil de 15 coureurs &amp; Dispense de piste cyclable
                    </h3>
                    <span className="text-[11px] font-semibold text-[#e03e3e]">§1</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Dès <strong>15 participants</strong>, le peloton n&apos;est plus tenu d&apos;emprunter les pistes
                    cyclables inadaptées à un roulage à 28–34 km/h. Sous 15 coureurs, le groupe applique les règles
                    individuelles (piste obligatoire, file indienne si dépassement).
                  </p>
                </div>

                {/* Clause 2 */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#101216] dark:text-white">
                      Deux de front permanents sur la voie de droite
                    </h3>
                    <span className="text-[11px] font-semibold text-[#e03e3e]">§2</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Le peloton roule en <strong>double file permanente</strong>. Règle absolue : occuper strictement
                    la moitié droite de la chaussée et <strong>ne jamais franchir la ligne médiane</strong>.
                  </p>
                </div>

                {/* Clause 3 */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#101216] dark:text-white">
                      Capitaines de route assermentés &amp; Disque C3
                    </h3>
                    <span className="text-[11px] font-semibold text-[#e03e3e]">§3</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Deux capitaines de route minimum équipés du brassard tricolore encadrent le groupe.
                    Aux carrefours sans feux, ils déploient le <strong>disque C3</strong> pour neutraliser la priorité
                    et faire passer le peloton en un bloc compact.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col (5 cols): Clean Tactical Diagram */}
            <div className="lg:col-span-5">
              <PelotonRoadDiagram />
            </div>
          </div>
        </section>

        {/* ──── Section 2 : Règle Fondamentale de la Roue Croisée ──── */}
        <section id="demi-roue" className="scroll-mt-28">
          <HalfWheelingDiagram />
        </section>

        {/* ──── Section 3 : Interactive Console (Signaux, Paceline, Urgence) ──── */}
        <SecuriteInteractive />

        {/* ──── Section 4 : Checklist Vélo & Matériel Requis ──── */}
        <section id="materiel" className="space-y-6 pt-8 border-t border-[#e4e0d8] dark:border-[#262b38] scroll-mt-28">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
              Checklist Matériel au Départ
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb]">
              Une défaillance mécanique met en jeu la sécurité de tout le peloton. Les 3 vérifications indispensables :
            </p>
          </div>

          {/* 3-Column Editorial Grid (No Box-in-a-Box Bloat) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Column 1: Atelier */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#efece5] dark:border-white/10">
                <WrenchScrewdriverIcon className="h-4 w-4 text-[#e03e3e]" />
                <h3 className="font-bold text-sm text-[#101216] dark:text-white">
                  Atelier (Avant le départ)
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Pression pneus 28–30 mm</strong> : 4.5–5.5 b (chambre) / 3.5–4.5 b (tubeless).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Freinage</strong> : usure des patins/plaquettes et course ferme.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Axes traversants</strong> : serrage ferme vérifié au départ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Transmission</strong> : chaîne lubrifiée, zéro saut sous l&apos;effort.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Sacoche */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#efece5] dark:border-white/10">
                <CheckBadgeIcon className="h-4 w-4 text-[#e03e3e]" />
                <h3 className="font-bold text-sm text-[#101216] dark:text-white">
                  Sacoche (Autonomie)
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>1 à 2 chambres à air</strong> adaptées à la hauteur de vos jantes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Démonte-pneus</strong> + mini-pompe ou 2 cartouches CO2.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Multi-tool</strong> avec dérive-chaîne et maillon rapide compatible.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Mèches tubeless</strong> pour montage sans chambre.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Sur le cycliste */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#efece5] dark:border-white/10">
                <ShieldCheckIcon className="h-4 w-4 text-[#e03e3e]" />
                <h3 className="font-bold text-sm text-[#101216] dark:text-white">
                  Sur le Cycliste
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Casque EN 1078</strong> jugulaire verrouillée sans jeu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Éclairage rouge arrière</strong> activé par temps sombre ou brume.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>GSM chargé à 100%</strong> avec fiche ICE à jour dans l&apos;app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>2 bidons + ravitaillement</strong> (1 bidon et 1 barre par heure).</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
