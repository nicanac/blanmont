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
      id={`poll-status-toggle-${pollId}`}
      aria-label="Modifier le statut du sondage"
      value={currentStatus}
      onChange={(e) => handleStatusChange(e.target.value as 'draft' | 'active' | 'closed')}
      disabled={isPending}
      className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#f5f6f8] focus:border-[#e03e3e] focus:outline-hidden transition-colors duration-150 disabled:opacity-50 cursor-pointer"
    >
      <option value="active">Actif (ouvert)</option>
      <option value="closed">Clôturé</option>
      <option value="draft">Brouillon</option>
    </select>
  );
}
