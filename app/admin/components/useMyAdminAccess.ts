'use client';

import { useEffect, useState } from 'react';
import { getMyAdminAccessAction } from '../acces/actions';
import type { MyAdminAccess } from '@/app/constants/admin-sections';

const NO_ACCESS: MyAdminAccess = { isAdmin: false, isOwner: false, sections: [] };

/** The current user's back-office access (null while loading). Refetched when the signed-in user changes. */
export function useMyAdminAccess(userId: string | null | undefined): MyAdminAccess | null {
  const [access, setAccess] = useState<MyAdminAccess | null>(null);
  useEffect(() => {
    if (!userId) return;
    let live = true;
    getMyAdminAccessAction().then(
      (a) => live && setAccess(a),
      () => live && setAccess(NO_ACCESS) // fail closed: hide everything, the server still guards
    );
    return () => {
      live = false;
    };
  }, [userId]);
  return userId ? access : null;
}
