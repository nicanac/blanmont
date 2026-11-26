'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowUturnLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import AdminPageHeader from '../components/AdminPageHeader';
import { CLUB_ROLES } from '@/app/constants/roles';
import type { AdminSection } from '@/app/constants/admin-sections';
import type { AdminAccessMatrix } from '@/app/lib/auth/admin-access';
import { getAdminAccessAction, resetAdminAccessAction, saveAdminAccessAction } from './actions';

type Roles = Record<string, string[]>;
interface Loaded {
  matrix: AdminAccessMatrix;
  sections: readonly AdminSection[];
  roles: { key: string; label: string }[];
}

const ADMIN_ROLE_LABELS = CLUB_ROLES.filter((r) => r.isAdmin).map((r) => r.label).join(' · ');
const sameRoles = (a: Roles, b: Roles): boolean =>
  Object.keys({ ...a, ...b }).every((k) => [...(a[k] ?? [])].sort().join() === [...(b[k] ?? [])].sort().join());

const buttonClass =
  'inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-narrow font-bold uppercase tracking-[0.07em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

/** Admin-only matrix: which club role opens which back-office section (spec: docs/admin-rbac.md). */
export default function AdminAccesPage(): React.ReactElement {
  const [data, setData] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<Roles>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = (loaded: Loaded): void => {
    setData(loaded);
    setDraft(loaded.matrix.roles);
  };

  useEffect(() => {
    getAdminAccessAction().then((res) => (res.success ? apply(res) : setError(res.error)));
  }, []);

  const dirty = useMemo(() => (data ? !sameRoles(draft, data.matrix.roles) : false), [draft, data]);

  // Sidebar groups, in registry order.
  const groups = useMemo(() => {
    const byGroup = new Map<string, AdminSection[]>();
    for (const s of data?.sections ?? []) byGroup.set(s.group, [...(byGroup.get(s.group) ?? []), s]);
    return [...byGroup];
  }, [data]);

  const toggle = (role: string, section: string): void =>
    setDraft((prev) => {
      const current = prev[role] ?? [];
      return {
        ...prev,
        [role]: current.includes(section) ? current.filter((id) => id !== section) : [...current, section],
      };
    });

  const save = async (): Promise<void> => {
    if (!data) return;
    setBusy(true);
    const res = await saveAdminAccessAction({ roles: draft });
    setBusy(false);
    if (!res.success) return void toast.error(res.error);
    apply({ ...data, matrix: res.matrix });
    toast.success('Accès enregistrés. Ils s’appliquent dans la minute.');
  };

  const reset = async (): Promise<void> => {
    if (!data || !window.confirm('Rétablir les accès suggérés pour tous les rôles ?')) return;
    setBusy(true);
    const res = await resetAdminAccessAction();
    setBusy(false);
    if (!res.success) return void toast.error(res.error);
    apply({ ...data, matrix: res.matrix });
    toast.success('Valeurs suggérées rétablies.');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Accès & Rôles"
        badge={{ icon: ShieldCheckIcon, label: 'Configuration' }}
        description="Choisissez quelles sections de l’administration chaque rôle du club peut ouvrir. Les administrateurs et le président ont toujours tout. L’attribution des rôles aux membres et cette page restent réservées aux administrateurs ; les Paramètres au propriétaire du site."
      />

      {error && (
        <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 px-4 py-3 text-sm text-ink dark:text-snow">
          {error}
        </p>
      )}

      {!data && !error && <p className="text-sm text-ink-3 dark:text-snow-3">Chargement de la matrice…</p>}

      {data && (
        <>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="acces-caption"
            className="overflow-x-auto rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2"
          >
            <table className="w-full border-separate border-spacing-0 text-sm">
              <caption id="acces-caption" className="sr-only">
                Accès aux sections de l’administration par rôle
              </caption>
              <thead>
                <tr className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                  <th scope="col" className="sticky left-0 bg-paper-2 dark:bg-night px-4 py-3 text-left border-b border-line dark:border-night-line">
                    Section
                  </th>
                  <th scope="col" className="bg-paper-2 dark:bg-night px-3 py-3 text-center border-b border-line dark:border-night-line">
                    {ADMIN_ROLE_LABELS}
                    <span className="block font-normal normal-case tracking-normal">accès total</span>
                  </th>
                  {data.roles.map((r) => (
                    <th key={r.key} scope="col" className="bg-paper-2 dark:bg-night px-3 py-3 text-center border-b border-line dark:border-night-line">
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map(([group, sections]) => (
                <tbody key={group}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={data.roles.length + 2}
                      className="px-4 pt-4 pb-1.5 text-left text-xs font-narrow font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3"
                    >
                      {group}
                    </th>
                  </tr>
                  {sections.map((s) => (
                    <tr key={s.id} className="hover:bg-paper-2/60 dark:hover:bg-night/60">
                      <th scope="row" className="sticky left-0 bg-paper dark:bg-night-2 px-4 py-2 text-left font-semibold text-ink dark:text-snow border-t border-line dark:border-night-line">
                        {s.label}
                      </th>
                      <td className="px-3 py-2 text-center border-t border-line dark:border-night-line">
                        <input type="checkbox" checked disabled aria-label={`${ADMIN_ROLE_LABELS} — ${s.label} (toujours)`} className="h-4 w-4 accent-brand" />
                      </td>
                      {data.roles.map((r) => (
                        <td key={r.key} className="px-3 py-2 text-center border-t border-line dark:border-night-line">
                          <input
                            type="checkbox"
                            checked={draft[r.key]?.includes(s.id) ?? false}
                            onChange={() => toggle(r.key, s.id)}
                            disabled={busy}
                            aria-label={`${r.label} — ${s.label}`}
                            className="h-4 w-4 accent-brand cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-3 dark:text-snow-3">
              {data.matrix.updatedAt
                ? `Dernière modification le ${new Date(data.matrix.updatedAt).toLocaleString('fr-BE')}${data.matrix.updatedBy ? ` par ${data.matrix.updatedBy.name}` : ''}.`
                : 'Valeurs suggérées, jamais modifiées.'}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                className={`${buttonClass} border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3`}
              >
                <ArrowUturnLeftIcon className="h-4 w-4" aria-hidden="true" />
                Rétablir les valeurs suggérées
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy || !dirty}
                className={`${buttonClass} bg-brand hover:bg-brand-strong text-white`}
              >
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
