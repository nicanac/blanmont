'use client';

import React from 'react';
import { deleteWeekendPollAction } from '@/app/actions';
import AdminDeleteButton from '@/app/admin/components/AdminDeleteButton';

export default function AdminDeletePollButton({ pollId }: { pollId: string }) {
  return (
    <AdminDeleteButton
      onDelete={async () => {
        await deleteWeekendPollAction(pollId);
      }}
      confirmStyle="button-with-prompt"
      confirmPrompt="Êtes-vous sûr de vouloir supprimer définitivement ce sondage et toutes ses réponses ?"
      redirectOnSuccess="/admin/sondages"
      successMessage="Sondage supprimé avec succès."
      errorMessage="Erreur lors de la suppression du sondage."
      ariaLabel="Supprimer le sondage"
    />
  );
}
