'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWeekendPollAction } from '@/app/actions';
import { TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function AdminDeletePollButton({ pollId }: { pollId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce sondage et toutes ses réponses ?')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteWeekendPollAction(pollId);
        toast.success('Sondage supprimé avec succès.');
        router.push('/admin/sondages');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erreur : ${msg}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      <TrashIcon className="h-4 w-4" />
      <span>{isPending ? 'Suppression...' : 'Supprimer'}</span>
    </button>
  );
}
