import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '@/app/lib/urlUtils';

describe('urlUtils - sanitizeUrl', () => {
  it('preserves clean URLs unchanged', () => {
    const url = 'https://blanmont.be/traces/circuit-1';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeUrl('   https://example.com/map   ')).toBe('https://example.com/map');
  });

  it('removes enclosing double and single quotes', () => {
    expect(sanitizeUrl('"https://example.com/route"')).toBe('https://example.com/route');
    expect(sanitizeUrl('\'https://example.com/route\'')).toBe('https://example.com/route');
  });

  it('removes enclosing HTML entity quotes (&quot; and &apos;)', () => {
    expect(sanitizeUrl('&quot;https://example.com/route&quot;')).toBe('https://example.com/route');
    expect(sanitizeUrl('&apos;https://example.com/route&apos;')).toBe('https://example.com/route');
  });

  it('handles empty, non-string, or undefined inputs gracefully', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null as unknown as string)).toBe('');
    expect(sanitizeUrl(undefined as unknown as string)).toBe('');
    expect(sanitizeUrl('    ')).toBe('');
  });
});
