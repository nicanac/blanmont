import { describe, it, expect } from 'vitest';
import { sanitizeBlogHtml, isHtmlContent } from '@/app/lib/sanitizeHtml';

describe('sanitizeHtml utility', () => {
  it('detects HTML content correctly', () => {
    expect(isHtmlContent('<p>Bonjour le peloton</p>')).toBe(true);
    expect(isHtmlContent('<h2>Titre de section</h2>')).toBe(true);
    expect(isHtmlContent('Texte avec <strong>gras</strong>')).toBe(true);
    expect(isHtmlContent('<ul><li>Item</li></ul>')).toBe(true);
    expect(isHtmlContent('<img src="https://res.cloudinary.com/test.jpg" />')).toBe(true);
    expect(isHtmlContent('# Markdown Titre\n\nTexte normal')).toBe(false);
    expect(isHtmlContent('')).toBe(false);
  });

  it('strips dangerous script and iframe tags', () => {
    const malicious = '<p>Normal</p><script>alert("xss")</script><iframe src="//evil.com"></iframe>';
    const clean = sanitizeBlogHtml(malicious);
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('<iframe');
    expect(clean).toContain('<p>Normal</p>');
  });

  it('strips inline event handlers', () => {
    const malicious = '<img src="valid.jpg" onerror="alert(\'xss\')" onclick="doEvil()" />';
    const clean = sanitizeBlogHtml(malicious);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('onclick');
    expect(clean).toContain('src="valid.jpg"');
  });

  it('strips javascript: URLs', () => {
    const malicious = '<a href="javascript:alert(\'xss\')">Click me</a>';
    const clean = sanitizeBlogHtml(malicious);
    expect(clean).not.toContain('javascript:');
  });

  it('adds rel="noopener noreferrer" to target="_blank" links', () => {
    const link = '<a href="https://strava.com" target="_blank">Strava</a>';
    const clean = sanitizeBlogHtml(link);
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  it('preserves valid editorial formatting', () => {
    const html = '<h2>Titre</h2><p>Paragraphe avec <strong>gras</strong>, <em>italique</em> et <u>souligné</u>.</p><ul><li>Puce 1</li></ul>';
    const clean = sanitizeBlogHtml(html);
    expect(clean).toBe(html);
  });
});
