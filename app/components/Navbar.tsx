'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
    MagnifyingGlassIcon,
    UserIcon,
    ShoppingBagIcon,
    HeartIcon,
    LifebuoyIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    PlusCircleIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const pathname = usePathname();
    const { user, login, logout, isAuthenticated } = useAuth();

    const navigation = [
        { name: 'Parcours', href: '/traces' },
        { name: 'Sortie du Samedi', href: '/saturday-ride' },
        { name: 'Membres', href: '/members' },
        { name: 'Carré Vert', href: '/leaderboard' },
        { name: 'Calendrier', href: '/calendrier' },
        { name: 'Le Club', href: '/le-club' },
        { name: 'Le Club', href: '/le-club' },
    ];

    return (
        <Disclosure as="nav" className={`${pathname === '/' ? 'absolute z-50 w-full bg-transparent' : 'bg-white border-b border-gray-100'}`}>
            {({ open }) => (
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
                                <div className="hidden sm:flex sm:space-x-8">
                                    {navigation.map((item) => {
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
                                </div>
                            </div>

                            {/* Right Side: Icons */}
                            <div className="hidden sm:flex items-center space-x-6">


                                {/* User Menu / Login */}
                                {isAuthenticated ? (
                                    <Menu as="div" className="relative">
                                        <div>
                                            <MenuButton className="flex items-center text-gray-900 hover:text-gray-600 focus:outline-none">
                                                <span className="sr-only">Ouvrir le menu utilisateur</span>
                                                <UserIcon className="h-6 w-6" aria-hidden="true" />
                                            </MenuButton>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div className="px-4 py-3">
                                                    <p className="text-xs text-gray-500">Connecté en tant que</p>
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                                </div>
                                                <div className="py-1">
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <Link
                                                                href="/profile"
                                                                className={classNames(
                                                                    focus ? 'bg-gray-50' : '',
                                                                    'flex items-center px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                <UserIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                Mon Compte
                                                            </Link>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <Link
                                                                href="#"
                                                                className={classNames(
                                                                    focus ? 'bg-gray-50' : '',
                                                                    'flex items-center px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                <ShoppingBagIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                Mes Parcours
                                                            </Link>
                                                        )}
                                                    </MenuItem>
                                                </div>
                                                <div className="py-1">
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <Link
                                                                href="/admin/add-trace"
                                                                className={classNames(
                                                                    focus ? 'bg-gray-50' : '',
                                                                    'flex items-center px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                <PlusCircleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                Admin (Add Trace)
                                                            </Link>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <Link
                                                                href="/import/strava"
                                                                className={classNames(
                                                                    focus ? 'bg-gray-50' : '',
                                                                    'flex items-center px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                <CloudArrowUpIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                Import Strava
                                                            </Link>
                                                        )}
                                                    </MenuItem>
                                                </div>
                                                <div className="py-1">
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <button
                                                                onClick={() => logout()}
                                                                className={classNames(
                                                                    focus ? 'bg-gray-50' : '',
                                                                    'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                Log out
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                </div>
                                            </MenuItems>
                                        </Transition>
                                    </Menu>
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
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden bg-white border-b border-gray-200">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => {
                                const isCurrent = pathname === item.href;
                                return (
                                    <Disclosure.Button
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
                                    </Disclosure.Button>
                                );
                            })}
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
                                        <Disclosure.Button
                                            as={Link}
                                            href="/profile"
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            My Account
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={Link}
                                            href="/admin/add-trace"
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            Admin (Add Trace)
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={Link}
                                            href="/import/strava"
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            Import Strava
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as="button"
                                            onClick={() => logout()}
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            Log out
                                        </Disclosure.Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1 px-4">
                                    <Link href="/login" className="block text-base font-medium text-gray-500 hover:text-gray-900">
                                        Log in
                                    </Link>
                                    <Link href="/register" className="block text-base font-medium text-gray-500 hover:text-gray-900">
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
