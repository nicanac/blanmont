'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  PhotoIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';
import { cn } from '../utils/cn';
import AdminGuard from './components/AdminGuard';
import AdminHelpModal from './components/AdminHelpModal';
import AdminTopbar from './components/AdminTopbar';
import AdminCommandPalette from './components/AdminCommandPalette';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  matchExtra?: string[];
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
    ],
  },
  {
    title: 'Rituels & Sorties',
    items: [
      {
        name: 'Sondages Weekend',
        href: '/admin/sondages',
        icon: ChatBubbleLeftRightIcon,
        badge: 'Hebdo',
      },
      {
        name: 'Événements & Sorties',
        href: '/admin/events',
        icon: CalendarIcon,
        matchExtra: ['/admin/events/import', '/admin/events/new'],
      },
      // Masqué temporairement / Hidden for now
      // {
      //   name: 'Traces & Parcours GPS',
      //   href: '/admin/traces',
      //   icon: MapIcon,
      //   badge: 'GPX',
      //   matchExtra: ['/admin/add-trace'],
      // },
      {
        name: 'Pointage Carré Vert',
        href: '/admin/carre-vert',
        icon: TrophySquareIcon,
      },
    ],
  },
  {
    title: 'Contenu',
    items: [
      { name: 'Bannière Accueil', href: '/admin/hero', icon: PhotoIcon },
      { name: 'Articles & Blog', href: '/admin/blog', icon: DocumentTextIcon },
      { name: 'Équipements Club', href: '/admin/equipements', icon: JerseyIcon },
    ],
  },
  {
    title: 'Organisation & Système',
    items: [
      { name: 'Membres du Club', href: '/admin/members', icon: UsersIcon },
      { name: 'Statistiques', href: '/admin/statistics', icon: ChartBarIcon },
      { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon, matchExtra: ['/admin/parametres'] },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Initialize collapse preference from localStorage safely
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('cc_admin_sidebar_collapsed');
        if (stored === 'true') {
          setIsCollapsed(true);
        }
      } catch {
        // localStorage may be disabled
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebarCollapse = useCallback((): void => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cc_admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Keyboard shortcuts (Cmd/Ctrl + B for sidebar, Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const [hoveredTooltip, setHoveredTooltip] = useState<{
    name: string;
    badge?: string;
    top: number;
  } | null>(null);

  useEffect(() => {
    setHoveredTooltip(null);
  }, [isCollapsed, pathname]);

  const handleResetOnboarding = (): void => {
    window.dispatchEvent(new CustomEvent('cc_admin_reset_onboarding'));
  };

  const isItemActive = useCallback(
    (item: NavigationItem) => {
      if (item.href === '/admin') {
        return pathname === '/admin';
      }
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        return true;
      }
      if (item.matchExtra?.some((extra) => pathname === extra || pathname.startsWith(extra + '/'))) {
        return true;
      }
      return false;
    },
    [pathname]
  );

  // Render navigation links list
  const renderNavItems = (isDrawer = false): React.ReactElement => (
    <div className="space-y-6 px-3 py-4">
      {navigationGroups.map((group) => (
        <div key={group.title}>
          {(!isCollapsed || isDrawer) && (
            <h3 className="px-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#7d8493] mb-1.5">
              {group.title}
            </h3>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={isDrawer ? closeMobileSidebar : undefined}
                  onMouseEnter={(e) => {
                    if (isCollapsed && !isDrawer) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredTooltip({
                        name: item.name,
                        badge: item.badge,
                        top: rect.top + rect.height / 2,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed && !isDrawer) {
                      setHoveredTooltip(null);
                    }
                  }}
                  className={cn(
                    'group relative flex items-center rounded-lg transition-all text-xs font-semibold',
                    isCollapsed && !isDrawer
                      ? 'justify-center p-2.5'
                      : 'gap-3 px-3 py-2.5',
                    active
                      ? 'bg-[#e03e3e]/10 dark:bg-[#e03e3e]/20 text-[#e03e3e] dark:text-white font-bold'
                      : 'text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white'
                  )}
                  aria-label={isCollapsed && !isDrawer ? item.name : undefined}
                >
                  {/* Left active marker */}
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#e03e3e]" />
                  )}

                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active
                        ? 'text-[#e03e3e] dark:text-white'
                        : 'text-[#7d8493] group-hover:text-[#101216] dark:group-hover:text-white'
                    )}
                  />

                  {(!isCollapsed || isDrawer) && (
                    <div className="flex flex-1 items-center justify-between min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'ml-2 rounded-xs px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider',
                            active
                              ? 'bg-[#e03e3e] text-white'
                              : 'bg-[#f2efe9] dark:bg-[#161922] text-[#7d8493]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200">
        {/* Mobile slide-over drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={closeMobileSidebar}
              aria-hidden="true"
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0a0c10] border-r border-[#e4e0d8] dark:border-[#262b38] flex flex-col shadow-2xl">
              <div className="flex h-16 items-center justify-between px-5 border-b border-[#e4e0d8] dark:border-[#262b38]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e03e3e] text-white font-extrabold text-xs">
                    CC
                  </div>
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-tight text-[#101216] dark:text-white">
                      Blan<span className="text-[#e03e3e]">mont</span>
                    </p>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-[#7d8493]">
                      Administration
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileSidebar}
                  className="p-1.5 rounded-md text-[#7d8493] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {renderNavItems(true)}
              </div>

              <div className="p-4 border-t border-[#e4e0d8] dark:border-[#262b38] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileSidebar();
                    setHelpOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
                  <span>Guide &amp; Raccourcis</span>
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#7d8493] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Retour au site public</span>
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar (Collapsible: 256px wide or 72px collapsed) */}
        <aside
          className={cn(
            'hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col bg-white dark:bg-[#0a0c10] border-r border-[#e4e0d8] dark:border-[#262b38] transition-[width] duration-200',
            isCollapsed ? 'md:w-[72px]' : 'md:w-64'
          )}
        >
          {/* Brand Header */}
          <div
            className={cn(
              'flex h-16 items-center border-b border-[#e4e0d8] dark:border-[#262b38] transition-all',
              isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
            )}
          >
            <Link href="/admin" className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e03e3e] shadow-xs">
                <span className="text-white font-extrabold text-xs">CC</span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-extrabold uppercase tracking-tight text-[#101216] dark:text-white truncate">
                    Blan<span className="text-[#e03e3e]">mont</span>
                  </p>
                  <p className="text-[0.625rem] font-bold uppercase tracking-widest text-[#5c6370] dark:text-[#7d8493]">
                    Administration
                  </p>
                </div>
              )}
            </Link>
          </div>

          {/* Nav List */}
          <nav
            onScroll={() => setHoveredTooltip(null)}
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
          >
            {renderNavItems(false)}
          </nav>

          {/* Bottom quick actions */}
          <div className="border-t border-[#e4e0d8] dark:border-[#262b38] p-3 transition-all">
            {!isCollapsed ? (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors text-left"
                >
                  <AcademicCapIcon className="h-4 w-4 text-[#e03e3e] shrink-0" />
                  <span>Guide &amp; Raccourcis</span>
                </button>

                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#7d8493] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Retour au site public</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTooltip({
                      name: 'Guide & Raccourcis',
                      top: rect.top + rect.height / 2,
                    });
                  }}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className="flex items-center justify-center h-10 w-10 rounded-lg text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors"
                  aria-label="Guide & Raccourcis"
                >
                  <AcademicCapIcon className="h-5 w-5 text-[#e03e3e]" />
                </button>

                <Link
                  href="/"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredTooltip({
                      name: 'Retour au site public',
                      top: rect.top + rect.height / 2,
                    });
                  }}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className="flex items-center justify-center h-10 w-10 rounded-lg text-[#7d8493] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors"
                  aria-label="Retour au site public"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div
          className={cn(
            'flex flex-col min-h-screen transition-[padding] duration-200',
            isCollapsed ? 'md:pl-[72px]' : 'md:pl-64'
          )}
        >
          {/* Admin Topbar */}
          <AdminTopbar
            isSidebarCollapsed={isCollapsed}
            onToggleSidebar={toggleSidebarCollapse}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenHelpModal={() => setHelpOpen(true)}
          />

          {/* Main workspace */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
            {children}
          </main>
        </div>

        {/* Command Palette Modal (Ctrl+K / Cmd+K) */}
        <AdminCommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* Global Admin Help & Shortcuts Modal */}
        <AdminHelpModal
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          onResetOnboarding={handleResetOnboarding}
        />

        {/* Floating tooltip for collapsed sidebar */}
        {isCollapsed && hoveredTooltip && (
          <div
            style={{ top: hoveredTooltip.top }}
            className="fixed left-[76px] -translate-y-1/2 px-2.5 py-1 bg-[#101216] dark:bg-white text-white dark:text-[#101216] text-xs font-semibold rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
          >
            {hoveredTooltip.name}
            {hoveredTooltip.badge && (
              <span className="ml-1.5 px-1 py-0.2 rounded-xs bg-[#e03e3e] text-white text-[0.625rem]">
                {hoveredTooltip.badge}
              </span>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
