'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWeekendPollResponseAction } from '@/app/actions';
import { TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface AdminDeleteResponseButtonProps {
  pollId: string;
  memberId: string;
}

export default function AdminDeleteResponseButton({
  pollId,
  memberId,
}: AdminDeleteResponseButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Supprimer la réponse de ce membre ?')) return;

    startTransition(async () => {
      try {
        await deleteWeekendPollResponseAction(pollId, memberId);
        toast.success('Réponse supprimée.');
        router.refresh();
      } catch {
        toast.error('Erreur lors de la suppression.');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
      title="Supprimer cette réponse"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
