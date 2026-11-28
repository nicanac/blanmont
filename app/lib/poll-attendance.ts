/**
 * Poll respondents → Pointage Express (Carré Vert attendance).
 *
 * At the start of a weekend ride the members who answered the weekend poll for that day are
 * already ticked: the captain unticks the no-shows and ticks the riders who did not answer.
 * The pre-check is written to `attendance/<eventId>` like any other tick (it feeds the
 * leaderboard), and `attendance/<eventId>/pollPrefill` remembers which members it ticked, so a
 * member the captain unticked is never ticked again by the poll.
 *
 * Client-safe: no server imports.
 */
import { CYCLING_GROUPS, type CyclingGroup } from '../constants/cycling';
import { responseSlots, slotsLabel } from './poll-slots';
import type { PollResponse, PollSlot } from '../types';

/** What `attendance/<eventId>/pollPrefill` holds. */
export interface PollPrefillRecord {
  /** Last pre-check (ISO). */
  at: string;
  /** Admin who ran it (display name). */
  by?: string;
  /** Members the poll ticked; RTDB drops the key when it is empty. */
  memberIds?: Record<string, true>;
}

/** A member who said in the poll that they ride on the ride's day. */
export interface PollRespondent {
  memberId: string;
  name: string;
  /** Group answered in the poll ('A', 'B', 'BC', 'C', 'VTT'); null for "Autre" or none. */
  group: CyclingGroup | null;
  /** Slots ticked that day, e.g. "Samedi matin". */
  slotsLabel: string;
}

const DAY_SLOTS: Record<'saturday' | 'sunday', readonly PollSlot[]> = {
  saturday: ['samedi-matin', 'samedi-apres-midi'],
  sunday: ['dimanche-matin'],
};

/** Day of week of an ISO date (0 = Sunday), null when the date is not valid. */
function weekday(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate ?? '');
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date.getUTCDay();
}

/**
 * The weekend poll a ride belongs to: its `weekendIsoDate` is the Saturday, so a Saturday
 * ride gives its own date and a Sunday ride the day before. Null for a weekday ride.
 */
export function pollWeekendFor(isoDate: string): string | null {
  const day = weekday(isoDate);
  if (day === 6) return isoDate;
  if (day !== 0) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

/** Attendance group of a poll answer: "Groupe BC" → "BC"; null for "Autre" or no answer. */
export function pollGroupCode(response: Pick<PollResponse, 'groupChoice'>): CyclingGroup | null {
  const code = response.groupChoice?.replace(/^Groupe /, '');
  return CYCLING_GROUPS.includes(code as CyclingGroup) ? (code as CyclingGroup) : null;
}

/**
 * Respondents who ride on `isoDate`: any Saturday slot for a Saturday ride (morning or
 * afternoon, the Carré Vert counts the day), the Sunday slot for a Sunday ride. Sorted by name.
 */
export function pollRespondentsForDay(
  responses: readonly PollResponse[],
  isoDate: string
): PollRespondent[] {
  const day = weekday(isoDate);
  const wanted = day === 6 ? DAY_SLOTS.saturday : day === 0 ? DAY_SLOTS.sunday : null;
  if (!wanted) return [];

  return responses
    .flatMap((r): PollRespondent[] => {
      if (!r?.memberId) return [];
      const slots = responseSlots(r).filter((s) => wanted.includes(s));
      if (slots.length === 0) return [];
      return [
        {
          memberId: r.memberId,
          name: r.memberName || '',
          group: pollGroupCode(r),
          slotsLabel: slotsLabel(slots),
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
}

/** Member ids the poll already ticked for a ride (keys of `pollPrefill.memberIds`). */
export function prefilledMemberIds(record: PollPrefillRecord | null | undefined): string[] {
  return record?.memberIds ? Object.keys(record.memberIds) : [];
}

/**
 * Respondents still to tick: not present yet, and never ticked by the poll before (a member
 * the captain unticked stays unticked). Keeps the respondents' order.
 */
export function pollPrefillCandidates(
  respondents: readonly Pick<PollRespondent, 'memberId'>[],
  present: Iterable<string>,
  prefilled: Iterable<string>
): string[] {
  const skip = new Set([...present, ...prefilled]);
  return respondents.map((r) => r.memberId).filter((id) => !skip.has(id));
}

/** Rides whose poll the Pointage Express page loads: from two weeks back to a week ahead. */
export const POLL_PREFILL_WINDOW_DAYS = { before: 14, after: 7 } as const;

/** True when `isoDate` lies in the window around `todayIso` (both YYYY-MM-DD). */
export function inPollPrefillWindow(isoDate: string, todayIso: string): boolean {
  const toDay = (iso: string): number | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000 : null;
  };
  const day = toDay(isoDate);
  const today = toDay(todayIso);
  if (day === null || today === null) return false;
  return day >= today - POLL_PREFILL_WINDOW_DAYS.before && day <= today + POLL_PREFILL_WINDOW_DAYS.after;
}
