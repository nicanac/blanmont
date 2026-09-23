import React from 'react';
import { cn } from '@/app/utils/cn';
import type { CyclingGroup } from '@/app/constants/cycling';

interface RoadSwatchProps {
  group: CyclingGroup;
  className?: string;
}

/**
 * Legend swatch: each weekend group is printed as a road class of the sheet —
 * A the red main road, B the amber secondary road, C the cased local road,
 * VTT the dashed track through the woods.
 */
export function RoadSwatch({ group, className }: RoadSwatchProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 48 12"
      className={cn('h-3 w-12 shrink-0 overflow-visible', className)}
      aria-hidden="true"
      focusable="false"
    >
      {group === 'A' && (
        <>
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="8"
            strokeLinecap="butt"
            className="stroke-brand-strong"
          />
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="5.5"
            strokeLinecap="butt"
            className="stroke-brand-vif"
          />
        </>
      )}
      {group === 'B' && (
        <>
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="7"
            strokeLinecap="butt"
            className="stroke-ambre-ink"
          />
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="4.5"
            strokeLinecap="butt"
            className="stroke-ambre"
          />
        </>
      )}
      {group === 'C' && (
        <>
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="6.5"
            strokeLinecap="butt"
            className="stroke-ink dark:stroke-snow-2"
          />
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="4"
            strokeLinecap="butt"
            className="stroke-white dark:stroke-night"
          />
        </>
      )}
      {group === 'VTT' && (
        <>
          <rect x="0" y="0" width="48" height="12" className="fill-bois dark:fill-vert/25" />
          <line
            x1="1"
            y1="6"
            x2="47"
            y2="6"
            strokeWidth="2"
            strokeDasharray="5 3.5"
            strokeLinecap="butt"
            className="stroke-ink dark:stroke-snow"
          />
        </>
      )}
    </svg>
  );
}

export default RoadSwatch;
