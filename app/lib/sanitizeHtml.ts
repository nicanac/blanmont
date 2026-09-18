/**
 * Utility functions to sanitize and safely render HTML content for blog articles,
 * ensuring XSS protection while allowing rich editorial formatting.
 */

const DANGEROUS_TAGS_REGEX = /<\/?(script|style|iframe|object|embed|applet|form|input|button|svg|math)[^>]*>/gi;
const EVENT_HANDLERS_REGEX = /\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const JAVASCRIPT_URL_REGEX = /\s+(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]*)/gi;

/**
 * Sanitizes an HTML string by removing dangerous tags, script injections,
 * inline event handlers, and javascript: pseudo-protocols.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let sanitized = html
    // 1. Remove dangerous executable or framing tags
    .replace(DANGEROUS_TAGS_REGEX, '')
    // 2. Remove all inline DOM event handlers (onclick, onerror, onload, etc.)
    .replace(EVENT_HANDLERS_REGEX, '')
    // 3. Remove javascript: pseudo-protocols in href or src attributes
    .replace(JAVASCRIPT_URL_REGEX, '');

  // 4. Ensure target="_blank" links include rel="noopener noreferrer" for security
  sanitized = sanitized.replace(
    /<a\s+(?=[^>]*target="_blank")(?!.*rel=)[^>]*>/gi,
    (match) => match.replace('<a', '<a rel="noopener noreferrer"')
  );

  return sanitized.trim();
}

/**
 * Determines whether the given content string contains HTML tags
 * produced by the rich text editor (e.g. <p>, <h2>, <ul>, <img>) or is raw markdown.
 */
export function isHtmlContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  // Match any common HTML tag produced by the editor
  return /<\/?(p|h[1-6]|ul|ol|li|strong|b|em|i|u|a|img|blockquote|br|hr|pre|code|div|span)\b[^>]*>/i.test(
    content
  );
}
