'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface AdminTopbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenHelpModal: () => void;
}

interface BreadcrumbPart {
  label: string;
  href?: string;
}

export default function AdminTopbar({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenHelpModal,
}: AdminTopbarProps): React.ReactElement {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // Close "+ Nouveau" menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic breadcrumbs from pathname
  const breadcrumbs: BreadcrumbPart[] = React.useMemo(() => {
    const parts: BreadcrumbPart[] = [{ label: 'Admin', href: '/admin' }];

    if (pathname === '/admin') {
      parts.push({ label: 'Tableau de bord' });
      return parts;
    }

    if (pathname.startsWith('/admin/hero')) {
      parts.push({ label: 'Contenu' });
      parts.push({ label: 'Bannière Accueil' });
    } else if (pathname.startsWith('/admin/sondages')) {
      parts.push({ label: 'Rituels' });
      parts.push({ label: 'Sondages Weekend', href: '/admin/sondages' });
      if (pathname.endsWith('/new')) {
        parts.push({ label: 'Nouveau sondage' });
      } else if (pathname !== '/admin/sondages') {
        parts.push({ label: 'Détails du sondage' });
      }
    } else if (pathname.startsWith('/admin/events')) {
      parts.push({ label: 'Rituels' });
      parts.push({ label: 'Événements & Sorties', href: '/admin/events' });
      if (pathname.includes('/import')) {
        parts.push({ label: 'Importation PDF' });
      } else if (pathname.endsWith('/new')) {
        parts.push({ label: 'Nouvelle sortie' });
      } else if (pathname !== '/admin/events') {
        parts.push({ label: 'Détails' });
      }
    } else if (pathname.startsWith('/admin/traces') || pathname.startsWith('/admin/add-trace')) {
      parts.push({ label: 'Rituels' });
      parts.push({ label: 'Traces & Parcours', href: '/admin/traces' });
      if (pathname.startsWith('/admin/add-trace')) {
        parts.push({ label: 'Ajouter une trace' });
      }
    } else if (pathname.startsWith('/admin/carre-vert')) {
      parts.push({ label: 'Rituels' });
      parts.push({ label: 'Pointage Carré Vert' });
    } else if (pathname.startsWith('/admin/blog')) {
      parts.push({ label: 'Contenu' });
      parts.push({ label: 'Articles & News', href: '/admin/blog' });
      if (pathname.endsWith('/new')) {
        parts.push({ label: 'Nouvel article' });
      }
    } else if (pathname.startsWith('/admin/equipements')) {
      parts.push({ label: 'Contenu' });
      parts.push({ label: 'Équipements Club', href: '/admin/equipements' });
    } else if (pathname.startsWith('/admin/members')) {
      parts.push({ label: 'Gestion' });
      parts.push({ label: 'Annuaire des Membres', href: '/admin/members' });
      if (pathname.endsWith('/new')) {
        parts.push({ label: 'Nouveau membre' });
      }
    } else if (pathname.startsWith('/admin/statistics')) {
      parts.push({ label: 'Gestion' });
      parts.push({ label: 'Statistiques & Rapports' });
    } else if (pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/parametres')) {
      parts.push({ label: 'Système' });
      parts.push({ label: 'Paramètres' });
    } else {
      parts.push({ label: 'Navigation' });
    }

    return parts;
  }, [pathname]);

  const quickActions = [
    {
      name: 'Nouvelle Sortie',
      desc: 'Planifier une sortie au calendrier',
      href: '/admin/events/new',
      icon: CalendarDaysIcon,
    },
    {
      name: 'Nouveau Sondage',
      desc: 'Créer le sondage de présence weekend',
      href: '/admin/sondages/new',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Rédiger un Article',
      desc: 'Publier une actualité du club',
      href: '/admin/blog/new',
      icon: DocumentTextIcon,
    },
    // Masqué temporairement / Hidden for now
    // {
    //   name: 'Ajouter une Trace',
    //   desc: 'Créer ou importer un parcours GPX',
    //   href: '/admin/add-trace',
    //   icon: MapIcon,
    // },
    {
      name: 'Inscrire un Membre',
      desc: 'Ajouter un cycliste à l’annuaire',
      href: '/admin/members/new',
      icon: UsersIcon,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e4e0d8] dark:border-[#262b38] bg-white/95 dark:bg-[#0a0c10]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Left: Mobile Toggle / Desktop Collapse & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-md text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors"
          title="Ouvrir la navigation"
        >
          <span className="sr-only">Ouvrir le menu</span>
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Desktop sidebar collapse button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:flex items-center justify-center h-8 w-8 rounded-md text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors"
          title={isSidebarCollapsed ? 'Déplier la barre latérale (Ctrl+B)' : 'Replier la barre latérale (Ctrl+B)'}
          aria-expanded={!isSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
        >
          {isSidebarCollapsed ? (
            <ArrowsPointingOutIcon className="h-4 w-4" />
          ) : (
            <ArrowsPointingInIcon className="h-4 w-4" />
          )}
        </button>

        {/* Separator on desktop */}
        <div className="hidden md:block h-4 w-px bg-[#e4e0d8] dark:bg-[#262b38]" />

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold overflow-hidden" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && (
                  <ChevronRightIcon className="h-3 w-3 text-[#7d8493] shrink-0" />
                )}
                {isLast ? (
                  <span className="font-bold text-[#101216] dark:text-white truncate">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#7d8493] truncate hidden sm:inline">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions, Command Palette, Theme, View Site & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Command Search Bar Shortcut */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] hover:border-[#101216]/30 dark:hover:border-white/30 hover:text-[#101216] dark:hover:text-white transition-all shadow-2xs"
          title="Rechercher (⌘K)"
        >
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-[#7d8493]" />
          <span className="hidden sm:inline">Rechercher...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#262b38] border border-[#e4e0d8] dark:border-[#3a4152] font-mono text-[0.625rem] text-[#7d8493]">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action "+ Nouveau" Dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            type="button"
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nouveau</span>
            <ChevronDownIcon
              className={`h-3 w-3 transition-transform ${isNewMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#0a0c10] shadow-xl p-1.5 z-50 text-left animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-[#7d8493]">
                Création Rapide
              </div>
              <div className="space-y-0.5">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    onClick={() => setIsNewMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#f2efe9] dark:hover:bg-[#161922] transition-colors group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb] group-hover:text-[#e03e3e] group-hover:border-[#e03e3e]/30 transition-colors">
                      <action.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#101216] dark:text-white">
                        {action.name}
                      </div>
                      <div className="text-[0.6875rem] text-[#7d8493]">
                        {action.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-[#e4e0d8] dark:bg-[#262b38]" />

        {/* Guide & Raccourcis */}
        <button
          type="button"
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-lg text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#101216] dark:hover:text-white transition-colors"
          title="Guide & Raccourcis d'administration"
          aria-label="Guide et Raccourcis d'administration"
        >
          <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
        </button>

        {/* Public Site Link */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] text-xs font-semibold text-[#101216] dark:text-white hover:bg-[#faf8f5] dark:hover:bg-[#202533] transition-colors"
          title="Ouvrir le site public dans un nouvel onglet"
        >
          <span className="hidden lg:inline">Voir le site</span>
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-[#7d8493]" />
        </Link>

        {/* User Pill / Role */}
        {user && (
          <div className="hidden xl:flex items-center gap-2 pl-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#101216] text-white font-bold text-xs border border-white/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-[#101216] dark:text-white max-w-[90px] truncate">
                {user.name || 'Admin'}
              </div>
              <div className="text-[0.625rem] font-semibold uppercase tracking-wider text-[#e03e3e]">
                {user.role || 'Admin'}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
