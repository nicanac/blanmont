import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Pothole & Road Hazard: Hand/Arm pointing down toward the asphalt.
 */
export function SignalPotholeIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Hand pointing downwards */}
      <path d="M12 2v9" />
      <path d="M9 8l3 3 3-3" />
      {/* Road fissure / pothole */}
      <path d="M4 19l4-2 3 3 5-3 4 2" strokeDasharray="1 1" />
      <circle cx="12" cy="19" r="2.5" fill="currentColor" fillOpacity={0.15} />
    </svg>
  );
}

/**
 * Deviation / Obstacle: Arm bent behind the back with flat palm pointing outward.
 */
export function SignalDeviationIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Cyclist torso back */}
      <path d="M12 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" transform="translate(0, 5)" />
      {/* Arm folded across lower back */}
      <path d="M16 13c-2 2-5 2-8 0" />
      {/* Hand flicking leftward to deflect line */}
      <path d="M8 13l-4 1.5M4 14.5l2-2.5" />
      <path d="M18 10c0 4-2 7-6 7" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Slowing / Immediate Stop: Hand raised high vertically, open palm facing backwards.
 */
export function SignalStopIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Hand raised with 4 open fingers and thumb */}
      <path d="M10 13V4a1 1 0 0 1 2 0v7" />
      <path d="M12 6.5a1 1 0 0 1 2 0v4.5" />
      <path d="M14 8.5a1 1 0 0 1 2 0V13" />
      <path d="M10 8a1 1 0 0 0-2 0v6c0 3 2 5 5 5h1c3 0 5-2 5-5v-1" />
      {/* Forearm base */}
      <path d="M10 22v-3h6v3" />
    </svg>
  );
}

/**
 * Approaching Vehicle: Front/Rear vehicle detection in the corridor.
 */
export function SignalVehicleIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Frontal car silhouette */}
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <rect x="3" y="11" width="18" height="7" rx="2" />
      <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor" />
      <path d="M5 18v2M19 18v2" />
    </svg>
  );
}

/**
 * Intersection Control: Roadway crossing & priority signal.
 */
export function SignalIntersectionIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Crossroads lines */}
      <path d="M12 3v18M3 12h18" />
      {/* Hexagonal priority sign */}
      <polygon points="12,7 15.5,9 15.5,13 12,15 8.5,13 8.5,9" strokeWidth={1.5} fill="#e03e3e" fillOpacity={0.15} />
    </svg>
  );
}

/**
 * Relay Rotation: Elbow gesture (coup de coude) indicating side pull-off.
 */
export function SignalRelayIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Bent cycling arm on drops */}
      <path d="M6 16l4-7 6 3 2 6" />
      {/* Dynamic outward elbow impulse lines */}
      <path d="M15 6c1.5-1 3.5-1 5 0M17 9c1-.5 2-.5 3 0" stroke="#e03e3e" strokeWidth={1.75} />
    </svg>
  );
}

/**
 * Single File Transition: Index upright indicating single paceline.
 */
export function SignalSingleFileIcon({ className = 'h-6 w-6', ...props }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      {/* Hand with index finger raised up */}
      <rect x="8.5" y="10" width="7" height="10" rx="2" />
      <path d="M11 10V4a1.25 1.25 0 0 1 2.5 0v6" />
      <path d="M8.5 13H6.5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2" />
    </svg>
  );
}
