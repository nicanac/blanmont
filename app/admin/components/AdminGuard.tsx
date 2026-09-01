'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { checkIsAdmin } from '../../utils/auth';
import Link from 'next/link';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard protects admin routes by checking if the user has admin privileges.
 * Only users with 'Admin' or 'President' roles can access admin pages.
 */
export default function AdminGuard({ children }: AdminGuardProps): React.ReactElement {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Give a moment for auth state to hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin');
        return;
      }

      const hasAdminAccess = isAdmin || checkIsAdmin(user);
      setHasAccess(hasAdminAccess);
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, isAdmin, router]);

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#e03e3e] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Accès Refusé
          </h2>
          <p className="mt-2 text-gray-600">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
            Seuls les administrateurs et le président peuvent accéder au tableau de bord.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/login?redirect=/admin"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              Se connecter avec un autre compte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
