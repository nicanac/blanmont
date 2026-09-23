import React from 'react';
import { cn } from '@/app/utils/cn';

type Sky = 'clear' | 'partly' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

export function skyFromCode(code?: number): Sky {
  if (code === undefined || code === null || Number.isNaN(code)) return 'partly';
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'partly';
}

const CLOUD = 'M7.2 18.5h9.6a3.7 3.7 0 0 0 .5-7.37A5.2 5.2 0 0 0 7.4 12a3.3 3.3 0 0 0-.2 6.5Z';

interface WeatherGlyphProps {
  code?: number;
  className?: string;
  title?: string;
}

/** Sky symbols drawn in the sheet's single 1.6 stroke, keyed on WMO weather codes. */
export function WeatherGlyph({ code, className, title }: WeatherGlyphProps): React.ReactElement {
  const sky = skyFromCode(code);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {sky === 'clear' && (
        <>
          <circle cx="12" cy="12" r="4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="3" x2="12" y2="5" transform={`rotate(${a} 12 12)`} />
          ))}
        </>
      )}
      {sky === 'partly' && (
        <>
          <circle cx="9" cy="8.5" r="3.2" />
          <line x1="9" y1="2.6" x2="9" y2="3.6" />
          <line x1="3.1" y1="8.5" x2="4.1" y2="8.5" />
          <line x1="4.8" y1="4.3" x2="5.5" y2="5" />
          <line x1="13.2" y1="4.3" x2="12.5" y2="5" />
          <path
            d="M8.6 19.5h8.6a3.3 3.3 0 0 0 .45-6.57A4.7 4.7 0 0 0 8.8 13.6a2.95 2.95 0 0 0-.2 5.9Z"
            className="fill-paper dark:fill-night-2"
          />
        </>
      )}
      {sky === 'cloud' && <path d={CLOUD} />}
      {sky === 'fog' && (
        <>
          <path d="M7.2 14.5h9.6a3.7 3.7 0 0 0 .5-7.37A5.2 5.2 0 0 0 7.4 8a3.3 3.3 0 0 0-.2 6.5Z" />
          <line x1="4" y1="18" x2="16" y2="18" />
          <line x1="8" y1="21" x2="20" y2="21" />
        </>
      )}
      {sky === 'drizzle' && (
        <>
          <path d="M7.2 15h9.6a3.7 3.7 0 0 0 .5-7.37A5.2 5.2 0 0 0 7.4 8.5a3.3 3.3 0 0 0-.2 6.5Z" />
          <line x1="9" y1="18.5" x2="9" y2="19" />
          <line x1="12.5" y1="19.5" x2="12.5" y2="20" />
          <line x1="16" y1="18.5" x2="16" y2="19" />
        </>
      )}
      {sky === 'rain' && (
        <>
          <path d="M7.2 14.5h9.6a3.7 3.7 0 0 0 .5-7.37A5.2 5.2 0 0 0 7.4 8a3.3 3.3 0 0 0-.2 6.5Z" />
          <line x1="9" y1="17.5" x2="8" y2="20.5" />
          <line x1="12.5" y1="17.5" x2="11.5" y2="20.5" />
          <line x1="16" y1="17.5" x2="15" y2="20.5" />
        </>
      )}
      {sky === 'snow' && (
        <>
          <path d="M7.2 14.5h9.6a3.7 3.7 0 0 0 .5-7.37A5.2 5.2 0 0 0 7.4 8a3.3 3.3 0 0 0-.2 6.5Z" />
          <path d="M9 17.5v3M7.7 18.3l2.6 1.4M7.7 19.7l2.6-1.4" />
          <path d="M15 17.5v3M13.7 18.3l2.6 1.4M13.7 19.7l2.6-1.4" />
        </>
      )}
      {sky === 'storm' && (
        <>
          <path d="M7.2 14.5h9.6a3.7 3.7 0 0 0 .5-7.37A5.2 5.2 0 0 0 7.4 8a3.3 3.3 0 0 0-.2 6.5Z" />
          <path d="M12.5 15.5 10.5 19h3l-2 3.5" />
        </>
      )}
    </svg>
  );
}

/** A small wind arrow pointing where the wind carries the rider. */
export function WindArrow({
  fromDeg,
  className,
}: {
  fromDeg: number;
  className?: string;
}): React.ReactElement {
  const toDeg = (fromDeg + 180) % 360;
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn('size-3.5 shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <g transform={`rotate(${toDeg} 8 8)`}>
        <path d="M8 1.5 12 9.5 8 7.6 4 9.5Z" fill="currentColor" />
        <line
          x1="8"
          y1="7.6"
          x2="8"
          y2="14.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export default WeatherGlyph;
