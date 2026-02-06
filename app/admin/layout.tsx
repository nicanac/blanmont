'use client';

import React from 'react';
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
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import AdminGuard from './components/AdminGuard';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Les News', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'Members', href: '/admin/members', icon: UsersIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon },
  { name: 'Carré Vert', href: '/admin/carre-vert', icon: CheckBadgeIcon },
  { name: 'Statistics', href: '/admin/statistics', icon: ChartBarIcon },
  { name: 'Traces', href: '/admin/traces', icon: MapIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 pt-16">
          <div className="flex h-full flex-col">
            {/* Logo / Brand */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                <span className="text-white font-bold text-sm">BCC</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">BLANMONT</p>
                <p className="text-xs text-gray-400">CYCLING CLUB</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Back to Site */}
            <div className="border-t border-gray-800 p-4">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Site
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pl-64 pt-16">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
