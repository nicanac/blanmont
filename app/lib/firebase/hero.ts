import { HeroSettings } from '@/app/types';
import { DEFAULT_HERO_SETTINGS } from '@/app/constants/hero';
import { isMockMode } from './client';

export { DEFAULT_HERO_SETTINGS };

/**
 * Normalizes raw data from Firebase to guarantee full conformity with HeroSettings.
 */
export function normalizeHeroSettings(data: any): HeroSettings {
  if (!data || typeof data !== 'object') {
    return DEFAULT_HERO_SETTINGS;
  }

  const badge = typeof data.badge === 'string' && data.badge.trim() ? data.badge.trim() : DEFAULT_HERO_SETTINGS.badge;

  let slides = Array.isArray(data.slides) ? data.slides : [];
  slides = slides
    .filter((s: any) => s && typeof s.url === 'string' && s.url.trim())
    .map((s: any, idx: number) => ({
      id: s.id || `slide-${idx + 1}`,
      url: s.url.trim(),
      alt: typeof s.alt === 'string' ? s.alt : 'Photo du club de Blanmont',
      position: typeof s.position === 'string' && s.position.trim() ? s.position.trim() : 'center center',
    }));

  if (slides.length === 0) {
    slides = DEFAULT_HERO_SETTINGS.slides;
  }

  let cards = Array.isArray(data.cards) ? data.cards : [];
  cards = cards
    .filter((c: any) => c && typeof c.label === 'string')
    .map((c: any, idx: number) => {
      const defaultCard = DEFAULT_HERO_SETTINGS.cards[idx] || DEFAULT_HERO_SETTINGS.cards[0];
      return {
        id: c.id || `card-${idx + 1}`,
        icon: c.icon || defaultCard.icon,
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
    let rawData: any = null;

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
