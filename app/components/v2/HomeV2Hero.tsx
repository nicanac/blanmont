'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { WeekendPoll } from '@/app/types';

interface HomeV2HeroProps {
  activePoll: WeekendPoll | null;
}

export default function HomeV2Hero({ activePoll }: HomeV2HeroProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle interactive parallax mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const el = heroRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (el) el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const photos = [
    {
      src: '/images/home-hero.jpg',
      alt: 'Peloton du Club de Blanmont fendant la brume matinale',
      label: 'Peloton Principal',
      coord: '50.6094° N, 4.6833° E',
      caption: 'L\'aspiration collective au matin',
    },
    {
      src: '/images/IMG_5777.JPG',
      alt: 'Chapelle brabançonne et halte historique',
      label: 'Étape Patrimoine',
      coord: 'Alt. 142m · Brabant',
      caption: 'Halte sacrée à la chapelle',
    },
    {
      src: '/images/IMG_7627.JPG',
      alt: 'Grand rassemblement de saison sous le soleil',
      label: 'L\'Équipage au complet',
      coord: 'Place de Blanmont',
      caption: 'Lancement de saison sous l\'azur',
    },
  ];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[#08090c] text-white pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-white/[0.08]"
    >
      {/* ── Background Celestial Coordinate Grid & Astrolabe Atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-20">
        {/* Fine coordinate grid lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 30%, rgba(224, 62, 62, 0.18) 0%, transparent 60%),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 80px 80px, 80px 80px',
          }}
        />

        {/* Rotating Celestial Astrolabe Ring in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] rounded-full border border-white/5 animate-slow-rotate">
          <div className="absolute inset-4 rounded-full border border-dashed border-white/[0.06]" />
          <div className="absolute inset-20 rounded-full border border-white/[0.04] animate-slow-rotate-reverse" />
          {/* Compass degree points */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] tracking-widest text-white/30">
            N 000°
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] tracking-widest text-white/30">
            S 180°
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[9px] tracking-widest text-white/30">
            E 090°
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[9px] tracking-widest text-white/30">
            W 270°
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        {/* Top Colophon / Coordinates Pill */}
        <div className="cover-rise flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-[#a7adbb]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e] animate-ping" />
            <span className="text-white font-bold">CC Saint-Martin Blanmont</span>
            <span className="text-white/20">|</span>
            <span className="text-white/70">50°36&apos;34&quot; N · 04°41&apos;00&quot; E</span>
          </div>

          <div className="flex items-center gap-3 text-xs tracking-wider text-[#a7adbb]">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded border border-white/10 bg-white/[0.03] text-[11px] font-mono">
              HORLOGE DU PELOTON · 08:30:00
            </span>
            <span className="inline-flex items-center gap-1 text-[#e03e3e] font-semibold text-xs uppercase tracking-wider">
              <SparklesIcon className="h-3.5 w-3.5" />
              Saison 2026
            </span>
          </div>
        </div>

        {/* ── Main Editorial Typography & Surreal Staging ── */}
        <div className="pt-10 sm:pt-16 pb-12 sm:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Typographic Monument */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e03e3e]/10 border border-[#e03e3e]/30 text-[#e03e3e] text-[11px] font-bold uppercase tracking-[0.15em]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                Haute Cyclotourisme Belge
              </div>

              <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold uppercase tracking-[-0.035em] leading-[0.94] text-balance">
                <span className="cover-line">
                  <span>L&apos;Ordre Céleste</span>
                </span>
                <span className="cover-line">
                  <span>du Peloton</span>
                </span>
                <span className="cover-line">
                  <span className="text-[#e03e3e] italic font-serif lowercase tracking-normal text-[0.95em]">
                    de Blanmont.
                  </span>
                </span>
              </h1>
            </div>

            <p className="cover-rise cover-rise-1 text-base sm:text-lg text-[#a7adbb] leading-relaxed max-w-xl font-light">
              Chaque weekend au départ de la Place de Blanmont, le cyclisme sur route s&apos;élève au rang de{' '}
              <strong className="text-white font-medium">rituel partagé</strong>. Trois pelotons d&apos;allures,
              des routes brabançonnes envoûtantes, et une promesse indéfectible :{' '}
              <em className="text-[#f5f6f8] not-italic underline decoration-[#e03e3e]/60 underline-offset-4">
                « On part ensemble, on rentre ensemble. »
              </em>
            </p>

            {/* Interactive Action Trio */}
            <div className="cover-rise cover-rise-2 flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/le-club"
                className="group relative inline-flex items-center gap-3 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 shadow-xl shadow-[#e03e3e]/25 hover:shadow-2xl hover:shadow-[#e03e3e]/40 hover:-translate-y-0.5"
              >
                <span>Rejoindre le Peloton</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/sondage"
                className="inline-flex items-center gap-2.5 rounded-md border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/40 text-white px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-[#e03e3e]" />
                <span>Sondage Présence</span>
                {activePoll && (
                  <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
                )}
              </Link>

              <Link
                href="/traces"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a7adbb] hover:text-white uppercase tracking-wider transition-colors px-2 py-2"
              >
                <span>250+ Parcours GPX</span>
                <span className="text-[#e03e3e]">→</span>
              </Link>
            </div>

            {/* Micro-Telemetry Badge */}
            <div className="cover-rise cover-rise-3 pt-4 border-t border-white/[0.08] flex items-center gap-6 text-xs text-[#7d8493]">
              <div>
                <span className="block text-white font-bold tabular-nums text-sm">48 Ans</span>
                <span className="text-[11px] uppercase tracking-wider">De Passion (1978)</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="block text-white font-bold tabular-nums text-sm">3 Allures + VTT</span>
                <span className="text-[11px] uppercase tracking-wider">Tous Niveaux</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="block text-emerald-400 font-bold tabular-nums text-sm">100%</span>
                <span className="text-[11px] uppercase tracking-wider">Entraide &amp; Sécurité</span>
              </div>
            </div>
          </div>

          {/* Right Column: Surreal Multi-Layered Visual Montage */}
          <div className="lg:col-span-6 relative">
            {/* Dynamic Interactive Stage Container */}
            <div
              className="relative rounded-xl p-3 sm:p-4 bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent border border-white/10 shadow-2xl transition-transform duration-500 ease-out"
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`,
              }}
            >
              {/* Primary Cinematic Viewport */}
              <div className="relative overflow-hidden rounded-lg aspect-[4/3] sm:aspect-[16/11] bg-[#101216]">
                <Image
                  src={photos[activeFrame].src}
                  alt={photos[activeFrame].alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-700 ease-out"
                />

                {/* Editorial dark vignettes & gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

                {/* Overlaid Gold Luxury Stamp */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#08090c]/85 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-white shadow-xl">
                    <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                      {photos[activeFrame].label}
                    </span>
                  </div>
                </div>

                {/* Bottom Photo Metadata */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 flex items-end justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#e03e3e]">
                      {photos[activeFrame].coord}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {photos[activeFrame].caption}
                    </div>
                  </div>

                  {/* Frame Navigator Dots */}
                  <div className="flex items-center gap-1.5 bg-[#08090c]/80 backdrop-blur px-2.5 py-1.5 rounded-full border border-white/10">
                    {photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFrame(idx)}
                        aria-label={`Afficher la vue ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeFrame === idx
                            ? 'w-6 bg-[#e03e3e]'
                            : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Surreal Satellite Frame (Tilted Offset Layer) */}
              <div
                onClick={() => setActiveFrame((activeFrame + 1) % photos.length)}
                className="hidden sm:block absolute -bottom-6 -right-6 w-44 lg:w-52 aspect-[4/3] rounded-lg overflow-hidden border-2 border-white/20 bg-[#161922] shadow-2xl cursor-pointer transition-all duration-500 hover:scale-105 hover:border-[#e03e3e] z-30 animate-float-subtle"
              >
                <Image
                  src={photos[(activeFrame + 1) % photos.length].src}
                  alt="Aperçu photo satellite"
                  fill
                  sizes="220px"
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white/90 truncate flex items-center justify-between">
                  <span>{photos[(activeFrame + 1) % photos.length].label}</span>
                  <span className="text-[#e03e3e]">↻</span>
                </div>
              </div>

              {/* Surreal Floating Badge Left */}
              <div className="hidden sm:flex absolute -top-5 -left-5 items-center gap-2 rounded-md bg-[#101216]/95 border border-[#e03e3e]/40 p-3 shadow-2xl z-30 animate-float-subtle-alt">
                <div className="h-8 w-8 rounded bg-[#e03e3e]/20 border border-[#e03e3e]/40 flex items-center justify-center text-[#e03e3e] font-bold text-xs">
                  8h30
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Place de Blanmont
                  </div>
                  <div className="text-[10px] text-[#a7adbb]">
                    Rassemblement rituel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Seamless Marquee Ticker ── */}
        <div className="relative overflow-hidden py-3 border-y border-white/[0.08] bg-white/[0.02]">
          <div className="flex whitespace-nowrap animate-ticker text-[11px] uppercase tracking-[0.2em] font-semibold text-[#a7adbb]/80">
            <span className="inline-flex items-center gap-4 mx-4">
              <span className="text-[#e03e3e]">✦</span> BRABANT WALLON
              <span className="text-[#e03e3e]">✦</span> DÉPART PLACE DE BLANMONT
              <span className="text-[#e03e3e]">✦</span> GROUPES A, B, C &amp; VTT
              <span className="text-[#e03e3e]">✦</span> ON PART ENSEMBLE, ON RENTRE ENSEMBLE
              <span className="text-[#e03e3e]">✦</span> 250+ PARCOURS GPX CATALOGUÉS
              <span className="text-[#e03e3e]">✦</span> CHALLENGE ASSIDUITÉ CARRÉ VERT
              <span className="text-[#e03e3e]">✦</span> ESSAI GRATUIT SANS ENGAGEMENT
            </span>
            <span className="inline-flex items-center gap-4 mx-4" aria-hidden="true">
              <span className="text-[#e03e3e]">✦</span> BRABANT WALLON
              <span className="text-[#e03e3e]">✦</span> DÉPART PLACE DE BLANMONT
              <span className="text-[#e03e3e]">✦</span> GROUPES A, B, C &amp; VTT
              <span className="text-[#e03e3e]">✦</span> ON PART ENSEMBLE, ON RENTRE ENSEMBLE
              <span className="text-[#e03e3e]">✦</span> 250+ PARCOURS GPX CATALOGUÉS
              <span className="text-[#e03e3e]">✦</span> CHALLENGE ASSIDUITÉ CARRÉ VERT
              <span className="text-[#e03e3e]">✦</span> ESSAI GRATUIT SANS ENGAGEMENT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
