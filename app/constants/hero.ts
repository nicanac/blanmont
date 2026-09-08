import { HeroSettings } from '@/app/types';

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  badge: 'Peloton CC Saint-Martin · Blanmont',
  slides: [
    {
      id: 'default-1',
      url: '/images/home-hero.jpg',
      alt: 'Club de Blanmont – peloton cycliste sur route dans le Brabant wallon',
      position: 'center center',
    },
  ],
  cards: [
    {
      id: 'card-1',
      icon: 'pin',
      label: 'Rassemblement',
      value: 'Place de Blanmont',
      detail: '',
    },
    {
      id: 'card-2',
      icon: 'calendar',
      label: 'Samedi',
      value: '8h30',
      detail: '· Route',
    },
    {
      id: 'card-3',
      icon: 'calendar',
      label: 'Dimanche',
      value: '9h00',
      detail: '· Route & VTT',
    },
    {
      id: 'card-4',
      icon: 'group',
      label: 'Allures',
      value: 'Groupes A, B, C & VTT',
      detail: '',
    },
  ],
  updatedAt: '2026-09-08T00:00:00.000Z',
};
