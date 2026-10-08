'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  FlagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { ActivityLog, ReviewStatus } from '@/app/types/logging';

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
  onUpdateReview?: (logId: string, status: ReviewStatus, notes?: string) => Promise<void>;
}

export default function LogDetailModal({ log, onClose, onUpdateReview }: Props): React.ReactElement | null {
  const [copied, setCopied] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('unreviewed');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  useEffect(() => {
    if (log) {
      setReviewStatus(log.review?.status || 'unreviewed');
      setReviewNotes(log.review?.notes || '');
    }
  }, [log]);

  if (!log) return null;

  const handleSaveReview = async () => {
    if (!onUpdateReview) return;
    setIsSavingReview(true);
    try {
      await onUpdateReview(log.id, reviewStatus, reviewNotes);
    } finally {
      setIsSavingReview(false);
    }
  };

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

          {/* Moderation & Review Section */}
          <div className="p-3.5 rounded-md bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-brand" />
                Tri &amp; Modération d'Audit
              </h3>
              {log.review?.reviewedBy && (
                <span className="text-[11px] font-sans text-ink-3 dark:text-snow-3">
                  Examiné par <strong className="text-ink dark:text-snow">{log.review.reviewedBy}</strong>
                  {log.review.reviewedAt && (
                    <> le {new Date(log.review.reviewedAt).toLocaleDateString('fr-BE')}</>
                  )}
                </span>
              )}
            </div>

            {/* Status pills selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewStatus('unreviewed')}
                className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
                  reviewStatus === 'unreviewed'
                    ? 'bg-paper dark:bg-night border-line-2 dark:border-night-line-2 text-ink dark:text-snow shadow-xs'
                    : 'border-transparent text-ink-3 hover:text-ink dark:hover:text-snow'
                }`}
              >
                À examiner
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus('reviewed')}
                className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
                  reviewStatus === 'reviewed'
                    ? 'bg-vert/15 border-vert/40 text-vert font-extrabold'
                    : 'border-transparent text-vert/70 hover:text-vert'
                }`}
              >
                Examiné
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus('flagged')}
                className={`px-3 py-1.5 rounded-md text-xs font-narrow font-bold uppercase tracking-wider border transition-colors ${
                  reviewStatus === 'flagged'
                    ? 'bg-brand/15 border-brand/40 text-brand font-extrabold'
                    : 'border-transparent text-brand/70 hover:text-brand'
                }`}
              >
                Signalé pour enquête
              </button>
            </div>

            {/* Audit Notes field */}
            <div className="space-y-1.5">
              <label htmlFor="review-notes-input" className="block text-[11px] font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                Notes Internes de Contrôle
              </label>
              <textarea
                id="review-notes-input"
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Remarques éventuelles sur cet événement, conclusion du contrôle..."
                className="w-full px-2.5 py-1.5 text-xs font-sans rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink dark:text-snow placeholder:text-ink-4 focus:outline-hidden focus:border-brand"
              />
            </div>

            {onUpdateReview && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  disabled={isSavingReview}
                  className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand-vif text-white text-xs font-narrow font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSavingReview ? 'Enregistrement...' : 'Enregistrer la modération'}
                </button>
              </div>
            )}
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
