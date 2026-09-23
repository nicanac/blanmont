import React from 'react';
import { cn } from '@/app/utils/cn';

interface GeodeticMarkProps {
  className?: string;
  title?: string;
}

/**
 * The geodetic point symbol (△ with a centre dot) used by topographic sheets
 * for surveyed fixed points. Here it marks the club's own fixed point:
 * the Place de la Féchère in Blanmont, where every ride starts.
 */
export function GeodeticMark({ className, title }: GeodeticMarkProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 22"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 1.2 23 20.8H1Z" fill="currentColor" />
      <circle cx="12" cy="14.2" r="2.6" className="fill-paper dark:fill-night" />
    </svg>
  );
}

export default GeodeticMark;
