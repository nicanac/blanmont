'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  PopoverBackdrop,
} from '@headlessui/react';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  CalendarIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  PhotoIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon, TrophySquareIcon, ClubCrestIcon } from '../ui/CyclingIcons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import ThemeToggle from './ThemeToggle';
import { Wordmark } from '../brand/Wordmark';

type NavItem = {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isLive?: boolean;
};

const outingsNavigation: NavItem[] = [
  {
    name: 'Calendrier',
    description: 'Agenda des sorties & saison',
    href: '/calendrier',
    icon: CalendarIcon,
  },
  {
    name: 'Sondage Weekend',
    description: 'Qui roule ce weekend ? Groupes A, B, C',
    href: '/sondage',
    icon: ChatBubbleLeftRightIcon,
    isLive: true,
  },
];

const communityNavigation: NavItem[] = [
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

const primaryNavigation = [...outingsNavigation, ...communityNavigation];

const clubDiscover: NavItem[] = [
  {
    name: 'Présentation & Esprit',
    description: 'Histoire, valeurs & 3 groupes d’allure (A, B, C)',
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

const clubLife: NavItem[] = [
  {
    name: 'Équipement Officiel',
    description: 'Collection 2026, maillots & boutique club',
    href: '/le-club/equipement',
    icon: JerseyIcon,
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

const userNavigation: NavItem[] = [
  { name: 'Mon Compte', description: 'Gérer mon profil', href: '/profile', icon: UserIcon },
  {
    name: 'Pass Sécurité & Carte',
    description: 'Licence FFBC, ICE & QR départ',
    href: '/profile/pass',
    icon: QrCodeIcon,
  },
];

const CLUB_PATHS = ['/le-club', '/securite', '/rejoindre', '/leaderboard', '/galerie'];

function isCurrentPath(pathname: string | null, href: string): boolean {
  return pathname === href || (href !== '/' && Boolean(pathname?.startsWith(`${href}/`)));
}

const navLinkBase =
  'relative inline-flex h-full min-h-[44px] items-center gap-1.5 font-narrow text-[0.8125rem] font-semibold uppercase tracking-[0.07em] transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:bg-brand after:transition-transform after:duration-300 after:ease-(--ease-plot)';

function LiveDot(): React.ReactElement {
  return (
    <span className="relative flex size-2" aria-hidden="true">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-vert-vif opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-vert-vif" />
    </span>
  );
}

function MenuItem({
  item,
  current,
  onDarkIcon = false,
}: {
  item: NavItem;
  current: boolean;
  onDarkIcon?: boolean;
}) {
  return (
    <PopoverButton
      as={Link}
      href={item.href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'group flex items-start gap-3 rounded-md border p-2.5 transition-colors duration-150',
        current
          ? 'border-line bg-paper dark:border-night-line dark:bg-night-3'
          : 'border-transparent hover:border-line hover:bg-paper dark:hover:border-night-line dark:hover:bg-night-3'
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150',
          current
            ? 'border-brand bg-brand text-white'
            : cn(
                'border-ink/70 text-ink group-hover:border-brand group-hover:bg-brand group-hover:text-white dark:border-snow-3 dark:text-snow',
                onDarkIcon && 'bg-white dark:bg-night-2'
              )
        )}
      >
        <item.icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            'flex items-center justify-between gap-1 text-[0.8125rem] font-bold',
            current
              ? 'text-brand dark:text-brand-soft'
              : 'text-ink group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft'
          )}
        >
          {item.name}
          <ArrowRightIcon className="size-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-ink-3 dark:text-snow-3">
          {item.description}
        </span>
      </span>
    </PopoverButton>
  );
}

export default function Navbar(): React.ReactElement {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const isClubActive = CLUB_PATHS.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  const adminNavigation: NavItem[] = isAdmin
    ? [
        {
          name: 'Admin',
          description: 'Administration du site',
          href: '/admin',
          icon: PlusCircleIcon,
        },
      ]
    : [];

  if (pathname?.startsWith('/admin')) {
    return <></>;
  }

  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-[60] rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Aller au contenu
      </a>
      <Popover
        as="nav"
        aria-label="Navigation principale"
        className="sticky top-0 z-50 w-full border-b border-line bg-paper/90 backdrop-blur-md transition-colors duration-200 dark:border-night-line dark:bg-night/90"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex h-full items-center">
                  <Wordmark />

                  <div
                    className="mx-4 hidden h-6 w-px self-center bg-line lg:block xl:mx-6 dark:bg-night-line"
                    aria-hidden="true"
                  />

                  <div className="hidden h-full items-center lg:flex lg:gap-4 xl:gap-6">
                    <Popover className="relative flex h-full items-center">
                      {({ open: clubOpen }) => (
                        <>
                          <PopoverButton
                            className={cn(
                              navLinkBase,
                              'focus:outline-none focus-visible:outline-2',
                              clubOpen || isClubActive
                                ? 'text-ink after:scale-x-100 dark:text-snow'
                                : 'text-ink-2 after:scale-x-0 hover:text-ink hover:after:scale-x-100 dark:text-snow-2 dark:hover:text-snow'
                            )}
                          >
                            <span>Le Club</span>
                            <ChevronDownIcon
                              className={cn(
                                'size-3.5 transition-transform duration-200',
                                clubOpen && 'rotate-180 text-brand'
                              )}
                              aria-hidden="true"
                            />
                          </PopoverButton>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                          >
                            <PopoverPanel className="absolute left-0 top-full z-50 mt-px w-screen max-w-xl xl:left-1/2 xl:-translate-x-1/2">
                              <div className="overflow-hidden border border-ink/80 bg-white shadow-xl dark:border-night-line-strong dark:bg-night-2">
                                <div
                                  className="scale-strip h-[3px] opacity-80 [--seg:18px] dark:opacity-40"
                                  aria-hidden="true"
                                />
                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                                  <div className="space-y-1">
                                    <p className="px-2.5 py-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                                      Découvrir le club
                                    </p>
                                    {clubDiscover.map((item) => (
                                      <MenuItem
                                        key={item.name}
                                        item={item}
                                        current={pathname === item.href}
                                      />
                                    ))}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="px-2.5 py-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                                      Vie du club &amp; activités
                                    </p>
                                    {clubLife.map((item) => (
                                      <MenuItem
                                        key={item.name}
                                        item={item}
                                        current={pathname === item.href}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div className="flex flex-col justify-between gap-3 border-t border-line bg-paper p-4 sm:flex-row sm:items-center sm:px-5 dark:border-night-line dark:bg-night">
                                  <div className="min-w-0">
                                    <p className="text-[0.8125rem] font-bold text-ink dark:text-snow">
                                      Nouveau cycliste ? Trois sorties d&apos;essai offertes
                                    </p>
                                    <p className="mt-0.5 text-xs leading-snug text-ink-3 dark:text-snow-3">
                                      Venez rouler avec le peloton sans engagement avant
                                      d&apos;adhérer.
                                    </p>
                                  </div>
                                  <PopoverButton
                                    as={Link}
                                    href="/rejoindre"
                                    className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 self-start rounded-md bg-brand px-4 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-brand-strong sm:self-center"
                                  >
                                    Rejoindre
                                    <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                                  </PopoverButton>
                                </div>
                              </div>
                            </PopoverPanel>
                          </Transition>
                        </>
                      )}
                    </Popover>

                    {primaryNavigation.map((item) => {
                      const current = isCurrentPath(pathname, item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          aria-current={current ? 'page' : undefined}
                          className={cn(
                            navLinkBase,
                            current
                              ? 'text-ink after:scale-x-100 dark:text-snow'
                              : 'text-ink-2 after:scale-x-0 hover:text-ink hover:after:scale-x-100 dark:text-snow-2 dark:hover:text-snow'
                          )}
                        >
                          <span>{item.name}</span>
                          {item.isLive && <LiveDot />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden items-center gap-3 lg:flex xl:gap-4">
                  <ThemeToggle variant="icon" />
                  <div className="h-5 w-px bg-line dark:bg-night-line" aria-hidden="true" />

                  {isAuthenticated ? (
                    <Popover className="relative">
                      {({ open: userOpen }) => (
                        <>
                          <PopoverButton className="group inline-flex min-h-[44px] items-center gap-2.5 rounded-md border border-line bg-white py-1 pl-1 pr-3 text-ink transition-colors hover:border-ink/40 focus:outline-none focus-visible:outline-2 dark:border-night-line dark:bg-night-2 dark:text-snow dark:hover:border-snow-3">
                            <span className="sr-only">Ouvrir le menu utilisateur</span>
                            {user?.avatarUrl ? (
                              <Image
                                className="size-8 rounded-sm object-cover"
                                src={user.avatarUrl}
                                alt={user.name || 'Avatar'}
                                width={32}
                                height={32}
                                unoptimized={!user.avatarUrl.includes('cloudinary.com')}
                              />
                            ) : (
                              <span className="flex size-8 items-center justify-center rounded-sm bg-paper-2 text-ink dark:bg-night-3 dark:text-snow">
                                <UserIcon className="size-4" aria-hidden="true" />
                              </span>
                            )}
                            <span className="select-none font-narrow text-[0.8125rem] font-semibold uppercase tracking-[0.07em]">
                              Mon Compte
                            </span>
                            <ChevronDownIcon
                              className={cn(
                                'size-3.5 transition-transform duration-200',
                                userOpen && 'rotate-180 text-brand'
                              )}
                              aria-hidden="true"
                            />
                          </PopoverButton>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                          >
                            <PopoverPanel className="absolute right-0 z-10 mt-2 w-screen max-w-xs">
                              <div className="overflow-hidden border border-ink/80 bg-white shadow-xl dark:border-night-line-strong dark:bg-night-2">
                                <div
                                  className="scale-strip h-[3px] opacity-80 [--seg:18px] dark:opacity-40"
                                  aria-hidden="true"
                                />
                                <div className="grid gap-1 p-3">
                                  <div className="mb-1 border-b border-line px-2.5 pb-3 pt-1 dark:border-night-line">
                                    <p className="text-xs text-ink-3 dark:text-snow-3">
                                      Connecté en tant que
                                    </p>
                                    <p className="truncate text-sm font-bold text-ink dark:text-snow">
                                      {user?.name}
                                    </p>
                                  </div>
                                  {[...userNavigation, ...adminNavigation].map((item) => (
                                    <MenuItem
                                      key={item.name}
                                      item={item}
                                      current={pathname === item.href}
                                    />
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => logout()}
                                    className="group flex min-h-[44px] w-full items-start gap-3 rounded-md border border-transparent p-2.5 text-left transition-colors hover:border-line hover:bg-paper dark:hover:border-night-line dark:hover:bg-night-3"
                                  >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-brand/60 text-brand dark:text-brand-soft">
                                      <ArrowRightOnRectangleIcon
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                    </span>
                                    <span>
                                      <span className="block text-[0.8125rem] font-bold text-brand dark:text-brand-soft">
                                        Se déconnecter
                                      </span>
                                      <span className="mt-0.5 block text-xs text-ink-3 dark:text-snow-3">
                                        Fermer la session
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </PopoverPanel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/login"
                        className="inline-flex min-h-[44px] items-center px-2 font-narrow text-[0.8125rem] font-semibold uppercase tracking-[0.07em] text-ink-2 underline-offset-[0.35em] transition-colors hover:text-ink hover:underline dark:text-snow-2 dark:hover:text-snow"
                      >
                        Se connecter
                      </Link>
                      <Link
                        href="/rejoindre"
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-brand px-4 font-narrow text-[0.8125rem] font-bold uppercase tracking-[0.07em] text-white transition-colors hover:bg-brand-strong"
                      >
                        <UserPlusIcon className="size-4" aria-hidden="true" />
                        <span>Rejoindre</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="-mr-2 flex items-center gap-1 lg:hidden">
                  <ThemeToggle variant="icon" />
                  <PopoverButton className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-ink transition-colors hover:bg-paper-2 focus:outline-none focus-visible:outline-2 dark:text-snow dark:hover:bg-night-3">
                    <span className="sr-only">
                      {open ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}
                    </span>
                    {open ? (
                      <XMarkIcon className="size-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="size-6" aria-hidden="true" />
                    )}
                  </PopoverButton>
                </div>
              </div>
            </div>

            {/* Scroll position printed as the sheet's scale strip */}
            <div
              className="pointer-events-none absolute inset-x-0 -bottom-px h-[3px]"
              aria-hidden="true"
            >
              <div className="scale-strip absolute inset-0 opacity-[0.12] [--seg:24px] dark:opacity-[0.18]" />
              <div className="scroll-scale absolute inset-0 bg-brand" />
            </div>

            <Transition
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="duration-150 ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <PopoverBackdrop className="fixed inset-0 top-16 z-40 bg-ink/40 lg:hidden" />
            </Transition>

            <Transition
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="duration-150 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-2"
            >
              <PopoverPanel className="absolute inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-ink/80 bg-paper shadow-2xl lg:hidden dark:border-night-line-strong dark:bg-night">
                <div className="space-y-5 p-4 sm:p-5">
                  <div>
                    <p className="px-1 pb-2 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                      Sorties &amp; activités
                    </p>
                    <div className="divide-y divide-line border-y border-line dark:divide-night-line dark:border-night-line">
                      {outingsNavigation.map((item) => {
                        const current = isCurrentPath(pathname, item.href);
                        return (
                          <PopoverButton
                            key={item.name}
                            as={Link}
                            href={item.href}
                            aria-current={current ? 'page' : undefined}
                            className="flex min-h-[56px] items-center justify-between gap-3 px-1 py-2.5"
                          >
                            <span className="flex items-center gap-3">
                              <item.icon
                                className={cn(
                                  'size-5 shrink-0',
                                  current ? 'text-brand' : 'text-ink dark:text-snow'
                                )}
                              />
                              <span className="text-left">
                                <span
                                  className={cn(
                                    'block font-narrow text-sm font-bold uppercase tracking-[0.06em]',
                                    current
                                      ? 'text-brand dark:text-brand-soft'
                                      : 'text-ink dark:text-snow'
                                  )}
                                >
                                  {item.name}
                                </span>
                                <span className="block text-xs text-ink-3 dark:text-snow-3">
                                  {item.description}
                                </span>
                              </span>
                            </span>
                            {item.isLive ? (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-vert/30 bg-vert-tint px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-vert dark:border-vert-vif/30 dark:bg-vert/15 dark:text-vert-vif">
                                <LiveDot />
                                Ouvert
                              </span>
                            ) : (
                              <ArrowRightIcon
                                className="size-4 shrink-0 text-ink-3"
                                aria-hidden="true"
                              />
                            )}
                          </PopoverButton>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="px-1 pb-2 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                      Le club
                    </p>

                    {!isAuthenticated && (
                      <PopoverButton
                        as={Link}
                        href="/rejoindre"
                        className="mb-3 flex min-h-[56px] w-full items-center justify-between gap-3 rounded-md bg-brand px-4 py-3 text-white"
                      >
                        <span className="text-left">
                          <span className="block font-narrow text-sm font-bold uppercase tracking-[0.06em]">
                            Rejoindre le club
                          </span>
                          <span className="block text-xs text-white/85">
                            Trois sorties d&apos;essai offertes
                          </span>
                        </span>
                        <ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
                      </PopoverButton>
                    )}

                    <Disclosure as="div" defaultOpen={isClubActive}>
                      {({ open: subOpen }) => (
                        <div className="border-y border-line dark:border-night-line">
                          <DisclosureButton className="flex min-h-[48px] w-full items-center justify-between px-1 font-narrow text-sm font-bold uppercase tracking-[0.06em] text-ink dark:text-snow">
                            <span>Présentation, sécurité &amp; vie du club</span>
                            <ChevronDownIcon
                              className={cn(
                                'size-4 transition-transform duration-200',
                                subOpen && 'rotate-180 text-brand'
                              )}
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="divide-y divide-line pb-1 dark:divide-night-line">
                            {[...clubDiscover, ...clubLife].map((item) => {
                              const current = pathname === item.href;
                              return (
                                <PopoverButton
                                  key={item.name}
                                  as={Link}
                                  href={item.href}
                                  aria-current={current ? 'page' : undefined}
                                  className="flex min-h-[48px] items-center gap-3 px-1 py-2"
                                >
                                  <item.icon
                                    className={cn(
                                      'size-4 shrink-0',
                                      current ? 'text-brand' : 'text-ink-2 dark:text-snow-2'
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      'text-sm font-semibold',
                                      current
                                        ? 'text-brand dark:text-brand-soft'
                                        : 'text-ink dark:text-snow'
                                    )}
                                  >
                                    {item.name}
                                  </span>
                                </PopoverButton>
                              );
                            })}
                          </DisclosurePanel>
                        </div>
                      )}
                    </Disclosure>
                  </div>

                  <div>
                    <p className="px-1 pb-2 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                      Communauté
                    </p>
                    <div className="divide-y divide-line border-y border-line dark:divide-night-line dark:border-night-line">
                      {communityNavigation.map((item) => {
                        const current = isCurrentPath(pathname, item.href);
                        return (
                          <PopoverButton
                            key={item.name}
                            as={Link}
                            href={item.href}
                            aria-current={current ? 'page' : undefined}
                            className="flex min-h-[48px] items-center justify-between gap-3 px-1 py-2"
                          >
                            <span className="flex items-center gap-3">
                              <item.icon
                                className={cn(
                                  'size-5 shrink-0',
                                  current ? 'text-brand' : 'text-ink dark:text-snow'
                                )}
                              />
                              <span
                                className={cn(
                                  'font-narrow text-sm font-bold uppercase tracking-[0.06em]',
                                  current
                                    ? 'text-brand dark:text-brand-soft'
                                    : 'text-ink dark:text-snow'
                                )}
                              >
                                {item.name}
                              </span>
                            </span>
                            <ArrowRightIcon
                              className="size-4 shrink-0 text-ink-3"
                              aria-hidden="true"
                            />
                          </PopoverButton>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    {isAuthenticated ? (
                      <div className="border border-line bg-white p-3 dark:border-night-line dark:bg-night-2">
                        <div className="flex items-center gap-3 border-b border-line pb-3 dark:border-night-line">
                          {user?.avatarUrl ? (
                            <Image
                              className="size-10 rounded-sm object-cover"
                              src={user.avatarUrl}
                              alt={user.name || 'Avatar'}
                              width={40}
                              height={40}
                              unoptimized={!user.avatarUrl.includes('cloudinary.com')}
                            />
                          ) : (
                            <span className="flex size-10 items-center justify-center rounded-sm bg-paper-2 dark:bg-night-3">
                              <UserIcon
                                className="size-5 text-ink dark:text-snow"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-ink-3 dark:text-snow-3">
                              Connecté en tant que
                            </p>
                            <p className="truncate text-sm font-bold text-ink dark:text-snow">
                              {user?.name}
                            </p>
                          </div>
                        </div>
                        <div className="divide-y divide-line dark:divide-night-line">
                          {[...userNavigation, ...adminNavigation].map((item) => (
                            <PopoverButton
                              key={item.name}
                              as={Link}
                              href={item.href}
                              className="flex min-h-[48px] items-center gap-3 px-1 py-2 text-sm font-semibold text-ink dark:text-snow"
                            >
                              <item.icon className="size-4 text-brand" aria-hidden="true" />
                              {item.name}
                            </PopoverButton>
                          ))}
                          <button
                            type="button"
                            onClick={() => logout()}
                            className="flex min-h-[48px] w-full items-center gap-3 px-1 py-2 text-left text-sm font-semibold text-brand dark:text-brand-soft"
                          >
                            <ArrowRightOnRectangleIcon className="size-4" aria-hidden="true" />
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    ) : (
                      <PopoverButton
                        as={Link}
                        href="/login"
                        className="flex min-h-[48px] w-full items-center justify-center rounded-md border border-ink font-narrow text-sm font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
                      >
                        Se connecter
                      </PopoverButton>
                    )}
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
}
