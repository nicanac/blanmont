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
