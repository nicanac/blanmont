'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  CameraIcon,
  WindowIcon,
  UserCircleIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';

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
    id: 'page-stats',
    name: 'Statistiques & Rapports',
    category: 'Pages',
    description: 'Analyses de fréquentation, participation et métriques',
    href: '/admin/statistics',
    icon: ChartBarIcon,
    keywords: ['statistiques', 'stats', 'graphiques', 'rapports', 'metriques'],
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
  // Masqué temporairement / Hidden for now
  // {
  //   id: 'page-traces',
  //   name: 'Traces & Parcours GPS',
  //   category: 'Pages',
  //   description: 'Bibliothèque des parcours, imports GPX et Strava',
  //   href: '/admin/traces',
  //   icon: MapIcon,
  //   keywords: ['traces', 'parcours', 'gpx', 'strava', 'garmin', 'gps'],
  // },
  {
    id: 'page-pointage-express',
    name: 'Pointage Express',
    category: 'Pages',
    description: 'Émargement rapide des présences au départ des sorties',
    href: '/admin/pointage-express',
    icon: ClipboardDocumentCheckIcon,
    keywords: ['pointage', 'express', 'depart', 'presence', 'appel', 'emargement'],
  },
  {
    id: 'page-carre-vert',
    name: 'Pointage Carré Vert',
    category: 'Pages',
    description: 'Pointage des présences et challenge d’assiduité annuel',
    href: '/admin/carre-vert',
    icon: TrophySquareIcon,
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
    id: 'page-galerie',
    name: 'Galeries Photos',
    category: 'Pages',
    description: 'Albums et reportages photos des sorties du club',
    href: '/admin/galerie',
    icon: CameraIcon,
    keywords: ['galerie', 'photos', 'albums', 'images', 'souvenirs'],
  },
  {
    id: 'page-hero',
    name: 'Bannière Accueil & Télémétrie',
    category: 'Pages',
    description: 'Gestion du slider photo et des 4 cartes d’informations',
    href: '/admin/hero',
    icon: WindowIcon,
    keywords: ['hero', 'slider', 'banniere', 'telemetrie', 'photos', 'accueil'],
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
    id: 'page-prospects',
    name: 'Candidatures & Sorties d’essai',
    category: 'Pages',
    description: 'Suivi des prospects /rejoindre, mentors capitaines et adhésions',
    href: '/admin/prospects',
    icon: UserPlusIcon,
    keywords: ['prospects', 'candidatures', 'sorties', 'essai', 'rejoindre', 'recrutement', 'nouveaux'],
  },
  {
    id: 'page-members-photos',
    name: 'Portraits & Cadrage Photos',
    category: 'Pages',
    description: 'Alignement vertical, positionnement et recadrage des photos des membres',
    href: '/admin/members/photos',
    icon: UserCircleIcon,
    keywords: ['photos', 'cadrage', 'portraits', 'focal', 'visages', 'membres', 'alignement'],
  },
  {
    id: 'page-equipements',
    name: 'Équipements Club',
    category: 'Pages',
    description: 'Catalogue Gobik, gestion des tailles et commandes',
    href: '/admin/equipements',
    icon: JerseyIcon,
    keywords: ['equipements', 'tenues', 'gobik', 'maillots', 'cuissards', 'boutique'],
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
  // Masqué temporairement / Hidden for now
  // {
  //   id: 'action-add-trace',
  //   name: 'Ajouter une Trace GPX',
  //   category: 'Actions Rapides',
  //   description: 'Enregistrer manuellement un itinéraire GPS pour le club',
  //   href: '/admin/add-trace',
  //   icon: PlusCircleIcon,
  //   keywords: ['ajouter', 'trace', 'gpx', 'parcours', 'gps', 'creer'],
  // },
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes administrateur"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/70 dark:bg-black/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 text-ink dark:text-snow-1 shadow-2xl overflow-hidden z-10">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line dark:border-night-line bg-paper-2 dark:bg-night">
          <MagnifyingGlassIcon className="h-5 w-5 text-ink-3 dark:text-snow-3 shrink-0" />
          <input
            id="admin-command-palette-input"
            ref={inputRef}
            type="text"
            aria-label="Rechercher une section, une action ou un module"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une section, une action, un module... (ou taper 'sondage', 'trace')"
            className="w-full bg-transparent border-none text-sm font-medium text-ink dark:text-snow-1 placeholder-ink-3 dark:placeholder-snow-3 focus:outline-hidden focus:ring-0"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-ink-3 hover:text-ink dark:text-snow-3 dark:hover:text-snow-1 hover:bg-paper-3 dark:hover:bg-night-3 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-line/40 dark:divide-night-line">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-ink-3 dark:text-snow-3">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
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
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-sm text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-snow-1 font-semibold'
                        : 'text-ink-3 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-3'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-sm border ${
                          isSelected
                            ? 'bg-brand text-white border-brand'
                            : 'bg-paper-2 dark:bg-night text-ink-3 dark:text-snow-3 border-line/60 dark:border-night-line'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-ink dark:text-snow-1 truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-paper-2 dark:bg-night border border-line/50 dark:border-night-line text-ink-3 dark:text-snow-3">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-ink-3 dark:text-snow-3 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <ArrowRightIcon className="h-3.5 w-3.5 text-brand dark:text-snow-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-line dark:border-night-line bg-paper-2 dark:bg-night text-xs text-ink-3 dark:text-snow-3">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-xs bg-paper dark:bg-night-2 border border-line dark:border-night-line font-mono text-xs text-ink dark:text-snow-2">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded-xs bg-paper dark:bg-night-2 border border-line dark:border-night-line font-mono text-xs text-ink dark:text-snow-2">↓</kbd>
              Naviguer
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-xs bg-paper dark:bg-night-2 border border-line dark:border-night-line font-mono text-xs text-ink dark:text-snow-2">↵</kbd>
              Ouvrir
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-xs bg-paper dark:bg-night-2 border border-line dark:border-night-line font-mono text-xs text-ink dark:text-snow-2">Esc</kbd>
              Fermer
            </span>
          </div>
          <span className="font-semibold text-ink-3 dark:text-snow-3 font-mono text-xs">CC Blanmont Command</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps): React.ReactElement | null {
  if (!isOpen) return null;
  return <CommandPaletteModal onClose={onClose} />;
}
