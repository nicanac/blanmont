'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  MapIcon,
  CheckBadgeIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import AdminGuard from './components/AdminGuard';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
  { name: 'Sondages Weekend', href: '/admin/sondages', icon: ChatBubbleLeftRightIcon },
  { name: 'Les News / Blog', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'Membres', href: '/admin/members', icon: UsersIcon },
  { name: 'Événements & Sorties', href: '/admin/events', icon: CalendarIcon },
  { name: 'Équipements Club', href: '/admin/equipements', icon: ShoppingBagIcon },
  { name: 'Carré Vert', href: '/admin/carre-vert', icon: CheckBadgeIcon },
  { name: 'Statistiques', href: '/admin/statistics', icon: ChartBarIcon },
  { name: 'Traces GPS', href: '/admin/traces', icon: MapIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0a0c10] text-white border-r border-[#262b38]">
      {/* Logo / Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-[#262b38]">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e03e3e]">
          <span className="text-white font-extrabold text-xs">CC</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-tight text-white truncate">
            Blan<span className="text-[#e03e3e]">mont</span>
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7d8493]">
            Administration
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeSidebar}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                isActive
                  ? 'bg-[#e03e3e] text-white shadow-xs'
                  : 'text-[#a7adbb] hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-white' : 'text-[#7d8493] group-hover:text-white'
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Site */}
      <div className="border-t border-[#262b38] p-4">
        <Link
          href="/"
          onClick={closeSidebar}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#7d8493] hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Retour au site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#faf8f5]">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#262b38] bg-[#0a0c10] px-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#e03e3e]">
              <span className="text-white font-bold text-xs">CC</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Admin Blanmont
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-[#a7adbb] hover:bg-white/10 hover:text-white"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeSidebar} aria-hidden="true" />
            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0c10]">
              <div className="absolute right-2 top-3">
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="rounded-md p-1.5 text-[#7d8493] hover:text-white"
                >
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:w-64">
          {sidebarContent}
        </aside>

        {/* Main Content */}
        <main className="md:pl-64">
          <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
