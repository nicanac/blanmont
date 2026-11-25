'use client';

import React from 'react';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';
import { groupSummaryText } from '@/app/lib/groupSummary';

/**
 * Enumerates the pace groups with their admin-configured names, for server components.
 *
 * - default: "GR1, GR2, GR3, GR4 & VTT"
 * - `withPaces`: "GR1 (> 30 km/h), GR2 (25 – 28 km/h), … ou VTT"
 */
export default function GroupList({
  withPaces = false,
  conjunction,
}: {
  withPaces?: boolean;
  conjunction?: string;
}): React.ReactElement {
  const { settings } = useGroupLabels();
  return <>{groupSummaryText(settings, { withPaces, conjunction })}</>;
}
