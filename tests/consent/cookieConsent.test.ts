/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCookieConsent,
  saveCookieConsent,
  hasGivenConsent,
  hasAnalyticsConsent,
  purgeVisitorTracking,
  purgeConsent,
  triggerOpenConsentModal,
  CONSENT_STORAGE_KEY,
  CONSENT_COOKIE_NAME,
  VISITOR_STORAGE_KEY,
  VISITOR_COOKIE_NAME,
  CONSENT_MAX_AGE_MS,
  CONSENT_CHANGE_EVENT,
  OPEN_CONSENT_MODAL_EVENT,
} from '@/app/lib/consent/cookieConsent';

describe('Cookie Consent Utilities (app/lib/consent/cookieConsent.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  it('returns null when no consent has been given', () => {
    expect(getCookieConsent()).toBeNull();
    expect(hasGivenConsent()).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('saves consent with analytics enabled', () => {
    const preferences = saveCookieConsent(true);
    expect(preferences.essential).toBe(true);
    expect(preferences.analytics).toBe(true);
    expect(preferences.version).toBe(1);

    expect(hasGivenConsent()).toBe(true);
    expect(hasAnalyticsConsent()).toBe(true);

    const stored = getCookieConsent();
    expect(stored).toEqual(preferences);

    // Verify localStorage
    const rawStorage = localStorage.getItem(CONSENT_STORAGE_KEY);
    expect(rawStorage).toBeTruthy();
    expect(JSON.parse(rawStorage!)).toEqual(preferences);

    // Verify cookie contains consent
    expect(document.cookie).toContain(CONSENT_COOKIE_NAME);
  });

  it('saves consent with analytics refused and purges visitor tracking', () => {
    // Pre-populate visitor ID
    localStorage.setItem(VISITOR_STORAGE_KEY, 'anon_test_123');
    document.cookie = `${VISITOR_COOKIE_NAME}=anon_test_123; path=/`;

    const preferences = saveCookieConsent(false);
    expect(preferences.essential).toBe(true);
    expect(preferences.analytics).toBe(false);

    expect(hasGivenConsent()).toBe(true);
    expect(hasAnalyticsConsent()).toBe(false);

    // Visitor tracking should be cleared
    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).toBeNull();
  });

  it('expires consent older than 180 days and purges it', () => {
    const oldTimestamp = Date.now() - (CONSENT_MAX_AGE_MS + 1000);
    const expiredConsent = {
      essential: true,
      analytics: true,
      timestamp: oldTimestamp,
      version: 1,
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(expiredConsent));

    expect(getCookieConsent()).toBeNull();
    expect(hasGivenConsent()).toBe(false);
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });

  it('dispatches CONSENT_CHANGE_EVENT when consent is saved', () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_CHANGE_EVENT, listener);

    saveCookieConsent(true);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.analytics).toBe(true);

    window.removeEventListener(CONSENT_CHANGE_EVENT, listener);
  });

  it('dispatches OPEN_CONSENT_MODAL_EVENT via triggerOpenConsentModal', () => {
    const listener = vi.fn();
    window.addEventListener(OPEN_CONSENT_MODAL_EVENT, listener);

    triggerOpenConsentModal();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_CONSENT_MODAL_EVENT, listener);
  });

  it('purges visitor tracking and cookies properly', () => {
    localStorage.setItem(VISITOR_STORAGE_KEY, 'anon_xyz');
    document.cookie = `${VISITOR_COOKIE_NAME}=anon_xyz; path=/`;

    purgeVisitorTracking();

    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).toBeNull();
  });

  it('purges consent properly', () => {
    saveCookieConsent(true);
    expect(hasGivenConsent()).toBe(true);

    purgeConsent();
    expect(getCookieConsent()).toBeNull();
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });
});
