import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { getSessionUser, isSessionOwner } from '@/app/lib/auth/session';
import AdminEmptyState from '../components/AdminEmptyState';

export const dynamic = 'force-dynamic';

/** Paramètres is owner-only (OWNER_EMAILS, verified login email); proxy.ts lets other admins reach this notice. */
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  if (!isSessionOwner(await getSessionUser())) {
    return (
      <AdminEmptyState
        icon={LockClosedIcon}
        title="Réservé au propriétaire du site"
        description="Les paramètres du site ne sont accessibles qu’au propriétaire du site."
        primaryAction={{ label: 'Retour au tableau de bord', href: '/admin' }}
      />
    );
  }
  return <>{children}</>;
}
