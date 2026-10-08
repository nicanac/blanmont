/**
 * Types and interfaces for the User Activity & Audit Logging Service.
 * Covers anonymous visitors, registered club members, and administrators.
 */

export type LogCategory =
  | 'auth'          // Login, logout, activation, password reset
  | 'navigation'    // Page views, GPX downloads, iCal subscriptions, interactive map views
  | 'participation' // Saturday ride votes, weekend polls, trace feedback, event debriefs
  | 'admin'         // Pointage attendance, member edits, calendar events, blog posts, kit
  | 'security';     // Blocked admin access, repeated login failures, suspicious activity

export type LogSeverity = 'info' | 'warn' | 'error' | 'security';

export type UserSegment = 'anonymous' | 'member' | 'admin';

export interface ActivityUser {
  isAuthenticated: boolean;
  userId?: string | null;       // Member ID (e.g. member_2cd...) or null if anonymous
  userName?: string | null;     // Member display name or 'Visiteur anonyme'
  userEmail?: string | null;    // Member email or masked email
  role?: string[];              // ['Admin'], ['Member'], etc.
  visitorId?: string;           // Ephemeral anonymous visitor token (cookie: ccb_visitor_id)
}

export interface ActivityContext {
  path?: string;                // URL pathname (e.g. /traces/trace_123)
  referrer?: string | null;     // HTTP Referrer
  userAgent?: string | null;    // Raw User Agent header
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'bot';
  ip?: string;                  // Anonymized/masked IP address (e.g. 194.154.xxx.xxx)
}

export type ReviewStatus = 'unreviewed' | 'reviewed' | 'flagged';

export interface ActivityReview {
  status: ReviewStatus;
  reviewedBy?: string | null;       // Name or ID of administrator
  reviewedAt?: string | null;       // ISO 8601 timestamp
  notes?: string | null;            // Internal audit / moderation note
}

export interface ActivityLog {
  id: string;                   // Unique ID: log_1728374920000_abc123
  timestamp: string;            // ISO 8601 UTC date string
  timestampMs: number;          // Epoch timestamp in milliseconds (for indexing and range queries)
  yearMonth: string;            // Partition partition key: YYYY-MM (e.g. '2026-10')
  category: LogCategory;
  action: string;               // Machine slug: 'auth:login_success', 'traces:gpx_download'
  title: string;                // Human-readable title in French
  severity: LogSeverity;
  user: ActivityUser;
  context: ActivityContext;
  metadata?: Record<string, unknown>; // Specific details (traceName, group, eventTitle, etc.)
  review?: ActivityReview;      // Triage & moderation review status
}

export interface ActivityLogFilter {
  yearMonth?: string;           // Target partition (defaults to current month)
  category?: LogCategory | 'all';
  severity?: LogSeverity | 'all';
  userType?: 'all' | 'anonymous' | 'member' | 'admin';
  reviewStatus?: ReviewStatus | 'all';
  searchQuery?: string;         // Search in action, title, user, path, notes
  startDate?: string;           // ISO date string
  endDate?: string;             // ISO date string
  limit?: number;
}

export interface ActivityStats {
  total: number;
  byCategory: Record<LogCategory, number>;
  bySeverity: Record<LogSeverity, number>;
  byReviewStatus: Record<ReviewStatus, number>;
  uniqueVisitors: number;
  activeMembers: number;
  adminActionsCount: number;
  securityAlertsCount: number;
}
