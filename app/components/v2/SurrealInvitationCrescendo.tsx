'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  MapPinIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function SurrealInvitationCrescendo() {
  return (
    <section className="py-24 sm:py-36 bg-[#08090c] text-white relative overflow-hidden">
      {/* Background Radial Glow & Astrolabe Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e03e3e]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(224,62,62,0.15) 0%, transparent 60%),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10 sm:space-y-12">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-[#a7adbb]">
          <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-ping" />
          <span>Essai Libre &amp; Sans Engagement</span>
        </div>

        {/* Monumental Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold uppercase tracking-[-0.035em] leading-[0.94] text-balance">
            Le Peloton n&apos;attend <br />
            <span className="text-[#e03e3e] italic font-serif lowercase tracking-normal text-[0.95em]">
              plus que vous.
            </span>
          </h2>
          <p className="text-base sm:text-xl text-[#a7adbb] leading-relaxed max-w-2xl mx-auto font-light">
            Rejoignez-nous un samedi ou un dimanche matin sur la Place de Blanmont. Venez tester une ou deux sorties à votre propre rythme avant toute adhésion.
          </p>
        </div>

        {/* Action Button Trio */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/le-club"
            className="group inline-flex items-center gap-3 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-9 py-4 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 shadow-2xl shadow-[#e03e3e]/30 hover:shadow-[#e03e3e]/50 hover:-translate-y-0.5"
          >
            <span>Découvrir le Club &amp; Horaires</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/sondage"
            className="inline-flex items-center gap-2.5 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Sondage du Weekend</span>
          </Link>
        </div>

        {/* 3 Seal Badges */}
        <div className="pt-12 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <MapPinIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>Rassemblement</span>
            </div>
            <p className="text-xs text-[#a7adbb]">
              Place de Blanmont · Samedi 8h30 &amp; Dimanche 9h00.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <ShieldCheckIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>Sécurité Totale</span>
            </div>
            <p className="text-xs text-[#a7adbb]">
              Capitaines formés, parcours reconnus et entraide absolue.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <HeartIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>Tous Profils</span>
            </div>
            <p className="text-xs text-[#a7adbb]">
              Cyclistes débutants ou confirmés, vélos classiques et VAE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
