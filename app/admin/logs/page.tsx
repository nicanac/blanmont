'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import LogsHeader from './components/LogsHeader';
import LogsTable from './components/LogsTable';
import { ActivityLog, ActivityStats } from '@/app/types/logging';

export default function AdminLogsPage(): React.ReactElement {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch('/api/logs?limit=300'),
        fetch('/api/logs?stats=true'),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live polling (every 8 seconds when active)
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchData();
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive, fetchData]);

  // Export CSV handler
  const handleExportCsv = useCallback(() => {
    if (logs.length === 0) {
      toast.info('Aucun événement à exporter.');
      return;
    }

    try {
      const headers = [
        'ID',
        'Horodatage (ISO)',
        'Catégorie',
        'Action',
        'Titre',
        'Gravité',
        'Est Connecté',
        'ID Utilisateur',
        'Nom Utilisateur',
        'Email Utilisateur',
        'Rôles',
        'IP Masquée',
        'Chemin URL',
        'Appareil',
      ];

      const rows = logs.map((l) => [
        `"${l.id}"`,
        `"${l.timestamp}"`,
        `"${l.category}"`,
        `"${l.action}"`,
        `"${(l.title || '').replace(/"/g, '""')}"`,
        `"${l.severity}"`,
        l.user.isAuthenticated ? 'Oui' : 'Non',
        `"${l.user.userId || ''}"`,
        `"${(l.user.userName || '').replace(/"/g, '""')}"`,
        `"${l.user.userEmail || ''}"`,
        `"${(l.user.role || []).join(';')}"`,
        `"${l.context.ip || ''}"`,
        `"${l.context.path || ''}"`,
        `"${l.context.deviceType || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cc_blanmont_journal_activite_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Journal exporté au format CSV avec succès !');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      toast.error('Erreur lors de la génération du fichier CSV.');
    }
  }, [logs]);

  // Purge handler
  const handleConfirmPurge = async () => {
    setIsPurging(true);
    setPurgeConfirmOpen(false);

    try {
      const res = await fetch('/api/logs?days=90', { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Purge des anciens logs effectuée.');
        fetchData();
      } else {
        toast.error(data.error || 'Erreur lors de la purge.');
      }
    } catch {
      toast.error('Impossible de contacter le serveur pour purger les logs.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <LogsHeader
        stats={stats}
        onExportCsv={handleExportCsv}
        onOpenPurge={() => setPurgeConfirmOpen(true)}
        isPurging={isPurging}
      />

      <LogsTable
        logs={logs}
        isLoading={isLoading}
        isLive={isLive}
        onToggleLive={() => setIsLive((prev) => !prev)}
        onRefresh={fetchData}
      />

      {/* Confirmation Modal for Purge */}
      {purgeConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md bg-paper dark:bg-night border border-line dark:border-night-line rounded-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-wide font-extrabold uppercase text-ink dark:text-white">
              Confirmer la purge des logs
            </h3>
            <p className="text-xs font-sans text-ink-2 dark:text-snow-2 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement tous les événements de journalisation plus anciens que <strong>90 jours</strong> ? Cette opération est irréversible.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line dark:border-night-line">
              <button
                type="button"
                onClick={() => setPurgeConfirmOpen(false)}
                className="px-4 py-2 rounded-md border border-line dark:border-night-line text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 hover:text-ink dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="px-4 py-2 rounded-md bg-brand hover:bg-brand-vif text-white text-xs font-narrow font-bold uppercase tracking-wider transition-colors"
              >
                Confirmer la purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
