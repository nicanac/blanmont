'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface RouteProfile {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  difficulty: string;
  description: string;
  points: { km: number; alt: number; grade: number; landmark: string; sensation: string }[];
}

export default function InteractiveElevationScrubber() {
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [scrubIndex, setScrubIndex] = useState<number>(3); // Default midway
  const svgRef = useRef<SVGSVGElement>(null);

  const routes: RouteProfile[] = [
    {
      id: 'route-1',
      name: 'La Boucle des Cinq Vallées',
      distance: 84,
      elevation: 780,
      difficulty: 'Moyen / Soutenu',
      description:
        'Un classique brabançon arpentant les crêtes de Nil-Saint-Vincent, la vallée de l\'Orne et les monts de Chaumont.',
      points: [
        { km: 0, alt: 110, grade: 0.5, landmark: 'Place de Blanmont — Départ rituel', sensation: 'Mise en route fluide' },
        { km: 12, alt: 145, grade: 3.8, landmark: 'Côte de Nil-Saint-Vincent', sensation: 'Prise de relais dynamique' },
        { km: 24, alt: 122, grade: -1.2, landmark: 'Vallée de la Thyle', sensation: 'Aéro et vitesse collective' },
        { km: 38, alt: 175, grade: 6.5, landmark: 'Mont-Saint-Guibert & Forêt', sensation: 'Échauffement des cuisses' },
        { km: 52, alt: 135, grade: 1.0, landmark: 'Chapelle Sainte-Adèle (Halte)', sensation: 'Regroupement peloton' },
        { km: 66, alt: 198, grade: 8.2, landmark: 'Mur de Vieusart (Crête)', sensation: 'Braquet souple & relance' },
        { km: 78, alt: 140, grade: -2.5, landmark: 'Descente vers Chastre', sensation: 'Vent favorable' },
        { km: 84, alt: 110, grade: 0.0, landmark: 'Place de Blanmont — Arrivée & Bière', sensation: 'Satisfaction accomplie' },
      ],
    },
    {
      id: 'route-2',
      name: 'Le Tour du Lion & Pavés Brabançons',
      distance: 98,
      elevation: 940,
      difficulty: 'Sportif / Exigeant',
      description:
        'Grand voyage vers les pavés de Sart-Dames-Avelines, les contreforts de Villers-la-Ville et les collines de Genappe.',
      points: [
        { km: 0, alt: 110, grade: 0.0, landmark: 'Place de Blanmont', sensation: 'Peloton groupé' },
        { km: 18, alt: 160, grade: 4.5, landmark: 'Bois de Lauzelle', sensation: 'Tempo régulier' },
        { km: 35, alt: 190, grade: 7.0, landmark: 'Sart-Dames-Avelines (Pavés)', sensation: 'Concentration maximale' },
        { km: 54, alt: 130, grade: -1.0, landmark: 'Abbaye de Villers-la-Ville', sensation: 'Vue magistrale' },
        { km: 72, alt: 210, grade: 9.1, landmark: 'Côte du Chasteleer (Max 11%)', sensation: 'Dépassement de soi' },
        { km: 88, alt: 150, grade: 2.0, landmark: 'Plateau de Court-Saint-Étienne', sensation: 'Derniers relais' },
        { km: 98, alt: 110, grade: 0.0, landmark: 'Blanmont — Fin d\'épopée', sensation: 'Sourires partagés' },
      ],
    },
    {
      id: 'route-3',
      name: 'La Ronde des Chapelles & Bocages',
      distance: 62,
      elevation: 480,
      difficulty: 'Accessible / Plaisir',
      description:
        'Boucle panoramique accessible et lumineuse, idéale pour les groupes B & C et amateurs de vues champêtres.',
      points: [
        { km: 0, alt: 110, grade: 0.0, landmark: 'Départ Blanmont', sensation: 'Air frais du matin' },
        { km: 15, alt: 138, grade: 2.5, landmark: 'Hameau de Gentinnes', sensation: 'Rythme apaisé' },
        { km: 30, alt: 165, grade: 3.2, landmark: 'Chapelle aux Briques Rouges', sensation: 'Pause photo' },
        { km: 45, alt: 120, grade: -1.5, landmark: 'Chemin des Meuniers', sensation: 'Douceur de roulage' },
        { km: 62, alt: 110, grade: 0.0, landmark: 'Retour Blanmont', sensation: 'Plaisir intact' },
      ],
    },
  ];

  const currentRoute = routes[selectedRoute];
  const activePoint = currentRoute.points[scrubIndex] || currentRoute.points[0];

  // Generate SVG path coordinates
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const minAlt = Math.min(...currentRoute.points.map((p) => p.alt)) - 20;
  const maxAlt = Math.max(...currentRoute.points.map((p) => p.alt)) + 20;
  const maxKm = currentRoute.distance;

  const getCoordinates = (p: { km: number; alt: number }) => {
    const x = paddingX + (p.km / maxKm) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - ((p.alt - minAlt) / (maxAlt - minAlt)) * (svgHeight - 2 * paddingY);
    return { x, y };
  };

  const pathPoints = currentRoute.points.map(getCoordinates);
  const pathD = pathPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );

  const fillD = `${pathD} L ${pathPoints[pathPoints.length - 1].x},${svgHeight - paddingY} L ${pathPoints[0].x},${svgHeight - paddingY} Z`;

  const activeCoord = getCoordinates(activePoint);

  return (
    <section className="py-20 sm:py-28 bg-[#0a0c10] text-white border-b border-white/[0.08] relative overflow-hidden">
      {/* Background Topographic Contour Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="28" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 4" />
              <circle cx="30" cy="30" r="14" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-grid)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        {/* Section Masthead */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e03e3e]">
              <SparklesIcon className="h-4 w-4" />
              Cartographie &amp; Relief Brabançon
            </div>
            <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-white text-balance">
              Le Théâtre du Dénivelé
            </h2>
            <p className="text-base text-[#a7adbb] leading-relaxed">
              Survolez le profil altimétrique pour explorer les crêtes, les vallons et les haltes remarquables de nos parcours phares.
            </p>
          </div>

          {/* Route Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {routes.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRoute(idx);
                  setScrubIndex(Math.floor(r.points.length / 2));
                }}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                  selectedRoute === idx
                    ? 'bg-[#e03e3e] text-white border-[#e03e3e] shadow-lg shadow-[#e03e3e]/30'
                    : 'bg-white/5 text-[#a7adbb] border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {r.name.split(' ')[2] || r.name.split(' ')[1]} ({r.distance} km)
              </button>
            ))}
          </div>
        </div>

        {/* ── Interactive Profile Stage ── */}
        <div className="rounded-xl border border-white/15 bg-[#101216] p-6 sm:p-10 space-y-8 shadow-2xl">
          {/* Header Row of the selected route */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentRoute.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#a7adbb] mt-1 max-w-2xl">
                {currentRoute.description}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 text-xs font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
              <div>
                <span className="text-[#7d8493] block text-[10px] uppercase">Distance</span>
                <span className="text-white text-base tabular-nums font-extrabold">
                  {currentRoute.distance} km
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[#7d8493] block text-[10px] uppercase">Dénivelé</span>
                <span className="text-[#e03e3e] text-base tabular-nums font-extrabold">
                  +{currentRoute.elevation} m
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[#7d8493] block text-[10px] uppercase">Niveau</span>
                <span className="text-emerald-400 text-xs font-bold uppercase">
                  {currentRoute.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Interactive Wave Area */}
          <div className="relative">
            {/* Scrubber SVG Canvas */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-64 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e03e3e" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#e03e3e" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#e03e3e" stopOpacity="0.0" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Altitude Reference Gridlines */}
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={svgHeight / 2}
                x2={svgWidth - paddingX}
                y2={svgHeight / 2}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              {/* Shaded Area under curve */}
              <path d={fillD} fill="url(#elevationGrad)" />

              {/* Glowing Elevation Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#e03e3e"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Interactive Milestone Nodes */}
              {currentRoute.points.map((p, idx) => {
                const c = getCoordinates(p);
                const isCurrent = scrubIndex === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onClick={() => setScrubIndex(idx)}
                    onMouseEnter={() => setScrubIndex(idx)}
                  >
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isCurrent ? 7 : 4}
                      fill={isCurrent ? '#ffffff' : '#e03e3e'}
                      stroke={isCurrent ? '#e03e3e' : '#ffffff'}
                      strokeWidth={isCurrent ? 3 : 1.5}
                      className="transition-all duration-300"
                    />
                    {isCurrent && (
                      <line
                        x1={c.x}
                        y1={c.y}
                        x2={c.x}
                        y2={svgHeight - paddingY}
                        stroke="#e03e3e"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Mobile Scrubber Touch / Click Bar */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-[#7d8493] font-mono">
              <span>KM 0</span>
              <span className="text-[#a7adbb]">
                ← Cliquez ou survolez les étapes du parcours →
              </span>
              <span>KM {currentRoute.distance}</span>
            </div>
          </div>

          {/* ── Active Milestone Telemetry Card ── */}
          <div className="rounded-lg bg-[#161922] border border-white/10 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#e03e3e]">
                <MapPinIcon className="h-4 w-4" />
                <span>Point Kilométrique {activePoint.km} km</span>
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">
                {activePoint.landmark}
              </h4>
              <p className="text-xs text-[#a7adbb]">
                Sensation peloton : <em className="text-white not-italic">{activePoint.sensation}</em>
              </p>
            </div>

            <div className="md:col-span-6 grid grid-cols-3 gap-3 text-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
              <div className="bg-black/30 rounded p-2.5 border border-white/5">
                <span className="block text-lg font-extrabold text-white tabular-nums">
                  {activePoint.alt} m
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#7d8493]">
                  Altitude
                </span>
              </div>

              <div className="bg-black/30 rounded p-2.5 border border-white/5">
                <span
                  className={`block text-lg font-extrabold tabular-nums ${
                    activePoint.grade > 0 ? 'text-[#e03e3e]' : 'text-emerald-400'
                  }`}
                >
                  {activePoint.grade > 0 ? `+${activePoint.grade}%` : `${activePoint.grade}%`}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#7d8493]">
                  Pente
                </span>
              </div>

              <div className="bg-black/30 rounded p-2.5 border border-white/5">
                <span className="block text-lg font-extrabold text-white tabular-nums">
                  {Math.round((activePoint.km / currentRoute.distance) * 100)}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#7d8493]">
                  Avancée
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/traces"
              className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] transition-all shadow-lg shadow-[#e03e3e]/20"
            >
              <span>Accéder à la Bibliothèque des 250+ Traces</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/calendrier"
              className="inline-flex items-center gap-1.5 text-xs text-[#a7adbb] hover:text-white transition-colors"
            >
              <span>Voir les tracés de la saison</span>
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
