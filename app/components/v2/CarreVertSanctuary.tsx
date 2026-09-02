'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import type { WeekendPoll } from '@/app/types';

interface CarreVertSanctuaryProps {
  activePoll: WeekendPoll | null;
}

export default function CarreVertSanctuary({ activePoll }: CarreVertSanctuaryProps) {
  return (
    <section className="py-20 sm:py-28 bg-[#0e1117] text-white border-b border-[#262b38] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-400">
              <TrophyIcon className="h-4 w-4" />
              Challenge &amp; Démocratie du Peloton
            </div>
            <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-white text-balance">
              Le Sanctuaire du Carré Vert
            </h2>
            <p className="text-base text-[#a7adbb] leading-relaxed">
              L&apos;assiduité récompensée, la démocratie de chaque weekend, et le pacte indéfectible qui unit le peloton de Blanmont depuis 1978.
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            <span>Classement Carré Vert</span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-emerald-400" />
          </Link>
        </div>

        {/* ── 2 Main Pillars: Carré Vert Trophy & Live Weekend Sondage ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Le Carré Vert Annual Challenge */}
          <div className="lg:col-span-6 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-[#161922] via-[#101216] to-[#0c1814] p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Palmarès d&apos;Assiduité
                </div>
                <TrophyIcon className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Le Rituel du Carré Vert
                </h3>
                <p className="text-sm text-[#a7adbb] leading-relaxed">
                  Chaque sortie officielle du samedi et du dimanche attribue un point de présence. À la fin de la saison, lors de l&apos;Assemblée Générale, les membres les plus assidus sont honorés par le prestigieux Trophée du Carré Vert.
                </p>
              </div>

              {/* 3 Core Rules */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-start gap-3 text-xs text-[#f5f6f8]">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pointage automatique des présences au départ sur la Place de Blanmont.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-[#f5f6f8]">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tous les groupes de niveau (A, B, C &amp; VTT) participent au même classement.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-[#f5f6f8]">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Récompenses officielles et convivialité lors du banquet annuel.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Consulter le Tableau d&apos;Honneur</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>

              <span className="text-[11px] text-[#7d8493] font-mono">
                SAISON 2026 EN COURS
              </span>
            </div>
          </div>

          {/* Right: Weekend Sondage & Democratic Participation */}
          <div className="lg:col-span-6 rounded-xl border border-white/10 bg-[#161922] p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#e03e3e]/15 border border-[#e03e3e]/30 text-[#e03e3e] text-xs font-bold uppercase tracking-widest">
                  <span className={`h-2 w-2 rounded-full ${activePoll?.status === 'closed' ? 'bg-[#7d8493]' : 'bg-[#e03e3e] animate-ping'}`} />
                  {activePoll?.status === 'closed' ? 'Sondage Clôturé' : 'Sondage Ouvert'}
                </div>
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-[#e03e3e]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activePoll?.title || 'Sondage de Présence du Weekend'}
                </h3>
                <p className="text-sm text-[#a7adbb] leading-relaxed">
                  Chaque semaine, la démocratie du club s&apos;exprime en direct : indiquez vos jours de sortie (Samedi, Dimanche, ou les deux) et votre allure pour que les capitaines affinent les parcours et l&apos;encadrement.
                </p>
              </div>

              {/* Instant Live Features */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="bg-black/30 rounded-lg p-3.5 border border-white/5 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                    Choix du jour
                  </div>
                  <div className="text-xs font-bold text-white">
                    Samedi · Dimanche · VTT
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3.5 border border-white/5 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                    Export Capitaines
                  </div>
                  <div className="text-xs font-bold text-white">
                    Synthèse WhatsApp en 1 clic
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
              <Link
                href="/sondage"
                className="inline-flex items-center gap-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-300 shadow-lg shadow-[#e03e3e]/20"
              >
                <span>Participer au Sondage</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/sondage"
                className="text-xs text-[#a7adbb] hover:text-white transition-colors"
              >
                Voir les inscrits →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
