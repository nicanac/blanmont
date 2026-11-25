/**
 * Location of the committee's Carré Vert attendance sheet (Google Sheets CSV export).
 * Configured with LEADERBOARD_SHEET_CSV_URL so the sheet can move without a code change.
 */
export const LEADERBOARD_SHEET_ENV = 'LEADERBOARD_SHEET_CSV_URL';

/** Error message returned by routes when the sheet URL is not configured. */
export const LEADERBOARD_SHEET_MISSING_ERROR = `${LEADERBOARD_SHEET_ENV} is not configured`;

/**
 * Returns the configured CSV export URL, or null when missing or not a Google Sheets HTTPS URL.
 * Restricting the host keeps the server from fetching arbitrary URLs if the variable is mistyped.
 */
export function getLeaderboardSheetCsvUrl(): string | null {
  const raw = process.env[LEADERBOARD_SHEET_ENV]?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com') return null;
    return url.toString();
  } catch {
    return null;
  }
}
