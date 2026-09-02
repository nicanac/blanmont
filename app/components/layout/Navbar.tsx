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
  CalendarIcon,
  TrophyIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function Navbar() {
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
      icon: InformationCircleIcon,
      iconBg: 'bg-white/10 text-white',
    },
    {
      name: 'Équipement',
      description: 'Collection 2026',
      href: '/le-club/equipement',
      icon: ShoppingBagIcon,
      iconBg: 'bg-amber-400/10 text-amber-400',
    },
    {
      name: 'Carré Vert',
      description: 'Classement & Assiduité',
      href: '/leaderboard',
      icon: TrophyIcon,
      iconBg: 'bg-emerald-400/10 text-emerald-400',
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

  return (
    <Popover
      as="nav"
      className="sticky top-0 z-50 w-full bg-[#0a0c10]/95 backdrop-blur-md border-b border-white/10"
    >
      {({ open, close }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Left Side: Logo | Divider | Links */}
              <div className="flex items-center">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-xl font-extrabold uppercase tracking-[-0.02em] text-white font-sans">
                      Blan<span className="text-[#e03e3e]">mont</span>
                    </span>
                    <span className="hidden md:inline-block text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#7d8493] border-l border-white/15 pl-2.5 leading-tight">
                      Cyclo Club
                      <br />
                      Saint-Martin
                    </span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-6 w-px bg-white/15 mx-6"></div>

                {/* Navigation Links */}
                <div className="hidden sm:flex sm:space-x-7 items-center">
                  {mainNavigation.map((item) => {
                    const isCurrent = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'relative text-[0.8125rem] font-semibold uppercase tracking-[0.08em] transition-colors inline-flex items-center gap-1.5 py-1',
                          isCurrent
                            ? 'text-white after:absolute after:-bottom-[21px] after:left-0 after:right-0 after:h-0.5 after:bg-[#e03e3e]'
                            : 'text-[#a7adbb] hover:text-white'
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
                            'group inline-flex items-center text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#a7adbb] hover:text-white transition-colors focus:outline-none'
                          )}
                        >
                          <span>Le Club</span>
                          <ChevronDownIcon
                            className={cn(
                              open ? 'text-[#e03e3e] rotate-180' : 'text-[#5c6370]',
                              'ml-1.5 h-4 w-4 transition duration-150 ease-in-out group-hover:text-white'
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
                            <div className="overflow-hidden rounded-md shadow-2xl border border-[#262b38] bg-[#161922]">
                              <div className="relative grid gap-2 px-3 py-3 sm:p-4">
                                {clubNavigation.map((item) => (
                                  <PopoverButton
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className="flex items-start rounded-md p-3 hover:bg-white/5 transition ease-in-out duration-150 group"
                                  >
                                    <div className={cn('p-2 rounded-md flex-shrink-0 transition-transform group-hover:scale-105', item.iconBg || 'bg-white/10 text-white')}>
                                      <item.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="ml-4 text-left">
                                      <p className="text-sm font-semibold text-white group-hover:text-[#e03e3e] transition-colors">
                                        {item.name}
                                      </p>
                                      <p className="mt-0.5 text-xs text-[#7d8493]">
                                        {item.description}
                                      </p>
                                    </div>
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

              {/* Right Side: Icons */}
              <div className="hidden sm:flex items-center space-x-6">
                {/* User Menu / Login */}
                {isAuthenticated ? (
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <PopoverButton className="flex items-center text-white hover:text-[#a7adbb] focus:outline-none">
                          <span className="sr-only">Ouvrir le menu utilisateur</span>
                          {user?.avatarUrl ? (
                            <Image
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
                              src={user.avatarUrl}
                              alt={user.name || 'User avatar'}
                              width={32}
                              height={32}
                              unoptimized={!user.avatarUrl.includes('cloudinary.com')}
                            />
                          ) : (
                            <UserIcon className="h-6 w-6" aria-hidden="true" />
                          )}
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
                            <div className="overflow-hidden rounded-md shadow-2xl border border-[#262b38] bg-[#161922]">
                              <div className="relative grid gap-2 px-3 py-3 sm:p-4">
                                <div className="p-3 border-b border-[#262b38] pb-4 mb-1">
                                  <p className="text-xs text-[#7d8493]">Connecté en tant que</p>
                                  <p className="text-sm font-semibold text-white truncate">
                                    {user?.name}
                                  </p>
                                </div>

                                {[...userNavigation, ...adminNavigation].map((item) => (
                                  <PopoverButton
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className="flex items-start rounded-md p-3 hover:bg-white/5 transition ease-in-out duration-150"
                                  >
                                    <item.icon
                                      className="h-6 w-6 flex-shrink-0 text-[#e03e3e]"
                                      aria-hidden="true"
                                    />
                                    <div className="ml-4 text-left">
                                      <p className="text-sm font-semibold text-white">
                                        {item.name}
                                      </p>
                                      <p className="mt-0.5 text-xs text-[#7d8493]">
                                        {item.description}
                                      </p>
                                    </div>
                                  </PopoverButton>
                                ))}

                                <button
                                  onClick={() => logout()}
                                  className="flex w-full items-start rounded-md p-3 hover:bg-white/5 transition ease-in-out duration-150"
                                >
                                  <ArrowRightOnRectangleIcon
                                    className="h-6 w-6 flex-shrink-0 text-[#e03e3e]"
                                    aria-hidden="true"
                                  />
                                  <div className="ml-4 text-left">
                                    <p className="text-sm font-semibold text-[#e03e3e]">
                                      Se déconnecter
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#7d8493]">Fermer la session</p>
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
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/login"
                      className="text-[#a7adbb] hover:text-white font-semibold text-[0.8125rem] uppercase tracking-[0.08em] transition-colors"
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

              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center sm:hidden">
                <PopoverButton className="relative inline-flex items-center justify-center rounded-md p-2 text-[#a7adbb] hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e03e3e]">
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
            <PopoverBackdrop className="fixed inset-0 bg-black/50 z-40 sm:hidden" />
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
            <PopoverPanel className="absolute top-16 inset-x-0 z-50 origin-top shadow-2xl sm:hidden bg-[#0a0c10] border-b border-white/10">
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
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-[#a7adbb] hover:bg-white/5 hover:text-white',
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
                          'flex w-full items-center justify-between py-2.5 px-3 rounded-md text-sm font-semibold uppercase tracking-[0.08em] text-[#a7adbb] hover:bg-white/5 hover:text-white'
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
                            className="block py-2 px-3 rounded-md text-sm font-medium text-[#a7adbb] hover:bg-white/5 hover:text-white"
                          >
                            {item.name}
                          </PopoverButton>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="border-t border-white/10 pb-3 pt-4">
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
                        <div className="text-base font-medium text-white">{user?.name}</div>
                        <div className="text-sm font-medium text-[#7d8493]">{user?.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {[...userNavigation, ...adminNavigation].map((item) => (
                        <PopoverButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className="block px-4 py-2 text-sm font-medium text-[#a7adbb] hover:bg-white/5 hover:text-white rounded-md"
                        >
                          {item.name}
                        </PopoverButton>
                      ))}
                      <PopoverButton
                        as="button"
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2 text-sm font-medium text-[#e03e3e] hover:bg-white/5 rounded-md"
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
                      className="block text-sm font-semibold uppercase tracking-[0.08em] text-[#a7adbb] hover:text-white"
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
