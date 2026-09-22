'use client';

import React from 'react';
import AdminDeleteButton from '@/app/admin/components/AdminDeleteButton';

interface DeleteMemberButtonProps {
  memberId: string;
  memberName?: string;
}

export default function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps): React.ReactElement {
  return (
    <AdminDeleteButton
      endpoint={`/api/admin/members/${memberId}`}
      itemTitle={memberName}
      successMessage="Membre supprimé avec succès."
      errorMessage="Échec de la suppression du membre"
      ariaLabel="Supprimer le membre"
    />
  );
}
