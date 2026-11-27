/**
 * Viewport capture for the feedback tool.
 * 1) Native tab capture (getDisplayMedia, current tab): pixel-accurate, needs a one-click browser prompt.
 * 2) DOM snapshot (SVG foreignObject): no permission, but images/canvas/maps are blanked.
 */
export type CaptureMode = 'native_tab' | 'dom_snapshot';

export interface Capture {
  canvas: HTMLCanvasElement;
  mode: CaptureMode;
}

// shortcut: the DOM fallback inlines at most this many nodes; raise it if long pages come out unstyled.
const MAX_NODES = 4000;
const SKIP_STYLE = /^(animation|transition)/;
/**
 * Logical aliases (inset-block, inline-size, margin-inline-start…) duplicate the physical longhands already
 * copied. Kept, they serialize after `inset`/`width` and override them when the SVG re-parses the style, which
 * wiped the scroll offset: the snapshot always showed the top of the page (issue #236).
 */
const LOGICAL_ALIAS = /^(inset-|block-size|inline-size)|-(block|inline)(-|$)/;

/** Properties worth inlining: no animation/transition, no logical alias of a physical property. */
export function shouldInline(prop: string): boolean {
  return !SKIP_STYLE.test(prop) && !LOGICAL_ALIAS.test(prop);
}

export const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function captureNativeTab(): Promise<HTMLCanvasElement> {
  if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('getDisplayMedia unavailable');
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: 'browser' },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
  } as DisplayMediaStreamOptions);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    if (video.readyState < 2) {
      await new Promise<void>((resolve) => video.addEventListener('loadeddata', () => resolve(), { once: true }));
    }
    await nextFrame();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return canvas;
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/** Copies the computed style inline; `overrides` go last so they win over the copied values. */
function inlineStyles(source: Element, target: Element, overrides = ''): void {
  const computed = getComputedStyle(source);
  let css = '';
  for (const prop of Array.from(computed)) {
    if (shouldInline(prop)) css += prop + ':' + computed.getPropertyValue(prop) + ';';
  }
  target.setAttribute('style', css + overrides);
  if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
    target.setAttribute('value', source.value);
  }
}

// shortcut: fonts above this total are left out (the snapshot then falls back to a system font).
const MAX_FONT_BYTES = 2_000_000;
const URL_IN_SRC = /url\(\s*["']?([^"')]+)["']?\s*\)/;

/** Same key for a FontFace and a @font-face rule: family, style and unicode-range, quotes and spaces ignored. */
export function fontFaceKey(family: string, style: string, unicodeRange: string): string {
  const norm = (v: string): string => v.replace(/["'\s]/g, '').toLowerCase();
  return [norm(family), norm(style || 'normal'), norm(unicodeRange || 'U+0-10FFFF')].join('|');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * The SVG image cannot fetch web fonts, so text fell back to a wider font and wrapped differently.
 * Inline the @font-face rules the page actually uses (status "loaded") as data URLs; any failure skips fonts.
 */
async function embeddedFontCss(): Promise<string> {
  try {
    const loaded = new Set<string>();
    document.fonts.forEach((f) => {
      if (f.status === 'loaded') loaded.add(fontFaceKey(f.family, f.style, f.unicodeRange));
    });
    const rules: { css: string; src: string; url: string }[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let list: CSSRuleList;
      try {
        list = sheet.cssRules;
      } catch {
        continue; // cross-origin stylesheet
      }
      for (const rule of Array.from(list)) {
        if (!(rule instanceof CSSFontFaceRule)) continue;
        const key = fontFaceKey(
          rule.style.getPropertyValue('font-family'),
          rule.style.getPropertyValue('font-style'),
          rule.style.getPropertyValue('unicode-range')
        );
        const match = URL_IN_SRC.exec(rule.cssText);
        if (!loaded.has(key) || !match) continue;
        const url = new URL(match[1], sheet.href ?? window.location.href);
        if (url.origin !== window.location.origin) continue;
        rules.push({ css: rule.cssText, src: match[0], url: url.href });
      }
    }
    let total = 0;
    let css = '';
    for (const r of rules) {
      const blob = await (await fetch(r.url)).blob();
      total += blob.size;
      if (total > MAX_FONT_BYTES) break;
      css += r.css.replace(r.src, 'url("' + (await blobToDataUrl(blob)) + '")');
    }
    return css;
  } catch {
    return '';
  }
}

/** Inline style that places the cloned body so the current viewport lands at (0, 0) of the snapshot. */
export function snapshotRootStyle(scrollX: number, scrollY: number, width: number): string {
  return 'margin:0;position:absolute;left:' + -scrollX + 'px;top:' + -scrollY + 'px;width:' + width + 'px;';
}

async function captureDomSnapshot(): Promise<HTMLCanvasElement> {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const clone = document.body.cloneNode(true) as HTMLElement;
  const sources = document.body.querySelectorAll('*');
  const clones = clone.querySelectorAll('*');
  const limit = Math.min(sources.length, MAX_NODES);
  for (let i = 0; i < limit; i++) inlineStyles(sources[i], clones[i]);

  clone.querySelectorAll('[data-feedback-ignore], script, style, link, iframe, video, noscript').forEach((n) => n.remove());
  // SVG images cannot load external resources: blank them instead of leaving broken icons.
  clone.querySelectorAll('img, canvas').forEach((n) => {
    const box = document.createElement('div');
    box.setAttribute('style', 'width:' + ((n as HTMLElement).clientWidth || 0) + 'px;height:' + ((n as HTMLElement).clientHeight || 0) + 'px;background:#f0f1eb;');
    n.replaceWith(box);
  });
  // Shift the page by the scroll offset so the snapshot shows what is on screen, not the top of the page.
  inlineStyles(document.body, clone, snapshotRootStyle(window.scrollX, window.scrollY, document.body.clientWidth));

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.setAttribute('style', 'position:relative;overflow:hidden;width:' + width + 'px;height:' + height + 'px;background:#ffffff;');
  const fontCss = await embeddedFontCss();
  if (fontCss) {
    const fonts = document.createElement('style');
    fonts.textContent = fontCss;
    wrapper.appendChild(fonts);
  }
  wrapper.appendChild(clone);

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
    '<foreignObject width="100%" height="100%">' + new XMLSerializer().serializeToString(wrapper) + '</foreignObject></svg>';

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('DOM snapshot failed to render'));
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(image, 0, 0);
  return canvas;
}

/** Throws if the canvas is tainted (export would be blocked): the caller then submits without an image. */
function assertExportable(canvas: HTMLCanvasElement): void {
  canvas.toDataURL('image/jpeg', 0.1);
}

/** Native capture first, DOM snapshot as fallback; resolves null when both are unavailable or refused. */
export async function captureViewport(): Promise<Capture | null> {
  try {
    const canvas = await captureNativeTab();
    assertExportable(canvas);
    return { canvas, mode: 'native_tab' };
  } catch {
    // Permission refused or API missing: fall through to the DOM snapshot.
  }
  try {
    const canvas = await captureDomSnapshot();
    assertExportable(canvas);
    return { canvas, mode: 'dom_snapshot' };
  } catch {
    return null;
  }
}
