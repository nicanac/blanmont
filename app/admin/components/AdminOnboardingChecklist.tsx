'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ArrowRightIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
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
      icon: JerseyIcon,
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
    <section aria-labelledby="onboarding-guide-heading" className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden transition-all">
      {/* Header Band */}
      <div className="bg-paper-2 dark:bg-night border-b border-line dark:border-night-line p-4 sm:p-5 text-ink dark:text-snow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 rounded-full bg-paper dark:bg-night-2 border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-snow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span>Guide de Prise en Main</span>
              </span>
              <span className="text-xs font-narrow text-ink-3 dark:text-snow-3 uppercase tracking-wider">
                Administration du Club
              </span>
            </div>
            <h2 id="onboarding-guide-heading" className="text-base sm:text-lg font-wide font-extrabold tracking-tight text-ink dark:text-white">
              Prise en main des opérations de CC Saint-Martin Blanmont
            </h2>
            <p className="text-xs text-ink-3 dark:text-snow-3 max-w-2xl">
              Suivez ces étapes clés pour coordonner le peloton, gérer les présences et animer la saison.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 hover:bg-paper-2 dark:hover:bg-night-3 px-3 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow transition-colors"
                title="Consulter le guide complet"
              >
                <AcademicCapIcon className="h-4 w-4 text-brand" />
                <span>Aide &amp; Rituels</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleCollapse}
              className="rounded-md p-1.5 text-ink-3 hover:bg-paper-2 dark:hover:bg-night-3 hover:text-ink dark:hover:text-white transition-colors"
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
              className="rounded-md p-1.5 text-ink-3 hover:bg-paper-2 dark:hover:bg-night-3 hover:text-ink dark:hover:text-white transition-colors"
              title="Masquer le guide"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-ink-3 dark:text-snow-3 font-narrow">
              Progression globale :{' '}
              <span className="text-ink dark:text-white font-bold tabular-nums">
                {completedCount} sur {steps.length} étapes
              </span>
            </span>
            <span
              className={`font-bold tabular-nums font-narrow ${
                isAllComplete ? 'text-vert dark:text-vert-strong' : 'text-brand'
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line dark:bg-night-line">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isAllComplete ? 'bg-vert' : 'bg-brand'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items (Collapsible) */}
      {!isCollapsed && (
        <div className="divide-y divide-line dark:divide-night-line bg-paper dark:bg-night-2">
          {steps.map((step, index) => {
            const completed = isTaskCompleted(step);

            return (
              <div
                key={step.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  completed ? 'bg-paper-2/60 dark:bg-night-2/60' : 'bg-paper dark:bg-night-2 hover:bg-paper-2 dark:hover:bg-night-3'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Interactive Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleTask(step.id, e)}
                    className="mt-0.5 shrink-0 rounded text-ink-3 hover:text-brand transition-colors focus:outline-none"
                    title={completed ? 'Marquer comme non fait' : 'Marquer comme complété'}
                  >
                    {completed ? (
                      <CheckCircleSolidIcon className="h-5 w-5 text-vert dark:text-vert-strong" />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-line dark:border-night-line-strong hover:border-brand text-xs font-bold text-ink-3 dark:text-snow-3">
                        {index + 1}
                      </div>
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          completed ? 'text-ink-3 dark:text-snow-3 line-through decoration-ink-3' : 'text-ink dark:text-white'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-xs font-narrow font-bold uppercase tracking-wider rounded-sm bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3 px-2 py-0.5 border border-line dark:border-night-line">
                        {step.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-narrow font-semibold px-2 py-0.5 rounded-full border border-line dark:border-night-line bg-paper dark:bg-night-2 text-ink dark:text-snow">
                        <span className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-vert' : 'bg-brand'}`} />
                        {step.statusBadge}
                      </span>
                    </div>

                    <p className="text-xs text-ink-3 dark:text-snow-3 max-w-2xl leading-relaxed">
                      {step.description}
                    </p>

                    <p className="text-xs text-ink-3 dark:text-snow-3 italic">
                      <span className="font-semibold text-ink-3 dark:text-snow-3 not-italic">Conseil :</span> {step.tip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={step.href}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-narrow font-semibold uppercase tracking-wider transition-colors active:translate-y-px ${
                      completed
                        ? 'border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 text-ink dark:text-white hover:bg-line dark:hover:bg-night-line'
                        : 'bg-brand hover:bg-brand-strong text-white'
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
          <div className="p-4 bg-paper-2/70 dark:bg-night/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-3 dark:text-snow-3 border-t border-line dark:border-night-line">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-brand" />
              <span>
                Ce guide reste accessible à tout moment depuis le bouton <strong>&laquo; Guide &amp; Raccourcis &raquo;</strong> du menu latéral.
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white hover:underline"
            >
              Masquer pour l&apos;instant
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
