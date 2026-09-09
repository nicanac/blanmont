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
  TrophyIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
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

  const mainNavigation = [
    { name: 'Les News', href: '/blog' },
    { name: 'Membres', href: '/members' },
    {
      name: 'Calendrier',
      description: 'Agenda de la saison',
      href: '/calendrier',
      icon: CalendarIcon,
    },
    {
      name: 'Sondage Weekend',
      description: 'Qui roule ce weekend ?',
      href: '/sondage',
      icon: ChatBubbleLeftRightIcon,
      isLive: true,
    },
  ];

  const clubNavigation = [
    {
      name: 'Présentation',
      description: 'Qui sommes-nous ?',
      href: '/le-club',
      icon: ClubCrestIcon,
      tag: 'Le Club',
    },
    {
      name: 'Équipement',
      description: 'Collection 2026',
      href: '/le-club/equipement',
      icon: JerseyIcon,
      tag: 'Boutique',
    },
    {
      name: 'Carré Vert',
      description: 'Classement & Assiduité',
      href: '/leaderboard',
      icon: TrophySquareIcon,
      tag: 'Challenge',
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
              <div className="flex items-center">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-xl font-extrabold uppercase tracking-[-0.02em] text-[#101216] dark:text-white font-sans">
                      Blan<span className="text-[#e03e3e]">mont</span>
                    </span>
                    <span className="hidden md:inline-block text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#5c6370] dark:text-[#7d8493] border-l border-[#e4e0d8] dark:border-white/15 pl-2.5 leading-tight">
                      Cyclo Club
                      <br />
                      Saint-Martin
                    </span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="hidden lg:block h-6 w-px bg-[#e4e0d8] dark:bg-white/15 mx-4 xl:mx-6"></div>

                {/* Navigation Links */}
                <div className="hidden lg:flex lg:space-x-5 xl:space-x-7 items-center">
                  {mainNavigation.map((item) => {
                    const isCurrent = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'relative text-[0.8125rem] font-semibold uppercase tracking-[0.08em] transition-colors inline-flex items-center gap-1.5 py-1',
                          isCurrent
                            ? 'text-[#101216] dark:text-white after:absolute after:-bottom-[21px] after:left-0 after:right-0 after:h-0.5 after:bg-[#e03e3e]'
                            : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
                        )}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        <span>{item.name}</span>
                        {item.isLive && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Le Club Popover */}
                  <Popover className="relative self-center -mt-px">
                    {({ open }) => (
                      <>
                        <PopoverButton
                          className={cn(
                            'group inline-flex items-center text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white transition-colors focus:outline-none'
                          )}
                        >
                          <span>Le Club</span>
                          <ChevronDownIcon
                            className={cn(
                              open ? 'text-[#e03e3e] rotate-180' : 'text-[#7d8493]',
                              'ml-1.5 h-4 w-4 transition duration-150 ease-in-out group-hover:text-[#101216] dark:group-hover:text-white'
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
                          <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-2 sm:px-0">
                            <div className="overflow-hidden rounded-lg shadow-2xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922]">
                              <div className="relative grid gap-1.5 p-3">
                                {clubNavigation.map((item) => (
                                  <PopoverButton
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className="flex items-center rounded-md p-3 hover:bg-[#faf8f5] dark:hover:bg-white/5 border border-transparent hover:border-[#e4e0d8] dark:hover:border-white/10 transition-all duration-200 group"
                                  >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] transition-all duration-200 group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white shadow-2xs group-hover:shadow-md group-hover:shadow-[#e03e3e]/20">
                                      <item.icon
                                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="ml-3.5 text-left flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors">
                                          {item.name}
                                        </p>
                                        <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#7d8493] dark:text-[#a7adbb] bg-[#f2efe9] dark:bg-white/5 px-2 py-0.5 rounded border border-[#e4e0d8] dark:border-white/10">
                                          {item.tag}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#7d8493] truncate">
                                        {item.description}
                                      </p>
                                    </div>
                                    <ChevronRightIcon className="ml-2 h-4 w-4 text-[#7d8493] dark:text-[#a7adbb] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#e03e3e] transition-all duration-150 shrink-0 self-center" />
                                  </PopoverButton>
                                ))}
                              </div>
                            </div>
                          </PopoverPanel>
                        </Transition>
                      </>
                    )}
                  </Popover>
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
                        <PopoverButton className="group inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[#e4e0d8] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-[#101216] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#e03e3e]/40">
                          <span className="sr-only">Ouvrir le menu utilisateur</span>
                          {user?.avatarUrl ? (
                            <Image
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20 group-hover:ring-[#e03e3e]/50 transition-colors"
                              src={user.avatarUrl}
                              alt={user.name || 'User avatar'}
                              width={32}
                              height={32}
                              unoptimized={!user.avatarUrl.includes('cloudinary.com')}
                            />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[#101216] dark:text-white ring-1 ring-black/10 dark:ring-white/20">
                              <UserIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                          <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#3a3f4a] dark:text-[#d5d9e2] group-hover:text-[#101216] dark:group-hover:text-white transition-colors select-none">
                            Mon Compte
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              open ? 'text-[#e03e3e] rotate-180' : 'text-[#7d8493]',
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
                                  <p className="text-xs text-[#5c6370] dark:text-[#7d8493]">Connecté en tant que</p>
                                  <p className="text-sm font-semibold text-[#101216] dark:text-white truncate">
                                    {user?.name}
                                  </p>
                                </div>

                                {[...userNavigation, ...adminNavigation].map((item) => (
                                  <PopoverButton
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className="flex items-start rounded-md p-3 hover:bg-black/5 dark:hover:bg-white/5 transition ease-in-out duration-150"
                                  >
                                    <item.icon
                                      className="h-6 w-6 flex-shrink-0 text-[#e03e3e]"
                                      aria-hidden="true"
                                    />
                                    <div className="ml-4 text-left">
                                      <p className="text-sm font-semibold text-[#101216] dark:text-white">
                                        {item.name}
                                      </p>
                                      <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#7d8493]">
                                        {item.description}
                                      </p>
                                    </div>
                                  </PopoverButton>
                                ))}

                                <button
                                  onClick={() => logout()}
                                  className="flex w-full items-start rounded-md p-3 hover:bg-black/5 dark:hover:bg-white/5 transition ease-in-out duration-150"
                                >
                                  <ArrowRightOnRectangleIcon
                                    className="h-6 w-6 flex-shrink-0 text-[#e03e3e]"
                                    aria-hidden="true"
                                  />
                                  <div className="ml-4 text-left">
                                    <p className="text-sm font-semibold text-[#e03e3e]">
                                      Se déconnecter
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#5c6370] dark:text-[#7d8493]">Fermer la session</p>
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
                      className="text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white font-semibold text-[0.8125rem] uppercase tracking-[0.08em] transition-colors"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-4 py-2 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors"
                    >
                      Espace Membre
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
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
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
            <PopoverPanel className="absolute top-16 inset-x-0 z-50 origin-top shadow-2xl lg:hidden bg-white dark:bg-[#0a0c10] border-b border-[#e4e0d8] dark:border-white/10">
              <div className="space-y-1 pb-3 pt-2 px-2">
                {mainNavigation.map((item) => {
                  const isCurrent = pathname === item.href;
                  return (
                    <PopoverButton
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={cn(
                        isCurrent
                          ? 'bg-black/5 dark:bg-white/10 text-[#101216] dark:text-white font-semibold'
                          : 'text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white',
                        'flex items-center justify-between py-2.5 px-4 rounded-md text-sm font-semibold uppercase tracking-[0.08em] transition-colors'
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      <span>{item.name}</span>
                      {item.isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </PopoverButton>
                  );
                })}

                {/* Mobile Le Club Dropdown using nested Disclosure */}
                <Disclosure as="div" className="px-1">
                  {(
                    { open: subOpen } // Renamed to avoid confusion with parent Popover open
                  ) => (
                    <>
                      <Disclosure.Button
                        className={cn(
                          'flex w-full items-center justify-between py-2.5 px-3 rounded-md text-sm font-semibold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white'
                        )}
                      >
                        <span className="flex-1 text-left">Le Club</span>
                        <ChevronDownIcon
                          className={cn(subOpen ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-1 space-y-1 pl-3">
                        {clubNavigation.map((item) => (
                          <PopoverButton
                            key={item.name}
                            as={Link}
                            href={item.href}
                            className="flex items-center gap-3 py-2 px-3 rounded-md text-sm font-semibold text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white group"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-white/5 border border-[#e4e0d8] dark:border-white/10 text-[#101216] dark:text-white group-hover:border-[#e03e3e] group-hover:text-[#e03e3e] shrink-0">
                              <item.icon className="h-4 w-4" />
                            </div>
                            <span className="flex-1 text-left">{item.name}</span>
                            <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[#7d8493] dark:text-[#a7adbb] bg-[#f2efe9] dark:bg-white/5 px-2 py-0.5 rounded border border-[#e4e0d8] dark:border-white/10">
                              {item.tag}
                            </span>
                          </PopoverButton>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="border-t border-[#e4e0d8] dark:border-white/10 pb-3 pt-3">
                {/* Mobile Theme Switcher Row */}
                <div className="flex items-center justify-between px-4 py-2.5 mb-2 border-b border-[#e4e0d8]/60 dark:border-white/5">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb]">
                    Thème d&apos;affichage
                  </span>
                  <ThemeToggle variant="pill" />
                </div>

                {isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={user?.avatarUrl || '/images/default-avatar.svg'}
                          alt={user?.name || 'User avatar'}
                          width={40}
                          height={40}
                          unoptimized={!user?.avatarUrl?.includes('cloudinary.com')}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#e03e3e]">
                          Mon Compte
                        </div>
                        <div className="text-base font-medium text-[#101216] dark:text-white">{user?.name}</div>
                        <div className="text-sm font-medium text-[#5c6370] dark:text-[#7d8493]">{user?.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {[...userNavigation, ...adminNavigation].map((item) => (
                        <PopoverButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className="block px-4 py-2 text-sm font-medium text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white rounded-md"
                        >
                          {item.name}
                        </PopoverButton>
                      ))}
                      <PopoverButton
                        as="button"
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2 text-sm font-medium text-[#e03e3e] hover:bg-black/5 dark:hover:bg-white/5 rounded-md"
                      >
                        Se déconnecter
                      </PopoverButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <PopoverButton
                      as={Link}
                      href="/login"
                      className="block text-sm font-semibold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white"
                    >
                      Se connecter
                    </PopoverButton>
                    <PopoverButton
                      as={Link}
                      href="/login"
                      className="inline-flex items-center rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-4 py-2 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors"
                    >
                      Espace Membre
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
