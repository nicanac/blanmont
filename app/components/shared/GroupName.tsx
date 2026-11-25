'use client';

import React from 'react';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';

/**
 * Renders the admin-configured name of a group code. Lets server components
 * (home cover, weekend board, admin dashboard) show renamed groups.
 *
 * - `variant="short"` (default): "GR1" / "A"
 * - `variant="full"`: "GR1" / "Groupe A"
 */
export default function GroupName({
  code,
  variant = 'short',
}: {
  code: string | null | undefined;
  variant?: 'short' | 'full';
}): React.ReactElement {
  const { label, fullName } = useGroupLabels();
  return <>{variant === 'full' ? fullName(code) : label(code)}</>;
}
