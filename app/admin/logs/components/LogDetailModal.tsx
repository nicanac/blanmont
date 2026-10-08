'use client';

import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentCheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { ActivityLog } from '@/app/types/logging';

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
}

export default function LogDetailModal({ log, onClose }: Props): React.ReactElement | null {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getSeverityBadgeClass = (severity: ActivityLog['severity']) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-paper dark:bg-night border border-line dark:border-night-line rounded-lg shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line dark:border-night-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-narrow font-bold uppercase tracking-wider border ${getSeverityBadgeClass(
                  log.severity
                )}`}
              >
                {log.severity}
              </span>
              <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                {log.category} · {log.action}
              </span>
            </div>
            <h2 className="text-base font-wide font-extrabold text-ink dark:text-white">
              {log.title}
            </h2>
            <p className="text-xs font-mono text-ink-3 dark:text-snow-3 tabular-nums mt-0.5">
              {new Date(log.timestamp).toLocaleString('fr-BE', {
                dateStyle: 'full',
                timeStyle: 'medium',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-3 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs font-sans max-h-[65vh] overflow-y-auto pr-1">
          {/* User Section */}
          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
            <h3 className="font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 mb-2">
              Identité Utilisateur
            </h3>
            <div className="grid grid-cols-2 gap-2 text-ink dark:text-snow">
              <div>
                <span className="text-ink-3 dark:text-snow-3">Statut : </span>
                <span className="font-semibold">
                  {log.user.isAuthenticated ? 'Connecté (Membre)' : 'Visiteur Anonyme'}
                </span>
              </div>
              <div>
                <span className="text-ink-3 dark:text-snow-3">Nom : </span>
                <span className="font-semibold">{log.user.userName || '—'}</span>
              </div>
              {log.user.userEmail && (
                <div>
                  <span className="text-ink-3 dark:text-snow-3">Email : </span>
                  <span className="font-mono">{log.user.userEmail}</span>
                </div>
              )}
              {log.user.userId && (
                <div>
                  <span className="text-ink-3 dark:text-snow-3">ID Membre : </span>
                  <span className="font-mono text-[11px]">{log.user.userId}</span>
                </div>
              )}
              {log.user.role && log.user.role.length > 0 && (
                <div className="col-span-2">
                  <span className="text-ink-3 dark:text-snow-3">Rôles : </span>
                  <span className="font-semibold">{log.user.role.join(', ')}</span>
                </div>
              )}
              {log.user.visitorId && (
                <div className="col-span-2">
                  <span className="text-ink-3 dark:text-snow-3">Session Anonyme : </span>
                  <span className="font-mono text-[11px]">{log.user.visitorId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Context Section */}
          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
            <h3 className="font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 mb-2">
              Contexte Réseau &amp; Appareil
            </h3>
            <div className="grid grid-cols-2 gap-2 text-ink dark:text-snow">
              <div>
                <span className="text-ink-3 dark:text-snow-3">IP (Masquée RGPD) : </span>
                <span className="font-mono font-semibold">{log.context.ip || '—'}</span>
              </div>
              <div>
                <span className="text-ink-3 dark:text-snow-3">Appareil : </span>
                <span className="font-semibold capitalize">{log.context.deviceType || 'Desktop'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-ink-3 dark:text-snow-3">Chemin URL : </span>
                <span className="font-mono font-semibold">{log.context.path || '/'}</span>
              </div>
              {log.context.referrer && (
                <div className="col-span-2">
                  <span className="text-ink-3 dark:text-snow-3">Referrer : </span>
                  <span className="font-mono text-[11px] truncate">{log.context.referrer}</span>
                </div>
              )}
              {log.context.userAgent && (
                <div className="col-span-2">
                  <span className="text-ink-3 dark:text-snow-3">User Agent : </span>
                  <span className="font-mono text-[10px] break-all text-ink-2 dark:text-snow-3">
                    {log.context.userAgent}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata JSON */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                  Métadonnées Spécifiques
                </h3>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-[11px] font-narrow font-bold uppercase text-brand hover:underline"
                >
                  {copied ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-vert" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                      <span>Copier JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 rounded bg-black/5 dark:bg-white/5 font-mono text-[11px] overflow-x-auto text-ink dark:text-snow">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-line dark:border-night-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-line dark:border-night-line font-narrow font-bold uppercase tracking-wider text-xs hover:bg-paper-2 dark:hover:bg-night-2 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
