'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Member } from '@/app/types';
import { downloadCsv } from '@/app/lib/csv';
import {
  MAX_MEMBER_IMPORT_BYTES,
  MEMBER_CSV_SEPARATOR,
  MEMBER_IMPORT_TOO_LARGE,
  memberCsvHeader,
  membersToCsvRows,
  type MemberImportPlan,
} from '@/app/lib/members-csv';
import { importMembersCsvAction, previewMembersCsvAction } from '../actions';

const BTN =
  'inline-flex items-center gap-1.5 rounded-md border border-line bg-paper-2 px-3.5 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink transition-colors cursor-pointer hover:bg-line disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-line dark:bg-night-2 dark:text-snow dark:hover:bg-night-3';

/** "Exporter CSV" (the listed members) and "Importer CSV" (file, preview, confirm). */
export default function MembersCsvActions({ members }: { members: Member[] }): React.ReactElement {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [plan, setPlan] = useState<MemberImportPlan | null>(null);
  const [busy, setBusy] = useState(false);

  const exportCsv = (): void =>
    downloadCsv(
      `membres-blanmont-${new Date().toISOString().slice(0, 10)}.csv`,
      membersToCsvRows(members),
      MEMBER_CSV_SEPARATOR
    );

  const reset = (): void => {
    setCsv(null);
    setPlan(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const preview = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (picked.size > MAX_MEMBER_IMPORT_BYTES) {
      toast.error(MEMBER_IMPORT_TOO_LARGE);
      reset();
      return;
    }
    setBusy(true);
    try {
      const content = await picked.text();
      const res = await previewMembersCsvAction(content);
      if (!res.success) {
        toast.error(res.error);
        reset();
        return;
      }
      setCsv(content);
      setPlan(res.plan);
    } catch {
      toast.error('Lecture du fichier impossible.');
      reset();
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (): Promise<void> => {
    if (!csv) return;
    setBusy(true);
    try {
      const res = await importMembersCsvAction(csv);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Import terminé : ${res.created} créé(s), ${res.updated} mis à jour, ${res.rejected} rejeté(s).`);
      dialogRef.current?.close();
      router.refresh();
    } catch {
      toast.error('Import impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  };

  const changes = plan ? plan.creates.length + plan.updates.length : 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportCsv} className={BTN}>
        <ArrowDownTrayIcon className="h-4 w-4 text-brand" aria-hidden="true" />
        <span>Exporter CSV</span>
      </button>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={BTN}>
        <ArrowUpTrayIcon className="h-4 w-4 text-brand" aria-hidden="true" />
        <span>Importer CSV</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="members-csv-title"
        onClose={reset}
        className="m-auto max-h-[90dvh] w-[min(40rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-sm border border-line bg-paper p-0 text-ink backdrop:bg-night/60 dark:border-night-line dark:bg-night-2 dark:text-snow"
      >
        <div className="space-y-4 p-4 sm:p-6">
          <header className="flex items-start justify-between gap-4">
            <h2 id="members-csv-title" className="font-semiwide text-lg font-bold">
              Importer des membres (CSV)
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fermer"
              className="rounded-sm p-2 hover:bg-paper-2 dark:hover:bg-night"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <p className="text-xs text-ink-3 dark:text-snow-3">
            Fichier CSV UTF-8 (séparateur « ; » ou « , ») avec les colonnes d’un export. Chaque ligne met à jour le
            membre de même ID ou de même email, sinon elle crée un membre. Une colonne absente laisse le champ
            inchangé, une cellule vide l’efface. Les rôles et les accès ne sont jamais modifiés par un import.
          </p>

          <label className="block text-xs font-semibold text-ink-3 dark:text-snow-3">
            Fichier CSV
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={preview}
              disabled={busy}
              className="mt-1 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-line file:bg-paper-2 file:px-3 file:py-1.5 file:text-xs file:font-semibold dark:text-snow dark:file:border-night-line dark:file:bg-night"
            />
          </label>

          {plan && (
            <div className="space-y-3 text-xs">
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['À créer', plan.creates.length],
                  ['À mettre à jour', plan.updates.length],
                  ['Inchangés', plan.unchanged],
                  ['Rejetés', plan.rejected.length],
                ].map(([label, count]) => (
                  <div key={label} className="rounded-sm border border-line p-2 dark:border-night-line">
                    <dt className="font-narrow uppercase tracking-wider text-ink-3 dark:text-snow-3">{label}</dt>
                    <dd className="text-lg font-bold tabular-nums">{count}</dd>
                  </div>
                ))}
              </dl>
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {plan.creates.map((c) => (
                  <li key={`c${c.line}`}>
                    <span className="tabular-nums text-ink-3 dark:text-snow-3">Ligne {c.line}</span> · Création :{' '}
                    <strong>{c.values.name}</strong> {c.values.email}
                  </li>
                ))}
                {plan.updates.map((u) => (
                  <li key={`u${u.line}`}>
                    <span className="tabular-nums text-ink-3 dark:text-snow-3">Ligne {u.line}</span> · Mise à jour :{' '}
                    <strong>{u.name}</strong> ({Object.keys(u.changes).map(memberCsvHeader).join(', ')})
                  </li>
                ))}
                {plan.rejected.map((r) => (
                  <li key={`r${r.line}`} className="text-brand">
                    <span className="tabular-nums">Ligne {r.line}</span> · Rejetée : {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <footer className="flex justify-end gap-2">
            <button type="button" onClick={() => dialogRef.current?.close()} className={BTN}>
              Annuler
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || changes === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-1.5 text-xs font-narrow font-bold uppercase tracking-[0.07em] text-white transition-colors cursor-pointer hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirmer l’import
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
