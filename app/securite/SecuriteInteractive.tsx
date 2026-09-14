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
import {
  ExclamationTriangleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface SignalItem {
  id: string;
  category: 'sol' | 'trafic' | 'groupe';
  title: string;
  voice: string;
  intensity: 'Urgent' | 'Vigilance' | 'Manœuvre';
  icon: React.ComponentType<{ className?: string }>;
  gestureDescription: string;
  vocalAdvice: string;
  transmissionRule: string;
}

const SIGNALS_DATA: SignalItem[] = [
  {
    id: 'trou',
    category: 'sol',
    title: 'Nid-de-poule & Plaque d’égout',
    voice: '« TROU ! » ou « GRAVILLONS ! »',
    intensity: 'Urgent',
    icon: SignalPotholeIcon,
    gestureDescription:
      'Lâchez brièvement le cintre d’une main pour pointer fermement l’index vers le sol du côté exact où se situe le danger (gauche ou droite).',
    vocalAdvice: 'Criez d’une voix sèche et forte 2 à 3 secondes avant l’impact.',
    transmissionRule:
      'Chaque coureur répète le geste et la voix. La transmission doit atteindre la queue du peloton en moins de 2 secondes.',
  },
  {
    id: 'obstacle-lateral',
    category: 'sol',
    title: 'Obstacle latéral / Véhicule en stationnement',
    voice: '« À GAUCHE ! »',
    intensity: 'Vigilance',
    icon: SignalDeviationIcon,
    gestureDescription:
      'Placez le bras plié dans le dos, main ouverte avec la paume et les doigts oscillant vers la gauche pour faire dévier le groupe en douceur.',
    vocalAdvice: 'Annoncez sans panique pour éviter tout coup de guidon brusque dans le peloton.',
    transmissionRule:
      'Le premier rideau amorce la trajectoire fluide ; les suivants suivent le mouvement sans freiner.',
  },
  {
    id: 'ralentissement',
    category: 'groupe',
    title: 'Ralentissement brusque & Arrêt',
    voice: '« ÇA RALENTIT ! » ou « ARRÊT ! »',
    intensity: 'Urgent',
    icon: SignalStopIcon,
    gestureDescription:
      'Levez verticalement le bras droit, paume ouverte orientée vers les cyclistes qui vous suivent. Freinez de manière progressive avec les deux mains.',
    vocalAdvice: 'Le cri doit précéder le freinage puissant : ne jamais piler sans avertir.',
    transmissionRule:
      'Obligation absolue pour chaque ligne de relayer la main en l’air pour prévenir l’effet d’accordéon.',
  },
  {
    id: 'vehicule-face',
    category: 'trafic',
    title: 'Véhicule en face (Route étroite)',
    voice: '« VOITURE DEVANT ! »',
    intensity: 'Vigilance',
    icon: SignalVehicleIcon,
    gestureDescription:
      'Pas de geste complexe : gardez les deux mains sur les cocottes pour maintenir la maîtrise de la trajectoire.',
    vocalAdvice: 'Annonce vocale puissante transmise de l’avant vers l’arrière du groupe.',
    transmissionRule:
      'Le peloton resserre immédiatement la double file vers la droite sans empiéter sur l’accotement herbeux.',
  },
  {
    id: 'vehicule-arriere',
    category: 'trafic',
    title: 'Véhicule en approche par l’arrière',
    voice: '« VOITURE DERRIÈRE ! »',
    intensity: 'Vigilance',
    icon: SignalVehicleIcon,
    gestureDescription:
      'Annoncé en premier lieu par les coureurs ou le capitaine en queue de peloton.',
    vocalAdvice: 'Cri clair et puissant pour traverser les 20 à 30 mètres du groupe.',
    transmissionRule:
      'Remonte immédiatement de l’arrière vers l’avant. Les cyclistes de gauche se rabattent si la chaussée est trop étroite.',
  },
  {
    id: 'file-indienne',
    category: 'groupe',
    title: 'Passage temporaire en simple file',
    voice: '« EN FILE ! »',
    intensity: 'Manœuvre',
    icon: SignalSingleFileIcon,
    gestureDescription:
      'L’index levé au-dessus de la tête indique la formation en file indienne.',
    vocalAdvice: 'Ordre exclusif donné par les capitaines de route ou les relayeurs de tête.',
    transmissionRule:
      'Le coureur de gauche ralentit légèrement de 1 km/h pour s’intercaler en douceur derrière son binôme de droite.',
  },
  {
    id: 'carrefour',
    category: 'trafic',
    title: 'Franchissement de Carrefour / Cédez le passage',
    voice: '« LIBRE ! » ou « STOP ! »',
    intensity: 'Urgent',
    icon: SignalIntersectionIcon,
    gestureDescription:
      'Bras tendu vers l’avant pour « Libre » ou main levée haute paume ouverte pour « Stop ».',
    vocalAdvice:
      'Règle d’or : ne criez « Libre » QUE si la visibilité est totale à 100%. Au moindre doute, c’est « Stop ».',
    transmissionRule:
      'Si un capitaine C3 est présent, il immobilise les voies secondaires pour faire passer le bloc.',
  },
  {
    id: 'relais',
    category: 'groupe',
    title: 'Passage du Relais en Tête',
    voice: '« ON TOURNE ! »',
    intensity: 'Manœuvre',
    icon: SignalRelayIcon,
    gestureDescription:
      'Un coup de coude discret du côté où le coureur s’écarte (habituellement côté vent ou gauche).',
    vocalAdvice: 'Annonce brève à son équipier de tête.',
    transmissionRule:
      'Le relayeur s’écarte sans ralentir brusquement, laisse glisser le peloton, puis reprend la dernière roue.',
  },
];

const PACELINE_STEPS = [
  {
    step: 1,
    title: 'La Prise de Relais à Allure Constante',
    description:
      'L’erreur la plus fréquente du néophyte est d’accélérer de 2 à 3 km/h lorsqu’il passe en tête face au vent. La règle est de conserver scrupuleusement la vitesse cible (ex: 29 km/h constants pour le Groupe B) sans à-coup.',
    tactics: 'Surveillez votre compteur : la puissance augmente pour fendre l’air, mais la vitesse reste identique.',
  },
  {
    step: 2,
    title: 'L’Annonce par Coup de Coude',
    description:
      'Après un relais de 30 secondes à 1 minute selon le vent, le coureur de tête signale sa fin de passage par un coup de coude bref du côté où il va s’écarter.',
    tactics: 'Ne coupez pas votre effort avant d’avoir complètement libéré la trajectoire du coureur qui monte.',
  },
  {
    step: 3,
    title: 'Le Décrochage et la Glisse',
    description:
      'Le relayeur sortant s’écarte d’environ 1 mètre latéralement et réduit sa vitesse de 1 à 2 km/h. Il utilise la file descendante pour récupérer tout en restant vigilant.',
    tactics: 'Gardez les mains sur les leviers : une rafale de vent latérale ne doit pas vous déséquilibrer.',
  },
  {
    step: 4,
    title: 'La Réintégration en Queue de Peloton',
    description:
      'À l’approche du dernier coureur du groupe, ce dernier crie « Dernière roue ! » pour vous avertir. Le coureur sortant remet un coup de pédale anticipé pour se caler immédiatement dans l’aspiration sans créer de trou.',
    tactics: 'Ne vous laissez pas déborder : réaccélérez 5 mètres avant pour entrer avec la même vélocité.',
  },
];

export default function SecuriteInteractive(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<'all' | 'sol' | 'trafic' | 'groupe'>('all');
  const [activePacelineStep, setActivePacelineStep] = useState<number>(1);

  const filteredSignals = SIGNALS_DATA.filter((s) =>
    activeCategory === 'all' ? true : s.category === activeCategory
  );

  return (
    <div className="space-y-16">
      {/* ──── Section : Répertoire Interactif des Signaux ──── */}
      <section id="signaux" className="space-y-6 scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#e4e0d8] dark:border-[#262b38]">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
              Le Langage Gestuel &amp; Vocal du Peloton
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              À 30 km/h, le cycliste en 10ᵉ position ne voit pas le bitume devant la roue de tête. Chaque signal
              visuel doit être doublé instantanément d&apos;une annonce vocale puissante.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-[#101216] text-white dark:bg-white dark:text-[#101216]'
                  : 'bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]'
              }`}
            >
              Tous les signaux ({SIGNALS_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('sol')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'sol'
                  ? 'bg-[#e03e3e] text-white'
                  : 'bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]'
              }`}
            >
              Obstacles au sol
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('trafic')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'trafic'
                  ? 'bg-[#e03e3e] text-white'
                  : 'bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]'
              }`}
            >
              Trafic &amp; Voitures
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('groupe')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
                activeCategory === 'groupe'
                  ? 'bg-[#e03e3e] text-white'
                  : 'bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]'
              }`}
            >
              Mouvements de groupe
            </button>
          </div>
        </div>

        {/* Signals Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSignals.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-5 flex flex-col justify-between space-y-4 hover:border-[#cfc9be] dark:hover:border-white/20 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  {/* Top Bar with SVG Icon & Intensity Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                        item.intensity === 'Urgent'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                          : item.intensity === 'Vigilance'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                          : 'bg-[#faf8f5] dark:bg-white/5 text-[#5c6370] dark:text-[#a7adbb] border border-[#e4e0d8] dark:border-white/10'
                      }`}
                    >
                      {item.intensity}
                    </span>
                  </div>

                  {/* Title & Callout Quote */}
                  <div>
                    <h3 className="text-sm font-bold text-[#101216] dark:text-white leading-tight">
                      {item.title}
                    </h3>
                    <div className="mt-2 p-2 rounded-md bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38]">
                      <span className="text-xs font-mono font-bold text-[#e03e3e] tracking-tight block">
                        {item.voice}
                      </span>
                    </div>
                  </div>

                  {/* Gesture Description */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-[#7d8493]">
                      Geste technique :
                    </span>
                    <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                      {item.gestureDescription}
                    </p>
                  </div>
                </div>

                {/* Transmission Rule Footer */}
                <div className="pt-3 border-t border-[#efece5] dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-semibold text-[#7d8493] flex items-center gap-1">
                    <InformationCircleIcon className="h-3 w-3 text-[#e03e3e]" />
                    <span>Règle de transmission :</span>
                  </span>
                  <p className="text-[11px] text-[#3a3f4a] dark:text-[#a7adbb] leading-tight">
                    {item.transmissionRule}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──── Section : Technique de la Paceline (L'art du Relais) ──── */}
      <section id="relais" className="space-y-6 scroll-mt-28">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
            L&apos;Art du Relais en Double File (Paceline)
          </h2>
          <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
            Rouler en peloton permet d&apos;économiser jusqu&apos;à 35% d&apos;énergie dans les roues. Mais cette mécanique
            n&apos;est sûre que si les relais s&apos;enchaînent avec la régularité d&apos;un métronome suisse.
          </p>
        </div>

        {/* Interactive Step Carousel / Explainer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Step Selector Buttons (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            {PACELINE_STEPS.map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActivePacelineStep(s.step)}
                className={`w-full text-left p-4 rounded-[10px] border transition-all flex items-start gap-3.5 ${
                  activePacelineStep === s.step
                    ? 'bg-white dark:bg-[#161922] border-[#e03e3e] shadow-sm'
                    : 'bg-[#faf8f5] dark:bg-[#101216] border-[#e4e0d8] dark:border-[#262b38] hover:border-[#cfc9be]'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    activePacelineStep === s.step
                      ? 'bg-[#e03e3e] text-white'
                      : 'bg-[#e4e0d8] dark:bg-white/10 text-[#5c6370] dark:text-[#a7adbb]'
                  }`}
                >
                  0{s.step}
                </div>
                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold leading-snug ${
                      activePacelineStep === s.step
                        ? 'text-[#101216] dark:text-white'
                        : 'text-[#5c6370] dark:text-[#a7adbb]'
                    }`}
                  >
                    {s.title}
                  </h4>
                </div>
              </button>
            ))}
          </div>

          {/* Step Detail Card (8 cols) */}
          <div className="lg:col-span-8 rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-8 space-y-6 shadow-xs">
            {(() => {
              const current = PACELINE_STEPS.find((s) => s.step === activePacelineStep) || PACELINE_STEPS[0];
              return (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-[#efece5] dark:border-white/10">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e03e3e]">
                      Phase 0{current.step} / 04 · Mouvement Tactique
                    </span>
                    <span className="text-xs font-semibold text-[#7d8493]">
                      Allure de référence : 28–32 km/h
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#101216] dark:text-white">
                      {current.title}
                    </h3>
                    <p className="text-sm text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed">
                      {current.description}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-[#101216] dark:text-white block mb-0.5">
                        Consigne du Capitaine :
                      </span>
                      <p className="text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                        {current.tactics}
                      </p>
                    </div>
                  </div>

                  {/* Navigation controls between steps */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActivePacelineStep((prev) => Math.max(1, prev - 1))}
                      disabled={activePacelineStep === 1}
                      className="px-3.5 py-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] disabled:opacity-40 hover:bg-[#faf8f5] dark:hover:bg-white/5 transition-colors"
                    >
                      &larr; Phase précédente
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePacelineStep((prev) => Math.min(4, prev + 1))}
                      disabled={activePacelineStep === 4}
                      className="px-4 py-1.5 rounded-md bg-[#101216] dark:bg-white text-white dark:text-[#101216] text-xs font-semibold disabled:opacity-40 hover:bg-[#242938] transition-colors"
                    >
                      Phase suivante &rarr;
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ──── Section : Protocole Chute & Urgence 112 ──── */}
      <section id="urgence" className="scroll-mt-28">
        <div className="rounded-[10px] border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-[#161922] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#efece5] dark:border-white/10">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xl font-extrabold text-[#101216] dark:text-white">
                  Protocole en Cas de Chute ou d&apos;Accident
                </h3>
                <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                  Les 4 réflexes immédiats à appliquer en cas de sinistre sur la chaussée.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                Zone de Secours Brabant Wallon (112)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-600">01</span>
                <span className="text-[10px] uppercase font-bold text-[#7d8493]">Priorité 1</span>
              </div>
              <h4 className="text-sm font-bold text-[#101216] dark:text-white">Protéger la zone</h4>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Positionnez immédiatement deux cyclistes à 50 mètres en amont et en aval pour ralentir le trafic routier.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-600">02</span>
                <span className="text-[10px] uppercase font-bold text-[#7d8493]">Règle Médicale</span>
              </div>
              <h4 className="text-sm font-bold text-[#101216] dark:text-white">Casque Intouchable</h4>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Ne retirez <strong>jamais</strong> le casque d’un cycliste au sol. Ne tentez pas de le relever de force.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-600">03</span>
                <span className="text-[10px] uppercase font-bold text-[#7d8493]">Secours 112</span>
              </div>
              <h4 className="text-sm font-bold text-[#101216] dark:text-white">Balise GPS 112</h4>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Relevez les coordonnées GPS exactes affichées sur votre compteur Garmin/Wahoo ou smartphone avant d’appeler le 112.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-600">04</span>
                <span className="text-[10px] uppercase font-bold text-[#7d8493]">Contact ICE</span>
              </div>
              <h4 className="text-sm font-bold text-[#101216] dark:text-white">Alerte des Proches</h4>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Le capitaine ouvre l’application CC Blanmont pour déclencher l’appel vers le contact ICE renseigné par le membre.
              </p>
            </div>
          </div>

          {/* Action Box */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#efece5] dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <ShieldCheckIcon className="h-5 w-5 text-[#e03e3e]" />
              <span className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                Vos informations d&apos;urgence ICE sont-elles à jour pour la saison 2026 ?
              </span>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-xs min-h-[44px]"
            >
              <span>Vérifier ma fiche d&apos;urgence ICE</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
