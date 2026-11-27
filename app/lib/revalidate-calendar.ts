import { revalidatePath } from 'next/cache';

/**
 * Call after a calendar event is created, edited or deleted.
 *
 * Events are printed on several cached pages: /calendrier (time-based revalidation), the
 * home cover, the poll's GPS traces (/sondage) and the next ride in the footer, which lives in
 * the root layout and so is on every page. Revalidating the root layout refreshes all of them
 * at once, so a trace added in the admin shows on the next visit instead of up to an hour later.
 */
export function revalidateCalendarPages(): void {
  revalidatePath('/', 'layout');
}
