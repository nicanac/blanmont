/**
 * Utility functions for URL sanitization and handling.
 */

export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  // Strip enclosing quotes and HTML entities
  url = url.replace(/^(&quot;|"|'|&apos;)+|(&quot;|"|'|&apos;)+$/g, '');
  return url.trim();
}

/**
 * Checks whether a given URL points to a web UI (Strava, Garmin, Komoot) rather than a direct GPX file.
 */
export function isWebUiLink(url: string): boolean {
  if (!url) return false;
  return /strava\.com|garmin\.com|komoot/i.test(url);
}

