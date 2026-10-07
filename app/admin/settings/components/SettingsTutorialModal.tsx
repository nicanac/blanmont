'use client';

import React from 'react';
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface SettingsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function SettingsTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: SettingsTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'theme',
      label: '1. Thèmes & Affichage',
      badge: 'Débutant',
      icon: PaintBrushIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            La plateforme propose deux ambiances chromatiques inspirées de la cartographie IGN belge : le papier topographique le jour et la feuille nocturne d&apos;état-major la nuit.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <SunIcon className="h-4 w-4 text-ambre" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Mode Clair
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Fond Day Map Paper (<span className="font-mono text-xs">#fbfbf8</span>). Idéal pour consulter les parcours et pointer les membres en plein soleil au départ.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <MoonIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Mode Sombre
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Feuille Nocturne (<span className="font-mono text-xs">#0d1013</span>). Repose les yeux lors des réunions du comité ou de la rédaction du briefing le vendredi soir.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <PaintBrushIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Mode Système
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Synchronisation automatique avec les préférences de votre smartphone, tablette ou ordinateur.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Raccourci rapide :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Le sélecteur de thème est également accessible d&apos;un clic dans l&apos;en-tête supérieur droit de toutes les pages d&apos;administration.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'identity',
      label: '2. Identité & Charte IGN',
      badge: 'Confirmé',
      icon: SparklesIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le club est ancré dans le terroir brabançon. Le système graphique <strong>« La Feuille de Blanmont »</strong> garantit une cohérence absolue entre l&apos;application et les tenues.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Cartouche Géodésique &amp; Coordonnées
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Coordonnées officielles du siège : <span className="font-mono text-xs font-bold text-ink dark:text-white">50°37′23″ N · 4°38′32″ E</span> (Place de la Féchère, 1450 Blanmont, Belgique).
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Palette des 5 Encres Cartographiques
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded border border-brand/40 bg-brand/10 text-brand font-bold text-center">
                  Route Red
                </div>
                <div className="p-2 rounded border border-bistre/40 bg-bistre/10 text-bistre font-bold text-center">
                  Relief Bistre
                </div>
                <div className="p-2 rounded border border-hydro/40 bg-hydro/10 text-hydro font-bold text-center">
                  Hydro Blue
                </div>
                <div className="p-2 rounded border border-vert/40 bg-vert/10 text-vert dark:text-vert-strong font-bold text-center">
                  Woodland Vert
                </div>
                <div className="p-2 rounded border border-ambre/40 bg-ambre/10 text-ambre font-bold text-center">
                  Ambre Signal
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security_rules',
      label: '3. Règles Fédérales & Sécurité',
      badge: 'Avancé',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le CC Saint-Martin Blanmont est affilié à la <strong>FFBC (Fédération Francophone Belge du Cyclotourisme)</strong>. Ces normes régissent l&apos;encadrement des sorties.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <span className="rounded-full bg-brand/20 text-brand border border-brand/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Règle des 15 Cyclistes
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le code de la route belge autorise les pelotons jusqu&apos;à 14 cyclistes à rouler sans capitaine désigné ni véhicule suiveur. Dès 15 coureurs, le groupe doit obligatoirement être scindé en sous-groupes ou encadré par 2 capitaines de route.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <span className="rounded-full bg-vert/20 text-vert dark:text-vert-strong border border-vert/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Sécurité &amp; Fiches ICE
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Casque rigide obligatoire pour tous les membres. Les capitaines ont accès en 1 tap aux numéros d&apos;urgence ICE et numéros de licence fédérale sur le terrain.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdminTutorialModal
      isOpen={isOpen}
      onClose={onClose}
      onStartTour={onStartTour ? () => {
        onClose();
        onStartTour();
      } : undefined}
      title="Guide des Paramètres & Configuration"
      badge="Configuration Club"
      subtitle="Thème graphique, identité cartographique IGN et conformité réglementaire FFBC."
      icon={Cog6ToothIcon}
      iconColorClass="bg-ink text-white border-line dark:border-night-line"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
