import React from 'react';
import type { Metadata } from 'next';
import {
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { PelotonRoadDiagram, HalfWheelingDiagram } from './SafetyDiagrams';
import SecuriteInteractive from './SecuriteInteractive';
import { SheetHeader } from '../components/carte/SheetHeader';

export const metadata: Metadata = {
  title: 'Sécurité en Peloton & Code 43bis | CC Saint-Martin Blanmont',
  description:
    'Règles de sécurité en peloton, Code de la route belge (Art. 43bis), gestuelle normalisée et protocoles d’urgence du Cyclo Club Saint-Martin Blanmont.',
};

export default function SecuritePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200">
      <SheetHeader
        sheet="Charte de sécurité"
        focus={{ x: 44, y: 56 }}
        title="Sécurité en peloton"
        description="« On part ensemble, on rentre ensemble ». Règles de circulation belge (Art. 43bis), gestuelle officielle du peloton et protocoles d’urgence du Cyclo Club Saint-Martin Blanmont."
        legend={[
          { term: 'Code de la route belge', value: 'Article 43bis', hint: 'Double file dès 15 · Capitaines C3' },
          { term: 'Groupes encadrés', value: '15 à 50 cyclistes' },
          { term: 'Urgence', value: '112', hint: 'Secours d’urgence & fiche ICE' },
        ]}
        actions={
          <a
            href="#urgence"
            className="inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-colors hover:bg-brand-strong"
          >
            <PhoneIcon className="size-4" aria-hidden="true" />
            <span>Protocole d&apos;urgence (112)</span>
          </a>
        }
      />

      {/* ──── Sticky Jump Navigator Bar ──── */}
      <nav
        aria-label="Sommaire de la charte"
        className="sticky top-16 z-30 bg-white/95 dark:bg-night/95 backdrop-blur-md border-b border-line dark:border-night-line py-2.5 px-4 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-ink-3 text-xs font-semibold uppercase tracking-wider shrink-0 mr-1">
            Aller à :
          </span>
          <a
            href="#art43bis"
            className="px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line font-semibold text-ink dark:text-snow hover:border-brand shrink-0 transition-colors"
          >
            Code Art. 43bis
          </a>
          <a
            href="#demi-roue"
            className="px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line font-semibold text-ink dark:text-snow hover:border-brand shrink-0 transition-colors"
          >
            Roue Croisée
          </a>
          <a
            href="#signaux"
            className="px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line font-semibold text-ink dark:text-snow hover:border-brand shrink-0 transition-colors"
          >
            Signaux
          </a>
          <a
            href="#relais"
            className="px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line font-semibold text-ink dark:text-snow hover:border-brand shrink-0 transition-colors"
          >
            Relais
          </a>
          <a
            href="#urgence"
            className="px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line font-semibold text-ink dark:text-snow hover:border-brand shrink-0 transition-colors"
          >
            Urgence 112
          </a>
          <a
            href="#materiel"
            className="px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-paper dark:bg-night-2 border border-line dark:border-night-line font-semibold text-ink dark:text-snow hover:border-brand shrink-0 transition-colors"
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
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
                  L&apos;Article 43bis du Code Belge
                </h2>
                <p className="text-xs sm:text-sm text-ink-3 dark:text-snow-3 leading-relaxed">
                  L&apos;Arrêté Royal du 1er décembre 1975 confère au groupe cycliste un statut spécifique qui
                  protège l&apos;allure collective tout en encadrant ses devoirs sur la chaussée.
                </p>
              </div>

              {/* Clean Typographic Clauses Divided by Hairlines */}
              <div className="divide-y divide-line dark:divide-night-line border-t border-b border-line dark:border-night-line">
                {/* Clause 1 */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      Seuil de 15 coureurs &amp; Dispense de piste cyclable
                    </h3>
                    <span className="text-xs font-semibold text-brand">§1</span>
                  </div>
                  <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                    Dès <strong>15 participants</strong>, le peloton n&apos;est plus tenu d&apos;emprunter les pistes
                    cyclables inadaptées à un roulage à 28–34 km/h. Sous 15 coureurs, le groupe applique les règles
                    individuelles (piste obligatoire, file indienne si dépassement).
                  </p>
                </div>

                {/* Clause 2 */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      Deux de front permanents sur la voie de droite
                    </h3>
                    <span className="text-xs font-semibold text-brand">§2</span>
                  </div>
                  <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                    Le peloton roule en <strong>double file permanente</strong>. Règle absolue : occuper strictement
                    la moitié droite de la chaussée et <strong>ne jamais franchir la ligne médiane</strong>.
                  </p>
                </div>

                {/* Clause 3 */}
                <div className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      Capitaines de route assermentés &amp; Disque C3
                    </h3>
                    <span className="text-xs font-semibold text-brand">§3</span>
                  </div>
                  <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
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
        <section id="materiel" className="space-y-6 pt-8 border-t border-line dark:border-night-line scroll-mt-28">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              Checklist Matériel au Départ
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 dark:text-snow-3">
              Une défaillance mécanique met en jeu la sécurité de tout le peloton. Les 3 vérifications indispensables :
            </p>
          </div>

          {/* 3-Column Editorial Grid (No Box-in-a-Box Bloat) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Column 1: Atelier */}
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2 border-b border-paper-2 dark:border-white/10">
                <WrenchScrewdriverIcon className="h-4 w-4 text-brand" />
                <h3 className="font-bold text-sm text-ink dark:text-white">
                  Atelier (Avant le départ)
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-ink-3 dark:text-snow-3">
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Pression pneus 28–30 mm</strong> : 4.5–5.5 b (chambre) / 3.5–4.5 b (tubeless).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Freinage</strong> : usure des patins/plaquettes et course ferme.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Axes traversants</strong> : serrage ferme vérifié au départ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Transmission</strong> : chaîne lubrifiée, zéro saut sous l&apos;effort.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Sacoche */}
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2 border-b border-paper-2 dark:border-white/10">
                <CheckBadgeIcon className="h-4 w-4 text-brand" />
                <h3 className="font-bold text-sm text-ink dark:text-white">
                  Sacoche (Autonomie)
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-ink-3 dark:text-snow-3">
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>1 à 2 chambres à air</strong> adaptées à la hauteur de vos jantes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Démonte-pneus</strong> + mini-pompe ou 2 cartouches CO2.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Multi-tool</strong> avec dérive-chaîne et maillon rapide compatible.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Mèches tubeless</strong> pour montage sans chambre.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Sur le cycliste */}
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2 border-b border-paper-2 dark:border-white/10">
                <ShieldCheckIcon className="h-4 w-4 text-brand" />
                <h3 className="font-bold text-sm text-ink dark:text-white">
                  Sur le Cycliste
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-ink-3 dark:text-snow-3">
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Casque EN 1078</strong> jugulaire verrouillée sans jeu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>Éclairage rouge arrière</strong> activé par temps sombre ou brume.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
                  <span><strong>GSM chargé à 100%</strong> avec fiche ICE à jour dans l&apos;app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand font-bold shrink-0">•</span>
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
