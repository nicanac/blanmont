'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateWeekendPollAction } from '@/app/actions';
import { toast } from 'sonner';

interface PollStatusToggleProps {
  pollId: string;
  currentStatus: 'draft' | 'active' | 'closed';
}

export default function PollStatusToggle({ pollId, currentStatus }: PollStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'closed') => {
    startTransition(async () => {
      try {
        await updateWeekendPollAction(pollId, { status: newStatus });
        toast.success(`Statut mis à jour : ${newStatus}`);
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erreur : ${msg}`);
      }
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleStatusChange(e.target.value as 'draft' | 'active' | 'closed')}
      disabled={isPending}
      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#e03e3e] focus:outline-hidden disabled:opacity-50"
    >
      <option value="active">Actif (ouvert)</option>
      <option value="closed">Clôturé</option>
      <option value="draft">Brouillon</option>
    </select>
  );
}
