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

function inlineStyles(source: Element, target: Element): void {
  const computed = getComputedStyle(source);
  let css = '';
  for (const prop of Array.from(computed)) {
    if (!SKIP_STYLE.test(prop)) css += prop + ':' + computed.getPropertyValue(prop) + ';';
  }
  target.setAttribute('style', css);
  if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
    target.setAttribute('value', source.value);
  }
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
  inlineStyles(document.body, clone);
  clone.style.margin = '0';
  clone.style.position = 'absolute';
  clone.style.left = -window.scrollX + 'px';
  clone.style.top = -window.scrollY + 'px';
  clone.style.width = document.body.clientWidth + 'px';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.setAttribute('style', 'position:relative;overflow:hidden;width:' + width + 'px;height:' + height + 'px;background:#ffffff;');
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
