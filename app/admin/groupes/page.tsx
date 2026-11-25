'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUturnLeftIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import AdminPageHeader from '../components/AdminPageHeader';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';
import {
  GROUP_CODE_MAX_LENGTH,
  GROUP_LABEL_MAX_LENGTH,
  GROUP_MAX_COUNT,
  type GroupDefinition,
  type GroupSettings,
} from '@/app/constants/groups';
import { groupKey } from '@/app/lib/groupLabels';

type Usage = Record<string, { code: string; count: number }>;

/** Editable row; `id` keeps React from recreating inputs when rows move. */
interface Row extends GroupDefinition {
  id: string;
}

let rowSeq = 0;
const toRows = (groups: GroupDefinition[]): Row[] =>
  groups.map((g) => ({ ...g, id: `row-${rowSeq++}` }));

/** Per-row error messages (French), computed on the client before saving. */
function validateRows(rows: Row[]): Record<string, { code?: string; label?: string }> {
  const errors: Record<string, { code?: string; label?: string }> = {};
  // Count every value first so all rows sharing a duplicate are flagged, not only the later one.
  const codeCount = new Map<string, number>();
  const labelCount = new Map<string, number>();
  for (const row of rows) {
    const code = groupKey(row.code);
    const label = groupKey(row.label);
    if (code) codeCount.set(code, (codeCount.get(code) ?? 0) + 1);
    if (label) labelCount.set(label, (labelCount.get(label) ?? 0) + 1);
  }
  for (const row of rows) {
    const e: { code?: string; label?: string } = {};
    const code = groupKey(row.code);
    const label = groupKey(row.label);
    if (!code) e.code = 'Saisissez le code enregistré, par exemple A.';
    else if ((codeCount.get(code) ?? 0) > 1)
      e.code = `Le code ${row.code.trim()} apparaît plusieurs fois. Gardez une seule ligne.`;
    if (!label) e.label = 'Saisissez le nom à afficher, par exemple GR1.';
    else if ((labelCount.get(label) ?? 0) > 1)
      e.label = `Le nom ${row.label.trim()} est déjà utilisé par un autre groupe. Choisissez un nom unique.`;
    if (e.code || e.label) errors[row.id] = e;
  }
  return errors;
}

const inputClass =
  'w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 transition-colors aria-[invalid=true]:border-brand aria-[invalid=true]:bg-brand/5';

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper text-ink-2 hover:border-ink-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 transition-colors';

