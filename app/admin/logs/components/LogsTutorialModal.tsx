'use client';

import React from 'react';
import { XMarkIcon, ShieldCheckIcon, EyeIcon, UserGroupIcon, CommandLineIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogsTutorialModal({ isOpen, onClose }: Props): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-paper dark:bg-night border border-line dark:border-night-line rounded-lg shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line dark:border-night-line">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-wide font-extrabold uppercase tracking-tight text-ink dark:text-white">
                Guide du Journal d&apos;Activité &amp; Audit
              </h2>
              <p className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                Traçabilité · Observabilité · Conformité RGPD
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-3 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4 text-xs font-sans text-ink-2 dark:text-snow-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
            <h3 className="font-bold text-ink dark:text-white flex items-center gap-2 mb-1.5">
              <EyeIcon className="h-4 w-4 text-hydro" />
              1. Visiteurs Anonymes vs Membres Connectés
            </h3>
            <p className="leading-relaxed">
              Le journal consigne automatiquement les parcours des visiteurs non connectés (téléchargements GPX, consultations de traces, demandes d&apos;inscription) via un identifiant de session anonyme (<code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-xs">anon_...</code>). Dès qu&apos;un membre se connecte, toutes ses interactions (votes, réponses aux sondages, débriefs de sorties) sont nominativement attribuées.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
            <h3 className="font-bold text-ink dark:text-white flex items-center gap-2 mb-1.5">
              <UserGroupIcon className="h-4 w-4 text-vert" />
              2. Encres topographiques (Code Couleur Carte IGN)
            </h3>
            <ul className="grid grid-cols-2 gap-2 mt-2 font-narrow text-xs uppercase font-bold">
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-vert shrink-0" />
                <span>Vert · Membres &amp; Participations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-hydro shrink-0" />
                <span>Bleu · Navigation &amp; GPX</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-ambre shrink-0" />
                <span>Ambre · Actions Administration</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-brand shrink-0" />
                <span>Rouge · Alertes Sécurité</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
            <h3 className="font-bold text-ink dark:text-white flex items-center gap-2 mb-1.5">
              <ShieldCheckIcon className="h-4 w-4 text-brand" />
              3. Protection des Données &amp; Masquage IP (RGPD)
            </h3>
            <p className="leading-relaxed">
              Conformément à la réglementation belge et européenne, aucune adresse IP brute n&apos;est persistée. Les adresses IPv4 sont systématiquement tronquées (<code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-xs">xxx.xxx.xxx.xxx</code>) pour interdire toute géolocalisation abusive tout en préservant le diagnostic réseau.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
            <h3 className="font-bold text-ink dark:text-white flex items-center gap-2 mb-1.5">
              <CommandLineIcon className="h-4 w-4 text-ambre" />
              4. Export &amp; Rétention
            </h3>
            <p className="leading-relaxed">
              Vous pouvez exporter l&apos;intégralité du tableau filtré au format CSV en un clic. La politique de rétention recommandée est de 90 jours. Utilisez le bouton &laquo; Purger les anciens logs &raquo; pour libérer l&apos;espace de base de données.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-line dark:border-night-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-brand text-white font-narrow font-bold uppercase tracking-wider text-xs hover:bg-brand-vif transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
