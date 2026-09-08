'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarDaysIcon,
  MapIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';

export interface CommandItem {
  id: string;
  name: string;
  category: 'Pages' | 'Actions Rapides';
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const COMMAND_ITEMS: CommandItem[] = [
  // Pages
  {
    id: 'page-dashboard',
    name: 'Tableau de bord',
    category: 'Pages',
    description: 'Vue d’ensemble des activités, KPIs et alertes',
    href: '/admin',
    icon: HomeIcon,
    keywords: ['dashboard', 'accueil', 'stats', 'kpi', 'vue'],
  },
  {
    id: 'page-hero',
    name: 'Bannière Accueil & Télémétrie',
    category: 'Pages',
    description: 'Gestion du slider photo et des 4 cartes d’informations',
    href: '/admin/hero',
    icon: PhotoIcon,
    keywords: ['hero', 'slider', 'banniere', 'telemetrie', 'photos', 'accueil'],
  },
  {
    id: 'page-sondages',
    name: 'Sondages Weekend',
    category: 'Pages',
    description: 'Sondages de présence, groupes et votes parcours',
    href: '/admin/sondages',
    icon: ChatBubbleLeftRightIcon,
    keywords: ['sondages', 'weekend', 'votes', 'presences', 'groupes'],
  },
  {
    id: 'page-events',
    name: 'Événements & Sorties',
    category: 'Pages',
    description: 'Calendrier officiel, sorties samedi/dimanche et importations',
    href: '/admin/events',
    icon: CalendarDaysIcon,
    keywords: ['evenements', 'sorties', 'calendrier', 'agenda', 'pdf'],
  },
  {
    id: 'page-traces',
    name: 'Traces & Parcours GPS',
    category: 'Pages',
    description: 'Bibliothèque des parcours, imports GPX et Strava',
    href: '/admin/traces',
    icon: MapIcon,
    keywords: ['traces', 'parcours', 'gpx', 'strava', 'garmin', 'gps'],
  },
  {
    id: 'page-carre-vert',
    name: 'Pointage Carré Vert',
    category: 'Pages',
    description: 'Pointage des présences et challenge d’assiduité annuel',
    href: '/admin/carre-vert',
    icon: CheckBadgeIcon,
    keywords: ['carre', 'vert', 'assiduite', 'presences', 'pointage', 'classement'],
  },
  {
    id: 'page-blog',
    name: 'Articles & News',
    category: 'Pages',
    description: 'Comptes-rendus de sorties et publications du peloton',
    href: '/admin/blog',
    icon: DocumentTextIcon,
    keywords: ['blog', 'news', 'articles', 'actualites', 'publication'],
  },
  {
    id: 'page-equipements',
    name: 'Équipements Club',
    category: 'Pages',
    description: 'Catalogue Gobik, gestion des tailles et commandes',
    href: '/admin/equipements',
    icon: ShoppingBagIcon,
    keywords: ['equipements', 'tenues', 'gobik', 'maillots', 'cuissards', 'boutique'],
  },
  {
    id: 'page-members',
    name: 'Annuaire des Membres',
    category: 'Pages',
    description: 'Gestion des cyclistes, capitaines et accès',
    href: '/admin/members',
    icon: UsersIcon,
    keywords: ['membres', 'cyclistes', 'utilisateurs', 'capitaines', 'annuaire'],
  },
  {
    id: 'page-stats',
    name: 'Statistiques & Rapports',
    category: 'Pages',
    description: 'Analyses de fréquentation, participation et métriques',
    href: '/admin/statistics',
    icon: ChartBarIcon,
    keywords: ['statistiques', 'stats', 'graphiques', 'rapports', 'metriques'],
  },
  {
    id: 'page-settings',
    name: 'Paramètres du Club',
    category: 'Pages',
    description: 'Configuration générale, intégrations et maintenance',
    href: '/admin/settings',
    icon: Cog6ToothIcon,
    keywords: ['parametres', 'configuration', 'settings', 'options', 'systeme'],
  },
  // Actions Rapides
  {
    id: 'action-new-poll',
    name: 'Lancer un Nouveau Sondage',
    category: 'Actions Rapides',
    description: 'Créer le sondage de présence pour le weekend à venir',
    href: '/admin/sondages/new',
    icon: PlusCircleIcon,
    keywords: ['creer', 'nouveau', 'sondage', 'weekend', 'lancer'],
  },
  {
    id: 'action-new-event',
    name: 'Planifier une Nouvelle Sortie',
    category: 'Actions Rapides',
    description: 'Ajouter une sortie officielle au calendrier du club',
    href: '/admin/events/new',
    icon: PlusCircleIcon,
    keywords: ['creer', 'nouvelle', 'sortie', 'evenement', 'planifier'],
  },
  {
    id: 'action-import-pdf',
    name: 'Importer le Calendrier PDF',
    category: 'Actions Rapides',
    description: 'Extraction automatique des sorties depuis le PDF officiel',
    href: '/admin/events/import',
    icon: DocumentArrowUpIcon,
    keywords: ['importer', 'pdf', 'calendrier', 'extraction', 'batch'],
  },
  {
    id: 'action-new-blog',
    name: 'Rédiger un Nouvel Article',
    category: 'Actions Rapides',
    description: 'Publier une nouvelle ou un compte-rendu de course',
    href: '/admin/blog/new',
    icon: PlusCircleIcon,
    keywords: ['rediger', 'ecrire', 'article', 'news', 'blog', 'publier'],
  },
  {
    id: 'action-add-trace',
    name: 'Ajouter une Trace GPX',
    category: 'Actions Rapides',
    description: 'Enregistrer manuellement un itinéraire GPS pour le club',
    href: '/admin/add-trace',
    icon: PlusCircleIcon,
    keywords: ['ajouter', 'trace', 'gpx', 'parcours', 'gps', 'creer'],
  },
  {
    id: 'action-new-member',
    name: 'Inscrire un Nouveau Membre',
    category: 'Actions Rapides',
    description: 'Ajouter un cycliste à l’annuaire du CC Blanmont',
    href: '/admin/members/new',
    icon: PlusCircleIcon,
    keywords: ['inscrire', 'membre', 'ajouter', 'cycliste', 'utilisateur'],
  },
];

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

function CommandPaletteModal({ onClose }: { onClose: () => void }): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return COMMAND_ITEMS;
    const q = query.toLowerCase().trim();
    return COMMAND_ITEMS.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchName || matchDesc || matchKeywords;
    });
  }, [query]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, handleSelect, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#0a0c10] text-[#101216] dark:text-white shadow-2xl overflow-hidden z-10">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216]">
          <MagnifyingGlassIcon className="h-5 w-5 text-[#7d8493] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une section, une action, un module... (ou taper 'sondage', 'trace')"
            className="w-full bg-transparent border-none text-sm font-medium text-[#101216] dark:text-white placeholder-[#7d8493] focus:outline-hidden focus:ring-0"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#7d8493] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#f2efe9] dark:divide-[#161922]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-[#5c6370] dark:text-[#a7adbb]">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-[#7d8493]">
                Essayez des mots-clés comme &ldquo;sondage&rdquo;, &ldquo;membres&rdquo;, &ldquo;parcours&rdquo; ou &ldquo;sortie&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-[#e03e3e]/10 text-[#e03e3e] dark:bg-[#e03e3e]/20 dark:text-white font-semibold'
                        : 'text-[#5c6370] dark:text-[#a7adbb] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? 'bg-[#e03e3e] text-white'
                            : 'bg-[#f2efe9] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#101216] dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#f2efe9] dark:bg-[#161922] text-[#7d8493]">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <ArrowRightIcon className="h-3.5 w-3.5 text-[#e03e3e] dark:text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[0.6875rem] text-[#7d8493]">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#262b38] border border-[#e4e0d8] dark:border-[#3a4152] font-mono text-[0.625rem]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#262b38] border border-[#e4e0d8] dark:border-[#3a4152] font-mono text-[0.625rem]">↓</kbd>
              Naviguer
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#262b38] border border-[#e4e0d8] dark:border-[#3a4152] font-mono text-[0.625rem]">↵</kbd>
              Ouvrir
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#262b38] border border-[#e4e0d8] dark:border-[#3a4152] font-mono text-[0.625rem]">Esc</kbd>
              Fermer
            </span>
          </div>
          <span className="font-semibold text-[#5c6370] dark:text-[#a7adbb]">CC Blanmont Command</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps): React.ReactElement | null {
  if (!isOpen) return null;
  return <CommandPaletteModal onClose={onClose} />;
}
