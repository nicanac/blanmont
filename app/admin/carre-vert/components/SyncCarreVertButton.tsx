'use client';

import React, { useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function SyncCarreVertButton(): React.ReactElement {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  const handleSync = async (): Promise<void> => {
    setIsSyncing(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/import-csv');
      const data = await response.json();

      if (response.ok && data.success) {
        const stats = data.stats;
        const countMsg = stats
          ? `${stats.eventsProcessed ?? 0} sorties traitées, ${stats.membersUpdated ?? 0} membres mis à jour`
          : 'Données synchronisées avec succès';
        setStatus({
          type: 'success',
          message: `Synchronisation réussie ! (${countMsg})`,
        });
        router.refresh();
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Erreur lors de la synchronisation avec le Google Sheet.',
        });
      }
    } catch (error) {
      console.error('Error syncing Carré Vert:', error);
      setStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur de connexion lors de la synchronisation.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-600" />
          ) : (
            <XCircleIcon className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{status.message}</span>
          <button
            onClick={() => setStatus(null)}
            className="ml-1 text-gray-400 hover:text-gray-600 text-xs font-bold"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-700 hover:border-green-700 disabled:opacity-50 transition-colors cursor-pointer"
        title="Synchroniser les présences et le classement Carré Vert depuis le Google Sheet 2026"
      >
        <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser Google Sheet'}</span>
      </button>
    </div>
  );
}
