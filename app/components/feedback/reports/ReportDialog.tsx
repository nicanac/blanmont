'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { FeedbackReport, ReportAction, ReportComment } from '@/app/lib/feedback/reports';
import { CategoryChip, PriorityChip, StatusChip } from './chips';
import { relativeDate } from './filters';

interface ReportDialogProps {
  report: FeedbackReport;
  position: { index: number; total: number };
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
  onUpdated: (report: FeedbackReport) => void;
}

interface Detail {
  number: number;
  comments: ReportComment[];
}

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const DONE: Record<ReportAction, string> = {
  comment: 'Réponse publiée.',
  resolve: 'Marqué comme résolu.',
  dismiss: 'Retour écarté.',
  reopen: 'Retour rouvert.',
};

/** Full report: big screenshot, context, thread, and one-click triage actions. */
export default function ReportDialog({
  report,
  position,
  onClose,
  onNavigate,
  onUpdated,
}: ReportDialogProps): React.ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Comments come from a second call so the card data shows instantly.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/feedback/reports/' + report.number, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { comments: ReportComment[] }) => {
        if (!cancelled) {
          setDetail({ number: report.number, comments: data.comments });
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [report.number]);

  const comments = detail?.number === report.number ? detail.comments : null;

  const act = async (action: ReportAction): Promise<void> => {
    setBusy(true);
    try {
      const res = await fetch('/api/feedback/reports/' + report.number, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: text.trim() || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { report?: FeedbackReport; error?: string };
      if (!res.ok || !data.report) {
        toast.error(data.error ?? 'Action impossible pour le moment.');
        return;
      }
      onUpdated(data.report);
      setText('');
      const refreshed = await fetch('/api/feedback/reports/' + report.number, { credentials: 'same-origin' });
      if (refreshed.ok) setDetail({ number: report.number, comments: (await refreshed.json()).comments });
      toast.success(DONE[action]);
    } catch {
      toast.error('Action impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>): void => {
    if ((e.target as HTMLElement).closest('textarea, input')) return;
    if (e.key === 'ArrowLeft') onNavigate(-1);
    if (e.key === 'ArrowRight') onNavigate(1);
  };

  const isOpen = report.status === 'open';
  const dt = 'text-ink-3 dark:text-snow-3';

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="report-title"
      onClose={onClose}
      onKeyDown={onKeyDown}
      className="m-auto h-[min(60rem,94dvh)] w-[min(72rem,calc(100vw-1rem))] overflow-hidden overscroll-contain rounded-sm border border-line bg-paper p-0 text-ink backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-night/60 dark:border-night-line dark:bg-night-2 dark:text-snow"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line p-4 dark:border-night-line sm:px-6">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusChip status={report.status} />
              <PriorityChip priority={report.priority} />
              <CategoryChip category={report.category} />
              <span className="font-mono text-[11px] text-ink-3 dark:text-snow-3">#{report.number}</span>
            </div>
            <h2 id="report-title" className="text-lg font-bold leading-tight">
              {report.title}
            </h2>
            <p className="text-xs text-ink-3 dark:text-snow-3">
              {report.author} · {relativeDate(report.createdAt)} · <span className="font-mono">{report.routePath}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              disabled={position.index <= 0}
              aria-label="Retour précédent"
              className="rounded-sm p-2 hover:bg-paper-2 disabled:opacity-30 dark:hover:bg-night"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="text-xs tabular-nums text-ink-3 dark:text-snow-3">
              {position.index + 1}/{position.total}
            </span>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              disabled={position.index >= position.total - 1}
              aria-label="Retour suivant"
              className="rounded-sm p-2 hover:bg-paper-2 disabled:opacity-30 dark:hover:bg-night"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fermer"
              className="ml-2 rounded-sm p-2 hover:bg-paper-2 dark:hover:bg-night"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:overflow-hidden">
          <section className="space-y-4 p-4 sm:p-6 lg:overflow-y-auto" aria-label="Capture et contexte">
            {report.imageUrl ? (
              <a href={report.imageUrl} target="_blank" rel="noopener noreferrer" className="group block">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote GitHub asset, no next/image loader configured */}
                <img
                  src={report.imageUrl}
                  alt={'Capture d’écran du retour ' + report.id}
                  className="w-full rounded-sm border border-line dark:border-night-line"
                />
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-3 group-hover:text-brand dark:text-snow-3">
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Ouvrir en taille réelle
                </span>
              </a>
            ) : (
              <p className="rounded-sm border border-line bg-paper-2 p-3 text-xs dark:border-night-line dark:bg-night">
                Aucune capture jointe à ce retour.
              </p>
            )}

            <details className="rounded-sm border border-line text-xs dark:border-night-line">
              <summary className="cursor-pointer px-3 py-2 font-bold uppercase tracking-wider">Détails techniques</summary>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line p-3 dark:border-night-line">
                {report.pageUrl && (
                  <>
                    <dt className={dt}>Page</dt>
                    <dd className="break-all">
                      <a href={report.pageUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        {report.pageUrl}
                      </a>
                    </dd>
                  </>
                )}
                {report.viewport && (
                  <>
                    <dt className={dt}>Écran</dt>
                    <dd className="tabular-nums">{report.viewport}</dd>
                  </>
                )}
                {report.captureMode && (
                  <>
                    <dt className={dt}>Capture</dt>
                    <dd>
                      {report.captureMode === 'native_tab'
                        ? 'Onglet (fidèle)'
                        : report.captureMode === 'dom_snapshot'
                          ? 'Instantané simplifié'
                          : 'Aucune'}
                    </dd>
                  </>
                )}
                {report.userAgent && (
                  <>
                    <dt className={dt}>Navigateur</dt>
                    <dd className="break-all">{report.userAgent}</dd>
                  </>
                )}
                {report.consoleErrors.length > 0 && (
                  <>
                    <dt className={dt}>Erreurs</dt>
                    <dd className="space-y-1 font-mono">
                      {report.consoleErrors.map((e, i) => (
                        <div key={i} className="break-all">
                          {e}
                        </div>
                      ))}
                    </dd>
                  </>
                )}
              </dl>
            </details>
          </section>

          <section
            className="flex min-h-0 flex-col border-t border-line dark:border-night-line lg:border-l lg:border-t-0"
            aria-label="Description et réponses"
          >
            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">Ce qui ne va pas</h3>
                <p className="whitespace-pre-wrap text-sm">{report.comment}</p>
              </div>
              {report.expected && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">Comportement attendu</h3>
                  <p className="whitespace-pre-wrap text-sm">{report.expected}</p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">Échanges</h3>
                {loadError && (
                  <p role="alert" className="text-xs font-semibold text-brand">
                    Impossible de charger les réponses.
                  </p>
                )}
                {!loadError && comments === null && <p className="text-xs text-ink-3 dark:text-snow-3">Chargement…</p>}
                {comments?.length === 0 && <p className="text-xs text-ink-3 dark:text-snow-3">Aucune réponse pour l’instant.</p>}
                <ol className="space-y-3">
                  {comments?.map((c) => (
                    <li key={c.id} className="rounded-sm border border-line bg-white p-3 text-sm dark:border-night-line dark:bg-night">
                      <p className="mb-1 text-[11px] text-ink-3 dark:text-snow-3">
                        <strong className="text-ink dark:text-snow">{c.author}</strong> · {relativeDate(c.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap">{c.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <footer className="space-y-3 border-t border-line bg-paper-2 p-4 dark:border-night-line dark:bg-night sm:px-6">
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider">Votre réponse (facultative)</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  rows={2}
                  className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand dark:border-night-line dark:bg-night-2"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {isOpen ? (
                  <>
                    <button type="button" disabled={busy} onClick={() => act('resolve')} className={btn + ' bg-vert text-white'}>
                      Marquer résolu
                    </button>
                    <button type="button" disabled={busy} onClick={() => act('dismiss')} className={btn + ' border border-line dark:border-night-line'}>
                      Écarter
                    </button>
                  </>
                ) : (
                  <button type="button" disabled={busy} onClick={() => act('reopen')} className={btn + ' bg-brand text-white'}>
                    Rouvrir
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy || !text.trim()}
                  onClick={() => act('comment')}
                  className={btn + ' border border-line dark:border-night-line'}
                >
                  Répondre seulement
                </button>
                <a
                  href={report.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 hover:text-brand dark:text-snow-3"
                >
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  GitHub
                </a>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </dialog>
  );
}
