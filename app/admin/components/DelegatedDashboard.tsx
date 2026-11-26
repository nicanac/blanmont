import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { SheetHeader } from '@/app/components/carte/SheetHeader';
import { ADMIN_SECTIONS, type AdminSectionId } from '@/app/constants/admin-sections';

/**
 * Dashboard for a non-admin role (docs/admin-rbac.md): links to its sections only, no club-wide widgets,
 * so no data from other sections (members, prospects…) is read or shown.
 * shortcut: no per-section widgets; add them here if officers ask for figures on the dashboard.
 */
export default function DelegatedDashboard({
  sections,
  denied,
}: {
  sections: AdminSectionId[];
  denied: boolean;
}): React.ReactElement {
  const mine = ADMIN_SECTIONS.filter((s) => sections.includes(s.id));
  return (
    <div className="space-y-6">
      <SheetHeader
        sheet="Feuille · Quartier Général"
        title="Tableau de bord"
        description="Les sections de l’administration ouvertes à votre rôle."
      />
      {denied && (
        <p role="status" className="rounded-md border border-ambre/40 bg-ambre/10 px-4 py-3 text-sm text-ink dark:text-snow">
          Cette page n’est pas ouverte à votre rôle. Un administrateur peut changer cela dans « Accès &amp; rôles ».
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mine.map((s) => (
          <li key={s.id}>
            <Link
              href={s.pages[0]}
              className="group flex items-center justify-between gap-3 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-4 py-3 hover:border-brand transition-colors"
            >
              <span>
                <span className="block text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                  {s.group}
                </span>
                <span className="block text-sm font-semibold text-ink dark:text-snow">{s.label}</span>
              </span>
              <ArrowRightIcon className="h-4 w-4 text-ink-3 group-hover:text-brand" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
