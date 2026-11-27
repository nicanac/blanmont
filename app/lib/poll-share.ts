import type { CalendarEvent, PollResponse, WeekendPoll } from '@/app/types';
import { formatFrenchDate } from '@/app/utils/date';
import type { TraceRoute } from './trace-route';
import {
  POLL_GROUP_OPTIONS,
  POLL_SLOTS,
  pollGroupName,
  responseGroupKey,
  responseSlots,
  tallySlots,
} from './poll-slots';

export const SONDAGE_URL = 'https://blanmont.be/sondage';

export interface WeekendTrace {
  isoDate: string;
  url: string;
  /** Map and figures resolved server-side (`withTraceRoutes`); null or absent = link only. */
  route?: TraceRoute | null;
}

/** GPS traces the calendar lists for the poll's weekend: the target Saturday and the Sunday after. */
export function weekendTraces(
  events: readonly CalendarEvent[],
  saturdayIso: string
): WeekendTrace[] {
  const [y, m, d] = saturdayIso.split('-').map(Number);
  const sundayIso = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  return events
    .filter((e) => e.gpxUrl && (e.isoDate === saturdayIso || e.isoDate === sundayIso))
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate))
    .map((e) => ({ isoDate: e.isoDate, url: e.gpxUrl as string }));
}

const plural = (n: number, word: string): string => `${n} ${word}${n > 1 ? 's' : ''}`;
const dayLabel = (iso: string): string =>
  formatFrenchDate(iso, { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * WhatsApp message with the live state of the poll: riders per slot and per group,
 * the weekend's GPS traces and the poll link. *bold* is WhatsApp markup.
 */
export function buildPollShareMessage({
  poll,
  responses,
  traces,
  groupName,
}: {
  poll: Pick<WeekendPoll, 'weekendIsoDate' | 'status'>;
  responses: readonly PollResponse[];
  traces: readonly WeekendTrace[];
  /** Maps a stored group code to its display name (useGroupLabels().label). */
  groupName: (code: string) => string;
}): string {
  const tally = tallySlots(responses);
  const lines = [
    '🚴 *Sondage du week-end — CC Blanmont*',
    `📅 ${dayLabel(poll.weekendIsoDate)}`,
    '',
    `👥 *${plural(tally.riders, 'membre')} inscrit${tally.riders > 1 ? 's' : ''}*${
      tally.absent ? ` · ${plural(tally.absent, 'absent')}` : ''
    }`,
    ...POLL_SLOTS.map(
      (s) => `• ${s.label} (${s.departure.replace('Départ à ', '')}) : ${tally.bySlot[s.id]}`
    ),
  ];

  // Riders per group, in the quick-vote order (GR1, GR2+, GR2−…); unknown groups last.
  const rank = (r: PollResponse): number => {
    const i = POLL_GROUP_OPTIONS.findIndex((o) => o.key === responseGroupKey(r));
    return i < 0 ? POLL_GROUP_OPTIONS.length : i;
  };
  const counts = new Map<string, number>();
  responses
    .filter((r) => responseSlots(r).length > 0)
    .sort((a, b) => rank(a) - rank(b))
    .forEach((r) => {
      const name = pollGroupName(r, groupName);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
  if (counts.size > 0) {
    lines.push(`🏁 Groupes : ${[...counts].map(([name, n]) => `${name} ${n}`).join(' · ')}`);
  }

  if (traces.length > 0) lines.push('');
  traces.forEach((t) => lines.push(`🗺️ Tracé GPS · ${dayLabel(t.isoDate)} : ${t.url}`));

  lines.push(
    '',
    poll.status === 'closed'
      ? `🔒 Votes clôturés · détails : ${SONDAGE_URL}`
      : `🗳️ Votez ici : ${SONDAGE_URL}`
  );
  return lines.join('\n');
}
