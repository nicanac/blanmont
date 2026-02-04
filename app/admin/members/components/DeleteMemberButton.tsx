'use client';

import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface DeleteMemberButtonProps {
  memberId: string;
  memberName?: string;
}

export default function DeleteMemberButton({ memberId, memberName: _memberName }: DeleteMemberButtonProps): React.ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Échec de la suppression du membre');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Échec de la suppression du membre');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Oui'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
      title="Supprimer"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
