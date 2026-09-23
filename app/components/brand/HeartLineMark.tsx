import React from 'react';
import { cn } from '@/app/utils/cn';

export interface HeartLineMarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  title?: string;
  /**
   * Visual variant of the heart line:
   * - 'pulse-heart' (default): Iconic heart silhouette intersected by an athletic cardiac pulse line
   * - 'ecg': Pure electrocardiogram / rhythm pulse line
   * - 'contour': Minimalist continuous IGN hairline heart contour
   */
  variant?: 'pulse-heart' | 'ecg' | 'contour';
}

/**
 * The Heart Line mark: symbolizes the cardiac effort, endurance, and heart of
 * the cycling club peloton. Set beside BLANMONT in the club's visual identity.
 */
export function HeartLineMark({
  className,
  title,
  variant = 'pulse-heart',
  strokeWidth = 2,
  ...props
}: HeartLineMarkProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {variant === 'pulse-heart' && (
        <>
          {/* Heart contour with pulse rhythm clearance */}
          <path
            d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676a.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Athletic cardiac rhythm pulse line */}
          <path
            d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}

      {variant === 'ecg' && (
        <path
          d="M2 12h4.5l1.5-4 2 8 2-10 2 9 1.5-3H22"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {variant === 'contour' && (
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

export default HeartLineMark;
