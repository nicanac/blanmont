'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SignalPotholeIcon,
  SignalDeviationIcon,
  SignalStopIcon,
  SignalVehicleIcon,
  SignalIntersectionIcon,
  SignalRelayIcon,
  SignalSingleFileIcon,
} from './SignalIcons';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface SignalItem {
  id: string;
  category: 'sol' | 'trafic' | 'groupe';
  title: string;
  voice: string;
  gesture: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIGNALS_DATA: SignalItem[] = [
  {
    id: 'trou',
    category: 'sol',
    title: 'Nid-de-poule & Gravillons',
    voice: '« TROU ! » ou « GRAVIER ! »',
    gesture: 'Pointer l’index vers le sol du côté du danger.',
    action: 'Relayer le cri et le geste jusqu’en queue.',
    icon: SignalPotholeIcon,
  },
  {
    id: 'obstacle-lateral',
    category: 'sol',
    title: 'Obstacle latéral / Véhicule à l’arrêt',
    voice: '« À GAUCHE ! » ou « À DROITE ! »',
    gesture: 'Main dans le dos ondulant vers la direction d’évitement.',
    action: 'Décaler la ligne en souplesse sans freiner.',
    icon: SignalDeviationIcon,
  },
  {
    id: 'ralentissement',
    category: 'groupe',
    title: 'Ralentissement & Arrêt',
    voice: '« ÇA RALENTIT ! » ou « ARRÊT ! »',
    gesture: 'Bras droit levé verticalement, paume ouverte.',
    action: 'Freinage progressif à deux mains pour amortir l’accordéon.',
    icon: SignalStopIcon,
  },
  {
    id: 'vehicule-face',
    category: 'trafic',
    title: 'Véhicule en face (Route étroite)',
    voice: '« VOITURE EN FACE ! »',
    gesture: 'Aucun geste : deux mains fermes sur les cocottes.',
    action: 'Resserrer la double file à droite sans mordre le bas-côté.',
    icon: SignalVehicleIcon,
  },
  {
    id: 'vehicule-arriere',
    category: 'trafic',
    title: 'Véhicule en approche arrière',
    voice: '« VOITURE DERRIÈRE ! »',
    gesture: 'Cri lancé depuis la queue de peloton.',
    action: 'Faire remonter l’alerte jusqu’en tête.',
    icon: SignalVehicleIcon,
  },
  {
    id: 'file-indienne',
    category: 'groupe',
    title: 'Passage en simple file',
    voice: '« EN FILE ! »',
    gesture: 'Index levé au-dessus du casque.',
    action: 'Le coureur de gauche s’intercale derrière son binôme.',
    icon: SignalSingleFileIcon,
  },
  {
    id: 'carrefour',
    category: 'trafic',
    title: 'Carrefour & Cédez le passage',
    voice: '« LIBRE ! » ou « STOP ! »',
    gesture: 'Bras tendu vers l’avant (Libre) ou main levée haute (Stop).',
    action: 'Ne crier « Libre » que si la vue est dégagée à 100 %.',
    icon: SignalIntersectionIcon,
  },
  {
    id: 'relais',
    category: 'groupe',
    title: 'Fin de relais en tête',
    voice: '« ON TOURNE ! »',
    gesture: 'Coup de coude franc du côté du dégagement.',
    action: 'S’écarter sans couper l’effort, laisser monter la ligne active.',
    icon: SignalRelayIcon,
  },
];

const PACELINE_STEPS = [
  {
    step: 1,
    title: 'Allure constante en tête',
    summary: 'Conserver la vitesse du peloton. Ne jamais accélérer en prenant le vent sous peine de casser le groupe.',
  },
  {
    step: 2,
    title: 'Signal par coup de coude',
    summary: 'Après 30 à 60 secondes en tête, signaler sa fin de passage d’un coup de coude franc du côté de sortie.',
  },
  {
    step: 3,
    title: 'Glisse latérale dans le vent',
    summary: 'Se décaler de 50 cm à 1 m et laisser glisser le peloton en continuant de pédaler avec souplesse.',
  },
  {
    step: 4,
    title: 'Raccrochage en dernière roue',
    summary: 'Sur l’annonce « Dernière roue ! » du serre-file, relancer avec anticipation pour reprendre l’aspiration.',
  },
];

const EMERGENCY_STEPS = [
  {
    step: '01',
    label: 'Protéger',
    instruction: 'Placer deux cyclistes à 50 mètres en amont et en aval pour ralentir le trafic et bloquer le sur-accident.',
  },
  {
    step: '02',
    label: 'Casque intouchable',
    instruction: 'Ne jamais retirer le casque d’un coureur au sol. Protéger l’axe tête-cou-tronc.',
  },
  {
    step: '03',
    label: 'Alerte 112',
    instruction: 'Relever les coordonnées GPS (compteur/smartphone) et la commune avant de joindre le 112.',
  },
  {
    step: '04',
    label: 'Fiche ICE',
    instruction: 'Ouvrir l’app CC Blanmont pour joindre immédiatement le contact d’urgence enregistré par le membre.',
  },
];

export default function SecuriteInteractive(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<'all' | 'sol' | 'trafic' | 'groupe'>('all');

  const filteredSignals = SIGNALS_DATA.filter((s) =>
    activeCategory === 'all' ? true : s.category === activeCategory
  );

  return (
    <div className="space-y-16">
      {/* ──── Section : Lexique Scannable des Signaux ──── */}
      <section id="signaux" className="space-y-6 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-line dark:border-night-line">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              Signaux Vocaux &amp; Gestuels
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 dark:text-snow-3">
              Tout signal visuel est doublé immédiatement par une annonce vocale forte.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-ink text-white dark:bg-white dark:text-ink'
                  : 'bg-white dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:border-line-strong'
              }`}
            >
              Tous ({SIGNALS_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('sol')}
              className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'sol'
                  ? 'bg-brand text-white'
                  : 'bg-white dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:border-line-strong'
              }`}
            >
              Chaussée
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('trafic')}
              className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'trafic'
                  ? 'bg-brand text-white'
                  : 'bg-white dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:border-line-strong'
              }`}
            >
              Trafic
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('groupe')}
              className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'groupe'
                  ? 'bg-brand text-white'
                  : 'bg-white dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:border-line-strong'
              }`}
            >
              Peloton
            </button>
          </div>
        </div>

        {/* Compact, Flat Signal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSignals.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-4 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-paper dark:bg-ink border border-line dark:border-night-line text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-brand tracking-tight">
                      {item.voice}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-ink dark:text-white leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs text-ink-3 dark:text-snow-3 leading-normal">
                    {item.gesture}
                  </p>
                </div>

                <div className="pt-2 border-t border-paper-2 dark:border-white/5">
                  <p className="text-xs font-medium text-ink dark:text-snow leading-tight">
                    {item.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──── Section : Déroulé Linéaire du Relais (Paceline) ──── */}
      <section id="relais" className="space-y-6 scroll-mt-28">
        <div className="space-y-1 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
            Rotation du Relais en 4 Temps
          </h2>
          <p className="text-xs sm:text-sm text-ink-3 dark:text-snow-3">
            La double file permet d&apos;économiser jusqu&apos;à 35 % d&apos;énergie. Les passages s&apos;enchaînent avec une vitesse strictement régulière.
          </p>
        </div>

        {/* Flat 4-Stage Linear Grid: All steps visible at once */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACELINE_STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 md:h-6 md:w-6 items-center justify-center rounded-md bg-paper dark:bg-ink border border-line dark:border-night-line text-xs font-bold text-brand">
                  {s.step}
                </span>
                <span className="text-xs uppercase font-bold text-ink-3">
                  Temps {s.step}/4
                </span>
              </div>

              <h3 className="text-sm font-bold text-ink dark:text-white leading-snug">
                {s.title}
              </h3>

              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                {s.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Section : Protocole Chute & Urgence 112 ──── */}
      <section id="urgence" className="space-y-6 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-line dark:border-night-line">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              Protocole en Cas de Chute
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 dark:text-snow-3">
              Les 4 priorités réflexes en cas de sinistre sur la chaussée.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              Appel d&apos;urgence : 112
            </span>
          </div>
        </div>

        {/* 4 Linear Emergency Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EMERGENCY_STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-5 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600">{item.step}</span>
                <span className="text-xs uppercase font-bold text-ink-3">{item.label}</span>
              </div>
              <h3 className="text-sm font-bold text-ink dark:text-white">
                {item.label}
              </h3>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                {item.instruction}
              </p>
            </div>
          ))}
        </div>

        {/* ICE Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-white dark:bg-night-2 border border-line dark:border-night-line shadow-xs">
          <span className="text-xs text-ink-3 dark:text-snow-3">
            Vos coordonnées d&apos;urgence ICE doivent être tenues à jour sur votre profil membre.
          </span>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-md bg-brand hover:bg-brand-strong text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 min-h-[44px]"
          >
            <span>Vérifier ma fiche ICE</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
