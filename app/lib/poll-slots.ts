import type {
  CyclingGroupChoice,
  PollGroupVariant,
  PollResponse,
  PollSlot,
} from '@/app/types';

/** Weekend ride slots a member can tick, in display order. */
export const POLL_SLOTS: readonly { id: PollSlot; label: string; departure: string }[] = [
  { id: 'samedi-matin', label: 'Samedi matin', departure: 'Départ à 8h30' },
  { id: 'samedi-apres-midi', label: 'Samedi après-midi', departure: 'Départ à 13h' },
  { id: 'dimanche-matin', label: 'Dimanche matin', departure: 'Départ à 9h00' },
];

export const POLL_SLOT_IDS: readonly PollSlot[] = POLL_SLOTS.map((s) => s.id);

/** Group choices of the quick vote: GR2 (code B) comes with its objective of the day. */
export interface PollGroupOption {
  key: string;
  group: CyclingGroupChoice;
  variant?: PollGroupVariant;
  /** Speed and route; {GR1} is replaced by the admin name of group A. */
  detail: string;
}

export const POLL_GROUP_OPTIONS: readonly PollGroupOption[] = [
  { key: 'A', group: 'Groupe A', detail: '> 30 km/h · parcours le plus long' },
  { key: 'B+', group: 'Groupe B', variant: 'plus', detail: '25–28 km/h · même parcours que {GR1}' },
  { key: 'B-', group: 'Groupe B', variant: 'moins', detail: '25–28 km/h · parcours plus court' },
  { key: 'BC', group: 'Groupe BC', detail: '24–27 km/h · route de liaison' },
  { key: 'C', group: 'Groupe C', detail: '< 25 km/h · route locale' },
  { key: 'VTT', group: 'Groupe VTT', detail: 'Sentiers & bois' },
];

type SlotSource = Pick<PollResponse, 'slots' | 'dayChoice'>;

/**
 * Slots of a response. Responses saved before slots (2026-11) only carry dayChoice;
 * RTDB drops empty arrays, so a response with neither field is an absence.
 */
export function responseSlots(r: SlotSource): PollSlot[] {
  if (Array.isArray(r.slots)) return r.slots.filter((s) => POLL_SLOT_IDS.includes(s));
  switch (r.dayChoice) {
    case 'samedi':
      return ['samedi-matin'];
    case 'dimanche':
      return ['dimanche-matin'];
    case 'les-deux':
      return ['samedi-matin', 'dimanche-matin'];
    default:
      return [];
  }
}

export const isAbsent = (r: SlotSource): boolean => responseSlots(r).length === 0;
export const ridesSaturday = (r: SlotSource): boolean =>
  responseSlots(r).some((s) => s.startsWith('samedi'));
export const ridesSunday = (r: SlotSource): boolean => responseSlots(r).includes('dimanche-matin');

/** "Samedi matin + Dimanche matin", or "Absent". */
export function slotsLabel(slots: readonly PollSlot[]): string {
  if (slots.length === 0) return 'Absent';
  return POLL_SLOTS.filter((s) => slots.includes(s.id))
    .map((s) => s.label)
    .join(' + ');
}

export interface SlotTally {
  bySlot: Record<PollSlot, number>;
  saturday: number;
  sunday: number;
  both: number;
  absent: number;
  riders: number;
}

export function tallySlots(responses: readonly SlotSource[]): SlotTally {
  const tally: SlotTally = {
    bySlot: { 'samedi-matin': 0, 'samedi-apres-midi': 0, 'dimanche-matin': 0 },
    saturday: 0,
    sunday: 0,
    both: 0,
    absent: 0,
    riders: 0,
  };
  for (const r of responses) {
    const slots = responseSlots(r);
    if (slots.length === 0) {
      tally.absent += 1;
      continue;
    }
    tally.riders += 1;
    slots.forEach((s) => (tally.bySlot[s] += 1));
    const sat = ridesSaturday(r);
    const sun = ridesSunday(r);
    if (sat) tally.saturday += 1;
    if (sun) tally.sunday += 1;
    if (sat && sun) tally.both += 1;
  }
  return tally;
}

/** Option key of a response ("B+", "A"…), or null for no group / "Autre". */
export function responseGroupKey(r: Pick<PollResponse, 'groupChoice' | 'groupVariant'>): string | null {
  const option = POLL_GROUP_OPTIONS.find(
    (o) => o.group === r.groupChoice && (o.variant === undefined || o.variant === r.groupVariant)
  );
  // A GR2 answer saved before the split has no variant: no option is preselected.
  if (!option || (option.group === 'Groupe B' && !r.groupVariant)) return null;
  return option.key;
}

/** Display name of a response's group: "GR2+", "GR1", "Autre"… `name` maps a stored code. */
export function pollGroupName(
  r: Pick<PollResponse, 'groupChoice' | 'groupVariant'>,
  name: (code: string) => string
): string {
  if (!r.groupChoice) return '—';
  if (r.groupChoice === 'Autre') return 'Autre';
  const base = name(r.groupChoice);
  if (!r.groupVariant) return base;
  return `${base}${r.groupVariant === 'plus' ? '+' : '−'}`;
}
