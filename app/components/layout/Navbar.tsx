'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import {
  Disclosure,
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
  ChevronRightIcon,
  CalendarIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import {
  JerseyIcon,
  TrophySquareIcon,
  ClubCrestIcon,
} from '../ui/CyclingIcons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import ThemeToggle from './ThemeToggle';

export default function Navbar(): React.ReactElement {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  // Active state for Le Club dropdown section
  const isClubActive = [
    '/le-club',
    '/securite',
    '/rejoindre',
    '/leaderboard',
    '/galerie',
  ].some((path) => pathname === path || pathname?.startsWith(`${path}/`));

  // Outings & Weekly activities
  const outingsNavigation = [
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

  // Community & Articles
  const communityNavigation = [
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

  // Primary navigation for desktop
  const primaryNavigation = [...outingsNavigation, ...communityNavigation];

  // Le Club - Découvrir
  const clubDiscover = [
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

  // Le Club - Vie & Activités
  const clubLife = [
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

  // Simple user menu - only essential items
  // Trace management has been moved to Admin section
  const userNavigation = [
    { name: 'Mon Compte', description: 'Gérer mon profil', href: '/profile', icon: UserIcon },
  ];

  // Admin link - shown only for users with admin access
  const adminNavigation = isAdmin
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
    <Popover
      as="nav"
      className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0a0c10]/95 backdrop-blur-md border-b border-[#e4e0d8] dark:border-white/10 transition-colors duration-200"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Left Side: Logo | Divider | Links */}
              <div className="flex items-center h-full">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-xl font-extrabold uppercase tracking-[-0.02em] text-[#101216] dark:text-white font-sans">
                      Blan<span className="text-[#e03e3e]">mont</span>
                    </span>
                    <span className="hidden md:inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6370] dark:text-[#a7adbb] border-l border-[#e4e0d8] dark:border-white/15 pl-2.5 leading-tight">
                      Cyclo Club
                      <br />
                      Saint-Martin
                    </span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="hidden lg:block h-6 w-px bg-[#e4e0d8] dark:bg-white/15 mx-4 xl:mx-6 self-center"></div>

                {/* Navigation Links */}
                <div className="hidden lg:flex lg:space-x-3.5 xl:space-x-5 items-center h-full">
                  {/* Le Club Popover */}
                  <Popover className="relative flex items-center h-full">
                    {({ open: clubOpen }) => (
                      <>
                        <PopoverButton
                          className={cn(
                            'group relative inline-flex items-center gap-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none h-full min-h-[44px]',
                            clubOpen || isClubActive
                              ? 'text-[#101216] dark:text-white after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-[#e03e3e] after:z-10'
                              : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
                          )}
                        >
                          <span>Le Club</span>
                          <ChevronDownIcon
                            className={cn(
                              clubOpen ? 'text-[#e03e3e] rotate-180' : 'text-[#5c6370]',
                              'h-3.5 w-3.5 transition duration-150 ease-in-out group-hover:text-[#101216] dark:group-hover:text-white'
                            )}
                            aria-hidden="true"
                          />
                        </PopoverButton>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <PopoverPanel className="absolute top-full left-0 xl:left-1/2 z-50 mt-2 w-screen max-w-xl xl:-translate-x-1/2 transform px-3 sm:px-0">
                            <div className="overflow-hidden rounded-xl shadow-2xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] transition-colors">
                              {/* 2 Columns: Découvrir & Vie du Club */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5">
                                {/* Column 1: Découvrir le Club */}
                                <div className="space-y-1">
                                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c6370] dark:text-[#a7adbb] px-2.5 py-1">
                                    Découvrir le Club
                                  </p>
                                  {clubDiscover.map((item) => {
                                    const isItemCurrent = pathname === item.href;
                                    return (
                                      <PopoverButton
                                        key={item.name}
                                        as={Link}
                                        href={item.href}
                                        className={cn(
                                          'flex items-start rounded-lg p-2.5 border transition-all duration-150 group',
                                          isItemCurrent
                                            ? 'bg-[#faf8f5] dark:bg-white/10 border-[#e4e0d8] dark:border-white/15'
                                            : 'border-transparent hover:bg-[#faf8f5] dark:hover:bg-white/5 hover:border-[#e4e0d8] dark:hover:border-white/10'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                                            isItemCurrent
                                              ? 'border-[#e03e3e] bg-[#e03e3e] text-white shadow-xs'
                                              : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[#101216] dark:text-[#f5f6f8] group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white shadow-2xs'
                                          )}
                                        >
                                          <item.icon className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3 text-left flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-1">
                                            <p
                                              className={cn(
                                                'text-xs font-bold transition-colors',
                                                isItemCurrent
                                                  ? 'text-[#e03e3e]'
                                                  : 'text-[#101216] dark:text-white group-hover:text-[#e03e3e]'
                                              )}
                                            >
                                              {item.name}
                                            </p>
                                            <ChevronRightIcon className="h-3.5 w-3.5 text-[#5c6370] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#e03e3e] transition-all duration-150 shrink-0" />
                                          </div>
                                          <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#a7adbb] leading-snug">
                                            {item.description}
                                          </p>
                                        </div>
                                      </PopoverButton>
                                    );
                                  })}
                                </div>

                                {/* Column 2: Vie du Club */}
                                <div className="space-y-1">
                                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c6370] dark:text-[#a7adbb] px-2.5 py-1">
                                    Vie du Club &amp; Activités
                                  </p>
                                  {clubLife.map((item) => {
                                    const isItemCurrent = pathname === item.href;
                                    return (
                                      <PopoverButton
                                        key={item.name}
                                        as={Link}
                                        href={item.href}
                                        className={cn(
                                          'flex items-start rounded-lg p-2.5 border transition-all duration-150 group',
                                          isItemCurrent
                                            ? 'bg-[#faf8f5] dark:bg-white/10 border-[#e4e0d8] dark:border-white/15'
                                            : 'border-transparent hover:bg-[#faf8f5] dark:hover:bg-white/5 hover:border-[#e4e0d8] dark:hover:border-white/10'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                                            isItemCurrent
                                              ? 'border-[#e03e3e] bg-[#e03e3e] text-white shadow-xs'
                                              : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[#101216] dark:text-[#f5f6f8] group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white shadow-2xs'
                                          )}
                                        >
                                          <item.icon className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3 text-left flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-1">
                                            <p
                                              className={cn(
                                                'text-xs font-bold transition-colors',
                                                isItemCurrent
                                                  ? 'text-[#e03e3e]'
                                                  : 'text-[#101216] dark:text-white group-hover:text-[#e03e3e]'
                                              )}
                                            >
                                              {item.name}
                                            </p>
                                            <ChevronRightIcon className="h-3.5 w-3.5 text-[#5c6370] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#e03e3e] transition-all duration-150 shrink-0" />
                                          </div>
                                          <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#a7adbb] leading-snug">
                                            {item.description}
                                          </p>
                                        </div>
                                      </PopoverButton>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Bottom Warm Spotlight Banner: Rejoindre le Club */}
                              <div className="border-t border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e03e3e]/10 dark:bg-[#e03e3e]/20 text-[#e03e3e]">
                                    <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-[#101216] dark:text-white">
                                        Nouveau cycliste ? 3 sorties d&apos;essai
                                      </p>
                                      <span className="text-xs font-bold uppercase tracking-wider text-[#e03e3e] bg-[#e03e3e]/10 dark:bg-[#e03e3e]/20 px-1.5 py-0.5 rounded">
                                        Gratuit
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] mt-0.5 leading-snug">
                                      Venez rouler avec le peloton sans engagement avant d&apos;adhérer.
                                    </p>
                                  </div>
                                </div>
                                <PopoverButton
                                  as={Link}
                                  href="/rejoindre"
                                  className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors shadow-2xs"
                                >
                                  <span>Rejoindre</span>
                                  <ChevronRightIcon className="h-3.5 w-3.5" />
                                </PopoverButton>
                              </div>
                            </div>
                          </PopoverPanel>
                        </Transition>
                      </>
                    )}
                  </Popover>

                  {/* Primary Navigation Links */}
                  {primaryNavigation.map((item) => {
                    const isCurrent =
                      pathname === item.href ||
                      (item.href !== '/' && pathname?.startsWith(`${item.href}/`));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'relative text-[0.8125rem] font-semibold uppercase tracking-[0.08em] transition-colors inline-flex items-center gap-1.5 h-full min-h-[44px]',
                          isCurrent
                            ? 'text-[#101216] dark:text-white after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-[#e03e3e] after:z-10'
                            : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
                        )}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        <span>{item.name}</span>
                        {'isLive' in item && Boolean((item as { isLive?: boolean }).isLive) && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Theme Toggle & User Menu */}
              <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
                {/* Quick Theme Switcher */}
                <ThemeToggle variant="icon" />

                {/* Subtle vertical hairline divider */}
                <div className="h-5 w-px bg-[#e4e0d8] dark:bg-white/10" aria-hidden="true" />

                {/* User Menu / Login */}
                {isAuthenticated ? (
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <PopoverButton className="group inline-flex min-h-[44px] items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[#e4e0d8] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-[#101216] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#e03e3e]/40">
                          <span className="sr-only">Ouvrir le menu utilisateur</span>
                          {user?.avatarUrl ? (
                            <Image
                              className="h-8 w-8 md:h-8 md:w-8 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20 group-hover:ring-[#e03e3e]/50 transition-colors"
                              src={user.avatarUrl}
                              alt={user.name || 'User avatar'}
                              width={32}
                              height={32}
                              unoptimized={!user.avatarUrl.includes('cloudinary.com')}
                            />
                          ) : (
                            <span className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[#101216] dark:text-white ring-1 ring-black/10 dark:ring-white/20">
                              <UserIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                          <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#3a3f4a] dark:text-[#d5d9e2] group-hover:text-[#101216] dark:group-hover:text-white transition-colors select-none">
                            Mon Compte
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              open ? 'text-[#e03e3e] rotate-180' : 'text-[#5c6370]',
                              'h-3.5 w-3.5 transition-transform duration-200 ease-in-out group-hover:text-[#101216] dark:group-hover:text-white'
                            )}
                            aria-hidden="true"
                          />
                        </PopoverButton>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <PopoverPanel className="absolute right-0 z-10 mt-3 w-screen max-w-xs transform px-2 sm:px-0">
                            <div className="overflow-hidden rounded-md shadow-2xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922]">
                              <div className="relative grid gap-2 px-3 py-3 sm:p-4">
                                <div className="p-3 border-b border-[#e4e0d8] dark:border-[#262b38] pb-4 mb-1">
                                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">Connecté en tant que</p>
                                  <p className="text-sm font-semibold text-[#101216] dark:text-white truncate">
                                    {user?.name}
                                  </p>
                                </div>

                                {[...userNavigation, ...adminNavigation].map((item) => (
                                  <PopoverButton
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className="flex items-start rounded-md p-3 min-h-[44px] hover:bg-black/5 dark:hover:bg-white/5 transition ease-in-out duration-150"
                                  >
                                    <item.icon
                                      className="h-6 w-6 md:h-6 md:w-6 flex-shrink-0 text-[#e03e3e]"
                                      aria-hidden="true"
                                    />
                                    <div className="ml-4 text-left">
                                      <p className="text-sm font-semibold text-[#101216] dark:text-white">
                                        {item.name}
                                      </p>
                                      <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                                        {item.description}
                                      </p>
                                    </div>
                                  </PopoverButton>
                                ))}

                                <button
                                  onClick={() => logout()}
                                  className="flex w-full items-start rounded-md p-3 min-h-[44px] hover:bg-black/5 dark:hover:bg-white/5 transition ease-in-out duration-150"
                                >
                                  <ArrowRightOnRectangleIcon
                                    className="h-6 w-6 md:h-6 md:w-6 flex-shrink-0 text-[#e03e3e]"
                                    aria-hidden="true"
                                  />
                                  <div className="ml-4 text-left">
                                    <p className="text-sm font-semibold text-[#e03e3e]">
                                      Se déconnecter
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#a7adbb]">Fermer la session</p>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </PopoverPanel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                ) : (
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white font-semibold text-[0.8125rem] uppercase tracking-[0.08em] transition-colors py-1.5 min-h-[44px] px-2"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/rejoindre"
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-3.5 py-1.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors shadow-2xs min-h-[44px]"
                    >
                      <UserPlusIcon className="h-3.5 w-3.5" />
                      <span>Rejoindre</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile controls: Theme Toggle + Menu button */}
              <div className="-mr-2 flex items-center gap-1 sm:gap-2 lg:hidden">
                <ThemeToggle variant="icon" />

                <PopoverButton className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#101216] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e03e3e]">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6 md:h-6 md:w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6 md:h-6 md:w-6" aria-hidden="true" />
                  )}
                </PopoverButton>
              </div>
            </div>
          </div>

          {/* Mobile Overlay Backdrop */}
          <Transition
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <PopoverBackdrop className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
          </Transition>

          <Transition
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <PopoverPanel className="absolute top-16 inset-x-0 z-50 origin-top shadow-2xl lg:hidden bg-white dark:bg-[#0a0c10] border-b border-[#e4e0d8] dark:border-white/10 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.3)_transparent]">
              <div className="p-3 sm:p-4 space-y-3.5">
                {/* 1. Sorties & Activités */}
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#5c6370] dark:text-[#a7adbb]">
                    Sorties &amp; Activités
                  </p>
                  <div className="space-y-1 mt-1">
                    {outingsNavigation.map((item) => {
                      const isCurrent =
                        pathname === item.href ||
                        (item.href !== '/' && pathname?.startsWith(`${item.href}/`));
                      return (
                        <PopoverButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between min-h-[44px] py-2 px-3 rounded-lg text-sm font-semibold transition-colors',
                            isCurrent
                              ? 'bg-black/5 dark:bg-white/10 text-[#e03e3e] dark:text-[#e03e3e]'
                              : 'text-[#101216] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                          )}
                          aria-current={isCurrent ? 'page' : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#101216] dark:text-white shrink-0">
                              <item.icon className="h-4 w-4 text-[#e03e3e]" />
                            </div>
                            <div className="text-left">
                              <span className="block text-xs font-bold uppercase tracking-[0.06em] leading-tight">
                                {item.name}
                              </span>
                              <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-tight">
                                {item.description}
                              </span>
                            </div>
                          </div>
                          {item.isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider shrink-0">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              Live
                            </span>
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-[#5c6370] shrink-0" />
                          )}
                        </PopoverButton>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Le Club */}
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#5c6370] dark:text-[#a7adbb]">
                    Le Club
                  </p>

                  {/* Spotlight Card: Rejoindre le Club (Only for visitors who are NOT yet authenticated) */}
                  {!isAuthenticated && (
                    <div className="mt-1 mb-2">
                      <PopoverButton
                        as={Link}
                        href="/rejoindre"
                        className="flex items-center justify-between min-h-[44px] p-3 rounded-lg bg-[#faf8f5] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 hover:border-[#e03e3e] transition-colors group w-full"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-md bg-[#e03e3e] text-white shrink-0 shadow-2xs">
                            <UserPlusIcon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#101216] dark:text-white">Rejoindre le Club</span>
                              <span className="text-xs font-bold uppercase tracking-wider text-[#e03e3e] bg-[#e03e3e]/10 px-1.5 py-0.5 rounded">3 essais</span>
                            </div>
                            <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">Sorties d&apos;essai gratuites &amp; adhésion</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-[#5c6370] group-hover:text-[#e03e3e] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </PopoverButton>
                    </div>
                  )}

                  {/* Submenu Accordion */}
                  <Disclosure as="div" defaultOpen={isClubActive}>
                    {({ open: subOpen }) => (
                      <div className="mt-1">
                        <Disclosure.Button className="flex w-full items-center justify-between min-h-[44px] py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#101216] dark:text-white shrink-0">
                              <ClubCrestIcon className="h-4 w-4 text-[#e03e3e]" />
                            </div>
                            <span>Rubriques du Club</span>
                          </div>
                          <ChevronDownIcon
                            className={cn(subOpen ? 'rotate-180 text-[#e03e3e]' : '', 'h-4 w-4 transition-transform duration-150')}
                            aria-hidden="true"
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-1 space-y-0.5 pl-4 border-l-2 border-[#e03e3e]/30 ml-7 my-1">
                          {[...clubDiscover, ...clubLife].map((item) => {
                            const isCurrent = pathname === item.href;
                            return (
                              <PopoverButton
                                key={item.name}
                                as={Link}
                                href={item.href}
                                className={cn(
                                  'flex items-center justify-between min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold transition-colors',
                                  isCurrent
                                    ? 'bg-black/5 dark:bg-white/10 text-[#e03e3e] font-bold'
                                    : 'text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white'
                                )}
                                aria-current={isCurrent ? 'page' : undefined}
                              >
                                <div className="flex items-center gap-2.5">
                                  <item.icon className="h-4 w-4 text-[#e03e3e] shrink-0" />
                                  <span>{item.name}</span>
                                </div>
                                <ChevronRightIcon className="h-3.5 w-3.5 text-[#5c6370] opacity-50 group-hover:opacity-100 group-hover:text-[#e03e3e] shrink-0" />
                              </PopoverButton>
                            );
                          })}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                </div>

                {/* 3. Communauté */}
                <div>
                  <p className="px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#5c6370] dark:text-[#a7adbb]">
                    Communauté
                  </p>
                  <div className="space-y-1 mt-1">
                    {communityNavigation.map((item) => {
                      const isCurrent =
                        pathname === item.href ||
                        (item.href !== '/' && pathname?.startsWith(`${item.href}/`));
                      return (
                        <PopoverButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between min-h-[44px] py-2 px-3 rounded-lg text-sm font-semibold transition-colors',
                            isCurrent
                              ? 'bg-black/5 dark:bg-white/10 text-[#e03e3e] dark:text-[#e03e3e]'
                              : 'text-[#101216] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                          )}
                          aria-current={isCurrent ? 'page' : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#101216] dark:text-white shrink-0">
                              <item.icon className="h-4 w-4 text-[#e03e3e]" />
                            </div>
                            <div className="text-left">
                              <span className="block text-xs font-bold uppercase tracking-[0.06em] leading-tight">
                                 {item.name}
                              </span>
                              <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-tight">
                                 {item.description}
                              </span>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 text-[#5c6370] shrink-0" />
                        </PopoverButton>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Auth Controls */}
              <div className="border-t border-[#e4e0d8] dark:border-white/10 p-3 sm:p-4 bg-[#faf8f5]/60 dark:bg-white/[0.02]">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          <Image
                            className="h-10 w-10 rounded-full border border-[#e4e0d8] dark:border-white/10 object-cover"
                            src={user?.avatarUrl || '/images/default-avatar.svg'}
                            alt={user?.name || 'User avatar'}
                            width={40}
                            height={40}
                            unoptimized={!user?.avatarUrl?.includes('cloudinary.com')}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#101216] dark:text-white truncate">
                            {user?.name}
                          </div>
                          <div className="text-xs text-[#5c6370] dark:text-[#a7adbb] truncate">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border',
                          isAdmin
                            ? 'bg-[#e03e3e]/10 text-[#e03e3e] border-[#e03e3e]/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        )}
                      >
                        {isAdmin ? 'Admin' : 'Membre'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {[...userNavigation, ...adminNavigation].map((item) => (
                        <PopoverButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className="flex items-center gap-3 min-h-[44px] px-3 py-2 text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white rounded-md transition-colors"
                        >
                          <item.icon className="h-4 w-4 text-[#e03e3e] shrink-0" />
                          <span>{item.name}</span>
                        </PopoverButton>
                      ))}
                      <PopoverButton
                        as="button"
                        onClick={() => logout()}
                        className="flex items-center gap-3 min-h-[44px] w-full text-left px-3 py-2 text-xs font-semibold text-[#e03e3e] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 text-[#e03e3e] shrink-0" />
                        <span>Se déconnecter</span>
                      </PopoverButton>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <PopoverButton
                      as={Link}
                      href="/login"
                      className="flex items-center justify-center min-h-[44px] rounded-md border border-[#e4e0d8] dark:border-white/10 text-xs font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      Connexion
                    </PopoverButton>
                    <PopoverButton
                      as={Link}
                      href="/rejoindre"
                      className="flex items-center justify-center min-h-[44px] rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-[0.06em] shadow-2xs transition-colors"
                    >
                      Rejoindre
                    </PopoverButton>
                  </div>
                )}
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
