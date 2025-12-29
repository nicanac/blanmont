
'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel, Transition, PopoverBackdrop } from '@headlessui/react';
import {
    UserIcon,
    ShoppingBagIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    PlusCircleIcon,
    CloudArrowUpIcon,
    ChevronDownIcon,
    MapIcon,
    CalendarIcon,
    TrophyIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuth();

    const mainNavigation = [
        { name: 'Sortie du Samedi', href: '/saturday-ride' },
        { name: 'Membres', href: '/members' },
    ];

    const clubNavigation = [
        { name: 'Présentation', description: 'Qui sommes-nous ?', href: '/le-club', icon: InformationCircleIcon },
        { name: 'Parcours', description: 'Nos traces GPS', href: '/traces', icon: MapIcon },
        { name: 'Calendrier', description: 'Agenda de la saison', href: '/calendrier', icon: CalendarIcon },
        { name: 'Carré Vert', description: 'Classement', href: '/leaderboard', icon: TrophyIcon },
    ];

    const userNavigation = [
        { name: 'Mon Compte', description: 'Gérer mon profil', href: '/profile', icon: UserIcon },
        { name: 'Mes Parcours', description: 'Mes traces enregistrées', href: '#', icon: ShoppingBagIcon },
        { name: 'Admin (Add Trace)', description: 'Ajouter une trace', href: '/admin/add-trace', icon: PlusCircleIcon },
        { name: 'Import Strava', description: 'Importer depuis Strava', href: '/import/strava', icon: CloudArrowUpIcon },
    ];

    return (
        <Popover as="nav" className={`${pathname === '/' ? 'absolute z-50 w-full bg-transparent' : 'bg-white border-b border-gray-100'} `}>
            {({ open, close }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">

                            {/* Left Side: Logo | Divider | Links */}
                            <div className="flex items-center">
                                {/* Logo */}
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/" className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
                                            BLANMONT
                                        </span>
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="hidden sm:block h-6 w-px bg-gray-300 mx-6"></div>

                                {/* Navigation Links */}
                                <div className="hidden sm:flex sm:space-x-8 items-center">
                                    {mainNavigation.map((item) => {
                                        const isCurrent = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    'text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors'
                                                )}
                                                aria-current={isCurrent ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}

                                    {/* Le Club Popover */}
                                    <Popover className="relative">
                                        {({ open }) => (
                                            <>
                                                <PopoverButton
                                                    className={classNames(
                                                        open ? 'text-gray-900' : 'text-gray-900',
                                                        'group inline-flex items-center rounded-md text-sm font-medium hover:text-gray-600 focus:outline-none'
                                                    )}
                                                >
                                                    <span>Le Club</span>
                                                    <ChevronDownIcon
                                                        className={classNames(
                                                            open ? 'text-gray-600 rotate-180' : 'text-gray-400',
                                                            'ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-gray-500'
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
                                                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                                                {clubNavigation.map((item) => (
                                                                    <PopoverButton
                                                                        key={item.name}
                                                                        as={Link}
                                                                        href={item.href}
                                                                        className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50 transition ease-in-out duration-150"
                                                                    >
                                                                        <item.icon className="h-6 w-6 flex-shrink-0 text-brand-primary" aria-hidden="true" />
                                                                        <div className="ml-4 text-left">
                                                                            <p className="text-base font-medium text-gray-900">{item.name}</p>
                                                                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
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
                                                <PopoverButton className="flex items-center text-gray-900 hover:text-gray-600 focus:outline-none">
                                                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                                                    {user?.avatarUrl ? (
                                                        <img
                                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
                                                            src={user.avatarUrl}
                                                            alt={user.name || "User avatar"}
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
                                                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                                                <div className="-m-3 p-3 border-b border-gray-100 pb-4 mb-1">
                                                                    <p className="text-xs text-gray-500">Connecté en tant que</p>
                                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                                                </div>

                                                                {userNavigation.map((item) => (
                                                                    <PopoverButton
                                                                        key={item.name}
                                                                        as={Link}
                                                                        href={item.href}
                                                                        className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50 transition ease-in-out duration-150"
                                                                    >
                                                                        <item.icon className="h-6 w-6 flex-shrink-0 text-brand-primary" aria-hidden="true" />
                                                                        <div className="ml-4 text-left">
                                                                            <p className="text-base font-medium text-gray-900">{item.name}</p>
                                                                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                                                        </div>
                                                                    </PopoverButton>
                                                                ))}

                                                                <button
                                                                    onClick={() => logout()}
                                                                    className="-m-3 flex w-full items-start rounded-lg p-3 hover:bg-gray-50 transition ease-in-out duration-150"
                                                                >
                                                                    <ArrowRightOnRectangleIcon className="h-6 w-6 flex-shrink-0 text-red-500" aria-hidden="true" />
                                                                    <div className="ml-4 text-left">
                                                                        <p className="text-base font-medium text-red-600">Se déconnecter</p>
                                                                        <p className="mt-1 text-sm text-gray-500">Fermer la session</p>
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
                                        <Link href="/login" className="text-gray-900 hover:text-gray-600 font-medium text-sm">
                                            Se connecter
                                        </Link>
                                        <button onClick={() => { }} className="text-gray-900 hover:text-gray-600">
                                            <span className="sr-only">Se connecter</span>
                                            <UserIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <div className="-mr-2 flex items-center sm:hidden">
                                <PopoverButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
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
                        <PopoverBackdrop className="fixed inset-0 bg-black/25 z-40 sm:hidden" />
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
                        <PopoverPanel className="absolute top-16 inset-x-0 z-50 origin-top shadow-lg sm:hidden bg-white border-b border-gray-200">
                            <div className="space-y-1 pb-3 pt-2">
                                {mainNavigation.map((item) => {
                                    const isCurrent = pathname === item.href;
                                    return (
                                        <PopoverButton
                                            key={item.name}
                                            as={Link}
                                            href={item.href}
                                            className={classNames(
                                                isCurrent
                                                    ? 'bg-gray-50 border-l-4 border-gray-900 text-gray-900'
                                                    : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                                                'block py-2 pl-3 pr-4 text-base font-medium'
                                            )}
                                            aria-current={isCurrent ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </PopoverButton>
                                    );
                                })}

                                {/* Mobile Le Club Dropdown using nested Disclosure */}
                                <Disclosure as="div" className="border-l-4 border-transparent">
                                    {({ open: subOpen }) => ( // Renamed to avoid confusion with parent Popover open
                                        <>
                                            <Disclosure.Button
                                                className={classNames(
                                                    'flex w-full items-center justify-between py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                                )}
                                            >
                                                <span className="flex-1 text-left">Le Club</span>
                                                <ChevronDownIcon
                                                    className={classNames(
                                                        subOpen ? 'rotate-180' : '',
                                                        'h-5 w-5 flex-none'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                            </Disclosure.Button>
                                            <Disclosure.Panel className="mt-2 space-y-1 pl-4">
                                                {clubNavigation.map((item) => (
                                                    <PopoverButton
                                                        key={item.name}
                                                        as={Link}
                                                        href={item.href}
                                                        className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                    >
                                                        {item.name}
                                                    </PopoverButton>
                                                ))}
                                            </Disclosure.Panel>
                                        </>
                                    )}
                                </Disclosure>
                            </div>
                            <div className="border-t border-gray-200 pb-3 pt-4">
                                {isAuthenticated ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center px-4">
                                            <div className="flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-full"
                                                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                                    alt=""
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                                                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 space-y-1">
                                            {userNavigation.map((item) => (
                                                <PopoverButton
                                                    key={item.name}
                                                    as={Link}
                                                    href={item.href}
                                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                                >
                                                    {item.name}
                                                </PopoverButton>
                                            ))}
                                            <PopoverButton
                                                as="button"
                                                onClick={() => logout()}
                                                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                            >
                                                Log out
                                            </PopoverButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 px-4">
                                        <PopoverButton as={Link} href="/login" className="block text-base font-medium text-gray-500 hover:text-gray-900">
                                            Log in
                                        </PopoverButton>
                                        <PopoverButton as={Link} href="/register" className="block text-base font-medium text-gray-500 hover:text-gray-900">
                                            Sign up
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
