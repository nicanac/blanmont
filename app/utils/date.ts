/**
 * Timezone-safe French date utilities for CC Saint-Martin Blanmont.
 * Prevents off-by-one day shifts caused by naive UTC conversions in different timezones.
 */

/**
 * Safely parses an ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) into local date parts.
 */
export function parseIsoDate(isoString?: string | null): {
  year: number;
  month: number; // 1-12
  day: number;
  date: Date;
} | null {
  if (!isoString) return null;

  try {
    const cleanStr = isoString.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length < 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // Create a local midnight Date object (avoids UTC timezone shift)
    const date = new Date(year, month - 1, day);

    return { year, month, day, date };
  } catch {
    return null;
  }
}

/**
 * Formats an ISO date string into idiomatic French (e.g. "Samedi 14 mars 2026").
 */
export function formatFrenchDate(
  isoString?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!isoString) return '';

  const parsed = parseIsoDate(isoString);
  if (!parsed) return isoString;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };

  try {
    const formatted = new Intl.DateTimeFormat('fr-BE', defaultOptions).format(parsed.date);
    // Capitalize first letter (e.g., "samedi" -> "Samedi")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return isoString;
  }
}

/**
 * Formats an ISO date into a short date string (e.g. "14 mars 2026" or "14/03/2026").
 */
export function formatShortDate(isoString?: string | null): string {
  return formatFrenchDate(isoString, {
    weekday: undefined,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns today's date in local ISO format (YYYY-MM-DD).
 */
export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if an ISO date is in the past compared to today's local date.
 */
export function isPastDate(isoString?: string | null): boolean {
  if (!isoString) return false;
  const cleanDate = isoString.split('T')[0];
  return cleanDate < getTodayIso();
}

/**
 * Safely compares two ISO date strings for sorting.
 */
export function compareIsoDates(a?: string | null, b?: string | null): number {
  const dateA = a ? a.split('T')[0] : '';
  const dateB = b ? b.split('T')[0] : '';
  return dateA.localeCompare(dateB);
}
