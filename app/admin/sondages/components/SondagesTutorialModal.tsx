'use client';

import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  ShareIcon,
  MapPinIcon,
  LightBulbIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface SondagesTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function SondagesTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: SondagesTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'ritual',
      label: '1. Rituel & Calendrier',
      badge: 'Débutant',
      icon: ClockIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le sondage est le <strong>cœur battant de la vie du club chaque semaine</strong>. Il permet de connaître à l&apos;avance l&apos;effectif présent et d&apos;ajuster les groupes pour garantir la sécurité et la convivialité du peloton.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white font-extrabold text-xs">
                  L
                </span>
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Lundi 08h00 : Création Automatique
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le sondage est généré automatiquement par un job cron à partir des sorties officielles du weekend. Vous pouvez aussi le lancer manuellement via le bouton <em>« Générer pour ce weekend »</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ambre text-white font-extrabold text-xs">
                  M-J
                </span>
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Mardi à Jeudi : Vote du Peloton
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Les membres se connectent sur <span className="font-mono text-brand font-semibold">/sondage</span> pour indiquer leur présence (Samedi, Dimanche, Les deux jours, ou Absent) et choisir leur groupe de niveau.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vert text-white font-extrabold text-xs">
                  V
                </span>
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Vendredi 18h00 : Clôture &amp; Synthèse
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                L&apos;organisateur clôture le sondage, vérifie qu&apos;aucun groupe ne dépasse 15 cyclistes (recommandation sécurité FFBC) et exporte le récapitulatif officiel sur WhatsApp.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Conseil pour les débutants :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Si la météo s&apos;annonce pluvieuse, vous pouvez ajouter une consigne dans le champ « Message aux membres » (ex. <em>« Garde-boue recommandés »</em> ou <em>« Départ décalé à 09h30 »</em>).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'whatsapp',
      label: '2. WhatsApp & Briefing',
      badge: 'Confirmé',
      icon: ShareIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Plus besoin de rédiger manuellement de longs messages WhatsApp ! La plateforme intègre un <strong>générateur de message prêt à l&apos;emploi</strong> avec émojis, listes d&apos;inscrits et liens GPX.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <ShareIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Fiche de Synthèse du Sondage
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Sur <span className="font-mono text-brand text-xs">/admin/sondages/[id]</span>, cliquez sur <strong>« Copier pour WhatsApp »</strong>. Le texte structuré avec la composition par groupe est copié dans votre presse-papiers.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Poste de Commandement (QG)
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Directement depuis le tableau de bord <span className="font-mono text-brand text-xs">/admin</span>, le bouton <strong>« Briefing WhatsApp »</strong> génère le rappel du weekend avec l&apos;heure, le lieu de départ et le lien GPX.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-3.5 space-y-2">
            <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
              Exemple de message généré :
            </span>
            <div className="font-mono text-xs p-3 rounded-xs bg-paper dark:bg-night border border-line dark:border-night-line text-ink dark:text-snow space-y-1 select-all">
              <p>🚴 CC SAINT-MARTIN BLANMONT · WEEKEND</p>
              <p>📍 Départ : Place de la Féchère · 09h00</p>
              <p>🟢 Groupe B (26-28 km/h) : Laurent, Nicolas, Marc, Sophie (4)</p>
              <p>🔴 Groupe A (&gt;29 km/h) : Pierre, Thomas (2)</p>
              <p>🗺️ Traces GPX disponibles sur le site du club</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'groups_traces',
      label: '3. Groupes & Traces GPX',
      badge: 'Avancé',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Pour assurer l&apos;homogénéité des allures et la sécurité sur la route, les cyclistes sont répartis en 4 groupes distincts avec leurs vitesses indicatives :
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-brand/30 bg-brand/5 space-y-1">
              <span className="font-bold text-brand text-xs uppercase tracking-wider font-narrow">
                Groupe A · Sportif (&gt; 29 km/h)
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Relais actifs, rythme soutenu et gestion des bosses à allure élevée. Capitaine désigné à l&apos;avant.
              </p>
            </div>

            <div className="p-3 rounded-md border border-hydro/30 bg-hydro/5 space-y-1">
              <span className="font-bold text-hydro text-xs uppercase tracking-wider font-narrow">
                Groupe B · Régulier (26 - 28 km/h)
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le gros du peloton du club. Allure constante, solidarité dans les montées, regroupement au sommet.
              </p>
            </div>

            <div className="p-3 rounded-md border border-vert/30 bg-vert/5 space-y-1">
              <span className="font-bold text-vert text-xs uppercase tracking-wider font-narrow">
                Groupe C · Randonnée (23 - 25 km/h)
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Sortie conviviale, priorité au plaisir et découverte du patrimoine. Idéal pour reprise ou endurance douce.
              </p>
            </div>

            <div className="p-3 rounded-md border border-bistre/30 bg-bistre/5 space-y-1">
              <span className="font-bold text-bistre text-xs uppercase tracking-wider font-narrow">
                Groupe VTT · Chemins &amp; Forêt
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Parcours tout-terrain à travers les sentiers du Brabant wallon et du Namurois (bois de Lauzelle, Meerdaal).
              </p>
            </div>
          </div>

          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night p-3.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-brand" />
              <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Liaison avec la trace GPX
              </span>
            </div>
            <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
              Lors de la création du sondage, sélectionnez le parcours officiel du calendrier. Le lien direct vers la trace Komoot / Strava et le fichier GPX sera automatiquement intégré pour que les membres puissent le charger sur leur compteur GPS (Garmin, Wahoo, Karoo).
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdminTutorialModal
      isOpen={isOpen}
      onClose={onClose}
      onStartTour={() => {
        onClose();
        onStartTour();
      }}
      title="Guide des Sondages Hebdomadaires"
      badge="Rituel Club"
      subtitle="Maîtrisez le cycle de vie du sondage, de la planification jusqu'à l'export WhatsApp du peloton."
      icon={ChatBubbleLeftRightIcon}
      iconColorClass="bg-brand/10 text-brand border-brand/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
