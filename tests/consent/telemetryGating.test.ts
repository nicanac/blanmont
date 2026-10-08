/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getClientVisitorId,
  trackClientEvent,
} from '@/app/components/analytics/ActivityTracker';
import {
  saveCookieConsent,
  purgeConsent,
} from '@/app/lib/consent/cookieConsent';

describe('Telemetry Gating & Consent Enforcement', () => {
  const originalSendBeacon = navigator.sendBeacon;
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    purgeConsent();
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  afterEach(() => {
    navigator.sendBeacon = originalSendBeacon;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('getClientVisitorId', () => {
    it('returns empty string when no consent has been given', () => {
      expect(getClientVisitorId()).toBe('');
    });

    it('returns empty string when analytics consent is explicitly refused', () => {
      saveCookieConsent(false);
      expect(getClientVisitorId()).toBe('');
    });

    it('generates and persists visitor ID when analytics consent is granted', () => {
      saveCookieConsent(true);
      const visitorId = getClientVisitorId();

      expect(visitorId).toBeTruthy();
      expect(visitorId).toMatch(/^anon_/);
      expect(localStorage.getItem('ccb_visitor_id')).toBe(visitorId);
    });

    it('returns existing visitor ID when already stored and consent is granted', () => {
      saveCookieConsent(true);
      localStorage.setItem('ccb_visitor_id', 'anon_existing_123');

      expect(getClientVisitorId()).toBe('anon_existing_123');
    });
  });

  describe('trackClientEvent', () => {
    it('does not send any telemetry when consent is not given', () => {
      const mockSendBeacon = vi.fn().mockReturnValue(true);
      const mockFetch = vi.fn().mockResolvedValue({} as Response);
      navigator.sendBeacon = mockSendBeacon;
      global.fetch = mockFetch;

      trackClientEvent({
        category: 'navigation',
        action: 'page:view',
        title: 'Test Page',
      });

      expect(mockSendBeacon).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('does not send any telemetry when analytics consent is refused', () => {
      saveCookieConsent(false);
      const mockSendBeacon = vi.fn().mockReturnValue(true);
      const mockFetch = vi.fn().mockResolvedValue({} as Response);
      navigator.sendBeacon = mockSendBeacon;
      global.fetch = mockFetch;

      trackClientEvent({
        category: 'navigation',
        action: 'page:view',
        title: 'Test Page',
      });

      expect(mockSendBeacon).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('sends telemetry via sendBeacon when analytics consent is granted', () => {
      saveCookieConsent(true);
      const mockSendBeacon = vi.fn().mockReturnValue(true);
      navigator.sendBeacon = mockSendBeacon;

      trackClientEvent({
        category: 'navigation',
        action: 'page:view',
        title: 'Test Page',
      });

      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
      const [url, blob] = mockSendBeacon.mock.calls[0];
      expect(url).toBe('/api/logs');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('falls back to fetch if sendBeacon returns false or fails', async () => {
      saveCookieConsent(true);
      const mockSendBeacon = vi.fn().mockReturnValue(false);
      const mockFetch = vi.fn().mockResolvedValue({} as Response);
      navigator.sendBeacon = mockSendBeacon;
      global.fetch = mockFetch;

      trackClientEvent({
        category: 'navigation',
        action: 'page:view',
        title: 'Test Page',
      });

      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('/api/logs');
      expect(init.method).toBe('POST');
    });
  });
});
