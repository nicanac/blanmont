'use client';

import React, { useState } from 'react';
import {
  PaintBrushIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import AdminPageHeader from '../components/AdminPageHeader';
import SettingsTutorialModal from './components/SettingsTutorialModal';
import { useAdminTours } from '../components/tours/adminTours';

export default function AdminSettingsPage(): React.ReactElement {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { startSettingsTour } = useAdminTours();

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.success(
      newTheme === 'light'
        ? 'Mode Clair activé avec succès !'
        : newTheme === 'dark'
        ? 'Mode Sombre activé avec succès !'
        : 'Mode Système activé (synchronisé avec votre appareil) !'
    );
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <AdminPageHeader
        id="settings-header-section"
        title="Paramètres du Site & du Club"
        sheet="Feuille · Configuration"
        badge={{ icon: Cog6ToothIcon, label: 'Administration · Configuration' }}
        description="Gérez l'apparence visuelle globale du site (thème clair ou sombre) et consultez les paramètres officiels du CC Saint-Martin Blanmont."
        onOpenTutorial={() => setTutorialOpen(true)}
        tutorialButtonId="settings-tutorial-btn"
        actions={[
          {
            label: 'Voir le site public',
            href: '/',
            icon: EyeIcon,
            variant: 'secondary',
            tooltip: 'Ouvrir le site public dans un nouvel onglet ou naviguer vers l’accueil',
          },
        ]}
      />

      {/* Settings Tutorial Modal */}
      <SettingsTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startSettingsTour();
          }, 200);
        }}
      />

      {/* ── Section 1 : Apparence & Thème ── */}
      <section id="settings-theme-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand border border-brand/20">
              <PaintBrushIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-white uppercase tracking-tight">
                Apparence &amp; Thème Visuel
              </h2>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Basculez l&apos;apparence du site public entre la version claire et sombre. L&apos;administration reste quant à elle en mode clair.
              </p>
            </div>
          </div>

          {/* Quick interactive switch */}
          <div className="flex items-center gap-3 bg-white dark:bg-night-2 p-2 rounded-lg border border-line dark:border-night-line self-start sm:self-auto shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 flex items-center gap-1.5">
              {resolvedTheme === 'dark' ? (
                <>
                  <MoonIcon className="h-4 w-4 text-brand" />
                  <span>Mode Sombre</span>
                </>
              ) : (
                <>
                  <SunIcon className="h-4 w-4 text-amber-500" />
                  <span>Mode Clair</span>
                </>
              )}
            </span>
            <ThemeToggle variant="switch" />
          </div>
        </div>

        {/* 3 Visual Options Cards */}
        <div className="rounded-xl border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-white">
              Sélectionnez votre mode d&apos;affichage
            </h3>
            <p className="text-xs text-ink-3 dark:text-snow-3">
              Le choix est mémorisé sur votre navigateur et appliqué au site public (accueil, parcours, membres, footer). L&apos;espace d&apos;administration reste quant à lui exclusivement en mode clair pour un confort de gestion optimal.
            </p>
          </div>

          <ThemeToggle variant="cards" />

          {/* Live Preview Box */}
          <div className="mt-8 pt-6 border-t border-line dark:border-night-line space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4 text-brand" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                  Aperçu en direct du Thème ({resolvedTheme === 'dark' ? 'Sombre' : 'Clair'})
                </h4>
              </div>
              <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 flex items-center gap-1">
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                Rendu instantané
              </span>
            </div>

            {/* Mockup Preview Card with isolated theme container */}
            <div className={resolvedTheme === 'dark' ? 'dark' : ''}>
              <div className="rounded-lg border border-line dark:border-night-line overflow-hidden shadow-sm">
                {/* Mini Navbar Mockup */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-night/95 border-b border-line dark:border-white/10 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold uppercase tracking-tight text-ink dark:text-white">
                      Blan<span className="text-brand">mont</span>
                    </span>
                    <span className="text-xs uppercase tracking-wider text-ink-3 dark:text-snow-3 border-l border-line dark:border-white/15 pl-2">
                      CC St-Martin
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-ink-3 dark:text-snow-3">
                    <span className="text-ink dark:text-white">Les News</span>
                    <span>Membres</span>
                    <span>Calendrier</span>
                    <span className="bg-brand text-white text-xs px-2 py-0.5 rounded font-bold uppercase">
                      Espace Membre
                    </span>
                  </div>
                </div>

                {/* Mini Hero Mockup */}
                <div className="p-6 bg-gradient-to-b from-paper-2 via-paper to-paper dark:bg-night text-ink dark:text-white transition-colors duration-200">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mb-2">
                    <SparklesIcon className="h-3 w-3" />
                    <span>Peloton 2026</span>
                  </div>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight">
                    Rouler ensemble, la passion du peloton
                  </h3>
                  <p className="mt-1 text-xs text-ink-3 dark:text-snow-3 max-w-md">
                    Aperçu des typographies, des contrastes et des boutons en mode {resolvedTheme === 'dark' ? 'sombre' : 'clair'}.
                  </p>

                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      type="button"
                      className="rounded bg-brand text-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider"
                    >
                      Bouton Primaire
                    </button>
                    <button
                      type="button"
                      className="rounded border border-line dark:border-white/25 bg-white dark:bg-transparent text-ink dark:text-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider"
                    >
                      Bouton Secondaire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2 : Paramètres & Métadonnées du Club ── */}
      <section id="settings-club-identity-section" className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hydro/10 text-hydro border border-hydro/30">
            <InformationCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white uppercase tracking-tight">
              Informations du Club
            </h2>
            <p className="text-xs text-ink-3 dark:text-snow-3">
              Données officielles et configuration d&apos;identité du Cyclo Club Saint-Martin.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs divide-y divide-line dark:divide-night-line">
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Nom Officiel
            </span>
            <span className="sm:col-span-2 text-sm font-semibold text-ink dark:text-white">
              Cyclo Club Saint-Martin Blanmont (CC Blanmont)
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Lieu de Rendez-vous
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-ink-2 dark:text-snow">
              Place de la Féchère, 1450 Blanmont (Brabant wallon, Belgique)
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Coordonnées Géodésiques
            </span>
            <span className="sm:col-span-2 text-sm font-mono font-bold text-brand tabular-nums">
              50°37′23″ N · 4°38′32″ E
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Année de Fondation
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-ink-2 dark:text-snow tabular-nums">
              1978 &bull; 48e année d&apos;activité
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Saison Active
            </span>
            <span className="sm:col-span-2 text-sm font-bold text-brand tabular-nums">
              Saison 2026 (Carré Vert &amp; Calendrier)
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Charte Graphique IGN
            </span>
            <span className="sm:col-span-2 text-xs font-medium text-ink-3 dark:text-snow-3">
              La Feuille de Blanmont : Route Red (<code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-brand font-mono">#d63535</code>), Papier Topographique (<code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">#fbfbf8</code>), Feuille Nocturne (<code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">#0d1013</code>), Encre Archivo.
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 3 : Réglementation Fédérale & Sécurité ── */}
      <section id="settings-federation-section" className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vert/10 text-vert dark:text-vert-strong border border-vert/30">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white uppercase tracking-tight">
              Réglementation Fédérale FFBC &amp; Sécurité
            </h2>
            <p className="text-xs text-ink-3 dark:text-snow-3">
              Normes d&apos;encadrement des pelotons et conformité avec le code de la route belge.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs divide-y divide-line dark:divide-night-line">
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Fédération de Rattachement
            </span>
            <span className="sm:col-span-2 text-sm font-semibold text-ink dark:text-white">
              FFBC &bull; Fédération Francophone Belge du Cyclotourisme
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Taille Maximale de Peloton
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-ink-2 dark:text-snow">
              15 cyclistes maximum par groupe sur voie publique (scission en sous-groupes au-delà).
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Sécurité &amp; Matériel
            </span>
            <span className="sm:col-span-2 text-xs font-medium text-ink-3 dark:text-snow-3">
              Casque rigide obligatoire, fiches secours ICE accessibles par les capitaines sur mobile et trousse de réparation obligatoire.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
