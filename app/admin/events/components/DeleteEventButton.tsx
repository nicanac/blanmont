'use client';

import React from 'react';
import AdminDeleteButton from '@/app/admin/components/AdminDeleteButton';

interface DeleteEventButtonProps {
  eventId: string;
  eventDate?: string;
}

export default function DeleteEventButton({ eventId, eventDate }: DeleteEventButtonProps): React.ReactElement {
  return (
    <AdminDeleteButton
      endpoint={`/api/admin/events/${eventId}`}
      itemTitle={eventDate ? `Sortie du ${eventDate}` : undefined}
      successMessage="Événement supprimé avec succès."
      errorMessage="Échec de la suppression de l'événement"
      ariaLabel="Supprimer la sortie"
    />
  );
}
