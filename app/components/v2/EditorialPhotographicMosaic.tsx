'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface MosaicItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  badge: string;
  aspect: string;
  span: string;
}

export default function EditorialPhotographicMosaic() {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const items: MosaicItem[] = [
    {
      id: 'm1',
      src: '/images/IMG_7627.JPG',
      alt: 'Rassemblement printanier du Club de Blanmont sous un ciel azur',
      title: 'L\'Appel du Printemps',
      subtitle: 'Le peloton au complet réuni sous les cerisiers en fleurs',
      badge: 'Rassemblement Annuel',
      aspect: 'aspect-[16/10]',
      span: 'lg:col-span-8',
    },
    {
      id: 'm2',
      src: '/images/IMG_5777.JPG',
      alt: 'Halte photo devant la chapelle brabançonne en briques rouges',
      title: 'Le Sanctuaire Brabançon',
      subtitle: 'Halte contemplative devant les chapelles historiques de campagne',
      badge: 'Patrimoine & Histoire',
      aspect: 'aspect-[4/3] sm:aspect-[4/5]',
      span: 'lg:col-span-4',
    },
    {
      id: 'm3',
      src: '/images/IMG_8019.JPG',
      alt: 'Peloton en formation serrée fendant le vent sur la route',
      title: 'L\'Aspiration Pure',
      subtitle: 'Les relais se succèdent au millimètre dans le sillage du vent',
      badge: 'Allure & Cadence',
      aspect: 'aspect-[4/3] sm:aspect-[4/5]',
      span: 'lg:col-span-4',
    },
    {
      id: 'm4',
      src: '/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg',
      alt: 'Routes sinueuses entre champs dorés et bois brabançons',
      title: 'Les Chemins Secrets',
      subtitle: 'Des vallées oubliées et des chemins de crête où le temps s\'arrête',
      badge: 'Paysages Sauvages',
      aspect: 'aspect-[16/10]',
      span: 'lg:col-span-8',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#faf8f5] text-[#101216] border-b border-[#e4e0d8] relative overflow-hidden">
      {/* Editorial Giant Background Typography Layer */}
      <div className="absolute top-12 left-0 right-0 overflow-hidden pointer-events-none select-none opacity-[0.035] leading-none text-center">
        <span className="text-[clamp(6rem,18vw,22rem)] font-extrabold uppercase tracking-tighter text-[#101216] whitespace-nowrap">
          PELOTON
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e4e0d8] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e03e3e]">
              <SparklesIcon className="h-4 w-4" />
              Chronique Visuelle
            </div>
            <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] text-balance">
              La Traversée des Éléments
            </h2>
            <p className="text-base text-[#3a3f4a] leading-relaxed">
              Le vélo à Blanmont n&apos;est pas une collection d&apos;images : c&apos;est une symphonie de briques rouges, de ciels mouvants, d&apos;asphalte rugueux et de sourires complices.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#5c6370]">
            <span>Archives Vivantes · 1978–2026</span>
          </div>
        </div>

        {/* ── Asymmetric Non-Rectangular Editorial Gallery ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {items.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setActiveImage(item.id)}
              onMouseLeave={() => setActiveImage(null)}
              className={`group relative overflow-hidden rounded-xl border border-[#e4e0d8] bg-[#0a0c10] shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-[#e03e3e]/60 ${item.span}`}
            >
              {/* Image with zoom and soft color grade */}
              <div className={`relative w-full ${item.aspect}`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />

                {/* Dark luxury gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                  <span className="inline-flex items-center gap-2 rounded-md bg-[#08090c]/85 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white border border-white/15 shadow-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                    {item.badge}
                  </span>
                </div>

                {/* Bottom Story Reveal */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 space-y-1.5 transform transition-transform duration-500 group-hover:-translate-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-[#e03e3e] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#a7adbb] line-clamp-2 max-w-xl leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 4 Historical Pillars Manifesto Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#e4e0d8]">
          <div className="p-6 rounded-lg bg-white border border-[#e4e0d8] space-y-2">
            <span className="text-2xl font-extrabold text-[#e03e3e] tabular-nums">
              1978
            </span>
            <div className="text-sm font-bold text-[#101216]">
              Fondation du Club
            </div>
            <p className="text-xs text-[#5c6370] leading-relaxed">
              Près d&apos;un demi-siècle d&apos;héritage cycliste ininterrompu au cœur du Brabant wallon.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white border border-[#e4e0d8] space-y-2">
            <span className="text-2xl font-extrabold text-[#101216] tabular-nums">
              0 Abandon
            </span>
            <div className="text-sm font-bold text-[#101216]">
              Pacte de Solidarité
            </div>
            <p className="text-xs text-[#5c6370] leading-relaxed">
              En cas de coup de pompe ou de crevaison, le peloton s&apos;arrête. Personne ne rentre seul.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white border border-[#e4e0d8] space-y-2">
            <span className="text-2xl font-extrabold text-[#101216] tabular-nums">
              250+ Traces
            </span>
            <div className="text-sm font-bold text-[#101216]">
              Bibliothèque GPX
            </div>
            <p className="text-xs text-[#5c6370] leading-relaxed">
              Des centaines d&apos;itinéraires soignés avec dénivelés, profils et panoramas vérifiés.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white border border-[#e4e0d8] space-y-2">
            <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              100% Plaisir
            </span>
            <div className="text-sm font-bold text-[#101216]">
              Troisième Mi-temps
            </div>
            <p className="text-xs text-[#5c6370] leading-relaxed">
              Le plaisir de débriefer la sortie autour d&apos;une boisson fraîche sur la Place de Blanmont.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
