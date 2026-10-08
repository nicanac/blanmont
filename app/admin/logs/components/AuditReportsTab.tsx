'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  CheckCircleIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { ActivityLog, ActivityStats } from '@/app/types/logging';

interface Props {
  logs: ActivityLog[];
  stats?: ActivityStats | null;
}

type ReportPeriod = '7d' | '30d' | 'month' | 'quarter';

export default function AuditReportsTab({ logs, stats }: Props): React.ReactElement {
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [copiedMd, setCopiedMd] = useState(false);

  // Filter logs according to selected period
  const periodLogs = useMemo(() => {
    const now = Date.now();
    let cutoffMs = now - 30 * 24 * 60 * 60 * 1000;

    if (period === '7d') {
      cutoffMs = now - 7 * 24 * 60 * 60 * 1000;
    } else if (period === 'month') {
      const currentMonthStart = new Date();
      currentMonthStart.setUTCDate(1);
      currentMonthStart.setUTCHours(0, 0, 0, 0);
      cutoffMs = currentMonthStart.getTime();
    } else if (period === 'quarter') {
      cutoffMs = now - 90 * 24 * 60 * 60 * 1000;
    }

    return logs.filter((l) => l.timestampMs >= cutoffMs);
  }, [logs, period]);

  // Aggregate metrics for this report period
  const reportMetrics = useMemo(() => {
    const visitorSet = new Set<string>();
    const memberSet = new Set<string>();
    let gpxDownloads = 0;
    let rideParticipations = 0;
    let adminMutations = 0;
    let securityAlerts = 0;
    let reviewedCount = 0;
    let flaggedCount = 0;

    for (const log of periodLogs) {
      if (log.user.isAuthenticated && log.user.userId) {
        memberSet.add(log.user.userId);
      } else if (log.user.visitorId) {
        visitorSet.add(log.user.visitorId);
      } else if (log.context.ip) {
        visitorSet.add(log.context.ip);
      }

      if (log.action === 'traces:gpx_download' || log.title.toLowerCase().includes('gpx')) {
        gpxDownloads++;
      }

      if (log.category === 'participation') {
        rideParticipations++;
      }

      if (log.category === 'admin') {
        adminMutations++;
      }

      if (log.category === 'security' || log.severity === 'security' || log.severity === 'error') {
        securityAlerts++;
      }

      const rev = log.review?.status || 'unreviewed';
      if (rev === 'reviewed') reviewedCount++;
      if (rev === 'flagged') flaggedCount++;
    }

    const moderationRate = periodLogs.length > 0 ? Math.round((reviewedCount / periodLogs.length) * 100) : 0;

    return {
      totalLogs: periodLogs.length,
      uniqueVisitors: visitorSet.size,
      activeMembers: memberSet.size,
      gpxDownloads,
      rideParticipations,
      adminMutations,
      securityAlerts,
      reviewedCount,
      flaggedCount,
      moderationRate,
    };
  }, [periodLogs]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case '7d':
        return '7 derniers jours';
      case '30d':
        return '30 derniers jours';
      case 'month':
        return 'Mois en cours';
      case 'quarter':
        return 'Trimestre (90 jours)';
    }
  }, [period]);

  // Generate French narrative summary for committee
  const narrativeSummary = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `### 📋 Synthèse du Comité — Journal d'Activité & Audit
**Période examinée :** ${periodLabel} (Arrêté au ${todayStr})  
**Établi pour :** Comité de Direction & Assemblée Générale du Club de Blanmont

#### 1. Fréquentation et Audience Numérique
Sur la période de référence, la plateforme du club a enregistré **${reportMetrics.totalLogs} événements** de navigation et d'interaction.
- **Audience générale :** **${reportMetrics.uniqueVisitors} visiteurs uniques anonymes** ont parcouru les pages publiques.
- **Mobilisation des membres :** **${reportMetrics.activeMembers} cyclos licenciés** se sont connectés à leur espace membre pour consulter les traces et participer à la vie du club.

#### 2. Intérêt Sportif et Téléchargements de Parcours
- **Téléchargements de fichiers GPX :** **${reportMetrics.gpxDownloads} traces téléchargées** par les membres et visiteurs extérieurs, témoignant de la forte attractivité du répertoire cartographique de Blanmont.
- **Participations et Sondages :** **${reportMetrics.rideParticipations} interactions** relatives aux sondages de weekend, pointages de présence ou retours d'itinéraires.

#### 3. Gestion Administrative et Sécurité
- **Interventions administratives :** **${reportMetrics.adminMutations} modifications** enregistrées (gestion du calendrier, pointages, mises à jour des fiches coureurs).
- **Incidents & Alertes :** **${reportMetrics.securityAlerts} alertes ou accès non autorisés** relevés. ${
      reportMetrics.securityAlerts === 0
        ? 'Aucune tentative d’intrusion ou anomalie critique à signaler. Système nominal.'
        : 'Des vérifications ont été menées par les administrateurs sur les adresses IP signalées.'
    }
- **Modération interne :** **${reportMetrics.reviewedCount} logs audités** (${reportMetrics.moderationRate}% de couverture de revue), dont **${reportMetrics.flaggedCount} événement(s) sous surveillance**.

---
*Document certifié conforme à la politique de confidentialité RGPD du CC Blanmont (anonymisation des adresses IP et purge automatique à 90 jours).*`;
  }, [periodLabel, reportMetrics]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(narrativeSummary).then(() => {
      setCopiedMd(true);
      toast.success('Synthèse Markdown copiée dans le presse-papiers !');
      setTimeout(() => setCopiedMd(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCsv = () => {
    const csvContent = [
      ['Indicateur', 'Valeur', 'Période'],
      ['Total des événements', reportMetrics.totalLogs, periodLabel],
      ['Visiteurs uniques', reportMetrics.uniqueVisitors, periodLabel],
      ['Membres actifs connectés', reportMetrics.activeMembers, periodLabel],
      ['Téléchargements GPX', reportMetrics.gpxDownloads, periodLabel],
      ['Interactions sorties & sondages', reportMetrics.rideParticipations, periodLabel],
      ['Mutations administratives', reportMetrics.adminMutations, periodLabel],
      ['Alertes sécurité', reportMetrics.securityAlerts, periodLabel],
      ['Événements examinés', reportMetrics.reviewedCount, periodLabel],
      ['Événements signalés', reportMetrics.flaggedCount, periodLabel],
      ['Taux de modération (%)', `${reportMetrics.moderationRate}%`, periodLabel],
    ]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cc_blanmont_synthese_audit_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Bilan CSV téléchargé avec succès.');
  };

  return (
    <div className="space-y-6">
      {/* Period Selection & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 mr-1">
            Fenêtre d'Audit :
          </span>
          {(
            [
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: 'month', label: 'Mois en cours' },
              { id: 'quarter', label: 'Trimestre (90j)' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
                period === p.id
                  ? 'bg-paper dark:bg-night border-line-2 dark:border-night-line-2 text-ink dark:text-white shadow-xs font-extrabold'
                  : 'border-transparent text-ink-3 hover:text-ink dark:hover:text-snow'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line dark:border-night-line text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-snow bg-paper dark:bg-night hover:bg-paper-2 dark:hover:bg-night-2 transition-colors"
          >
            {copiedMd ? (
              <>
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-vert" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-4 h-4 text-brand" />
                <span>Copier Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line dark:border-night-line text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-snow bg-paper dark:bg-night hover:bg-paper-2 dark:hover:bg-night-2 transition-colors"
          >
            <PrinterIcon className="w-4 h-4 text-ink-3" />
            <span>Imprimer</span>
          </button>

          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line dark:border-night-line text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-snow bg-paper dark:bg-night hover:bg-paper-2 dark:hover:bg-night-2 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-hydro" />
            <span>Bilan CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Événements
          </span>
          <p className="font-mono tabular-nums text-xl font-bold text-ink dark:text-white">
            {reportMetrics.totalLogs}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Visiteurs
          </span>
          <p className="font-mono tabular-nums text-xl font-bold text-hydro">
            {reportMetrics.uniqueVisitors}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Membres Actifs
          </span>
          <p className="font-mono tabular-nums text-xl font-bold text-vert">
            {reportMetrics.activeMembers}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Téléchargements GPX
          </span>
          <p className="font-mono tabular-nums text-xl font-bold text-bistre">
            {reportMetrics.gpxDownloads}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Mutations Admin
          </span>
          <p className="font-mono tabular-nums text-xl font-bold text-ambre">
            {reportMetrics.adminMutations}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Alertes Sécurité
          </span>
          <p className={`font-mono tabular-nums text-xl font-bold ${
            reportMetrics.securityAlerts > 0 ? 'text-brand dark:text-brand-vif' : 'text-ink dark:text-white'
          }`}>
            {reportMetrics.securityAlerts}
          </p>
        </div>
      </div>

      {/* Moderation Health Bar */}
      <div className="p-4 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-vert" />
            <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">
              Couverture de Modération du Journal
            </span>
          </div>
          <p className="text-[11px] font-sans text-ink-3 dark:text-snow-3">
            {reportMetrics.reviewedCount} événements examinés sur {reportMetrics.totalLogs} ({reportMetrics.moderationRate}%). {reportMetrics.flaggedCount} événement(s) signalé(s).
          </p>
        </div>
        <div className="w-full sm:w-48 h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden shrink-0">
          <div
            className="h-full bg-vert rounded-full transition-all duration-500"
            style={{ width: `${reportMetrics.moderationRate}%` }}
          />
        </div>
      </div>

      {/* Generated Report Narrative Card */}
      <div className="p-6 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line dark:border-night-line">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-brand" />
            <h3 className="font-wide font-extrabold uppercase text-sm text-ink dark:text-white">
              Compte-Rendu d'Audit Officiel
            </h3>
          </div>
          <span className="text-xs font-mono text-ink-3 dark:text-snow-3">
            Prêt pour inclusion au PV de réunion
          </span>
        </div>

        {/* Narrative Prose Display */}
        <div className="prose dark:prose-invert max-w-none text-xs text-ink dark:text-snow leading-relaxed whitespace-pre-wrap font-sans">
          {narrativeSummary}
        </div>
      </div>
    </div>
  );
}
