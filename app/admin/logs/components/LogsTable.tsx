'use client';

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  GlobeAltIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import { ActivityLog, LogCategory, LogSeverity, UserSegment } from '@/app/types/logging';
import LogDetailModal from './LogDetailModal';

interface Props {
  logs: ActivityLog[];
  isLoading: boolean;
  isLive: boolean;
  onToggleLive: () => void;
  onRefresh: () => void;
}

export default function LogsTable({
  logs,
  isLoading,
  isLive,
  onToggleLive,
  onRefresh,
}: Props): React.ReactElement {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<LogSeverity | 'all'>('all');
  const [selectedUserSegment, setSelectedUserSegment] = useState<UserSegment | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');

  // Filtered logs computation
  const filteredLogs = useMemo(() => {
    let result = [...logs];

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
          l.context.ip?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [logs, timeFilter, selectedCategory, selectedSeverity, selectedUserSegment, searchQuery]);

  const categories: { id: LogCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Toutes catégories' },
    { id: 'auth', label: 'Authentification' },
    { id: 'navigation', label: 'Navigation & GPX' },
    { id: 'participation', label: 'Sorties & Votes' },
    { id: 'admin', label: 'Administration' },
    { id: 'security', label: 'Sécurité' },
  ];

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

  const getSeverityBadge = (severity: LogSeverity) => {
    switch (severity) {
      case 'security':
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-narrow font-bold uppercase tracking-wider bg-brand/15 text-brand dark:text-brand-vif border border-brand/30">
            <ShieldExclamationIcon className="h-3 w-3" />
            {severity}
          </span>
        );
      case 'warn':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-narrow font-bold uppercase tracking-wider bg-ambre/15 text-ambre border border-ambre/30">
            Alerte
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-narrow font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 text-ink-3 dark:text-snow-3 border border-line dark:border-night-line">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Control & Filter Strip */}
      <div className="p-4 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line space-y-3">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3 dark:text-snow-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par action, membre, email, URL, IP..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-paper dark:bg-night border border-line dark:border-night-line text-ink dark:text-white placeholder:text-ink-3 focus:outline-hidden focus:border-brand"
            />
          </div>

          {/* Quick Actions & Live Stream Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLive}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
                isLive
                  ? 'bg-vert/10 text-vert border-vert/40'
                  : 'bg-paper dark:bg-night text-ink-3 border-line dark:border-night-line hover:text-ink dark:hover:text-white'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive ? 'bg-vert animate-pulse' : 'bg-ink-3 dark:bg-snow-3'
                }`}
              />
              <span>{isLive ? 'Flux direct actif' : 'Flux direct suspendu'}</span>
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Actualiser la liste"
              className="p-2 rounded-md bg-paper dark:bg-night border border-line dark:border-night-line text-ink-3 hover:text-ink dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line dark:border-night-line text-xs font-narrow">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Période :
            </span>
            {(
              [
                { id: 'all', label: 'Mois' },
                { id: 'today', label: 'Aujourd\'hui' },
                { id: '7d', label: '7 jours' },
                { id: '30d', label: '30 jours' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeFilter(t.id)}
                className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  timeFilter === t.id
                    ? 'bg-ink dark:bg-white text-white dark:text-ink font-bold'
                    : 'bg-paper dark:bg-night text-ink-3 hover:text-ink dark:hover:text-white border border-line dark:border-night-line'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* User Segment */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Profil :
            </span>
            {(
              [
                { id: 'all', label: 'Tous' },
                { id: 'anonymous', label: 'Invités' },
                { id: 'member', label: 'Membres' },
                { id: 'admin', label: 'Admins' },
              ] as const
            ).map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setSelectedUserSegment(seg.id)}
                className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedUserSegment === seg.id
                    ? 'bg-brand text-white font-bold'
                    : 'bg-paper dark:bg-night text-ink-3 hover:text-ink dark:hover:text-white border border-line dark:border-night-line'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          {/* Severity selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Gravité :
            </span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="px-2 py-1 rounded text-xs bg-paper dark:bg-night border border-line dark:border-night-line text-ink dark:text-white font-semibold uppercase focus:outline-hidden"
            >
              <option value="all">Toutes</option>
              <option value="info">Info</option>
              <option value="warn">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="security">Sécurité</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <FunnelIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-narrow font-bold uppercase tracking-wider border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-ink dark:bg-white text-white dark:text-ink border-transparent font-extrabold'
                  : 'bg-paper dark:bg-night text-ink-3 dark:text-snow-3 border-line dark:border-night-line hover:border-ink-3'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 px-1">
        <span>
          Affichage de <strong className="text-ink dark:text-white tabular-nums">{filteredLogs.length}</strong> sur{' '}
          <span className="tabular-nums">{logs.length}</span> événements consignés
        </span>
        {filteredLogs.length !== logs.length && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSeverity('all');
              setSelectedUserSegment('all');
              setTimeFilter('all');
            }}
            className="text-brand hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Topographic Log Table */}
      <div className="rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line text-ink-3">
              <InformationCircleIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-wide font-extrabold uppercase text-ink dark:text-white">
              Aucun événement trouvé
            </h3>
            <p className="text-xs text-ink-3 dark:text-snow-3 max-w-sm mx-auto">
              Aucune activité ne correspond à vos filtres actuels. Modifiez vos critères de recherche ou réinitialisez les filtres.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line dark:border-night-line bg-paper-2 dark:bg-night-2 text-ink-3 dark:text-snow-3 font-narrow font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-32">Horodatage</th>
                  <th className="py-2.5 px-3 w-28">Catégorie</th>
                  <th className="py-2.5 px-3 w-44">Utilisateur</th>
                  <th className="py-2.5 px-3">Action &amp; Détails</th>
                  <th className="py-2.5 px-3 w-24">Gravité</th>
                  <th className="py-2.5 px-3 w-20 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-night-line font-sans">
                {filteredLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  const timeFormatted = date.toLocaleTimeString('fr-BE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const dateFormatted = date.toLocaleDateString('fr-BE', {
                    day: '2-digit',
                    month: '2-digit',
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-paper-2/70 dark:hover:bg-night-2/70 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-ink-3 dark:text-snow-3 font-mono text-[11px] tabular-nums">
                        <span className="font-semibold text-ink dark:text-snow mr-1">{dateFormatted}</span>
                        <span>{timeFormatted}</span>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-narrow font-bold uppercase tracking-wider border ${getCategoryInkClass(
                            log.category
                          )}`}
                        >
                          {log.category}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {log.user.isAuthenticated ? (
                            <UserCircleIcon className="h-4 w-4 text-vert shrink-0" />
                          ) : (
                            <GlobeAltIcon className="h-4 w-4 text-hydro shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-ink dark:text-white truncate">
                              {log.user.userName || 'Visiteur'}
                            </p>
                            {log.user.userEmail ? (
                              <p className="text-[10px] font-mono text-ink-3 dark:text-snow-3 truncate">
                                {log.user.userEmail}
                              </p>
                            ) : (
                              <p className="text-[10px] font-mono text-ink-3 dark:text-snow-3 truncate">
                                {log.context.ip || 'Anonyme'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action & Title */}
                      <td className="py-2.5 px-3 min-w-0">
                        <p className="font-semibold text-ink dark:text-snow truncate">{log.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-ink-3 dark:text-snow-3 font-mono truncate mt-0.5">
                          <span className="text-brand dark:text-brand-vif">{log.action}</span>
                          {log.context.path && (
                            <>
                              <span>·</span>
                              <span className="truncate">{log.context.path}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2 py-1 rounded text-[11px] font-narrow font-bold uppercase tracking-wider border border-line dark:border-night-line text-ink-3 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          Détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
