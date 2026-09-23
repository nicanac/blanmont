'use client';

import React, { useState, useTransition } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/app/utils/cn';

export interface AdminDeleteButtonProps {
  /**
   * REST endpoint to call with DELETE method (e.g. `/api/admin/blog/${id}`)
   */
  endpoint?: string;
  /**
   * Alternatively, an async action function to execute
   */
  onDelete?: () => Promise<void>;
  /**
   * Name or title of the item to delete for notifications
   */
  itemTitle?: string;
  successMessage?: string;
  errorMessage?: string;
  confirmStyle?: 'inline' | 'button-with-prompt';
  confirmPrompt?: string;
  redirectOnSuccess?: string;
  className?: string;
  ariaLabel?: string;
}

export default function AdminDeleteButton({
  endpoint,
  onDelete,
  itemTitle,
  successMessage = 'Élément supprimé avec succès.',
  errorMessage = 'Erreur lors de la suppression.',
  confirmStyle = 'inline',
  confirmPrompt = 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  redirectOnSuccess,
  className = '',
  ariaLabel = 'Supprimer',
}: AdminDeleteButtonProps): React.ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const executeDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      if (endpoint) {
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Échec de la requête');
        }
      } else if (onDelete) {
        await onDelete();
      }

      toast.success(itemTitle ? `${itemTitle} supprimé avec succès.` : successMessage);

      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handlePromptDelete = () => {
    if (!confirm(confirmPrompt)) return;
    startTransition(async () => {
      await executeDelete();
    });
  };

  if (confirmStyle === 'button-with-prompt') {
    return (
      <button
        type="button"
        onClick={handlePromptDelete}
        disabled={isDeleting || isPending}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer',
          className
        )}
        aria-label={ariaLabel}
      >
        <TrashIcon className="h-4 w-4" />
        <span>{isDeleting || isPending ? 'Suppression...' : 'Supprimer'}</span>
      </button>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={executeDelete}
          disabled={isDeleting}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isDeleting ? '...' : 'Oui'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-ink-3 bg-paper-2 hover:bg-line transition-colors cursor-pointer"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={cn(
        'rounded-md p-2 text-ink-3 hover:bg-red-50 hover:text-red-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 transition-colors cursor-pointer',
        className
      )}
      title={ariaLabel}
      aria-label={ariaLabel}
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
