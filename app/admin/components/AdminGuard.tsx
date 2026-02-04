'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
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
  const { user, isAuthenticated } = useAuth();
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

      // Check if user has admin/president role
      const allowedRoles = ['Admin', 'President', 'admin', 'president', 'WebMaster'];
      
      // 1. Check Role from Context
      if (user && user.role) {
         const hasAdminRole = user.role.some((role: string) => 
            allowedRoles.includes(role)
         );
         if (hasAdminRole) {
             setHasAccess(true);
             setIsChecking(false);
             return;
         }
      }

      // 2. Fallback: The user object from AuthContext didn't have roles (old session?), check localStorage
      const storedMember = localStorage.getItem('memberData');
      if (storedMember) {
        try {
          const member = JSON.parse(storedMember);
          const userRoles = member.role || [];
          const hasAdminRole = userRoles.some((role: string) => 
            allowedRoles.includes(role)
          );
          if (hasAdminRole) {
              setHasAccess(true);
              setIsChecking(false);
              return;
          }
        } catch {
          // ignore error
        }
      } 
      
      // 3. Fallback: Check email
      const adminEmails = ['admin@blanmont.be', 'president@blanmont.be', 'bruyere.nicolas@gmail.com'];
      if(adminEmails.includes(user?.email || '')) {
          setHasAccess(true);
          setIsChecking(false);
          return;
      }

      setHasAccess(false);
      
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
