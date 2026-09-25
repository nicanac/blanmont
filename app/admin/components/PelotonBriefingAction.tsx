'use client';

import React, { useState } from 'react';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

export interface PelotonGroupSummary {
  name: string;
  count: number;
}

export interface PelotonBriefingActionProps {
  pollTitle?: string;
  dateStr?: string;
  attendeesCount: number;
  groups: PelotonGroupSummary[];
  departureLocation?: string;
  departureTime?: string;
  distance?: string;
  gpxUrl?: string;
}

export default function PelotonBriefingAction({
  dateStr,
  attendeesCount,
  groups,
  departureLocation,
  departureTime,
  distance,
  gpxUrl,
}: PelotonBriefingActionProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const generateBriefing = (): string => {
    const groupLines = groups
      .filter((g) => g.count > 0)
      .map((g) => `• *${g.name}* : ${g.count} cycliste${g.count > 1 ? 's' : ''}`)
      .join('\n');

    return [
      `🚴 *CC Saint-Martin Blanmont — Briefing Sortie*`,
      dateStr ? `📅 Date : ${dateStr}` : null,
      `📍 Rendez-vous : ${departureLocation || 'Place de la Féchère, Blanmont'}${departureTime ? ` (${departureTime})` : ''}`,
      distance ? `📏 Parcours : ${distance}` : null,
      `👥 Peloton : ${attendeesCount} inscrit${attendeesCount > 1 ? 's' : ''}`,
      groupLines ? `\n*Groupes constitués :*\n${groupLines}` : null,
      gpxUrl ? `\n🗺️ Parcours GPX : ${gpxUrl}` : null,
      `\nConsignes : Port du casque obligatoire, respect du code de la route et esprit de groupe. Bonne sortie ! 🇧🇪`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopy = async (): Promise<void> => {
    const text = generateBriefing();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-narrow font-bold uppercase tracking-[0.07em] transition-all active:translate-y-px ${
        copied
          ? 'bg-vert text-white border border-vert'
          : 'bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3'
      }`}
      title="Copier le récapitulatif formaté pour WhatsApp"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" />
          <span>Briefing copié !</span>
        </>
      ) : (
        <>
          <ClipboardDocumentCheckIcon className="h-4 w-4 text-brand" />
          <span>Copier Briefing WhatsApp</span>
        </>
      )}
    </button>
  );
}
