'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/app/utils/cn';
import { drawAnnotated, toNormalized, type Layer, type Tool } from './annotations';

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'arrow', label: 'Flèche' },
  { id: 'rect', label: 'Cadre' },
  { id: 'pen', label: 'Crayon' },
  { id: 'blur', label: 'Flouter' },
];

interface AnnotationStudioProps {
  source: HTMLCanvasElement;
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
}

/** Pointer-driven annotation canvas. Annotations are optional: the form works without them. */
export default function AnnotationStudio({ source, layers, onLayersChange }: AnnotationStudioProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('arrow');
  const [draft, setDraft] = useState<Layer | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawAnnotated(ctx, source, draft ? [...layers, draft] : layers, canvas.width, canvas.height);
  }, [source, layers, draft]);

  useEffect(redraw, [redraw]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) =>
    toNormalized(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    setDraft({ id: crypto.randomUUID(), type: tool, start: p, end: p, points: tool === 'pen' ? [p] : undefined });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draft) return;
    const p = point(e);
    setDraft({ ...draft, end: p, points: draft.points ? [...draft.points, p] : undefined });
  };

  const commit = () => {
    if (draft) onLayersChange([...layers, draft]);
    setDraft(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Outils d'annotation">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tool === t.id}
            onClick={() => setTool(t.id)}
            className={cn(
              'rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider',
              tool === t.id
                ? 'border-brand bg-brand text-white'
                : 'border-line dark:border-night-line text-ink dark:text-snow hover:border-brand'
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onLayersChange(layers.slice(0, -1))}
          disabled={layers.length === 0}
          className="inline-flex items-center gap-1 rounded-sm border border-line dark:border-night-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-snow disabled:opacity-40"
        >
          <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
          Annuler le dernier
        </button>
        <button
          type="button"
          onClick={() => onLayersChange([])}
          disabled={layers.length === 0}
          className="rounded-sm border border-line dark:border-night-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-snow disabled:opacity-40"
        >
          Tout effacer
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={Math.min(source.width, 1280)}
        height={Math.round((source.height * Math.min(source.width, 1280)) / source.width)}
        role="img"
        aria-label="Capture de la page à annoter avec la souris ou le doigt (facultatif)"
        className="w-full h-auto touch-none cursor-crosshair rounded-sm border border-line dark:border-night-line"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={commit}
        onPointerCancel={() => setDraft(null)}
      />
    </div>
  );
}
