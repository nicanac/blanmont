import React from 'react';
import { cn } from '@/app/utils/cn';

interface WindRoseProps {
  /** Meteorological direction the wind comes FROM (degrees, 0 = north). */
  fromDeg: number;
  className?: string;
}

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Compass card for the cartouche: the arrow shows where the wind carries the peloton,
 * turning into place once on first paint.
 */
export function WindRose({ fromDeg, className }: WindRoseProps): React.ReactElement {
  const toDeg = (fromDeg + 180) % 360;
  return (
    <svg
      viewBox="0 0 44 44"
      className={cn('size-11 shrink-0 text-ink dark:text-snow', className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="22"
        cy="22"
        r="20.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="opacity-40"
      />
      {[0, 90, 180, 270].map((a) => (
        <line
          key={a}
          x1="22"
          y1="1.5"
          x2="22"
          y2="5.5"
          stroke="currentColor"
          strokeWidth={a === 0 ? 1.6 : 1}
          transform={`rotate(${a} 22 22)`}
        />
      ))}
      <text
        x="22"
        y="12.5"
        textAnchor="middle"
        className="fill-current font-sans text-[6.5px] font-bold"
      >
        N
      </text>
      <g
        className="rose-turn origin-center rotate-(--wind)"
        style={{ '--wind': `${toDeg}deg` } as CSSVars}
      >
        <path d="M22 9.5 26.5 25 22 22.4 17.5 25Z" className="fill-hydro dark:fill-hydro-soft" />
        <line
          x1="22"
          y1="22.4"
          x2="22"
          y2="34"
          strokeWidth="1.6"
          className="stroke-hydro dark:stroke-hydro-soft"
        />
      </g>
    </svg>
  );
}

export default WindRose;
