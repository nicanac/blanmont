import type { GroupDefinition } from '@/app/constants/groups';
import { groupCodes, groupKey } from './groupLabels';

/**
 * The club now rides in four road groups (GR1–GR4) plus VTT. Historical records still carry
 * older codes (A, A-, B, BC, C, V, Club…). This module proposes how to merge those codes
 * into the new groups; the admin reviews the proposal, can rename anything, then saves.
 * Stored records are never rewritten.
 */

interface MergeRule {
  /** Code that identifies the group (kept as its primary code). */
  code: string;
  /** Proposed display name; the admin can rename it before saving. */
  label: string;
  /** Matches a normalized stored code (upper-case, "Groupe " prefix removed, spaces collapsed). */
  matches: (key: string) => boolean;
}

/** Order matters: the first matching rule wins (BC must be tested before B). */
export const GROUP_MERGE_RULES: readonly MergeRule[] = [
  { code: 'A', label: 'GR1', matches: (k) => /^A[-+]?$/.test(k) },
  { code: 'BC', label: 'GR3', matches: (k) => /^B ?[-/]? ?C$/.test(k) || /ALLURE ?C\b/.test(k) },
  { code: 'B', label: 'GR2', matches: (k) => /^B[-+]?$/.test(k) },
  { code: 'C', label: 'GR4', matches: (k) => /^C[-+]?$/.test(k) || k.includes('CLUB') },
  { code: 'VTT', label: 'VTT', matches: (k) => k === 'VTT' || k === 'V' },
];

/** Display order of the proposed groups. */
const PROPOSED_ORDER = ['A', 'B', 'BC', 'C', 'VTT'];

function ruleKey(raw: string): string {
  return groupKey(raw)
    .replace(/^(GROUPE|GR\.?)\s+/, '')
    .replace(/\s+/g, ' ');
}

/** Rule matching a stored code, if any. */
export function matchMergeRule(raw: string): MergeRule | undefined {
  const key = ruleKey(raw);
  return key ? GROUP_MERGE_RULES.find((r) => r.matches(key)) : undefined;
}

export interface GroupMergeProposal {
  /** Proposed groups: GR1–GR4 and VTT first, then configured groups no rule covers. */
  groups: GroupDefinition[];
  /** Codes found in the data that the proposal leaves out (shown as stored). */
  unmatched: string[];
}

/**
 * Builds the merge proposal from the current configuration and the codes found in the data.
 * Codes no rule recognizes stay where they are: their configured group is kept as is.
 */
export function proposeGroupMerge(
  current: GroupDefinition[],
  usedCodes: string[]
): GroupMergeProposal {
  // Every known code once, keeping the first spelling met (configuration before data).
  const spelling = new Map<string, string>();
  const remember = (raw: string): void => {
    const clean = raw.trim();
    if (clean && !spelling.has(groupKey(clean))) spelling.set(groupKey(clean), clean);
  };
  current.forEach((g) => groupCodes(g).forEach(remember));
  usedCodes.forEach(remember);

  const buckets = new Map<string, string[]>(GROUP_MERGE_RULES.map((r) => [r.code, []]));
  const taken = new Set<string>();
  for (const [key, raw] of spelling) {
    const rule = matchMergeRule(raw);
    if (!rule) continue;
    buckets.get(rule.code)!.push(raw);
    taken.add(key);
  }

  const proposed: GroupDefinition[] = PROPOSED_ORDER.map((code) => {
    const rule = GROUP_MERGE_RULES.find((r) => r.code === code)!;
    const aliases = buckets
      .get(code)!
      .filter((raw) => groupKey(raw) !== groupKey(code))
      .sort((a, b) => a.localeCompare(b, 'fr'));
    return aliases.length > 0 ? { code, label: rule.label, aliases } : { code, label: rule.label };
  });
  taken.add('A').add('B').add('BC').add('C').add('VTT');

  // Configured groups that no rule covers keep their name and their remaining codes.
  const usedLabels = new Set(proposed.map((g) => groupKey(g.label)));
  const kept: GroupDefinition[] = [];
  for (const group of current) {
    const remaining = groupCodes(group).filter((c) => !taken.has(groupKey(c)));
    if (remaining.length === 0) continue;
    const [code, ...aliases] = remaining;
    remaining.forEach((c) => taken.add(groupKey(c)));
    // A leftover group may not reuse a proposed name (GR1…); fall back to its own code.
    const label = usedLabels.has(groupKey(group.label)) ? code : group.label;
    usedLabels.add(groupKey(label));
    kept.push(aliases.length > 0 ? { code, label, aliases } : { code, label });
  }

  const unmatched = Array.from(spelling.entries())
    .filter(([key]) => !taken.has(key))
    .map(([, raw]) => raw)
    .sort((a, b) => a.localeCompare(b, 'fr'));

  return { groups: [...proposed, ...kept], unmatched };
}

/** True when the configuration already matches the proposal (codes, merges and order). */
export function isSameGrouping(a: GroupDefinition[], b: GroupDefinition[]): boolean {
  const shape = (groups: GroupDefinition[]): string =>
    JSON.stringify(
      groups.map((g) => [
        groupKey(g.code),
        (g.aliases ?? []).map(groupKey).sort(),
      ])
    );
  return shape(a) === shape(b);
}
