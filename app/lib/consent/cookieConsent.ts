/**
 * GDPR Cookie Consent Utilities & Storage Management.
 * Manages visitor preferences, 6-month retention, and telemetry gating.
 */

export const CONSENT_COOKIE_NAME = 'ccb_cookie_consent';
export const CONSENT_STORAGE_KEY = 'ccb_cookie_consent';
export const VISITOR_COOKIE_NAME = 'ccb_visitor_id';
export const VISITOR_STORAGE_KEY = 'ccb_visitor_id';

// 6 months in milliseconds (approx 180 days)
export const CONSENT_MAX_AGE_DAYS = 180;
export const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
export const CONSENT_MAX_AGE_SECONDS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;

export interface CookieConsentPreferences {
  essential: true;
  analytics: boolean;
  timestamp: number;
  version: number;
}

export const CURRENT_CONSENT_VERSION = 1;

export const CONSENT_CHANGE_EVENT = 'ccb-consent-changed';
export const OPEN_CONSENT_MODAL_EVENT = 'ccb-open-consent-modal';

/**
 * Retrieves valid, unexpired cookie consent preferences.
 * Returns null if not set or expired.
 */
export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    let raw = localStorage.getItem(CONSENT_STORAGE_KEY);

    // Fallback to cookie check if localStorage is empty
    if (!raw) {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
      if (match) {
        raw = decodeURIComponent(match.split('=')[1]);
      }
    }

    if (!raw) return null;

    const parsed: CookieConsentPreferences = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Verify expiration (6 months)
    if (!parsed.timestamp || Date.now() - parsed.timestamp > CONSENT_MAX_AGE_MS) {
      purgeConsent();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Checks if the visitor has made an active choice that hasn't expired.
 */
export function hasGivenConsent(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Checks if the visitor has explicitly accepted analytics/telemetry cookies.
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent();
  return consent !== null && consent.analytics === true;
}

/**
 * Persists cookie consent choice for 6 months.
 * If analytics is rejected, instantly purges visitor telemetry ID and cookies.
 */
export function saveCookieConsent(analytics: boolean): CookieConsentPreferences {
  if (typeof window === 'undefined') {
    return {
      essential: true,
      analytics,
      timestamp: Date.now(),
      version: CURRENT_CONSENT_VERSION,
    };
  }

  const preferences: CookieConsentPreferences = {
    essential: true,
    analytics,
    timestamp: Date.now(),
    version: CURRENT_CONSENT_VERSION,
  };

  const serialized = JSON.stringify(preferences);

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage quota errors
  }

  // Set cookie with 6-month max-age
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    serialized
  )}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;

  // If analytics was refused, purge any existing visitor tracking immediately
  if (!analytics) {
    purgeVisitorTracking();
  }

  // Dispatch global event for reactive UI and telemetry updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(CONSENT_CHANGE_EVENT, { detail: preferences })
    );
  }

  return preferences;
}

/**
 * Removes visitor tracking identifier and cookie immediately.
 */
export function purgeVisitorTracking(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(VISITOR_STORAGE_KEY);
  } catch {
    // Ignore
  }

  document.cookie = `${VISITOR_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Clears stored consent data.
 */
export function purgeConsent(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Ignore
  }

  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Programmatically opens the cookie preferences modal from any link or button.
 */
export function triggerOpenConsentModal(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_MODAL_EVENT));
}
