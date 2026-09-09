import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Aerodynamic cycling jersey icon with collar, raglan cut, zipper, and contouring.
 * Perfect for 'Tenues & Équipements' and club kit shop.
 */
export function JerseyIcon({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Jersey outline: collar, raglan sleeves, cuffs, body, dropped cycling tail hem */}
      <path d="M8.5 4h7l2.5 3.5 3.5 1.5-1.5 4-2.5-1.2v7.7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-7.7l-2.5 1.2-1.5-4 3.5-1.5L8.5 4z" />
      {/* Front aerodynamic zipper */}
      <path d="M12 4v6.5" />
      {/* Precision collar curve */}
      <path d="M9.5 4c.6 1.1 1.4 1.6 2.5 1.6s1.9-.5 2.5-1.6" />
    </svg>
  );
}

/**
 * Le Carré Vert trophy emblem.
 * Celebrates the historic annual attendance competition of Blanmont (since 1978).
 * Features a prestigious trophy resting on the signature green square pedestal.
 */
export function TrophySquareIcon({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Trophy chalice */}
      <path d="M8 4.5h8v4.5a4 4 0 0 1-8 0V4.5z" />
      {/* Ergonomic handles */}
      <path d="M8 6H5.5a2 2 0 0 0-2 2c0 1.6 1.4 2.5 3 2.5H8" />
      <path d="M16 6h2.5a2 2 0 0 1 2 2c0 1.6-1.4 2.5-3 2.5H16" />
      {/* Pedestal stem */}
      <path d="M12 13v4" />
      {/* "Le Carré" - Clean architectural square base */}
      <rect x="6.5" y="17" width="11" height="4" rx="1" />
      {/* Star of honour inside chalice */}
      <path d="M12 7.2l.4.9 1 .1-.7.7.2 1-.9-.5-.9.5.2-1-.7-.7 1-.1.4-.9z" strokeWidth={1} fill="currentColor" />
    </svg>
  );
}

/**
 * Precision calendar route / GPX planner icon.
 * Features a clean calendar grid integrated with a cycling route waypoint trajectory.
 */
export function RouteCalendarIcon({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Calendar tablet */}
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      {/* Calendar binder pins */}
      <path d="M8 2.5v3.5" />
      <path d="M16 2.5v3.5" />
      {/* Top rule */}
      <path d="M3 9.5h18" />
      {/* Route trace line with departure and arrival nodes */}
      <circle cx="7.5" cy="15.5" r="1.25" fill="currentColor" />
      <circle cx="16.5" cy="13.5" r="1.25" fill="currentColor" />
      <path d="M8.75 15.5c2 0 2.5-3 4-3s1.5 1 2.5 1" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

/**
 * Authentic road cycling bicycle icon in matching 1.75px stroke.
 * Replaces raw emojis with genuine editorial vector linework.
 */
export function BicycleIcon({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Wheels */}
      <circle cx="5.5" cy="16" r="3.5" />
      <circle cx="18.5" cy="16" r="3.5" />
      {/* Bottom bracket */}
      <circle cx="11.5" cy="16" r="0.75" fill="currentColor" />
      {/* Diamond frame: seat tube, down tube, top tube, chainstays, seat stays */}
      <path d="M11.5 16l3.5-6.5h-5.5l-2.5 6.5" />
      <path d="M11.5 16L6 9.5h5" />
      {/* Saddle & seatpost */}
      <path d="M11.5 16l-2-8.5" />
      <path d="M8 7.5h3.5" />
      {/* Front fork & drop handlebars */}
      <path d="M18.5 16l-3.2-8.5" />
      <path d="M14 7.5h2.2l1.3 1.8" />
    </svg>
  );
}

/**
 * Clean peloton / club shield icon for "Présentation & Qui sommes-nous".
 */
export function ClubCrestIcon({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Heraldic cycling crest */}
      <path d="M12 3l7 3v6c0 5.25-3.5 8.75-7 10-3.5-1.25-7-4.75-7-10V6l7-3z" />
      {/* Inner chevron */}
      <path d="M8.5 10l3.5 3 3.5-3" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}
