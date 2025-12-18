export interface Member {
  id: string;
  name: string;
  role: string[];
  bio: string;
  photoUrl: string;
}

export interface Trace {
  id: string;
  name: string;
  distance: number;
  elevation?: number; // Not present in new schema, making optional
  surface: string; // Changed to string as 'road' column is flexible
  quality: number; // 1-5
  mapUrl?: string; // from Komoot
  gpxUrl?: string; // from Gpx property
  photoUrl?: string; // New field
  photoAlbumUrl?: string; // Google Photos album URL
  photoPreviews?: string[]; // Scraped preview images
  ratingColor?: string;
  start?: string;
  end?: string;
  description: string; // from Note
}

export interface Feedback {
  id: string;
  traceId: string;
  comment: string;
  rating: number; // 1-5
  memberName?: string;
  createdAt?: string;
  memberId?: string;
}

export interface SaturdayRide {
  id: string;
  date: string; // YYYY-MM-DD
  candidateTraceIds: string[];
  selectedTraceId?: string;
  status: 'Draft' | 'Voting' | 'Closed';
}

export interface Vote {
  id: string;
  rideId: string;
  memberId: string;
  traceId: string;
}
