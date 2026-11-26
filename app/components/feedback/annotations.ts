/** Pure helpers for the screenshot annotation canvas (vector layers in a normalized 0..1000 space). */
export type Tool = 'arrow' | 'rect' | 'pen' | 'blur';

export interface Point {
  x: number;
  y: number;
}

export interface Layer {
  id: string;
  type: Tool;
  start: Point;
  end: Point;
  points?: Point[];
}

export const NORM = 1000;
/** Route Red from the design system (brand). */
export const INK = '#d63535';
export const MAX_EXPORT_WIDTH = 1280;
export const JPEG_QUALITY = 0.84;
const PIXEL = 14;

const clamp = (n: number): number => Math.min(NORM, Math.max(0, n));

/** Pointer position -> normalized 0..1000 coordinates inside the canvas box. */
export function toNormalized(clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }): Point {
  return {
    x: clamp(((clientX - box.left) / (box.width || 1)) * NORM),
    y: clamp(((clientY - box.top) / (box.height || 1)) * NORM),
  };
}

/** Output size: never upscale, cap the width, keep the aspect ratio. */
export function exportSize(width: number, height: number, maxWidth = MAX_EXPORT_WIDTH): { width: number; height: number } {
  if (width <= maxWidth) return { width, height };
  return { width: maxWidth, height: Math.round((height * maxWidth) / width) };
}

function rectOf(layer: Layer, w: number, h: number) {
  const x1 = (layer.start.x / NORM) * w;
  const y1 = (layer.start.y / NORM) * h;
  const x2 = (layer.end.x / NORM) * w;
  return { x: Math.min(x1, x2), y: Math.min(y1, (layer.end.y / NORM) * h), w: Math.abs(x2 - x1), h: Math.abs((layer.end.y / NORM) * h - y1) };
}

/** Draws the base capture, then every layer, scaled to the target canvas size. */
export function drawAnnotated(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  layers: Layer[],
  w: number,
  h: number
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  const stroke = Math.max(3, w / 260);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = stroke;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const layer of layers) {
    if (layer.type === 'blur') {
      // Pixelate from the clean source: the redacted pixels never survive in the export.
      const r = rectOf(layer, w, h);
      if (r.w < 2 || r.h < 2) continue;
      const tw = Math.max(1, Math.round(r.w / PIXEL));
      const th = Math.max(1, Math.round(r.h / PIXEL));
      const tmp = document.createElement('canvas');
      tmp.width = tw;
      tmp.height = th;
      const tctx = tmp.getContext('2d');
      if (!tctx) continue;
      tctx.drawImage(source, (r.x / w) * (source as HTMLCanvasElement).width, (r.y / h) * (source as HTMLCanvasElement).height, (r.w / w) * (source as HTMLCanvasElement).width, (r.h / h) * (source as HTMLCanvasElement).height, 0, 0, tw, th);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, tw, th, r.x, r.y, r.w, r.h);
      ctx.imageSmoothingEnabled = true;
    } else if (layer.type === 'rect') {
      const r = rectOf(layer, w, h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    } else if (layer.type === 'pen' && layer.points?.length) {
      ctx.beginPath();
      layer.points.forEach((p, i) => {
        const px = (p.x / NORM) * w;
        const py = (p.y / NORM) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    } else if (layer.type === 'arrow') {
      const x1 = (layer.start.x / NORM) * w;
      const y1 = (layer.start.y / NORM) * h;
      const x2 = (layer.end.x / NORM) * w;
      const y2 = (layer.end.y / NORM) * h;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = stroke * 5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }
  }
}

/** Flattens capture + layers into a compressed JPEG data URL (max 1280 px wide). */
export function exportAnnotatedJpeg(source: HTMLCanvasElement, layers: Layer[]): string {
  const { width, height } = exportSize(source.width, source.height);
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  drawAnnotated(ctx, source, layers, width, height);
  return out.toDataURL('image/jpeg', JPEG_QUALITY);
}
