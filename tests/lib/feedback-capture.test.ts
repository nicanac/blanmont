import { describe, expect, it } from 'vitest';
import { fontFaceKey, shouldInline, snapshotRootStyle } from '@/app/components/feedback/capture';

// Logical aliases Chromium lists in getComputedStyle (the ones that broke issue #236).
const CHROME_LOGICAL = [
  'block-size',
  'inline-size',
  'inset-block-end',
  'inset-block-start',
  'inset-inline-end',
  'inset-inline-start',
  'margin-block-end',
  'margin-block-start',
  'margin-inline-end',
  'margin-inline-start',
  'max-block-size',
  'max-inline-size',
  'min-block-size',
  'min-inline-size',
  'padding-inline-start',
  'border-block-start-color',
  'border-inline-end-width',
  'scroll-margin-block-start',
  'scroll-padding-inline-end',
  'overscroll-behavior-block',
  'contain-intrinsic-block-size',
  'contain-intrinsic-inline-size',
];

describe('feedback DOM snapshot styles', () => {
  it('drops logical aliases so they cannot override the scroll offset (#236)', () => {
    for (const prop of CHROME_LOGICAL) expect(shouldInline(prop), prop).toBe(false);
  });

  it('keeps the physical properties and unrelated ones', () => {
    for (const prop of [
      'top',
      'left',
      'width',
      'height',
      'margin-top',
      'padding-left',
      'border-top-color',
      'display',
      'dominant-baseline',
      'outline-color',
      'position',
      'font-family',
    ]) {
      expect(shouldInline(prop), prop).toBe(true);
    }
  });

  it('still skips animations and transitions', () => {
    expect(shouldInline('animation-name')).toBe(false);
    expect(shouldInline('transition-duration')).toBe(false);
  });

  it('shifts the cloned page by the scroll offset', () => {
    expect(snapshotRootStyle(0, 1200, 475)).toBe('margin:0;position:absolute;left:0px;top:-1200px;width:475px;');
    expect(snapshotRootStyle(12, 0, 390)).toContain('left:-12px;top:0px;');
  });
});

describe('fontFaceKey', () => {
  it('matches a loaded FontFace with its @font-face rule', () => {
    // FontFace exposes the bare family; the CSS rule keeps the quotes.
    expect(fontFaceKey('Archivo', 'normal', 'U+0-FF, U+131, U+152-153')).toBe(
      fontFaceKey('"Archivo"', 'normal', 'U+0-FF,U+131,U+152-153')
    );
  });

  it('defaults style and unicode-range like the browser does', () => {
    expect(fontFaceKey('Archivo', '', '')).toBe(fontFaceKey('Archivo', 'normal', 'U+0-10FFFF'));
  });

  it('tells subsets and styles apart', () => {
    expect(fontFaceKey('Archivo', 'italic', 'U+0-FF')).not.toBe(fontFaceKey('Archivo', 'normal', 'U+0-FF'));
    expect(fontFaceKey('Archivo', 'normal', 'U+0-FF')).not.toBe(fontFaceKey('Archivo', 'normal', 'U+100-2BA'));
  });
});
