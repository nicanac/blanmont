/**
 * Server side of the poll pre-check (app/lib/poll-attendance): which members answered the
 * weekend poll for a ride. Reads through app/lib/firebase/polls (Admin SDK on the server).
 */
import { getAllWeekendPolls, getPollResponses } from './firebase/polls';
import {
  inPollPrefillWindow,
  pollRespondentsForDay,
  pollWeekendFor,
  type PollRespondent,
} from './poll-attendance';
import type { CalendarEvent, WeekendPoll } from '../types';

/** The poll of each weekend; the first one listed wins, like `getWeekendPollByDate`. */
function pollsByWeekend(polls: readonly WeekendPoll[]): Map<string, WeekendPoll> {
  const byWeekend = new Map<string, WeekendPoll>();
  for (const poll of polls) {
    if (poll.weekendIsoDate && !byWeekend.has(poll.weekendIsoDate)) byWeekend.set(poll.weekendIsoDate, poll);
  }
  return byWeekend;
}

/** Members who answered the weekend poll that they ride on `isoDate` ([] without a poll). */
export async function pollRespondentsForRide(isoDate: string): Promise<PollRespondent[]> {
  const weekend = pollWeekendFor(isoDate);
  if (!weekend) return [];
  const poll = pollsByWeekend(await getAllWeekendPolls()).get(weekend);
  if (!poll) return [];
  return pollRespondentsForDay(await getPollResponses(poll.id), isoDate);
}

/**
 * Poll respondents of each weekend ride around today (`POLL_PREFILL_WINDOW_DAYS`), by event id.
 * One read of the polls, then one per poll needed.
 */
export async function pollRespondentsByEvent(
  events: readonly Pick<CalendarEvent, 'id' | 'isoDate'>[],
  todayIso: string
): Promise<Record<string, PollRespondent[]>> {
  const rides = events.filter((e) => pollWeekendFor(e.isoDate) && inPollPrefillWindow(e.isoDate, todayIso));
  if (rides.length === 0) return {};

  const byWeekend = pollsByWeekend(await getAllWeekendPolls());
  const pollIds = [
    ...new Set(rides.flatMap((e) => byWeekend.get(pollWeekendFor(e.isoDate) as string)?.id ?? [])),
  ];
  const responses = new Map(
    await Promise.all(pollIds.map(async (id) => [id, await getPollResponses(id)] as const))
  );

  const result: Record<string, PollRespondent[]> = {};
  for (const ride of rides) {
    const poll = byWeekend.get(pollWeekendFor(ride.isoDate) as string);
    const answers = poll ? responses.get(poll.id) : undefined;
    if (!answers) continue;
    const respondents = pollRespondentsForDay(answers, ride.isoDate);
    if (respondents.length > 0) result[ride.id] = respondents;
  }
  return result;
}
