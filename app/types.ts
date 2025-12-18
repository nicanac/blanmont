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
