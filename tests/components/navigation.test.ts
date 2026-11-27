import { describe, it, expect } from 'vitest';
import {
  CLUB_PATHS,
  buildOutingsNavigation,
  buildClubDiscover,
  clubLife,
  communityNavigation,
  footerNavigation,
  userNavigation,
} from '@/app/components/layout/navigation';

const GROUPS = 'GR1, GR2, GR3, GR4 & VTT';

describe('navbar menus (app/components/layout/navigation.ts)', () => {
  it('lists Parcours GPS under "Vie du club & activités", not in the top bar (#234)', () => {
    const topBar = [...buildOutingsNavigation(GROUPS), ...communityNavigation];
    expect(topBar.map((item) => item.href)).not.toContain('/traces');

    const parcours = clubLife.find((item) => item.href === '/traces');
    expect(parcours?.name).toBe('Parcours GPS');
  });

  it('keeps the top bar to four links so the labels stay on one line', () => {
    const topBar = [...buildOutingsNavigation(GROUPS), ...communityNavigation];
    expect(topBar.map((item) => item.name)).toEqual([
      'Calendrier',
      'Sondage Weekend',
      'Membres',
      'Les News',
    ]);
  });

  it('highlights "Le Club" on every route of its mega-menu, traces included', () => {
    const clubRoutes = [...buildClubDiscover(GROUPS), ...clubLife]
      .map((item) => item.href)
      .filter((href) => !href.startsWith('/le-club/'));
    for (const href of clubRoutes) {
      expect(CLUB_PATHS).toContain(href);
    }
    expect(CLUB_PATHS).toContain('/traces');
  });

  it('puts the configured group names in the descriptions', () => {
    const sondage = buildOutingsNavigation(GROUPS).find((item) => item.href === '/sondage');
    expect(sondage?.description).toContain(GROUPS);
    const presentation = buildClubDiscover(GROUPS).find((item) => item.href === '/le-club');
    expect(presentation?.description).toContain(GROUPS);
  });
});

describe('footer columns (#243)', () => {
  const footerHrefs = footerNavigation.flatMap((column) => column.items.map((item) => item.href));

  it('links every page of the navbar menus', () => {
    const navbar = [
      ...buildOutingsNavigation(GROUPS),
      ...communityNavigation,
      ...buildClubDiscover(GROUPS),
      ...clubLife,
      ...userNavigation,
    ];
    for (const item of navbar) expect(footerHrefs).toContain(item.href);
  });

  it('lists no role-gated page, since every visitor sees the same footer', () => {
    expect(footerHrefs).not.toContain('/admin');
    expect(footerHrefs).not.toContain('/retours');
  });
});
