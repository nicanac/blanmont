'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BoltIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function InteractivePelotonPaces() {
  const [activeGroup, setActiveGroup] = useState<number>(1); // Default to Groupe B

  const groups = [
    {
      id: 'group-a',
      letter: 'A',
      name: "L'Échappée Pure",
      speed: '> 30 km/h',
      speedValue: 32,
      distance: '85 – 110 km',
      elevation: '700 – 1200 m D+',
      accentColor: '#e03e3e',
      bgGlow: 'rgba(224, 62, 62, 0.15)',
      borderColor: 'border-[#e03e3e]',
      tagColor: 'bg-[#e03e3e]/15 text-[#e03e3e] border-[#e03e3e]/30',
      tag: 'Rythme Soutenu & Relais',
      image: '/images/home-hero.jpg',
      quote: '« La vitesse pure fendant le vent sur les plateaux du Brabant. »',
      philosophy:
        'Conçu pour les cyclistes affûtés adeptes des relais continus en éventail, des bosses montées au train et des sorties sportives à haute cadence.',
      specs: [
        { label: 'Relais', value: 'Double file & Tournante' },
        { label: 'Braquets conseillés', value: '52/36 ou 50/34' },
        { label: 'Profil', value: 'Compétiteurs & Cyclosportifs' },
        { label: 'Ambiance', value: 'Concentrée, sportive, dynamique' },
      ],
    },
    {
      id: 'group-b',
      letter: 'B',
      name: 'Le Cœur Battant',
      speed: '25 – 28 km/h',
      speedValue: 27,
      distance: '70 – 90 km',
      elevation: '450 – 850 m D+',
      accentColor: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'border-sky-500',
      tagColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      tag: 'Équilibre & Convivialité',
      image: '/images/IMG_7627.JPG',
      quote: '« L\'harmonie parfaite entre intensité sportive et cohésion collective. »',
      philosophy:
        'Le peloton emblématique du club. Une allure rythmée et régulière permettant de progresser ensemble dans un esprit d\'entraide sans faille.',
      specs: [
        { label: 'Relais', value: 'Lignes régulières & Fluides' },
        { label: 'Braquets conseillés', value: '50/34 & Cassette 11-32' },
        { label: 'Profil', value: 'Cyclistes réguliers et passionnés' },
        { label: 'Ambiance', value: 'Chaleureuse, solidaire, tonique' },
      ],
    },
    {
      id: 'group-c',
      letter: 'C',
      name: 'Les Esthètes de la Route',
      speed: '< 25 km/h',
      speedValue: 23,
      distance: '55 – 75 km',
      elevation: '300 – 600 m D+',
      accentColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'border-emerald-500',
      tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      tag: 'Plaisir Pur & VAE Bienvenus',
      image: '/images/IMG_5777.JPG',
      quote: '« Le plaisir de rouler sans le diktat du chronomètre. »',
      philosophy:
        'La voie royale pour débuter, reprendre après une pause, ou simplement rouler à son rythme en profitant des paysages. Vélos électriques (VAE) bienvenus.',
      specs: [
        { label: 'Relais', value: 'Peloton calme & Adaptatif' },
        { label: 'Braquets conseillés', value: 'Tous types + Assistance VAE' },
        { label: 'Profil', value: 'Découverte, reprise & cyclotourisme' },
        { label: 'Ambiance', value: 'Détendue, bienveillante, conviviale' },
      ],
    },
    {
      id: 'group-vtt',
      letter: 'VTT',
      name: 'Les Sentiers Sauvages',
      speed: 'Allure Adaptée',
      speedValue: 18,
      distance: '40 – 65 km',
      elevation: '500 – 950 m D+',
      accentColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'border-amber-500',
      tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      tag: 'Sous-Bois & Chemins Creux',
      image: '/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg',
      quote: '« La liberté des singles forestiers et des chemins brabançons. »',
      philosophy:
        'Pour ceux qui préfèrent la terre battue et la boue à l\'asphalte. Exploration des bois, sentiers techniques et collines secrètes du Brabant wallon.',
      specs: [
        { label: 'Terrain', value: 'Sous-bois, chemins de terre & pavés' },
        { label: 'Matériel', value: 'VTT ou Gravel avec pneus crantés' },
        { label: 'Profil', value: 'Amateurs de nature et de pilotage' },
        { label: 'Ambiance', value: 'Aventureuse, rustique, joyeuse' },
      ],
    },
  ];

  const current = groups[activeGroup];

  return (
    <section className="py-20 sm:py-28 bg-[#faf8f5] text-[#101216] border-b border-[#e4e0d8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Masthead */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e4e0d8] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#5c6370]">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
              L&apos;Alchimie du Peloton
            </div>
            <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] text-balance">
              Le Miroir des Allures
            </h2>
            <p className="text-base text-[#3a3f4a] leading-relaxed">
              Une harmonie sportive où chacun trouve son peloton d&apos;élection. Cliquez pour explorer l&apos;esprit et les caractéristiques de chaque groupe.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#5c6370] bg-white border border-[#e4e0d8] px-4 py-2.5 rounded-md shadow-xs">
            <ShieldCheckIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Capitaine dédié par peloton</span>
          </div>
        </div>

        {/* ── Interactive 4-Peloton Selector Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {groups.map((grp, index) => {
            const isSelected = activeGroup === index;
            return (
              <button
                key={grp.id}
                onClick={() => setActiveGroup(index)}
                className={`relative p-4 sm:p-6 rounded-lg text-left transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-white shadow-xl -translate-y-1 ' + grp.borderColor
                    : 'bg-white/60 hover:bg-white border-[#e4e0d8] opacity-80 hover:opacity-100'
                }`}
              >
                {/* Active Indicator Top Bar */}
                {isSelected && (
                  <span
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                    style={{ backgroundColor: grp.accentColor }}
                  />
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${grp.accentColor}15`,
                        color: grp.accentColor,
                        borderColor: `${grp.accentColor}30`,
                      }}
                    >
                      Groupe {grp.letter}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: grp.accentColor }}
                    />
                  </div>

                  <div className="text-lg sm:text-xl font-extrabold text-[#101216] tracking-tight">
                    {grp.name}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e4e0d8]/80 flex items-center justify-between text-xs">
                  <span className="font-extrabold tabular-nums text-[#101216]">
                    {grp.speed}
                  </span>
                  <span className="text-[#7d8493] text-[11px] uppercase tracking-wider">
                    {grp.distance.split(' ')[0]} km
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Dynamic Morphing Stage for Selected Peloton ── */}
        <div className="relative overflow-hidden rounded-xl border border-[#e4e0d8] bg-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left: Deep Story & Specs */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${current.accentColor}15`,
                      color: current.accentColor,
                      borderColor: `${current.accentColor}30`,
                    }}
                  >
                    Groupe {current.letter} · {current.tag}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
                    {current.speed}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-[#101216] tracking-tight">
                    {current.name}
                  </h3>
                  <blockquote className="text-base sm:text-lg italic font-serif text-[#e03e3e]">
                    {current.quote}
                  </blockquote>
                </div>

                <p className="text-sm sm:text-base text-[#3a3f4a] leading-relaxed">
                  {current.philosophy}
                </p>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e4e0d8]">
                  {current.specs.map((spec, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                        {spec.label}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-[#101216]">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-6 border-t border-[#e4e0d8] flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/le-club"
                  className="inline-flex items-center gap-2 rounded-md bg-[#101216] hover:bg-[#e03e3e] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-300"
                >
                  <span>Venir tester ce groupe</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>

                <div className="text-xs text-[#7d8493] flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4 text-[#e03e3e]" />
                  <span>2 sorties d&apos;essai libres</span>
                </div>
              </div>
            </div>

            {/* Right: Rich Hard-Cropped Imagery & Live Telemetry Overlay */}
            <div className="lg:col-span-5 relative min-h-[340px] sm:min-h-[420px] bg-[#0a0c10] overflow-hidden">
              <Image
                src={current.image}
                alt={current.name}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-black/30 to-transparent" />

              {/* Floating Speed & Distance Telemetry Card */}
              <div className="absolute bottom-6 left-6 right-6 z-10 p-4 rounded-lg bg-[#08090c]/85 backdrop-blur-md border border-white/15 text-white space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#a7adbb] font-mono">
                    TÉLÉMÉTRIE DU GROUPE
                  </span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: current.accentColor }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 rounded p-2 border border-white/5">
                    <span className="block text-xl font-extrabold text-white tabular-nums">
                      {current.distance.split(' ')[0]}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#a7adbb]">
                      Distance moy.
                    </span>
                  </div>
                  <div className="bg-white/5 rounded p-2 border border-white/5">
                    <span
                      className="block text-xl font-extrabold tabular-nums"
                      style={{ color: current.accentColor }}
                    >
                      {current.speed}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#a7adbb]">
                      Allure visée
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
