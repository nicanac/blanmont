/**
 * Represents a club member.
 */
export interface Member {
  /** Unique identifier for the member (Notion Page ID). */
  id: string;
  /** Full name of the member. */
  name: string;
  /** List of roles assigned to the member (e.g., 'President', 'Admin', 'Member'). */
  role: string[];
  /** Short biography or tagline. */
  bio: string;
  /** URL to the member's profile photo. */
  photoUrl: string;
  /** Email address of the member. */
  email?: string;
  /** Phone number of the member. */
  phone?: string;
}

/**
 * Represents a cycling route (Trace).
 */
export interface Trace {
  /** Unique identifier for the trace (Notion Page ID). */
  id: string;
  /** Name or title of the trace. */
  name: string;
  /** Total distance in kilometers. */
  distance: number;
  /** Total elevation gain in meters. Optional as it may be missing in old records. */
  elevation?: number;
  /** Surface type (e.g., 'Road', 'Gravel'). */
  surface: string;
  /** Subjective quality rating (1-5 stars) derived from Notion. */
  quality: number;
  /** Raw rating string from Notion (e.g., '⭐⭐⭐'). */
  rating?: string;
  /** URL to the Komoot route map. */
  mapUrl?: string;
  /** URL to the GPX file download. */
  gpxUrl?: string;
  /** URL to the main cover photo for the trace. */
  photoUrl?: string;
  /** URL to a Google Photos album associated with this trace. */
  photoAlbumUrl?: string;
  /** List of photo URLs scraped from the album for preview. */
  photoPreviews?: string[];
  /** Color code associated with the difficulty/rating. */
  ratingColor?: string;
  /** Name of the starting location. */
  start?: string;
  /** Name of the ending location. */
  end?: string;
  /** General cardinal direction of the route (e.g., North, South-West). */
  direction?: string;
  /** specific description or notes about the route. */
  description: string;
  /** Encoded polyline string for the route path. */
  polyline?: string;
}

/**
 * Represents user feedback on a specific trace.
 */
export interface Feedback {
  /** Unique identifier for the feedback entry. */
  id: string;
  /** ID of the trace being reviewed. */
  traceId: string;
  /** Text comment provided by the user. */
  comment: string;
  /** Numerical rating (1-5). */
  rating: number;
  /** Name of the member who left the feedback (optional). */
  memberName?: string;
  /** ISO timestamp of when the feedback was created. */
  createdAt?: string;
  /** ID of the member who left the feedback (optional). */
  memberId?: string;
}

/**
 * Represents a weekly Saturday Ride event.
 */
export interface SaturdayRide {
  /** Unique identifier for the ride event. */
  id: string;
  /** Date of the ride in YYYY-MM-DD format. */
  date: string;
  /** List of Trace IDs proposed for this ride. */
  candidateTraceIds: string[];
  /** ID of the final selected trace (if decided). */
  selectedTraceId?: string;
  /** Current status of the voting process. */
  status: 'Draft' | 'Voting' | 'Closed';
}

/**
 * Represents a member's vote for a Saturday Ride.
 */
export interface Vote {
  /** Unique identifier for the vote record. */
  id: string;
  /** ID of the Saturday Ride event. */
  rideId: string;
  /** ID of the member who voted. */
  memberId: string;
  /** ID of the trace the member voted for. */
  traceId: string;
}

/**
 * Represents an event in the club calendar.
 */
export interface CalendarEvent {
  id: string;
  isoDate: string; // YYYY-MM-DD
  location: string;
  distances: string;
  departure: string;
  address: string;
  remarks: string;
  alternative: string;
  group: string;
}


/**
 * Represents a raw Page object from the Notion API.
 * This helps strict typing when mapping properties.
 */
export interface NotionProperty {
  id: string;
  type: string;
  rich_text?: { plain_text: string; text?: { content: string }; }[];
  title?: { plain_text: string }[];
  multi_select?: { name: string; color?: string }[];
  select?: { name: string; color?: string };
  number?: number;
  url?: string;
  files?: { file?: { url: string }, external?: { url: string } }[];
  email?: string;
  phone_number?: string;
  relation?: { id: string }[];
  [key: string]: any; // Fallback for other property types
}

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
  url: string;
}
