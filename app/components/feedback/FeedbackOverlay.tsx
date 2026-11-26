'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChatBubbleBottomCenterTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AnnotationStudio from './AnnotationStudio';
import { captureViewport, nextFrame, type Capture } from './capture';
import { exportAnnotatedJpeg, type Layer } from './annotations';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
} from '@/app/lib/feedback/schema';

const CATEGORY_LABELS: Record<(typeof FEEDBACK_CATEGORIES)[number], string> = {
  ui: 'Affichage / design',
  bug: 'Bug',
  feature: 'Idée / fonctionnalité',
  copy: 'Texte / orthographe',
};
const PRIORITY_LABELS: Record<(typeof FEEDBACK_PRIORITIES)[number], string> = {
  critical: 'Bloquant',
  important: 'Important',
  suggestion: 'Suggestion',
};

const fieldClass =
  'w-full rounded-sm border border-line dark:border-night-line bg-white dark:bg-night px-3 py-2 text-sm text-ink dark:text-snow focus-visible:outline-2 focus-visible:outline-brand';

/**
 * Floating "Donner un avis" button + capture/annotation dialog.
 * Loaded lazily by FeedbackGate only when an admin has enabled the tool for this visitor.
 */
export default function FeedbackOverlay(): React.ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const errorsRef = useRef<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'capturing' | 'editing'>('idle');
  const [capture, setCapture] = useState<Capture | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  // Recent runtime errors travel with the report. Window events only: no console monkey-patching to undo.
  useEffect(() => {
    const push = (message: string) => {
      errorsRef.current = [...errorsRef.current, message.slice(0, 300)].slice(-10);
    };
    const onError = (e: ErrorEvent) => push(e.message);
    const onRejection = (e: PromiseRejectionEvent) => push('Unhandled rejection: ' + String(e.reason));
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  useEffect(() => {
    if (phase === 'editing' && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [phase]);

  const start = useCallback(async () => {
    setPhase('capturing'); // hides the button so it is not in the screenshot
    await nextFrame();
    await nextFrame();
    const result = await captureViewport();
    setCapture(result);
    setLayers([]);
    setFormError('');
    setPhase('editing');
  }, []);

  const reset = () => {
    setPhase('idle');
    setCapture(null);
    setLayers([]);
    setFormError('');
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setFormError('');
    try {
      const screenshot = capture ? exportAnnotatedJpeg(capture.canvas, layers) : undefined;
      const expected = String(form.get('expectedBehavior') ?? '').trim();
      const res = await fetch('/api/feedback', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          comment: form.get('comment'),
          expectedBehavior: expected || undefined,
          category: form.get('category'),
          priority: form.get('priority'),
          screenshot,
          context: {
            url: window.location.href.slice(0, 500),
            routePath: window.location.pathname.slice(0, 300),
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio || 1,
            },
            userAgent: navigator.userAgent.slice(0, 400),
            captureMode: capture?.mode ?? 'none',
            consoleErrors: errorsRef.current,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; issueNumber?: number };
      if (!res.ok) {
        setFormError(data.error ?? 'Envoi impossible pour le moment.');
        return;
      }
      toast.success('Merci ! Retour envoyé' + (data.issueNumber ? ' (#' + data.issueNumber + ')' : '') + '.');
      dialogRef.current?.close();
    } catch {
      setFormError('Envoi impossible pour le moment.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {phase === 'idle' && (
        <button
          type="button"
          data-feedback-ignore
          onClick={start}
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-sm border border-brand bg-brand px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-vif focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <ChatBubbleBottomCenterTextIcon className="h-4 w-4" aria-hidden="true" />
          Donner un avis
        </button>
      )}

      <dialog
        ref={dialogRef}
        data-feedback-ignore
        aria-labelledby="feedback-title"
        onClose={reset}
        className="m-auto w-[min(56rem,calc(100vw-1.5rem))] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 p-0 text-ink dark:text-snow backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-night/60"
      >
        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="feedback-title" className="text-lg font-bold uppercase tracking-tight">
                Envoyer un retour
              </h2>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Entourez ce qui ne va pas, puis décrivez-le. Les annotations sont facultatives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fermer"
              className="rounded-sm p-1 hover:bg-paper-2 dark:hover:bg-night"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {capture ? (
            <AnnotationStudio source={capture.canvas} layers={layers} onLayersChange={setLayers} />
          ) : (
            <p className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-3 text-xs">
              La capture d’écran n’est pas disponible dans ce navigateur : le retour sera envoyé sans image.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider">Titre</span>
              <input name="title" required minLength={3} maxLength={120} autoFocus className={fieldClass} />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider">Que se passe-t-il ?</span>
              <textarea name="comment" required minLength={3} maxLength={4000} rows={4} className={fieldClass} />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider">Comportement attendu (facultatif)</span>
              <textarea name="expectedBehavior" maxLength={2000} rows={2} className={fieldClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">Type</span>
              <select name="category" defaultValue="ui" className={fieldClass}>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider">Priorité</span>
              <select name="priority" defaultValue="important" className={fieldClass}>
                {FEEDBACK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-start gap-2 rounded-sm border border-ambre/50 bg-ambre/10 p-3 text-xs">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand" />
            <span>
              Ce retour est publié sur GitHub dans un dépôt <strong>public</strong>. J’ai flouté ou vérifié
              qu’aucun nom, visage, e-mail ou autre donnée personnelle n’apparaît sur la capture.
            </span>
          </label>

          {formError && (
            <p role="alert" className="text-sm font-semibold text-brand">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-sm border border-line dark:border-night-line px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-sm bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
