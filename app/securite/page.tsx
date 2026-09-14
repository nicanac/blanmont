import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  PhoneIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { PelotonRoadDiagram, HalfWheelingDiagram } from './SafetyDiagrams';
import SecuriteInteractive from './SecuriteInteractive';

export const metadata: Metadata = {
  title: 'Charte de Sécurité & Code 43bis | CC Saint-Martin Blanmont',
  description:
    'Règles de sécurité en peloton, Code de la route belge (Art. 43bis), gestuelle normalisée et protocoles d’urgence du Cyclo Club Saint-Martin Blanmont.',
};

export default function SecuritePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200">
      {/* ──── Editorial Masthead Hero ──── */}
      <section className="relative overflow-hidden border-b border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#0a0c10]">
        {/* Subtle architectural background watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03] dark:opacity-[0.02] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,26rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            CHARTE 43BIS
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:px-8 z-10 space-y-8">
          <div className="space-y-3 max-w-3xl pb-8 border-b border-[#e4e0d8] dark:border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#7d8493] block">
              Directives FFBC · Arrêté Royal du 1er décembre 1975 · Matricule FFBC 4128
            </span>

            <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-[#101216] dark:text-white">
              Charte de Sécurité <span className="text-[#e03e3e] italic">&amp; Esprit du Peloton</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              « On part ensemble, on rentre ensemble ». Le plaisir d&apos;évoluer en groupe compact à 30 km/h
              repose sur une discipline collective sans faille, le respect scrupuleux du Code de la route belge
              et une anticipation permanente de chaque coureur.
            </p>
          </div>

          {/* Cycling Metrics / Regulatory Stat Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-2">
            <div className="py-3 lg:py-0 lg:px-6 first:lg:pl-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tracking-tight tabular-nums">
                15 à 50
              </div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold mt-0.5">
                Coureurs en peloton légal
              </div>
            </div>

            <div className="py-3 lg:py-0 lg:px-6">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tracking-tight tabular-nums">
                2 de Front
              </div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold mt-0.5">
                Formation autorisée sur chaussée
              </div>
            </div>

            <div className="py-3 lg:py-0 lg:px-6">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#e03e3e] tracking-tight tabular-nums">
                100%
              </div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold mt-0.5">
                Casque rigide obligatoire
              </div>
            </div>

            <div className="py-3 lg:py-0 lg:px-6 last:lg:pr-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tracking-tight tabular-nums">
                Disque C3
              </div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold mt-0.5">
                Capitaines de route assermentés
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
          <span className="text-[#7d8493] font-mono text-[10px] uppercase tracking-wider shrink-0 mr-1">
            Accès rapide :
          </span>
          <a
            href="#art43bis"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Code Belge Art. 43bis
          </a>
          <a
            href="#demi-roue"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Piège du Demi-Roue
          </a>
          <a
            href="#signaux"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Signaux &amp; Vocabulaire
          </a>
          <a
            href="#relais"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Technique du Relais
          </a>
          <a
            href="#urgence"
            className="px-3 py-1.5 rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] font-semibold text-[#101216] dark:text-[#f5f6f8] hover:border-[#e03e3e] shrink-0 transition-colors"
          >
            Protocole Urgence 112
          </a>
        </div>
      </nav>

      {/* ──── Main Editorial Content ──── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-16">
        {/* ──── Section 1 : Cadre Légal (Article 43bis) ──── */}
        <section id="art43bis" className="space-y-8 scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col (7 cols): Legal Foundations */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
                  L&apos;Article 43bis du Code de la Route Belge
                </h2>
                <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                  En Belgique, un peloton de cyclistes amateurs ne relève pas des règles générales applicables
                  au cycliste isolé. L&apos;Arrêté Royal du 1er décembre 1975 confère au groupe cycliste un
                  statut spécifique pour garantir sa sécurité et sa fluidité sur la voie publique.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Clause 1 */}
                <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101216] dark:text-white">
                      1. Dispense des Pistes Cyclables Inadaptées
                    </span>
                    <span className="text-[11px] font-mono text-[#7d8493]">Art. 43bis §1</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Les groupes de <strong>15 à 50 cyclistes</strong> ne sont pas tenus d&apos;emprunter les pistes
                    cyclables dès lors que leur gabarit, l&apos;état du revêtement ou la présence de piétons/mobiliers
                    urbains compromettraient la sécurité d&apos;un peloton roulant à 28–34 km/h. Le peloton emprunte
                    légitimement la chaussée.
                  </p>
                </div>

                {/* Clause 2 */}
                <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101216] dark:text-white">
                      2. Roulage Permanent à Deux de Front
                    </span>
                    <span className="text-[11px] font-mono text-[#7d8493]">Art. 43bis §2</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Le peloton a le droit de rouler en <strong>double file permanente</strong>. La condition légale
                    impérative est de demeurer exclusivement sur la bande de circulation de droite et de ne
                    <strong> jamais empiéter sur la voie de sens inverse</strong>, quelle que soit la largeur de la route.
                  </p>
                </div>

                {/* Clause 3 */}
                <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101216] dark:text-white">
                      3. Capitaines de Route &amp; Signal C3
                    </span>
                    <span className="text-[11px] font-mono text-[#7d8493]">Art. 43bis §3</span>
                  </div>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                    Les groupes peuvent être encadrés par des capitaines de route assermentés portant le brassard
                    tricolore. Aux carrefours dépourvus de feux de signalisation, ils peuvent déployer le
                    <strong> disque C3 (Accès interdit dans les deux sens)</strong> pour neutraliser la priorité et
                    permettre au peloton de franchir l&apos;intersection en un seul bloc sans scission.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col (5 cols): Technical Architecture Diagram */}
            <div className="lg:col-span-5">
              <PelotonRoadDiagram />
            </div>
          </div>
        </section>

        {/* ──── Section 2 : Règle Fondamentale du Demi-Roue ──── */}
        <section id="demi-roue" className="scroll-mt-28">
          <HalfWheelingDiagram />
        </section>

        {/* ──── Section 3 : Interactive Console (Signaux, Paceline, Urgence) ──── */}
        <SecuriteInteractive />

        {/* ──── Section 4 : Checklist Vélo & Matériel Requis ──── */}
        <section className="space-y-6 pt-8 border-t border-[#e4e0d8] dark:border-[#262b38]">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
              Checklist Vélo &amp; Ravitaillement
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Sur les routes de campagne brabançonnes, les pavés de Villers ou les montées rugueuses de Mont-Saint-Guibert,
              une défaillance mécanique met en péril l&apos;ensemble du groupe. Voici ce qui est exigé au départ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Transmission & Pneus */}
            <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e]">
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white">
                  Transmission &amp; Pneus
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Pression contrôlée</strong> : 6.5–7.5 bars en chambre, 4.5–5.5 bars en tubeless.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Plaquettes / Patins</strong> : vérification d&apos;usure minimale sans contact jante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Axes traversants serrés</strong> au couple préconisé avant le départ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Chaîne dégraissée et huilée</strong> pour éviter tout saut de vitesse en côte.</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Kit de Dépannage */}
            <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e]">
                  <CheckBadgeIcon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white">
                  Sacoche de Selle Obligatoire
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>2 chambres à air</strong> de dimension et longueur de valve adaptées à vos jantes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>2 démonte-pneus</strong> robustes et pompe ou 2 cartouches de CO2 avec percuteur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Multi-tool complet</strong> équipé d&apos;un dérive-chaîne et d&apos;un maillon rapide.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Mèches tubeless</strong> si montage sans chambre.</span>
                </li>
              </ul>
            </div>

            {/* Box 3: Équipement Individuel */}
            <div className="rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e]">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white">
                  Sécurité Individuelle
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Casque homologué EN 1078</strong> attaché en permanence sans jeu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Éclairage rouge arrière</strong> clignotant ou fixe par temps couvert ou brume.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>Smartphone chargé à 100%</strong> avec numéro d&apos;urgence ICE préenregistré.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#e03e3e] font-bold shrink-0">•</span>
                  <span><strong>2 bidons d&apos;eau + nutrition</strong> (minimum 1 bidon/heure de roulage).</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