export default function AdminGroupesPage(): React.ReactElement {
  const router = useRouter();
  const { setSettings } = useGroupLabels();
  const [rows, setRows] = useState<Row[]>([]);
  const [saved, setSaved] = useState<GroupDefinition[]>([]);
  const [usage, setUsage] = useState<Usage>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [status, setStatus] = useState('');

  // Bumped by "Réessayer" to refetch; state only changes in the async callbacks.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/group-settings', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return (await res.json()) as { settings: GroupSettings; usage: Usage };
      })
      .then((data) => {
        if (cancelled) return;
        setRows(toRows(data.settings.groups));
        setSaved(data.settings.groups);
        setUsage(data.usage ?? {});
      })
      .catch(() => {
        if (!cancelled)
          setLoadError(
            'Impossible de charger les groupes. Vérifiez votre connexion puis réessayez.'
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const errors = useMemo(() => validateRows(rows), [rows]);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = useMemo(
    () =>
      JSON.stringify(
        rows.map(({ code, label }) => ({ code: code.trim(), label: label.trim() }))
      ) !== JSON.stringify(saved),
    [rows, saved]
  );

  // Codes present in members / leaderboard data but missing from the list.
  const unconfigured = useMemo(() => {
    const configured = new Set(rows.map((r) => groupKey(r.code)));
    return Object.entries(usage)
      .filter(([key]) => !configured.has(key))
      .map(([, u]) => u)
      .sort((a, b) => a.code.localeCompare(b.code, 'fr'));
  }, [rows, usage]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent): void => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const updateRow = (id: string, patch: Partial<GroupDefinition>): void =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const move = (index: number, delta: -1 | 1): void => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const moved = next[target];
    setStatus(`${moved.label || moved.code} déplacé en position ${target + 1} sur ${next.length}.`);
  };

  const addRow = (code: string): void => {
    const clean = code.trim().slice(0, GROUP_CODE_MAX_LENGTH);
    if (!clean || rows.length >= GROUP_MAX_COUNT) return;
    if (rows.some((r) => groupKey(r.code) === groupKey(clean))) {
      toast.error(`Le code ${clean} est déjà dans la liste.`);
      return;
    }
    setRows((prev) => [...prev, ...toRows([{ code: clean, label: clean }])]);
    setStatus(`Groupe ${clean} ajouté en fin de liste.`);
  };

  const removeRow = (row: Row): void => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setStatus(
      `Groupe ${row.code} retiré de la liste. Ses membres afficheront à nouveau le code ${row.code}.`
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) {
      const firstId = Object.keys(errors)[0];
      const field = errors[firstId].code ? 'code' : 'label';
      document.getElementById(`${field}-${firstId}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const payload = {
        groups: rows.map(({ code, label }) => ({ code: code.trim(), label: label.trim() })),
      };
      const res = await fetch('/api/admin/group-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "L'enregistrement a échoué.");
      const settings = data.settings as GroupSettings;
      setSaved(settings.groups);
      setRows(toRows(settings.groups));
      setSettings(settings);
      setSubmitted(false);
      toast.success('Noms des groupes enregistrés. Ils sont visibles partout sur le site.');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "L'enregistrement a échoué. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const showError = (id: string, field: 'code' | 'label'): string | undefined =>
    submitted ? errors[id]?.[field] : undefined;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        id="groupes-header-section"
        title="Groupes & Pelotons"
        sheet="Feuille · Groupes"
        badge={{ icon: TagIcon, label: 'Administration · Groupes' }}
        description="Choisissez le nom affiché de chaque groupe (classement Carré Vert, pointage, calendrier, statistiques, accueil). Les codes enregistrés ne changent pas : renommer A en GR1 ne modifie aucun historique."
      />

      <p role="status" className="sr-only">
        {status}
      </p>

      {loading ? (
        <div
          className="rounded-md border border-line bg-paper p-6 text-sm text-ink-3"
          aria-busy="true"
        >
          Chargement des groupes…
        </div>
      ) : loadError ? (
        <div className="rounded-md border border-brand/40 bg-brand/5 p-6 space-y-3">
          <p className="text-sm text-ink">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setLoadError(null);
              setReloadKey((k) => k + 1);
            }}
            className="rounded-md border border-line bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:border-ink-3"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <section
            aria-labelledby="groupes-list-title"
            className="rounded-md border border-line bg-paper corner-ticks"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <div>
                <h2
                  id="groupes-list-title"
                  className="font-semiwide text-base font-extrabold uppercase tracking-tight text-ink"
                >
                  Légende des groupes
                </h2>
                <p className="text-xs text-ink-3">
                  L&apos;ordre ci-dessous est celui des filtres, légendes et statistiques.
                </p>
              </div>
              <span className="font-narrow text-xs font-bold uppercase tracking-wider text-ink-3 tabular-nums">
                {rows.length} / {GROUP_MAX_COUNT} groupes
              </span>
            </div>

            {rows.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-3">
                Aucun groupe configuré : les codes s&apos;affichent tels quels. Ajoutez un groupe
                ci-dessous.
              </p>
            ) : (
              <ol className="divide-y divide-line">
                {rows.map((row, index) => {
                  const count = usage[groupKey(row.code)]?.count ?? 0;
                  const isSavedCode = saved.some((g) => groupKey(g.code) === groupKey(row.code));
                  const codeError = showError(row.id, 'code');
                  const labelError = showError(row.id, 'label');
                  return (
                    <li
                      key={row.id}
                      className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[auto_7rem_1fr_6rem_auto] sm:items-center sm:px-5"
                    >
                      {/* Order controls */}
                      <div className="row-span-2 flex gap-1 sm:row-span-1">
                        <button
                          type="button"
                          className={iconButtonClass}
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`Monter ${row.label || row.code}`}
                        >
                          <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={iconButtonClass}
                          onClick={() => move(index, 1)}
                          disabled={index === rows.length - 1}
                          aria-label={`Descendre ${row.label || row.code}`}
                        >
                          <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Stored code */}
                      <div className="min-w-0">
                        <label
                          htmlFor={`code-${row.id}`}
                          className="block font-narrow text-xs font-bold uppercase tracking-wider text-ink-3"
                        >
                          Code
                        </label>
                        {isSavedCode ? (
                          <p
                            id={`code-${row.id}`}
                            className="py-2 font-mono text-sm font-bold text-ink tabular-nums"
                          >
                            {row.code}
                          </p>
                        ) : (
                          <input
                            id={`code-${row.id}`}
                            type="text"
                            value={row.code}
                            required
                            maxLength={GROUP_CODE_MAX_LENGTH}
                            autoComplete="off"
                            spellCheck={false}
                            onChange={(e) => updateRow(row.id, { code: e.target.value })}
                            aria-invalid={codeError ? 'true' : 'false'}
                            aria-describedby={codeError ? `code-error-${row.id}` : undefined}
                            className={`${inputClass} font-mono`}
                          />
                        )}
                        {codeError && (
                          <p id={`code-error-${row.id}`} className="mt-1 text-xs text-brand">
                            Erreur : {codeError}
                          </p>
                        )}
                      </div>

                      {/* Display label */}
                      <div className="col-start-2 col-span-2 min-w-0 sm:col-span-1 sm:col-start-auto">
                        <label
                          htmlFor={`label-${row.id}`}
                          className="block font-narrow text-xs font-bold uppercase tracking-wider text-ink-3"
                        >
                          Nom affiché
                        </label>
                        <input
                          id={`label-${row.id}`}
                          type="text"
                          value={row.label}
                          required
                          maxLength={GROUP_LABEL_MAX_LENGTH}
                          autoComplete="off"
                          placeholder="GR1"
                          onChange={(e) => updateRow(row.id, { label: e.target.value })}
                          aria-invalid={labelError ? 'true' : 'false'}
                          aria-describedby={labelError ? `label-error-${row.id}` : undefined}
                          className={inputClass}
                        />
                        {labelError && (
                          <p id={`label-error-${row.id}`} className="mt-1 text-xs text-brand">
                            Erreur : {labelError}
                          </p>
                        )}
                      </div>

                      {/* Usage */}
                      <p className="col-start-2 text-xs text-ink-3 sm:col-start-auto sm:text-right">
                        <span className="font-mono text-sm font-bold text-ink tabular-nums">
                          {count}
                        </span>{' '}
                        {count > 1 ? 'fiches' : 'fiche'}
                      </p>

                      {/* Remove */}
                      <button
                        type="button"
                        className={`${iconButtonClass} col-start-3 row-start-1 hover:border-brand hover:text-brand sm:col-start-auto sm:row-start-auto`}
                        onClick={() => removeRow(row)}
                        aria-label={`Retirer le groupe ${row.code} de la liste`}
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="space-y-3 border-t border-line bg-paper-2 px-4 py-4 sm:px-5">
              {unconfigured.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-ink-2">
                    Codes trouvés dans les fiches mais absents de la liste (affichés tels quels) :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unconfigured.map((u) => (
                      <button
                        key={u.code}
                        type="button"
                        onClick={() => addRow(u.code)}
                        disabled={rows.length >= GROUP_MAX_COUNT}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:border-ink-3 disabled:opacity-40"
                      >
                        <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="font-mono">{u.code}</span>
                        <span className="text-ink-3 tabular-nums">· {u.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[8rem]">
                  <label
                    htmlFor="new-group-code"
                    className="block font-narrow text-xs font-bold uppercase tracking-wider text-ink-3"
                  >
                    Nouveau code
                  </label>
                  <input
                    id="new-group-code"
                    type="text"
                    value={newCode}
                    maxLength={GROUP_CODE_MAX_LENGTH}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="D"
                    onChange={(e) => setNewCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRow(newCode);
                        setNewCode('');
                      }
                    }}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addRow(newCode);
                    setNewCode('');
                  }}
                  disabled={!newCode.trim() || rows.length >= GROUP_MAX_COUNT}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-line bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:border-ink-3 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  Ajouter le groupe
                </button>
              </div>
            </div>
          </section>

          {/* Preview */}
          <section
            aria-labelledby="groupes-preview-title"
            className="rounded-md border border-line bg-paper px-4 py-4 sm:px-5"
          >
            <h2
              id="groupes-preview-title"
              className="font-narrow text-xs font-bold uppercase tracking-wider text-ink-3"
            >
              Aperçu des étiquettes
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-2 px-3 py-1 text-xs"
                >
                  <span className="font-mono text-ink-3">{row.code.trim() || '?'}</span>
                  <span aria-hidden="true" className="text-ink-3">
                    →
                  </span>
                  <span className="sr-only">s&apos;affiche</span>
                  <span className="font-narrow font-bold text-ink">
                    {row.label.trim() || row.code.trim() || '?'}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {dirty && <p className="mr-auto text-xs text-ink-2">Modifications non enregistrées.</p>}
            <button
              type="button"
              onClick={() => {
                setRows(toRows(saved));
                setSubmitted(false);
                setStatus('Modifications annulées.');
              }}
              disabled={!dirty || saving}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-line bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:border-ink-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" aria-hidden="true" />
              Annuler les modifications
            </button>
            <button
              type="submit"
              disabled={!dirty || saving}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-brand px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer les noms'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
