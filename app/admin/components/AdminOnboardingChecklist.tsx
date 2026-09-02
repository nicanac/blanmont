'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

export interface AdminOnboardingChecklistProps {
  hasActivePoll: boolean;
  activePollTitle?: string;
  hasUpcomingEvents: boolean;
  upcomingEventsCount: number;
  hasMembers: boolean;
  totalMembers: number;
  hasBlogPosts: boolean;
  totalBlogPosts: number;
  onOpenHelp?: () => void;
}

interface StepItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tip: string;
  href: string;
  actionLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  autoCompleted: boolean;
  statusBadge: string;
}

const STORAGE_TASKS_KEY = 'cc_admin_onboarding_tasks_v1';
const STORAGE_DISMISSED_KEY = 'cc_admin_onboarding_dismissed_v1';
const STORAGE_COLLAPSED_KEY = 'cc_admin_onboarding_collapsed_v1';

export default function AdminOnboardingChecklist({
  hasActivePoll,
  activePollTitle,
  hasUpcomingEvents,
  upcomingEventsCount,
  hasMembers,
  totalMembers,
  hasBlogPosts,
  totalBlogPosts,
  onOpenHelp,
}: AdminOnboardingChecklistProps): React.ReactElement | null {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const steps: StepItem[] = [
    {
      id: 'poll',
      title: 'Lancer le Sondage Weekend',
      category: 'Rituel Hebdomadaire',
      description:
        'Créez le sondage pour sonder les présences (Samedi / Dimanche) et former les groupes (A, B, C, VTT).',
      tip: 'À lancer idéalement le mardi. Les membres votent directement sur /sondage.',
      href: hasActivePoll ? '/admin/sondages' : '/admin/sondages/new',
      actionLabel: hasActivePoll ? 'Voir le sondage en cours' : 'Créer un sondage',
      icon: ChatBubbleLeftRightIcon,
      autoCompleted: hasActivePoll,
      statusBadge: hasActivePoll
        ? activePollTitle
          ? `Actif : ${activePollTitle}`
          : 'Sondage en cours'
        : 'À lancer chaque semaine',
    },
    {
      id: 'events',
      title: 'Planifier les Sorties au Calendrier',
      category: 'Calendrier Officiel',
      description:
        'Ajoutez les prochains rendez-vous de sorties ou importez en un clic le calendrier officiel du club en PDF.',
      tip: 'L’import PDF extrait automatiquement les dates, départs et distances.',
      href: '/admin/events',
      actionLabel: 'Gérer les sorties',
      icon: CalendarDaysIcon,
      autoCompleted: hasUpcomingEvents,
      statusBadge: hasUpcomingEvents
        ? `${upcomingEventsCount} sortie(s) programmée(s)`
        : 'Aucune sortie programmée',
    },
    {
      id: 'members',
      title: 'Vérifier l’Annuaire des Membres',
      category: 'Gestion du Club',
      description:
        'Vérifiez la liste des cyclistes inscrits, assignez les rôles (Président, Capitaine) et réinitialisez les mots de passe.',
      tip: 'Les capitaines de route peuvent pointer les présences Carré Vert après chaque sortie.',
      href: '/admin/members',
      actionLabel: 'Consulter l’annuaire',
      icon: UsersIcon,
      autoCompleted: hasMembers,
      statusBadge: hasMembers ? `${totalMembers} membres enregistrés` : 'Annuaire vide',
    },
    {
      id: 'blog',
      title: 'Publier les Nouvelles du Peloton',
      category: 'Communication',
      description:
        'Partagez les comptes-rendus de sorties, le mot du président, ou les annonces importantes pour la communauté.',
      tip: 'Les articles apparaissent sur la page d’accueil et dans la rubrique Les News.',
      href: '/admin/blog',
      actionLabel: 'Rédiger une news',
      icon: DocumentTextIcon,
      autoCompleted: hasBlogPosts,
      statusBadge: hasBlogPosts ? `${totalBlogPosts} article(s) en ligne` : 'Aucun article publié',
    },
    {
      id: 'gear',
      title: 'Catalogue Gobik & Équipements',
      category: 'Opérations',
      description:
        'Gérez le stock de tenues officielles du club, le catalogue des tailles et les commandes des membres.',
      tip: 'Consultez les équipements disponibles pour équiper le peloton.',
      href: '/admin/equipements',
      actionLabel: 'Gérer les équipements',
      icon: ShoppingBagIcon,
      autoCompleted: false,
      statusBadge: 'Prêt à l’emploi',
    },
  ];

  // Load persistence from localStorage
  useEffect(() => {
    try {
      const savedDismissed = localStorage.getItem(STORAGE_DISMISSED_KEY);
      const savedCollapsed = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      const savedTasks = localStorage.getItem(STORAGE_TASKS_KEY);

      if (savedDismissed === 'true') {
        setIsDismissed(true);
      }
      if (savedCollapsed === 'true') {
        setIsCollapsed(true);
      }
      if (savedTasks) {
        setCheckedTasks(JSON.parse(savedTasks));
      }
    } catch {
      // Ignore local storage error
    } finally {
      setIsLoaded(true);
    }

    // Listen for custom reset event (e.g. from Help modal)
    const handleResetEvent = (): void => {
      setIsDismissed(false);
      setIsCollapsed(false);
      try {
        localStorage.removeItem(STORAGE_DISMISSED_KEY);
      } catch {
        // ignore
      }
    };

    window.addEventListener('cc_admin_reset_onboarding', handleResetEvent);
    return () => window.removeEventListener('cc_admin_reset_onboarding', handleResetEvent);
  }, []);

  // Compute effective checked status: manual check OR auto-completed
  const isTaskCompleted = (step: StepItem): boolean => {
    if (checkedTasks[step.id] !== undefined) {
      return checkedTasks[step.id];
    }
    return step.autoCompleted;
  };

  const completedCount = steps.filter((s) => isTaskCompleted(s)).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isAllComplete = completedCount === steps.length;

  const toggleTask = (id: string, e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = {
      ...checkedTasks,
      [id]: !isTaskCompleted(steps.find((s) => s.id === id)!),
    };
    setCheckedTasks(nextState);
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(nextState));
    } catch {
      // ignore
    }
  };

  const handleDismiss = (): void => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const toggleCollapse = (): void => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, String(nextVal));
    } catch {
      // ignore
    }
  };

  if (!isLoaded || isDismissed) {
    return null;
  }

  return (
    <section aria-labelledby="onboarding-guide-heading" className="rounded-xl border border-[#e4e0d8] bg-white shadow-xs overflow-hidden transition-all">
      {/* Header Band */}
      <div className="bg-[#101216] text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>Guide de Prise en Main</span>
              </span>
              <span className="text-xs text-[#7d8493] font-semibold uppercase tracking-wider">
                Administration du Club
              </span>
            </div>
            <h2 id="onboarding-guide-heading" className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Prise en main des opérations de CC Saint-Martin Blanmont
            </h2>
            <p className="text-xs text-[#a7adbb] max-w-2xl">
              Suivez ces étapes clés pour coordonner le peloton, gérer les présences et animer la saison.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
                title="Consulter le guide complet"
              >
                <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
                <span>Aide &amp; Rituels</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleCollapse}
              className="rounded-md p-1.5 text-[#7d8493] hover:bg-white/10 hover:text-white transition-colors"
              title={isCollapsed ? 'Développer' : 'Réduire'}
            >
              {isCollapsed ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md p-1.5 text-[#7d8493] hover:bg-white/10 hover:text-white transition-colors"
              title="Masquer le guide"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#a7adbb]">
              Progression globale :{' '}
              <span className="text-white font-bold tabular-nums">
                {completedCount} sur {steps.length} étapes
              </span>
            </span>
            <span
              className={`font-bold tabular-nums ${
                isAllComplete ? 'text-emerald-400' : 'text-[#e03e3e]'
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#262b38]">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isAllComplete ? 'bg-emerald-500' : 'bg-[#e03e3e]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items (Collapsible) */}
      {!isCollapsed && (
        <div className="divide-y divide-[#e4e0d8] bg-[#faf8f5]">
          {steps.map((step, index) => {
            const completed = isTaskCompleted(step);

            return (
              <div
                key={step.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  completed ? 'bg-white/80' : 'bg-white hover:bg-[#faf8f5]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Interactive Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleTask(step.id, e)}
                    className="mt-0.5 shrink-0 rounded text-[#7d8493] hover:text-[#e03e3e] transition-colors focus:outline-none"
                    title={completed ? 'Marquer comme non fait' : 'Marquer comme complété'}
                  >
                    {completed ? (
                      <CheckCircleSolidIcon className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#e4e0d8] hover:border-[#e03e3e] text-xs font-bold text-[#7d8493]">
                        {index + 1}
                      </div>
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          completed ? 'text-[#3a3f4a] line-through decoration-[#7d8493]' : 'text-[#101216]'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-sm bg-[#f2efe9] text-[#5c6370] px-2 py-0.5 border border-[#e4e0d8]">
                        {step.category}
                      </span>
                      <span
                        className={`text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full border ${
                          completed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {step.statusBadge}
                      </span>
                    </div>

                    <p className="text-xs text-[#5c6370] max-w-2xl leading-relaxed">
                      {step.description}
                    </p>

                    <p className="text-[0.6875rem] text-[#7d8493] italic">
                      💡 {step.tip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={step.href}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs ${
                      completed
                        ? 'border border-[#e4e0d8] bg-white text-[#101216] hover:bg-[#f2efe9]'
                        : 'bg-[#e03e3e] hover:bg-[#c93434] text-white'
                    }`}
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Footer note */}
          <div className="p-4 bg-[#f2efe9]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5c6370]">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>
                Ce guide reste accessible à tout moment depuis le bouton <strong>&laquo; Guide &amp; Raccourcis &raquo;</strong> du menu latéral.
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-[#7d8493] hover:text-[#101216] hover:underline"
            >
              Masquer pour l&apos;instant
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
