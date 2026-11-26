/**
 * Public navigation menus of the Navbar (desktop bar, "Le Club" mega-menu, mobile drawer).
 * Kept apart from the component so the menu structure can be unit-tested.
 */
import {
  CalendarIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserIcon,
  PhotoIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon, TrophySquareIcon, ClubCrestIcon } from '../ui/CyclingIcons';

export type NavItem = {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isLive?: boolean;
};

/** `groups` is the configured group list ("GR1, GR2, GR3, GR4 & VTT"). */
export const buildOutingsNavigation = (groups: string): NavItem[] => [
  {
    name: 'Calendrier',
    description: 'Agenda des sorties & saison',
    href: '/calendrier',
    icon: CalendarIcon,
  },
  {
    name: 'Sondage Weekend',
    description: `Qui roule ce weekend ? ${groups}`,
    href: '/sondage',
    icon: ChatBubbleLeftRightIcon,
    isLive: true,
  },
];

export const communityNavigation: NavItem[] = [
  {
    name: 'Membres',
    description: 'Trombinoscope & capitaines de route',
    href: '/members',
    icon: UserIcon,
  },
  {
    name: 'Les News',
    description: 'Actualités & chroniques du peloton',
    href: '/blog',
    icon: InformationCircleIcon,
  },
];

export const buildClubDiscover = (groups: string): NavItem[] => [
  {
    name: 'Présentation & Esprit',
    description: `Histoire, valeurs & groupes d’allure (${groups})`,
    href: '/le-club',
    icon: ClubCrestIcon,
  },
  {
    name: 'Charte & Sécurité',
    description: 'Code de la route (Art. 43bis) & signaux en peloton',
    href: '/securite',
    icon: ShieldCheckIcon,
  },
];

export const clubLife: NavItem[] = [
  {
    name: 'Équipement Officiel',
    description: 'Collection 2026, maillots & boutique club',
    href: '/le-club/equipement',
    icon: JerseyIcon,
  },
  {
    name: 'Parcours GPS',
    description: 'Catalogue des traces GPX du club',
    href: '/traces',
    icon: MapIcon,
  },
  {
    name: 'Challenge Carré Vert',
    description: 'Classement d’assiduité & présence annuelle',
    href: '/leaderboard',
    icon: TrophySquareIcon,
  },
  {
    name: 'Galerie & Souvenirs',
    description: 'Photos & récits des sorties au fil des saisons',
    href: '/galerie',
    icon: PhotoIcon,
  },
];

/** Routes that light up the "Le Club" menu (its mega-menu links and their sub-pages). */
export const CLUB_PATHS = ['/le-club', '/securite', '/rejoindre', '/leaderboard', '/galerie', '/traces'];
