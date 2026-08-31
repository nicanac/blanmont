'use client';

import React, { useState } from 'react';
import { WeekendPoll, PollResponse } from '@/app/types';
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface PollWhatsAppExportProps {
  poll: WeekendPoll;
  responses: PollResponse[];
}

export default function PollWhatsAppExport({ poll, responses }: PollWhatsAppExportProps) {
  const [copied, setCopied] = useState(false);

  const active = responses.filter((r) => r.dayChoice !== 'absent');
  const saturday = responses.filter((r) => r.dayChoice === 'samedi' || r.dayChoice === 'les-deux');
  const sunday = responses.filter((r) => r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux');

  const formatGroupList = (list: PollResponse[], groupName: string) => {
    const membersInGroup = list.filter((r) => r.groupChoice === groupName);
    if (membersInGroup.length === 0) return null;
    return `• *${groupName}* (${membersInGroup.length}) : ${membersInGroup.map((m) => m.memberName).join(', ')}`;
  };

  const generateWhatsAppMessage = () => {
    let msg = `🚴‍♂️ *SORTIE DU WEEKEND — CC BLANMONT*\n`;
    msg += `📅 Weekend du ${poll.weekendIsoDate}\n`;
    msg += `👥 Total inscrits : ${active.length} cyclistes\n\n`;

    if (saturday.length > 0) {
      msg += `🔵 *SAMEDI MATIN (${saturday.length})* :\n`;
      ['Groupe A', 'Groupe B', 'Groupe C', 'Groupe VTT'].forEach((grp) => {
        const line = formatGroupList(saturday, grp);
        if (line) msg += `${line}\n`;
      });
      msg += `\n`;
    }

    if (sunday.length > 0) {
      msg += `🟡 *DIMANCHE MATIN (${sunday.length})* :\n`;
      ['Groupe A', 'Groupe B', 'Groupe C', 'Groupe VTT'].forEach((grp) => {
        const line = formatGroupList(sunday, grp);
        if (line) msg += `${line}\n`;
      });
      msg += `\n`;
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
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
        <ShareIcon className="h-5 w-5 text-emerald-600" />
        <span>Récapitulatif WhatsApp</span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Générez et copiez le message récapitulatif formaté pour le groupe WhatsApp des membres.
      </p>

      <button
        onClick={handleCopy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 text-xs shadow-xs transition-colors"
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
