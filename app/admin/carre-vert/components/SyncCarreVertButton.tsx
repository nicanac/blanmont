'use client';

import React, { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Tooltip from '@/app/components/ui/Tooltip';

export default function SyncCarreVertButton(): React.ReactElement {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async (): Promise<void> => {
    setIsSyncing(true);

    try {
      const response = await fetch('/api/admin/import-csv');
      const data = await response.json();

      if (response.ok && data.success) {
        const stats = data.stats;
        const countMsg = stats
          ? `${stats.eventsProcessed ?? 0} sorties traitées, ${stats.membersUpdated ?? 0} membres mis à jour`
          : 'Données synchronisées avec succès';
        toast.success(`Synchronisation réussie (${countMsg})`);
        router.refresh();
      } else {
        toast.error(data.error || 'Erreur lors de la synchronisation avec le Google Sheet.');
      }
    } catch (error) {
      console.error('Error syncing Carré Vert:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur de connexion lors de la synchronisation.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Tooltip
      content="Synchroniser les présences et le classement Carré Vert depuis le Google Sheet 2026"
      badge="Google Sheet"
      side="top"
      followPointer
    >
      <button
        id="carre-vert-sync-btn"
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-3 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 active:translate-y-px"
        title="Synchroniser les présences et le classement Carré Vert depuis le Google Sheet 2026"
      >
        <ArrowPathIcon
          className={`h-4 w-4 text-vert dark:text-bois ${isSyncing ? 'animate-spin' : ''}`}
        />
        <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser Google Sheet'}</span>
      </button>
    </Tooltip>
  );
}
