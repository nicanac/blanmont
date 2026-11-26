'use client';

import React, { useState } from 'react';
import { WeekendPoll, PollResponse } from '@/app/types';
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';
import { POLL_SLOTS, isAbsent, pollGroupName, responseSlots } from '@/app/lib/poll-slots';

const GROUP_ORDER = ['Groupe A', 'Groupe B', 'Groupe BC', 'Groupe C', 'Groupe VTT', 'Autre'];
const VARIANT_ORDER = ['plus', undefined, 'moins'];
const SLOT_EMOJI: Record<string, string> = {
  'samedi-matin': '🔵',
  'samedi-apres-midi': '🟠',
  'dimanche-matin': '🟡',
};

interface PollWhatsAppExportProps {
  poll: WeekendPoll;
  responses: PollResponse[];
}

export default function PollWhatsAppExport({ poll, responses }: PollWhatsAppExportProps) {
  const [copied, setCopied] = useState(false);
  const { fullName: groupFullName } = useGroupLabels();

  const active = responses.filter((r) => !isAbsent(r));

  // One line per group (GR2+ and GR2− apart), in the club's group order.
  const formatGroupLines = (list: PollResponse[]): string[] => {
    const rank = (r: PollResponse): number =>
      GROUP_ORDER.indexOf(r.groupChoice ?? 'Autre') * 10 + VARIANT_ORDER.indexOf(r.groupVariant);
    const byName = new Map<string, string[]>();
    [...list]
      .sort((a, b) => rank(a) - rank(b))
      .forEach((r) => {
        const name = pollGroupName(r, groupFullName);
        byName.set(name, [...(byName.get(name) ?? []), r.memberName]);
      });
    return [...byName].map(([name, names]) => `• *${name}* (${names.length}) : ${names.join(', ')}`);
  };

  const generateWhatsAppMessage = () => {
    let msg = `🚴‍♂️ *SORTIE DU WEEKEND — CC BLANMONT*\n`;
    msg += `📅 Weekend du ${poll.weekendIsoDate}\n`;
    msg += `👥 Total inscrits : ${active.length} cyclistes\n\n`;

    POLL_SLOTS.forEach((slot) => {
      const riders = responses.filter((r) => responseSlots(r).includes(slot.id));
      if (riders.length === 0) return;
      msg += `${SLOT_EMOJI[slot.id]} *${slot.label.toUpperCase()} (${riders.length})* :\n`;
      formatGroupLines(riders).forEach((line) => (msg += `${line}\n`));
      msg += `\n`;
    });

    if (poll.customQuestions && poll.customQuestions.length > 0) {
      poll.customQuestions.forEach((q) => {
        const counts: Record<string, number> = {};
        q.options.forEach((opt) => (counts[opt] = 0));
        active.forEach((r) => {
          const ans = r.customAnswers?.[q.id];
          if (!ans) return;
          if (Array.isArray(ans)) {
            ans.forEach((a) => {
              counts[a] = (counts[a] || 0) + 1;
            });
          } else {
            counts[ans] = (counts[ans] || 0) + 1;
          }
        });

        msg += `📏 *${q.title.toUpperCase()}* :\n`;
        q.options.forEach((opt) => {
          msg += `• ${opt} : ${counts[opt] || 0}\n`;
        });
        msg += `\n`;
      });
    }

    msg += `📲 Sondage en direct : https://blanmont.be/sondage`;
    return msg;
  };

  const handleCopy = async () => {
    try {
      const text = generateWhatsAppMessage();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Texte WhatsApp copié dans le presse-papier !');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Erreur lors de la copie.');
    }
  };

  return (
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 space-y-4">
      <div className="flex items-center gap-2 text-ink dark:text-snow-1 font-bold text-sm font-semiwide">
        <ShareIcon className="h-5 w-5 text-vert dark:text-vert-light" />
        <span>Récapitulatif WhatsApp</span>
      </div>

      <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
        Générez et copiez le message récapitulatif formaté pour le groupe WhatsApp des membres.
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-vert hover:bg-vert-strong text-white font-semibold py-2.5 text-xs transition-colors uppercase tracking-wider font-mono cursor-pointer min-h-[44px]"
      >
        {copied ? (
          <>
            <ClipboardDocumentCheckIcon className="h-4 w-4" />
            <span>Copié dans le presse-papier !</span>
          </>
        ) : (
          <>
            <ClipboardDocumentIcon className="h-4 w-4" />
            <span>Copier le texte WhatsApp</span>
          </>
        )}
      </button>
    </div>
  );
}
