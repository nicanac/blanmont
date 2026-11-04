import { HeroSettings, HeroSlide, HeroTelemetryCard } from '@/app/types';
import { DEFAULT_HERO_SETTINGS } from '@/app/constants/hero';
import { sanitizeUrl } from '../urlUtils';
import { isMockMode } from './client';

export { DEFAULT_HERO_SETTINGS, sanitizeUrl };

/**
 * Normalizes raw data from Firebase to guarantee full conformity with HeroSettings.
 */
export function normalizeHeroSettings(input: unknown): HeroSettings {
  if (!input || typeof input !== 'object') {
    return DEFAULT_HERO_SETTINGS;
  }
  const data = input as Record<string, unknown> & {
    badge?: unknown;
    slides?: unknown;
    cards?: unknown;
    updatedAt?: string;
  };

  const badge = typeof data.badge === 'string' && data.badge.trim() ? data.badge.trim() : DEFAULT_HERO_SETTINGS.badge;

  type RawSlide = Partial<Record<keyof HeroSlide, unknown>> & { url: string };
  type RawCard = Partial<Record<keyof HeroTelemetryCard, unknown>> & { label: string };

  const rawSlides: unknown[] = Array.isArray(data.slides) ? data.slides : [];
  let slides: HeroSlide[] = rawSlides
    .filter((s): s is RawSlide => !!s && typeof (s as RawSlide).url === 'string' && (s as RawSlide).url.trim() !== '')
    .map((s, idx): HeroSlide => ({
      id: (s.id as string) || `slide-${idx + 1}`,
      url: sanitizeUrl(s.url),
      alt: typeof s.alt === 'string' ? s.alt : 'Photo du club de Blanmont',
      position: typeof s.position === 'string' && s.position.trim() ? s.position.trim() : 'center center',
    }))
    .filter((s) => Boolean(s.url));

  if (slides.length === 0) {
    slides = DEFAULT_HERO_SETTINGS.slides;
  }

  const rawCards: unknown[] = Array.isArray(data.cards) ? data.cards : [];
  const cards: HeroTelemetryCard[] = rawCards
    .filter((c): c is RawCard => !!c && typeof (c as RawCard).label === 'string')
    .map((c, idx): HeroTelemetryCard => {
      const defaultCard = DEFAULT_HERO_SETTINGS.cards[idx] || DEFAULT_HERO_SETTINGS.cards[0];
      return {
        id: (c.id as string) || `card-${idx + 1}`,
        icon: (c.icon as HeroTelemetryCard['icon']) || defaultCard.icon,
        label: typeof c.label === 'string' ? c.label : defaultCard.label,
        value: typeof c.value === 'string' ? c.value : defaultCard.value,
        detail: typeof c.detail === 'string' ? c.detail : defaultCard.detail,
      };
    });

  if (cards.length < 4) {
    for (let i = cards.length; i < 4; i++) {
      cards.push(DEFAULT_HERO_SETTINGS.cards[i]);
    }
  }

  return {
    badge,
    slides,
    cards: cards.slice(0, 4),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetches the hero settings from Firebase RTDB, falling back to defaults if not yet customized.
 */
export async function getHeroSettings(): Promise<HeroSettings> {
  if (isMockMode) {
    return DEFAULT_HERO_SETTINGS;
  }

  try {
    let rawData: unknown = null;

    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      const snapshot = await db.ref('hero-settings').once('value');
      if (snapshot.exists()) {
        rawData = snapshot.val();
      }
    } else {
      const { getFirebaseDatabase, ref, get } = await import('./client');
      const db = getFirebaseDatabase();
      const settingsRef = ref(db, 'hero-settings');
      const snapshot = await get(settingsRef);
      if (snapshot.exists()) {
        rawData = snapshot.val();
      }
    }

    return normalizeHeroSettings(rawData);
  } catch (error) {
    console.error('Error fetching hero settings from Firebase:', error);
    return DEFAULT_HERO_SETTINGS;
  }
}

/**
 * Updates hero settings in Firebase RTDB using Admin SDK.
 */
export async function updateHeroSettings(settings: HeroSettings): Promise<HeroSettings> {
  const normalized = normalizeHeroSettings({
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  if (isMockMode) {
    console.log('Mock mode: hero settings updated', normalized);
    return normalized;
  }

  const { getAdminDatabase } = await import('./admin');
  const db = getAdminDatabase();
  await db.ref('hero-settings').set(normalized);

  return normalized;
}
