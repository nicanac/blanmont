'use client';

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  FlagIcon,
  ClockIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  UserCircleIcon,
  GlobeAltIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  ActivityLog,
  ActivityStats,
  LogCategory,
  LogSeverity,
  ReviewStatus,
  UserSegment,
} from '@/app/types/logging';
import LogDetailModal from './LogDetailModal';

interface Props {
  logs: ActivityLog[];
  stats?: ActivityStats | null;
  isLoading: boolean;
  isLive: boolean;
  onToggleLive: () => void;
  onRefresh: () => void;
  onUpdateReview: (logId: string, status: ReviewStatus, notes?: string) => Promise<void>;
  onBatchReview: (logIds: string[], status: ReviewStatus, notes?: string) => Promise<void>;
}

export default function ReviewTriageTab({
  logs,
  stats,
  isLoading,
  isLive,
  onToggleLive,
  onRefresh,
  onUpdateReview,
  onBatchReview,
}: Props): React.ReactElement {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Filters state
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<LogSeverity | 'all'>('all');
  const [selectedUserSegment, setSelectedUserSegment] = useState<UserSegment | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');

  // Compute live review counts from logs
  const reviewCounts = useMemo(() => {
    let unreviewed = 0;
    let reviewed = 0;
    let flagged = 0;

    for (const log of logs) {
      const st = log.review?.status || 'unreviewed';
      if (st === 'reviewed') reviewed++;
      else if (st === 'flagged') flagged++;
      else unreviewed++;
    }

    return {
      all: logs.length,
      unreviewed,
      reviewed,
      flagged,
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Review status filter
    if (reviewFilter !== 'all') {
      result = result.filter((l) => {
        const st = l.review?.status || 'unreviewed';
        return st === reviewFilter;
      });
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      let windowMs = 0;
      if (timeFilter === 'today') windowMs = 24 * 60 * 60 * 1000;
      else if (timeFilter === '7d') windowMs = 7 * 24 * 60 * 60 * 1000;
      else if (timeFilter === '30d') windowMs = 30 * 24 * 60 * 60 * 1000;

      result = result.filter((l) => now - l.timestampMs <= windowMs);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.category === selectedCategory);
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      result = result.filter((l) => l.severity === selectedSeverity);
    }

    // User Segment filter
    if (selectedUserSegment !== 'all') {
      if (selectedUserSegment === 'anonymous') {
        result = result.filter((l) => !l.user.isAuthenticated);
      } else if (selectedUserSegment === 'admin') {
        result = result.filter(
          (l) =>
            l.user.isAuthenticated &&
            (l.user.role?.includes('Admin') || l.user.role?.includes('President'))
        );
      } else if (selectedUserSegment === 'member') {
        result = result.filter((l) => l.user.isAuthenticated);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((l) => {
        return (
          l.title.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.user.userName?.toLowerCase().includes(q) ||
          l.user.userEmail?.toLowerCase().includes(q) ||
          l.context.path?.toLowerCase().includes(q) ||
          l.context.ip?.toLowerCase().includes(q) ||
          l.review?.notes?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [logs, reviewFilter, timeFilter, selectedCategory, selectedSeverity, selectedUserSegment, searchQuery]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredLogs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchStatus = async (status: ReviewStatus) => {
    if (selectedIds.size === 0) return;
    setIsBatchProcessing(true);
    try {
      await onBatchReview(Array.from(selectedIds), status);
      setSelectedIds(new Set());
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const getCategoryInkClass = (cat: LogCategory) => {
    switch (cat) {
      case 'auth':
      case 'participation':
        return 'text-vert bg-vert/10 border-vert/25';
      case 'admin':
        return 'text-ambre bg-ambre/10 border-ambre/25';
      case 'security':
        return 'text-brand dark:text-brand-vif bg-brand/10 border-brand/25';
      case 'navigation':
      default:
        return 'text-hydro bg-hydro/10 border-hydro/25';
    }
  };

  const getSeverityBadgeClass = (severity: LogSeverity) => {
    switch (severity) {
      case 'security':
        return 'bg-brand/10 text-brand dark:text-brand-vif border-brand/30';
      case 'error':
        return 'bg-brand-vif/10 text-brand-vif border-brand-vif/30';
      case 'warn':
        return 'bg-ambre/10 text-ambre border-ambre/30';
      default:
        return 'bg-vert/10 text-vert border-vert/30';
    }
  };

  const getReviewStatusBadge = (status?: ReviewStatus) => {
    const st = status || 'unreviewed';
    if (st === 'reviewed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-extrabold uppercase tracking-wider bg-vert/15 border border-vert/35 text-vert">
          <CheckCircleIcon className="w-3 h-3" />
          Examiné
        </span>
      );
    }
    if (st === 'flagged') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-extrabold uppercase tracking-wider bg-brand/15 border border-brand/35 text-brand dark:text-brand-vif">
          <FlagIcon className="w-3 h-3" />
          Signalé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3">
        <ClockIcon className="w-3 h-3" />
        À examiner
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Triage Status Pills Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 mr-2">
            File de Tri :
          </span>
          <button
            type="button"
            onClick={() => setReviewFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
              reviewFilter === 'all'
                ? 'bg-paper dark:bg-night border-line-2 dark:border-night-line-2 text-ink dark:text-white shadow-xs'
                : 'border-transparent text-ink-3 hover:text-ink dark:hover:text-snow'
            }`}
          >
            Tous
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-black/10 dark:bg-white/10">
              {reviewCounts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setReviewFilter('unreviewed')}
            className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
              reviewFilter === 'unreviewed'
                ? 'bg-paper dark:bg-night border-line-2 dark:border-night-line-2 text-ink dark:text-white shadow-xs'
                : 'border-transparent text-ink-3 hover:text-ink dark:hover:text-snow'
            }`}
          >
            <ClockIcon className="w-3.5 h-3.5 text-ink-3" />
            À examiner
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-ambre/20 text-ambre font-extrabold">
              {reviewCounts.unreviewed}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setReviewFilter('reviewed')}
            className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
              reviewFilter === 'reviewed'
                ? 'bg-vert/15 border-vert/40 text-vert font-extrabold shadow-xs'
                : 'border-transparent text-vert/80 hover:text-vert'
            }`}
          >
            <CheckCircleIcon className="w-3.5 h-3.5 text-vert" />
            Examinés
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-vert/20 text-vert">
              {reviewCounts.reviewed}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setReviewFilter('flagged')}
            className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
              reviewFilter === 'flagged'
                ? 'bg-brand/15 border-brand/40 text-brand dark:text-brand-vif font-extrabold shadow-xs'
                : 'border-transparent text-brand/80 hover:text-brand'
            }`}
          >
            <FlagIcon className="w-3.5 h-3.5 text-brand" />
            Signalés
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-brand/20 text-brand dark:text-brand-vif font-extrabold">
              {reviewCounts.flagged}
            </span>
          </button>
        </div>

        {/* Live sync & manual refresh controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleLive}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
              isLive
                ? 'bg-vert/10 border-vert/30 text-vert'
                : 'bg-paper dark:bg-night border-line dark:border-night-line text-ink-3'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? 'bg-vert animate-pulse' : 'bg-ink-4 dark:bg-snow-4'
              }`}
            />
            {isLive ? 'Flux Direct (8s)' : 'Direct Désactivé'}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-md border border-line dark:border-night-line text-ink-3 hover:text-ink dark:hover:text-white bg-paper dark:bg-night hover:bg-paper-2 dark:hover:bg-night-2 transition-colors disabled:opacity-50"
            title="Rafraîchir"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows selected) */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-brand/10 border border-brand/30 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-narrow font-bold uppercase tracking-wider text-brand dark:text-brand-vif">
              {selectedIds.size} événement(s) sélectionné(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBatchStatus('reviewed')}
              disabled={isBatchProcessing}
              className="px-3 py-1 rounded-md bg-vert hover:bg-vert/90 text-white text-xs font-narrow font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Marquer examinés
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus('flagged')}
              disabled={isBatchProcessing}
              className="px-3 py-1 rounded-md bg-brand hover:bg-brand-vif text-white text-xs font-narrow font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <FlagIcon className="w-3.5 h-3.5" />
              Signaler
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatus('unreviewed')}
              disabled={isBatchProcessing}
              className="px-3 py-1 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink-3 hover:text-ink text-xs font-narrow font-bold uppercase tracking-wider transition-colors"
            >
              Remettre en attente
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-sans text-ink-3 hover:underline ml-2"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="p-3 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-ink-3 dark:text-snow-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, action, utilisateur, IP ou note..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-xs font-sans text-ink dark:text-snow placeholder:text-ink-4 focus:outline-hidden focus:border-brand"
            />
          </div>

          {/* Quick Time Window */}
          <div className="flex items-center gap-1 bg-paper dark:bg-night p-1 rounded-md border border-line dark:border-night-line">
            {(
              [
                { id: 'all', label: 'Tout' },
                { id: 'today', label: '24h' },
                { id: '7d', label: '7j' },
                { id: '30d', label: '30j' },
              ] as const
            ).map((tw) => (
              <button
                key={tw.id}
                type="button"
                onClick={() => setTimeFilter(tw.id)}
                className={`px-2.5 py-1 rounded-xs text-[11px] font-narrow font-bold uppercase tracking-wider transition-colors ${
                  timeFilter === tw.id
                    ? 'bg-paper-2 dark:bg-night-2 text-ink dark:text-white font-extrabold shadow-xs'
                    : 'text-ink-3 dark:text-snow-3 hover:text-ink'
                }`}
              >
                {tw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60 dark:border-night-line/60 text-xs">
          <FunnelIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3 mr-1" />

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-1 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink dark:text-snow text-xs font-narrow font-semibold focus:outline-hidden"
          >
            <option value="all">Toutes catégories</option>
            <option value="auth">Authentification</option>
            <option value="navigation">Navigation &amp; GPX</option>
            <option value="participation">Sorties &amp; Votes</option>
            <option value="admin">Administration</option>
            <option value="security">Sécurité</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="px-2.5 py-1 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink dark:text-snow text-xs font-narrow font-semibold focus:outline-hidden"
          >
            <option value="all">Toutes gravités</option>
            <option value="info">Info</option>
            <option value="warn">Avertissement</option>
            <option value="error">Erreur</option>
            <option value="security">Alerte Sécurité</option>
          </select>

          {/* User Segment Dropdown */}
          <select
            value={selectedUserSegment}
            onChange={(e) => setSelectedUserSegment(e.target.value as any)}
            className="px-2.5 py-1 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink dark:text-snow text-xs font-narrow font-semibold focus:outline-hidden"
          >
            <option value="all">Tous profils</option>
            <option value="anonymous">Visiteurs anonymes</option>
            <option value="member">Membres du club</option>
            <option value="admin">Administrateurs</option>
          </select>

          <span className="text-[11px] font-sans text-ink-3 dark:text-snow-3 ml-auto tabular-nums">
            {filteredLogs.length} sur {logs.length} affichés
          </span>
        </div>
      </div>

      {/* Main Triage Table */}
      <div className="overflow-x-auto rounded-lg border border-line dark:border-night-line bg-paper dark:bg-night">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line dark:border-night-line bg-paper-2/60 dark:bg-night-2/60 font-narrow font-bold uppercase tracking-wider text-[11px] text-ink-3 dark:text-snow-3">
              <th className="py-2.5 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={filteredLogs.length > 0 && selectedIds.size === filteredLogs.length}
                  onChange={handleSelectAll}
                  className="rounded-xs border-line dark:border-night-line text-brand focus:ring-0"
                  aria-label="Sélectionner tout"
                />
              </th>
              <th className="py-2.5 px-3 w-28">Horodatage</th>
              <th className="py-2.5 px-3 w-28">Statut Modération</th>
              <th className="py-2.5 px-3 w-24">Catégorie</th>
              <th className="py-2.5 px-3">Événement &amp; Contexte</th>
              <th className="py-2.5 px-3 w-40">Utilisateur</th>
              <th className="py-2.5 px-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 dark:divide-night-line/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-ink-3 dark:text-snow-3">
                  <InformationCircleIcon className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="font-narrow font-bold uppercase tracking-wider">
                    Aucun événement correspondant aux critères de tri
                  </p>
                  <p className="text-[11px] mt-1 text-ink-4">
                    Modifiez les filtres de file d'attente ou la recherche.
                  </p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedIds.has(log.id);
                const isReviewed = log.review?.status === 'reviewed';
                const isFlagged = log.review?.status === 'flagged';

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`hover:bg-paper-2/80 dark:hover:bg-night-2/80 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand/5 dark:bg-brand/10'
                        : isFlagged
                        ? 'bg-brand/5'
                        : isReviewed
                        ? 'opacity-80'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleRow(log.id, e as any)}
                        className="rounded-xs border-line dark:border-night-line text-brand focus:ring-0"
                      />
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-3 font-mono text-[11px] text-ink-3 dark:text-snow-3 tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('fr-BE', {
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      <span className="font-semibold text-ink dark:text-snow">
                        {new Date(log.timestamp).toLocaleTimeString('fr-BE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Review Status Badge */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {getReviewStatusBadge(log.review?.status)}
                    </td>

                    {/* Category */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-narrow font-bold uppercase tracking-wider border ${getCategoryInkClass(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>

                    {/* Event Details */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-1 py-0.2 rounded-xs text-[9px] font-narrow font-bold uppercase border ${getSeverityBadgeClass(
                            log.severity
                          )}`}
                        >
                          {log.severity}
                        </span>
                        <span className="font-semibold text-ink dark:text-white line-clamp-1">
                          {log.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-ink-3 dark:text-snow-3 font-mono mt-0.5 line-clamp-1 flex items-center gap-2">
                        <span>{log.action}</span>
                        {log.context.path && (
                          <span className="text-ink-4 dark:text-snow-4">
                            · {log.context.path}
                          </span>
                        )}
                        {log.review?.notes && (
                          <span className="text-bistre dark:text-ambre font-sans font-semibold">
                            💬 {log.review.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {log.user.isAuthenticated ? (
                          <UserCircleIcon className="h-4 w-4 text-vert shrink-0" />
                        ) : (
                          <GlobeAltIcon className="h-4 w-4 text-ink-3 dark:text-snow-3 shrink-0" />
                        )}
                        <span className="truncate max-w-[120px] font-medium text-ink dark:text-snow">
                          {log.user.userName || 'Anonyme'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-ink-4 dark:text-snow-4 mt-0.5">
                        {log.context.ip || '—'}
                      </div>
                    </td>

                    {/* Quick Row Actions */}
                    <td
                      className="py-2 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateReview(log.id, 'reviewed')}
                          title="Marquer comme examiné"
                          className="p-1 rounded-md text-ink-3 hover:text-vert hover:bg-vert/10 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateReview(log.id, 'flagged')}
                          title="Signaler pour enquête"
                          className="p-1 rounded-md text-ink-3 hover:text-brand hover:bg-brand/10 transition-colors"
                        >
                          <FlagIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Log Detail Modal with Moderation */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onUpdateReview={async (logId, status, notes) => {
          await onUpdateReview(logId, status, notes);
          setSelectedLog((prev) =>
            prev && prev.id === logId
              ? {
                  ...prev,
                  review: {
                    status,
                    notes: notes || null,
                    reviewedBy: 'Moi',
                    reviewedAt: new Date().toISOString(),
                  },
                }
              : prev
          );
        }}
      />
    </div>
  );
}
