/**
 * Ephemeral Anonymous Visitor Session & Device Utilities.
 */

export const VISITOR_COOKIE_NAME = 'ccb_visitor_id';
export const VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Generates an anonymous random visitor identifier (e.g. anon_1728374920_k3x9d).
 */
export function generateVisitorId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `anon_${time}_${rand}`;
}

/**
 * Determines basic device type from User Agent string.
 */
export function parseDeviceType(
  userAgent?: string | null
): 'desktop' | 'mobile' | 'tablet' | 'bot' {
  if (!userAgent) return 'desktop';

  const ua = userAgent.toLowerCase();

  if (/bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot/i.test(ua)) {
    return 'bot';
  }

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}
