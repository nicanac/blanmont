'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { generateVisitorId, VISITOR_COOKIE_NAME } from '@/app/lib/logging/visitorSession';
import { ActivityClientLogInput } from '@/app/lib/validation/logging';
import {
  hasAnalyticsConsent,
  CONSENT_CHANGE_EVENT,
} from '@/app/lib/consent/cookieConsent';

const STORAGE_KEY = 'ccb_visitor_id';

/**
 * Retrieves or generates an anonymous visitor identifier if analytics consent is granted.
 */
export function getClientVisitorId(): string {
  if (typeof window === 'undefined') return '';
  if (!hasAnalyticsConsent()) return '';

  try {
    let visitorId = localStorage.getItem(STORAGE_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(STORAGE_KEY, visitorId);
      // Also set document cookie for HTTP requests
      document.cookie = `${VISITOR_COOKIE_NAME}=${visitorId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
    return visitorId;
  } catch {
    return 'anon_ephemeral';
  }
}

/**
 * Safely dispatches an activity log from the browser to /api/logs if analytics consent is granted.
 */
export function trackClientEvent(event: ActivityClientLogInput): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  const visitorId = getClientVisitorId();
  const payload = {
    ...event,
    visitorId: event.visitorId || visitorId,
    path: event.path || window.location.pathname,
    referrer: event.referrer ?? (document.referrer || null),
  };

  const json = JSON.stringify(payload);

  // Use sendBeacon if available for non-blocking telemetry
  if (navigator.sendBeacon) {
    const blob = new Blob([json], { type: 'application/json' });
    const success = navigator.sendBeacon('/api/logs', blob);
    if (success) return;
  }

  // Fallback to fetch with keepalive
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    keepalive: true,
  }).catch(() => {
    // Suppress network errors in telemetry
  });
}

function getPublicPageTitle(pathname: string, docTitle?: string): string {
  if (docTitle && docTitle.trim() && !docTitle.includes('Page CC Blanmont')) {
    const cleaned = docTitle.split('|')[0].trim();
    if (cleaned && cleaned !== 'Cyclo Club Saint-Martin Blanmont') {
      return cleaned;
    }
  }

  if (pathname === '/') return 'Accueil';
  if (pathname === '/traces') return 'Catalogue des Parcours & GPX';
  if (pathname.startsWith('/traces/')) return 'Fiche Parcours';
  if (pathname === '/calendrier') return 'Calendrier des Sorties';
  if (pathname.startsWith('/calendrier/')) return 'Détail Sortie';
  if (pathname === '/le-club') return 'Le Club & Affiliation';
  if (pathname === '/sondage') return 'Sondage Week-end';
  if (pathname === '/saturday-ride') return 'Sortie du Samedi & Votes';
  if (pathname === '/rejoindre' || pathname === '/sorties-essai') return 'Sorties d\'Essai & Inscription';
  if (pathname === '/equipements') return 'Catalogue Équipements';
  if (pathname === '/galerie') return 'Galeries Photos';
  if (pathname === '/contact') return 'Contact & Secrétariat';
  if (pathname === '/reglement') return 'Règlement d\'Ordre Intérieur';
  if (pathname === '/login') return 'Connexion Membre';
  if (pathname.startsWith('/login/')) return 'Activation & Mot de Passe';
  if (pathname === '/profile') return 'Espace Membre';
  if (pathname === '/profile/pass') return 'Pass Membre Numérique';

  return 'Consultation de page';
}

/**
 * Root Client Activity Tracker Component.
 * Automatically tracks page views, route navigations, and delegated interactive clicks.
 */
export default function ActivityTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  // Track page views on route change with navigation debounce
  useEffect(() => {
    // Avoid tracking admin page views in public telemetry
    if (pathname.startsWith('/admin')) {
      return;
    }

    const currentUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

    if (lastPathRef.current === currentUrl) {
      return;
    }
    lastPathRef.current = currentUrl;

    // Navigation debounce delay (350ms) to ensure title is updated and absorb rapid navigation
    const timer = setTimeout(() => {
      const pageTitle = getPublicPageTitle(pathname, document.title);

      trackClientEvent({
        category: 'navigation',
        action: 'page:view',
        title: `Visite de page : ${pageTitle}`,
        path: currentUrl,
        metadata: {
          title: pageTitle,
          pathname,
        },
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Track initial page view immediately when analytics consent is granted dynamically
  useEffect(() => {
    const handleConsentChange = (e: Event) => {
      const custom = e as CustomEvent<{ analytics: boolean }>;
      if (custom.detail?.analytics) {
        if (pathname.startsWith('/admin')) return;
        const currentUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
        const pageTitle = getPublicPageTitle(pathname, document.title);
        trackClientEvent({
          category: 'navigation',
          action: 'page:view',
          title: `Visite de page : ${pageTitle}`,
          path: currentUrl,
          metadata: {
            title: pageTitle,
            pathname,
          },
        });
      }
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
  }, [pathname, searchParams]);

  // Delegated click tracking for data-track attributes (e.g. GPX downloads, external maps)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-track]');
      if (!target) return;

      const trackType = target.getAttribute('data-track');
      const trackTitle = target.getAttribute('data-track-title') || 'Action utilisateur';
      const trackMetaStr = target.getAttribute('data-track-meta');

      let parsedMeta: Record<string, unknown> = {};
      if (trackMetaStr) {
        try {
          parsedMeta = JSON.parse(trackMetaStr);
        } catch {
          // ignore parse error
        }
      }

      if (trackType === 'gpx-download') {
        trackClientEvent({
          category: 'navigation',
          action: 'traces:gpx_download',
          title: `Téléchargement GPX : ${trackTitle}`,
          metadata: {
            traceName: trackTitle,
            ...parsedMeta,
          },
        });
      } else if (trackType === 'external-map') {
        trackClientEvent({
          category: 'navigation',
          action: 'traces:map_click',
          title: `Ouverture carte externe : ${trackTitle}`,
          metadata: parsedMeta,
        });
      } else if (trackType === 'calendar-subscribe') {
        trackClientEvent({
          category: 'navigation',
          action: 'calendar:subscribe_click',
          title: 'Abonnement calendrier iCal',
          metadata: parsedMeta,
        });
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
