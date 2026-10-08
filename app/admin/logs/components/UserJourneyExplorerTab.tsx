'use client';

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  GlobeAltIcon,
  ClockIcon,
  ChevronRightIcon,
  ShieldExclamationIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { ActivityLog, ReviewStatus } from '@/app/types/logging';
import LogDetailModal from './LogDetailModal';

interface Props {
  logs: ActivityLog[];
  onUpdateReview: (logId: string, status: ReviewStatus, notes?: string) => Promise<void>;
}

export type SessionIntent =
  | 'gpx'          // Downloaded GPX
  | 'member'       // Logged-in club member
  | 'prospect'     // Prospective new member (/le-club, /contact)
  | 'security'     // Security alert or error
  | 'traces'       // Browsed routes
  | 'browse';      // General browsing

export interface SessionJourney {
  id: string;                    // Grouping key (userId or visitorId or IP)
  userDisplayName: string;
  userEmail?: string | null;
  isAuthenticated: boolean;
  ip?: string;
  deviceType?: string;
  events: ActivityLog[];         // Sorted chronologically (oldest first)
  startTime: string;
  endTime: string;
  durationMs: number;
  intent: SessionIntent;
  hasErrorsOrSecurity: boolean;
}

export default function UserJourneyExplorerTab({
  logs,
  onUpdateReview,
}: Props): React.ReactElement {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [sessionSearch, setSessionSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState<SessionIntent | 'all'>('all');

  // Group logs into sessions
  const sessions: SessionJourney[] = useMemo(() => {
    const sessionMap = new Map<string, ActivityLog[]>();

    for (const log of logs) {
      const key =
        (log.user.isAuthenticated && log.user.userId)
          ? `user_${log.user.userId}`
          : log.user.visitorId
          ? `visitor_${log.user.visitorId}`
          : log.context.ip
          ? `ip_${log.context.ip}`
          : `anon_${log.id}`;

      const existing = sessionMap.get(key) || [];
      existing.push(log);
      sessionMap.set(key, existing);
    }

    const result: SessionJourney[] = [];

    for (const [key, sessionLogs] of sessionMap.entries()) {
      // Sort chronologically (oldest first for journey playback)
      sessionLogs.sort((a, b) => a.timestampMs - b.timestampMs);

      const firstLog = sessionLogs[0];
      const lastLog = sessionLogs[sessionLogs.length - 1];
      const durationMs = lastLog.timestampMs - firstLog.timestampMs;

      // Determine session intent
      let intent: SessionIntent = 'browse';
      const hasSecurity = sessionLogs.some(
        (l) => l.category === 'security' || l.severity === 'security' || l.severity === 'error'
      );
      const hasGpx = sessionLogs.some(
        (l) => l.action === 'traces:gpx_download' || l.title.toLowerCase().includes('gpx')
      );
      const hasProspect = sessionLogs.some(
        (l) =>
          l.context.path?.includes('/le-club') ||
          l.context.path?.includes('/contact') ||
          l.context.path?.includes('/rejoindre')
      );
      const hasTraces = sessionLogs.some((l) => l.context.path?.startsWith('/traces'));

      if (hasSecurity) intent = 'security';
      else if (hasGpx) intent = 'gpx';
      else if (firstLog.user.isAuthenticated) intent = 'member';
      else if (hasProspect) intent = 'prospect';
      else if (hasTraces) intent = 'traces';

      result.push({
        id: key,
        userDisplayName: firstLog.user.userName || (firstLog.user.isAuthenticated ? 'Membre' : 'Visiteur anonyme'),
        userEmail: firstLog.user.userEmail,
        isAuthenticated: firstLog.user.isAuthenticated,
        ip: firstLog.context.ip,
        deviceType: firstLog.context.deviceType,
        events: sessionLogs,
        startTime: firstLog.timestamp,
        endTime: lastLog.timestamp,
        durationMs,
        intent,
        hasErrorsOrSecurity: hasSecurity,
      });
    }

    // Sort sessions by most recent event descending
    result.sort((a, b) => {
      const lastA = a.events[a.events.length - 1].timestampMs;
      const lastB = b.events[b.events.length - 1].timestampMs;
      return lastB - lastA;
    });

    return result;
  }, [logs]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (intentFilter !== 'all' && s.intent !== intentFilter) return false;

      if (sessionSearch.trim()) {
        const q = sessionSearch.toLowerCase().trim();
        const matchUser = s.userDisplayName.toLowerCase().includes(q);
        const matchEmail = s.userEmail?.toLowerCase().includes(q);
        const matchIp = s.ip?.toLowerCase().includes(q);
        const matchEvent = s.events.some((e) => e.title.toLowerCase().includes(q));
        if (!matchUser && !matchEmail && !matchIp && !matchEvent) return false;
      }

      return true;
    });
  }, [sessions, intentFilter, sessionSearch]);

  // Selected session (or default to first)
  const activeSession = useMemo(() => {
    if (!selectedSessionId && filteredSessions.length > 0) {
      return filteredSessions[0];
    }
    return sessions.find((s) => s.id === selectedSessionId) || filteredSessions[0] || null;
  }, [selectedSessionId, filteredSessions, sessions]);

  const getIntentBadge = (intent: SessionIntent) => {
    switch (intent) {
      case 'gpx':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-hydro/15 border border-hydro/35 text-hydro">
            <ArrowDownTrayIcon className="w-3 h-3" />
            Téléchargeur GPX
          </span>
        );
      case 'member':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-vert/15 border border-vert/35 text-vert">
            <UserCircleIcon className="w-3 h-3" />
            Cyclo Membre
          </span>
        );
      case 'prospect':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-ambre/15 border border-ambre/35 text-ambre font-extrabold">
            <SparklesIcon className="w-3 h-3" />
            Essai / Candidat
          </span>
        );
      case 'security':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-brand/15 border border-brand/35 text-brand dark:text-brand-vif font-extrabold">
            <ShieldExclamationIcon className="w-3 h-3" />
            Alerte Sécurité
          </span>
        );
      case 'traces':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-bistre/15 border border-bistre/35 text-bistre">
            <MapPinIcon className="w-3 h-3" />
            Exploration Traces
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-narrow font-bold uppercase tracking-wider bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3">
            <GlobeAltIcon className="w-3 h-3" />
            Visite Publique
          </span>
        );
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return 'Ponctuel';
    const totalSec = Math.floor(ms / 1000);
    if (totalSec < 60) return `${totalSec}s`;
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}m ${sec}s`;
  };

  const formatDeltaTime = (diffMs: number) => {
    if (diffMs < 1000) return 'Départ (0s)';
    const totalSec = Math.floor(diffMs / 1000);
    if (totalSec < 60) return `+${totalSec}s`;
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `+${min}m ${sec}s`;
  };

  return (
    <div className="space-y-4">
      {/* Session Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-ink-3 dark:text-snow-3" />
          <input
            type="text"
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
            placeholder="Rechercher par internaute, IP masquée, ou contenu..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-xs font-sans text-ink dark:text-snow placeholder:text-ink-4 focus:outline-hidden focus:border-brand"
          />
        </div>

        {/* Intent Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-narrow font-bold uppercase tracking-wider text-ink-3 mr-1">
            Intention :
          </span>
          {(
            [
              { id: 'all', label: 'Toutes' },
              { id: 'gpx', label: 'GPX' },
              { id: 'member', label: 'Membres' },
              { id: 'prospect', label: 'Essais' },
              { id: 'security', label: 'Sécurité' },
            ] as const
          ).map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => setIntentFilter(it.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
                intentFilter === it.id
                  ? 'bg-paper dark:bg-night border-line-2 dark:border-night-line-2 text-ink dark:text-white shadow-xs font-extrabold'
                  : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Session List (Left) & Timeline Journey (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Sessions List */}
        <div className="lg:col-span-5 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-line dark:border-night-line bg-paper dark:bg-night text-ink-3">
              Aucune session ne correspond aux critères de filtre.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = activeSession?.id === session.id;
              const firstEvent = session.events[0];

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-paper dark:bg-night border-brand shadow-md'
                      : 'bg-paper-2/60 dark:bg-night-2/60 border-line dark:border-night-line hover:border-line-2'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {session.isAuthenticated ? (
                        <UserCircleIcon className="w-4 h-4 text-vert shrink-0" />
                      ) : (
                        <GlobeAltIcon className="w-4 h-4 text-ink-3 dark:text-snow-3 shrink-0" />
                      )}
                      <span className="font-wide font-extrabold text-xs text-ink dark:text-white truncate">
                        {session.userDisplayName}
                      </span>
                    </div>
                    {getIntentBadge(session.intent)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-3 dark:text-snow-3 tabular-nums mt-1">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {new Date(session.startTime).toLocaleTimeString('fr-BE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {formatDuration(session.durationMs)}
                    </span>
                    <span className="font-semibold text-ink dark:text-snow">
                      {session.events.length} étape(s)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-sans text-ink-4 dark:text-snow-4 mt-2 pt-2 border-t border-line/40 dark:border-night-line/40">
                    <span className="font-mono">{session.ip || '—'}</span>
                    <span className="capitalize">{session.deviceType || 'Desktop'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Step-by-Step Vertical Journey Replay */}
        <div className="lg:col-span-7">
          {activeSession ? (
            <div className="rounded-lg border border-line dark:border-night-line bg-paper dark:bg-night p-5 space-y-6">
              {/* Session Cartouche Header */}
              <div className="p-4 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase text-brand tracking-widest font-bold">
                        50°37′23″ N · 4°38′32″ E
                      </span>
                      {getIntentBadge(activeSession.intent)}
                    </div>
                    <h3 className="font-wide font-extrabold text-base text-ink dark:text-white">
                      Parcours de {activeSession.userDisplayName}
                    </h3>
                    {activeSession.userEmail && (
                      <p className="text-xs font-mono text-ink-3 dark:text-snow-3">
                        {activeSession.userEmail}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs font-mono tabular-nums text-ink-3 dark:text-snow-3">
                    <div>Durée totale : <strong className="text-ink dark:text-white">{formatDuration(activeSession.durationMs)}</strong></div>
                    <div className="text-[11px] mt-0.5">{activeSession.events.length} actions enregistrées</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-line dark:border-night-line text-[11px] font-sans text-ink-3 dark:text-snow-3">
                  <div>
                    <span>IP RGPD : </span>
                    <strong className="font-mono text-ink dark:text-snow">{activeSession.ip || '—'}</strong>
                  </div>
                  <div>
                    <span>Appareil : </span>
                    <strong className="capitalize text-ink dark:text-snow">{activeSession.deviceType || 'Desktop'}</strong>
                  </div>
                  <div>
                    <span>Début : </span>
                    <strong className="font-mono text-ink dark:text-snow">
                      {new Date(activeSession.startTime).toLocaleTimeString('fr-BE')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Vertical Timeline Steps */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line dark:before:bg-night-line">
                {activeSession.events.map((event, idx) => {
                  const deltaMs = event.timestampMs - activeSession.events[0].timestampMs;

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedLog(event)}
                      className="relative group cursor-pointer"
                    >
                      {/* Step Circle Pin on Timeline */}
                      <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-paper dark:bg-night border-2 border-brand flex items-center justify-center text-[10px] font-mono font-bold text-ink dark:text-white shadow-xs group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>

                      {/* Step Card */}
                      <div className="p-3.5 rounded-lg border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-2/60 hover:bg-paper-2 dark:hover:bg-night-2 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold text-vert tabular-nums">
                            {formatDeltaTime(deltaMs)}
                          </span>
                          <span className="text-[10px] font-narrow font-bold uppercase tracking-wider text-ink-4">
                            {new Date(event.timestamp).toLocaleTimeString('fr-BE')}
                          </span>
                        </div>

                        <h4 className="font-semibold text-xs text-ink dark:text-white mb-1">
                          {event.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-ink-3 dark:text-snow-3">
                          <span className="px-1.5 py-0.2 rounded-xs bg-black/5 dark:bg-white/5">
                            {event.action}
                          </span>
                          {event.context.path && (
                            <span className="text-ink dark:text-snow font-semibold truncate max-w-[200px]">
                              {event.context.path}
                            </span>
                          )}
                          {event.review?.status === 'reviewed' && (
                            <span className="text-vert font-sans font-bold">✓ Modéré</span>
                          )}
                          {event.review?.status === 'flagged' && (
                            <span className="text-brand font-sans font-bold">🚩 Signalé</span>
                          )}
                        </div>

                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-line/40 dark:border-night-line/40 text-[10px] font-mono text-ink-3 dark:text-snow-3">
                            {Object.entries(event.metadata).map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="text-ink-4">{k}:</span> {String(v)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-lg border border-line dark:border-night-line bg-paper dark:bg-night text-ink-3">
              Sélectionnez une session pour afficher son parcours détaillé.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onUpdateReview={onUpdateReview}
      />
    </div>
  );
}
