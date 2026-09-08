'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ConditionalFooterProps {
  children: React.ReactNode;
}

/**
 * ConditionalFooter hides the public website footer when navigating within /admin/*
 * to preserve a dedicated back-office application workspace.
 */
export default function ConditionalFooter({ children }: ConditionalFooterProps): React.ReactElement | null {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <div className="mt-auto">{children}</div>;
}
