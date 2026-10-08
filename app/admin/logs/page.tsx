'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import LogsHeader from './components/LogsHeader';
import ReviewTriageTab from './components/ReviewTriageTab';
import ReviewAnalyticsTab from './components/ReviewAnalyticsTab';
import UserJourneyExplorerTab from './components/UserJourneyExplorerTab';
import AuditReportsTab from './components/AuditReportsTab';
import { ActivityLog, ActivityStats, ReviewStatus } from '@/app/types/logging';

export type LogReviewTab = 'triage' | 'analytics' | 'journeys' | 'reports';

export default function AdminLogsPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<LogReviewTab>('triage');
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
        fetch('/api/logs?limit=400'),
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

  // Single review update handler
  const handleUpdateReview = useCallback(
    async (logId: string, status: ReviewStatus, notes?: string) => {
      // Optimistic update
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? {
                ...l,
                review: {
                  status,
                  notes: notes !== undefined ? notes : l.review?.notes,
                  reviewedBy: 'Moi',
                  reviewedAt: new Date().toISOString(),
                },
              }
            : l
        )
      );

      try {
        const res = await fetch('/api/logs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logId,
            status,
            notes: notes || null,
          }),
        });

        if (res.ok) {
          toast.success(
            status === 'flagged'
              ? 'Événement signalé pour enquête.'
              : status === 'reviewed'
              ? 'Événement marqué comme examiné.'
              : 'Événement remis en attente.'
          );
        } else {
          toast.error('Erreur lors de la mise à jour du statut.');
          fetchData(); // Rollback on failure
        }
      } catch (err) {
        console.error('Failed to patch review status:', err);
        toast.error('Erreur réseau lors de la mise à jour.');
        fetchData();
      }
    },
    [fetchData]
  );

  // Batch review update handler
  const handleBatchReview = useCallback(
    async (logIds: string[], status: ReviewStatus, notes?: string) => {
      if (logIds.length === 0) return;

      const logIdSet = new Set(logIds);
      // Optimistic update
      setLogs((prev) =>
        prev.map((l) =>
          logIdSet.has(l.id)
            ? {
                ...l,
                review: {
                  status,
                  notes: notes !== undefined ? notes : l.review?.notes,
                  reviewedBy: 'Moi',
                  reviewedAt: new Date().toISOString(),
                },
              }
            : l
        )
      );

      try {
        const res = await fetch('/api/logs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logIds,
            status,
            notes: notes || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          toast.success(data.message || `${logIds.length} événements mis à jour.`);
        } else {
          toast.error('Erreur lors de la mise à jour par lot.');
          fetchData();
        }
      } catch (err) {
        console.error('Failed to batch patch review status:', err);
        toast.error('Erreur réseau lors de la mise à jour.');
        fetchData();
      }
    },
    [fetchData]
  );

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
        'Statut Modération',
        'Note Audit',
        'Examiné Par',
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
        `"${l.review?.status || 'unreviewed'}"`,
        `"${(l.review?.notes || '').replace(/"/g, '""')}"`,
        `"${(l.review?.reviewedBy || '').replace(/"/g, '""')}"`,
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

  // Compute unreviewed count for triage badge
  const unreviewedCount = useMemo(() => {
    return logs.filter((l) => (l.review?.status || 'unreviewed') === 'unreviewed').length;
  }, [logs]);

  const tabs: {
    id: LogReviewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'triage',
      label: 'Tri & Modération',
      icon: ShieldCheckIcon,
      badge: unreviewedCount > 0 ? unreviewedCount : undefined,
    },
    {
      id: 'analytics',
      label: 'Analyse & Chronologie',
      icon: ChartBarIcon,
    },
    {
      id: 'journeys',
      label: 'Parcours de Session',
      icon: UserGroupIcon,
    },
    {
      id: 'reports',
      label: 'Rapports Comité',
      icon: DocumentTextIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <LogsHeader
        stats={stats}
        onExportCsv={handleExportCsv}
        onOpenPurge={() => setPurgeConfirmOpen(true)}
        isPurging={isPurging}
      />

      {/* 4-Tab Navigation Bar adhering to Carte IGN design */}
      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-narrow font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-paper dark:bg-night text-ink dark:text-white border border-line-2 dark:border-night-line-2 shadow-xs font-extrabold'
                  : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-ink-3'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-ambre/20 text-ambre font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'triage' && (
        <ReviewTriageTab
          logs={logs}
          stats={stats}
          isLoading={isLoading}
          isLive={isLive}
          onToggleLive={() => setIsLive((prev) => !prev)}
          onRefresh={fetchData}
          onUpdateReview={handleUpdateReview}
          onBatchReview={handleBatchReview}
        />
      )}

      {activeTab === 'analytics' && (
        <ReviewAnalyticsTab logs={logs} stats={stats} />
      )}

      {activeTab === 'journeys' && (
        <UserJourneyExplorerTab
          logs={logs}
          onUpdateReview={handleUpdateReview}
        />
      )}

      {activeTab === 'reports' && (
        <AuditReportsTab logs={logs} stats={stats} />
      )}

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
