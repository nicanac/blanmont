'use client';

import React from 'react';
import {
  PaintBrushIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';

export default function AdminSettingsPage(): React.ReactElement {
  const { theme, resolvedTheme, setTheme } = useTheme();

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
      <div className="border-b border-[#e4e0d8] dark:border-[#262b38] pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] dark:bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
          Administration &bull; Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
          Paramètres du Site &amp; du Club
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] max-w-2xl">
          Gérez l&apos;apparence visuelle globale du site (thème clair ou sombre) et consultez les paramètres officiels du CC Saint-Martin Blanmont.
        </p>
      </div>

      {/* ── Section 1 : Apparence & Thème ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/20">
              <PaintBrushIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101216] dark:text-white uppercase tracking-tight">
                Apparence &amp; Thème Visuel
              </h2>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                Basculez l&apos;apparence du site public entre la version claire et sombre. L&apos;administration reste quant à elle en mode clair.
              </p>
            </div>
          </div>

          {/* Quick interactive switch */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#161922] p-2 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] self-start sm:self-auto shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb] flex items-center gap-1.5">
              {resolvedTheme === 'dark' ? (
                <>
                  <MoonIcon className="h-4 w-4 text-[#e03e3e]" />
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
        <div className="rounded-xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#101216] dark:text-white">
              Sélectionnez votre mode d&apos;affichage
            </h3>
            <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
              Le choix est mémorisé sur votre navigateur et appliqué au site public (accueil, parcours, membres, footer). L&apos;espace d&apos;administration reste quant à lui exclusivement en mode clair pour un confort de gestion optimal.
            </p>
          </div>

          <ThemeToggle variant="cards" />

          {/* Live Preview Box */}
          <div className="mt-8 pt-6 border-t border-[#e4e0d8] dark:border-[#262b38] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4 text-[#e03e3e]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
                  Aperçu en direct du Thème ({resolvedTheme === 'dark' ? 'Sombre' : 'Clair'})
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#5c6370] dark:text-[#a7adbb] flex items-center gap-1">
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                Rendu instantané
              </span>
            </div>

            {/* Mockup Preview Card with isolated theme container */}
            <div className={resolvedTheme === 'dark' ? 'dark' : ''}>
              <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] overflow-hidden shadow-sm">
                {/* Mini Navbar Mockup */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-[#0a0c10]/95 border-b border-[#e4e0d8] dark:border-white/10 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold uppercase tracking-tight text-[#101216] dark:text-white">
                      Blan<span className="text-[#e03e3e]">mont</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#5c6370] dark:text-[#7d8493] border-l border-[#e4e0d8] dark:border-white/15 pl-2">
                      CC St-Martin
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb]">
                    <span className="text-[#101216] dark:text-white">Les News</span>
                    <span>Membres</span>
                    <span>Calendrier</span>
                    <span className="bg-[#e03e3e] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      Espace Membre
                    </span>
                  </div>
                </div>

                {/* Mini Hero Mockup */}
                <div className="p-6 bg-gradient-to-b from-[#f5f2eb] via-[#faf8f5] to-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-white transition-colors duration-200">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <SparklesIcon className="h-3 w-3" />
                    <span>Peloton 2026</span>
                  </div>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight">
                    Rouler ensemble, <span className="text-[#e03e3e] italic">la passion du peloton</span>
                  </h3>
                  <p className="mt-1 text-xs text-[#5c6370] dark:text-[#a7adbb] max-w-md">
                    Aperçu des typographies, des contrastes et des boutons en mode {resolvedTheme === 'dark' ? 'sombre' : 'clair'}.
                  </p>

                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      type="button"
                      className="rounded bg-[#e03e3e] text-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider"
                    >
                      Bouton Primaire
                    </button>
                    <button
                      type="button"
                      className="rounded border border-[#e4e0d8] dark:border-white/25 bg-white dark:bg-transparent text-[#101216] dark:text-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider"
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
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <InformationCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#101216] dark:text-white uppercase tracking-tight">
              Informations du Club
            </h2>
            <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
              Données officielles et configuration d&apos;identité du Cyclo Club Saint-Martin.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs divide-y divide-[#e4e0d8] dark:divide-[#262b38]">
          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
              Nom Officiel
            </span>
            <span className="sm:col-span-2 text-sm font-semibold text-[#101216] dark:text-white">
              Cyclo Club Saint-Martin Blanmont (CC Blanmont)
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
              Lieu de Rendez-vous
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-[#3a3f4a] dark:text-[#f5f6f8]">
              Place de Blanmont, 1450 Chastre (Brabant wallon, Belgique)
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
              Année de Fondation
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-[#3a3f4a] dark:text-[#f5f6f8] tabular-nums">
              1978 &bull; 48e année d&apos;activité
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
              Saison Active
            </span>
            <span className="sm:col-span-2 text-sm font-bold text-[#e03e3e] tabular-nums">
              Saison 2026 (Carré Vert &amp; Calendrier)
            </span>
          </div>

          <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
              Charte Graphique
            </span>
            <span className="sm:col-span-2 text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">
              Rouge Blanmont (<code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#e03e3e] font-mono">#e03e3e</code>), Papier Chaud (<code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">#faf8f5</code>), Encre Profonde (<code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">#0a0c10</code>).
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
