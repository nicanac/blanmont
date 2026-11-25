'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_GROUP_SETTINGS, type GroupSettings } from '@/app/constants/groups';
import { compareGroups, groupFullName, groupLabel } from '@/app/lib/groupLabels';

interface GroupLabelsValue {
  settings: GroupSettings;
  /** Short display name ("GR1"), or the stored value when the code is not configured. */
  label: (code: string | null | undefined) => string;
  /** Sentence form ("Groupe A" while unrenamed, "GR1" once renamed). */
  fullName: (code: string | null | undefined) => string;
  /** Sort comparator following the admin-defined order. */
  compare: (a: string, b: string) => number;
  /** Replaces the settings client-side right after an admin save. */
  setSettings: (settings: GroupSettings) => void;
}

const GroupLabelsContext = createContext<GroupLabelsValue | null>(null);

function buildValue(
  settings: GroupSettings,
  setSettings: (s: GroupSettings) => void
): GroupLabelsValue {
  return {
    settings,
    label: (code) => groupLabel(code, settings),
    fullName: (code) => groupFullName(code, settings),
    compare: (a, b) => compareGroups(a, b, settings),
    setSettings,
  };
}

/**
 * Provides the admin-configured group names to every client component.
 * Initial settings come from the root layout (server, cached by tag).
 */
export function GroupLabelsProvider({
  initialSettings,
  children,
}: {
  initialSettings: GroupSettings;
  children: React.ReactNode;
}): React.ReactElement {
  const [settings, setSettings] = useState(initialSettings);
  // Adopt fresh server settings after router.refresh() / navigation (React "derive from props").
  const [prevInitial, setPrevInitial] = useState(initialSettings);
  if (initialSettings !== prevInitial) {
    setPrevInitial(initialSettings);
    setSettings(initialSettings);
  }
  const value = useMemo(() => buildValue(settings, setSettings), [settings]);
  return <GroupLabelsContext.Provider value={value}>{children}</GroupLabelsContext.Provider>;
}

const fallbackValue = buildValue(DEFAULT_GROUP_SETTINGS, () => {});

/**
 * Group naming helpers. Outside a provider (isolated tests, storybook) it falls back to
 * the defaults, where every label equals its code.
 */
export function useGroupLabels(): GroupLabelsValue {
  return useContext(GroupLabelsContext) ?? fallbackValue;
}
