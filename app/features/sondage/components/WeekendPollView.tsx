'use client';

import React, { useState, useTransition } from 'react';
import { RoadSwatch } from '@/app/components/carte/RoadSwatch';
import type { CyclingGroup } from '@/app/constants/cycling';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import {
  WeekendPoll,
  PollResponse,
  Member,
  PollDayChoice,
  CyclingGroupChoice,
} from '@/app/types';
import {
  submitWeekendPollResponseAction,
  deleteWeekendPollResponseAction,
} from '@/app/actions';
import {
  CheckIcon,
  PencilSquareIcon,
  LockClosedIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon, RouteCalendarIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';
import { toast } from 'sonner';

interface WeekendPollViewProps {
  poll: WeekendPoll | null;
  responses: PollResponse[];
  members: Member[];
}

interface DayOption {
  id: PollDayChoice;
  label: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const DAY_OPTIONS: DayOption[] = [
  { id: 'samedi', label: 'Samedi matin', subtitle: 'Sortie officielle du club', Icon: BicycleIcon },
  { id: 'dimanche', label: 'Dimanche matin', subtitle: 'Sortie dominicale', Icon: RouteCalendarIcon },
  { id: 'les-deux', label: 'Les 2 jours', subtitle: 'Samedi & Dimanche', Icon: TrophySquareIcon },
  { id: 'absent', label: 'Absent ce week-end', subtitle: 'Ne roule pas ce week-end', Icon: XMarkIcon },
];

const GROUP_OPTIONS: { id: CyclingGroupChoice; label: string; speed: string }[] = [
  { id: 'Groupe A', label: 'Groupe A', speed: '> 30 km/h' },
  { id: 'Groupe B', label: 'Groupe B', speed: '25 - 28 km/h' },
  { id: 'Groupe C', label: 'Groupe C', speed: '< 25 km/h' },
  { id: 'Groupe VTT', label: 'Groupe VTT', speed: 'Sentiers & Bois' },
  { id: 'Autre', label: 'Autre / Libre', speed: 'Horaires décalés' },
];

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function WeekendPollView({ poll, responses, members: _members }: WeekendPollViewProps): React.ReactElement {
  const { user, isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Find logged-in user's existing response
  const myResponse = user ? responses.find((r) => r.memberId === user.id) : null;
  const [isEditing, setIsEditing] = useState(!myResponse);

  // Form State
  const [selectedDay, setSelectedDay] = useState<PollDayChoice>(myResponse?.dayChoice || 'samedi');
  const [selectedGroup, setSelectedGroup] = useState<CyclingGroupChoice>(myResponse?.groupChoice || 'Groupe B');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>(myResponse?.customAnswers || {});
  const [comment, setComment] = useState(myResponse?.comment || '');

  // Filter state for results list
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');

  if (!poll) {
    return (
      <div className="relative corner-ticks rounded-sm border border-line bg-paper-2/40 dark:border-night-line dark:bg-night-2 p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-4 dark:[--tick:var(--color-snow-3)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-sm border border-ink text-ink dark:border-snow-3 dark:text-snow">
          <CalendarDaysIcon className="size-7 text-brand-vif" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="font-semiwide text-lg sm:text-xl font-extrabold uppercase text-ink dark:text-snow tracking-tight">
            Aucun sondage actif pour le moment
          </h2>
          <p className="text-sm text-ink-2 dark:text-snow-2 leading-relaxed">
            Le prochain sondage pour les sorties du week-end sera ouvert prochainement par les capitaines de route.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/calendrier"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-brand hover:bg-brand-strong px-6 py-2.5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white shadow-2xs transition-colors"
          >
            <span>Consulter le calendrier des sorties</span>
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = poll.status === 'closed';

  const handleCustomRadioChange = (questionId: string, option: string): void => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleCustomCheckboxChange = (questionId: string, option: string): void => {
    setCustomAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmitResponse = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!user) {
      toast.error('Veuillez vous connecter pour répondre au sondage.');
      return;
    }

    startTransition(async () => {
      try {
        await submitWeekendPollResponseAction({
          pollId: poll.id,
          memberId: user.id,
          memberName: user.name,
          memberPhotoUrl: user.avatarUrl,
          dayChoice: selectedDay,
          groupChoice: selectedGroup,
          customAnswers,
          comment: comment.trim() || undefined,
        });

        toast.success(
          myResponse
            ? 'Votre réponse a été mise à jour !'
            : 'Votre présence a été enregistrée avec succès !'
        );
        setIsEditing(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erreur : ${msg}`);
      }
    });
  };

  const handleDeleteResponse = (): void => {
    if (!user || !myResponse) return;
    if (!confirm('Voulez-vous retirer votre réponse à ce sondage ?')) return;

    startTransition(async () => {
      try {
        await deleteWeekendPollResponseAction(poll.id, user.id);
        toast.success('Votre réponse a été retirée.');
        setIsEditing(true);
      } catch (_err: unknown) {
        toast.error('Erreur lors du retrait de la réponse.');
      }
    });
  };

  // Calculations for Tally Dashboard
  const activeAttendees = responses.filter((r) => r.dayChoice !== 'absent');
  const saturdayCount = responses.filter((r) => r.dayChoice === 'samedi' || r.dayChoice === 'les-deux').length;
  const sundayCount = responses.filter((r) => r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux').length;
  const absentCount = responses.filter((r) => r.dayChoice === 'absent').length;

  const groupCounts: Record<string, number> = {
    'Groupe A': 0,
    'Groupe B': 0,
    'Groupe C': 0,
    'Groupe VTT': 0,
    'Autre': 0,
  };

  activeAttendees.forEach((r) => {
    if (groupCounts[r.groupChoice] !== undefined) {
      groupCounts[r.groupChoice]++;
    } else {
      groupCounts['Autre']++;
    }
  });

  // Filtered responses list
  const filteredResponses = responses.filter((r) => {
    if (filterGroup !== 'all' && r.groupChoice !== filterGroup) return false;
    if (filterDay === 'samedi' && r.dayChoice !== 'samedi' && r.dayChoice !== 'les-deux') return false;
    if (filterDay === 'dimanche' && r.dayChoice !== 'dimanche' && r.dayChoice !== 'les-deux') return false;
    if (filterDay === 'absent' && r.dayChoice !== 'absent') return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Main Grid: Left = Form / My Vote, Right = Live Tally & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Member QCM Form */}
        <div className="lg:col-span-5 space-y-6">
          {!isAuthenticated ? (
            <div className="relative corner-ticks rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-6 sm:p-8 text-center space-y-4 shadow-2xs dark:[--tick:var(--color-snow-3)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-sm border border-ink text-ink dark:border-snow-3 dark:text-snow">
                <LockClosedIcon className="size-6 text-brand-vif" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semiwide text-base sm:text-lg font-extrabold uppercase text-ink dark:text-snow tracking-tight">
                  Connexion requise
                </h3>
                <p className="text-xs sm:text-sm text-ink-2 dark:text-snow-2 leading-relaxed">
                  Connectez-vous avec votre compte membre pour voter et indiquer vos préférences de sortie.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login?redirect=/sondage"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-brand hover:bg-brand-strong px-6 py-2.5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white shadow-2xs transition-colors"
                >
                  Se connecter pour répondre
                </Link>
              </div>
            </div>
          ) : isClosed ? (
            <div className="relative corner-ticks rounded-sm border border-line bg-paper-2/60 dark:border-night-line dark:bg-night-2 p-6 sm:p-8 text-center space-y-3 dark:[--tick:var(--color-snow-3)]">
              <InformationCircleIcon className="mx-auto size-8 text-ink-3 dark:text-snow-3" aria-hidden="true" />
              <h3 className="font-semiwide text-base font-extrabold uppercase text-ink dark:text-snow tracking-tight">
                Les votes sont clôturés
              </h3>
              <p className="text-xs sm:text-sm text-ink-2 dark:text-snow-2">
                Ce sondage est désormais fermé. Rendez-vous au départ selon les groupes ci-contre !
              </p>
            </div>
          ) : myResponse && !isEditing ? (
            /* Already voted summary card */
            <div className="relative corner-ticks rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-6 sm:p-7 space-y-5 shadow-2xs dark:[--tick:var(--color-snow-3)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vert opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-vert" />
                  </span>
                  <h3 className="font-semiwide text-base font-extrabold uppercase text-ink dark:text-snow tracking-tight">
                    Votre participation est confirmée
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-line dark:border-night-line bg-paper-2 hover:bg-line dark:bg-night-3 dark:hover:bg-night-line-strong px-3.5 py-2 font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink dark:text-snow transition-colors min-h-[44px] cursor-pointer shrink-0"
                >
                  <PencilSquareIcon className="size-3.5" aria-hidden="true" />
                  <span>Modifier</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-line dark:border-night-line">
                  <span className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3">Membre :</span>
                  <strong className="font-semiwide text-ink dark:text-snow truncate max-w-[200px]">{user?.name}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-line dark:border-night-line">
                  <span className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3">Jour(s) :</span>
                  <span className="font-semiwide text-ink dark:text-snow">
                    {DAY_OPTIONS.find((d) => d.id === myResponse.dayChoice)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-line dark:border-night-line">
                  <span className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3">Groupe :</span>
                  <span className="font-semiwide text-ink dark:text-snow">{myResponse.groupChoice}</span>
                </div>
                {myResponse.comment && (
                  <div className="py-2 border-b border-line dark:border-night-line">
                    <span className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3 block mb-1">Remarque :</span>
                    <p className="italic text-xs text-ink-2 dark:text-snow-2 bg-paper-2 dark:bg-night-3 p-3 rounded-sm border border-line dark:border-night-line break-words">
                      &laquo; {myResponse.comment} &raquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDeleteResponse}
                  disabled={isPending}
                  className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-brand hover:text-brand-strong dark:text-brand-soft hover:underline transition-colors py-2.5 px-3 min-h-[44px] inline-flex items-center cursor-pointer"
                >
                  Annuler ma participation
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-sm bg-ink hover:bg-night-3 dark:bg-white dark:hover:bg-snow dark:text-ink text-white px-5 py-2.5 font-narrow text-xs font-bold uppercase tracking-[0.07em] transition-colors min-h-[44px] inline-flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Modifier mon choix
                </button>
              </div>
            </div>
          ) : (
            /* Interactive QCM Voting Form */
            <form
              onSubmit={handleSubmitResponse}
              className="rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-6 sm:p-7 space-y-6 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-line dark:border-night-line pb-4">
                <div>
                  <h3 className="font-semiwide text-base sm:text-lg font-extrabold uppercase text-ink dark:text-snow tracking-tight">
                    {myResponse ? 'Modifier votre réponse' : 'Votre réponse au sondage'}
                  </h3>
                  <p className="text-xs text-ink-3 dark:text-snow-3 mt-0.5">
                    Connecté en tant que <strong className="text-ink dark:text-snow">{user?.name}</strong>
                  </p>
                </div>
                {myResponse && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 hover:text-ink dark:text-snow-3 dark:hover:text-snow transition-colors px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
                  >
                    Fermer
                  </button>
                )}
              </div>

              {/* Question 1: Jours */}
              <div className="space-y-3">
                <label className="block font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                  1. Quel(s) jour(s) roulez-vous ce week-end ? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DAY_OPTIONS.map((opt) => {
                    const DayIcon = opt.Icon;
                    const isSelected = selectedDay === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedDay(opt.id)}
                        className={`group flex items-start gap-3 p-3.5 rounded-sm border text-left transition-colors min-h-[56px] cursor-pointer ${
                          isSelected
                            ? 'border-brand bg-brand-tint/60 dark:bg-brand/15 dark:border-brand-soft ring-1 ring-brand'
                            : 'border-line dark:border-night-line bg-paper-2/40 hover:bg-paper-2 dark:bg-night-3/60 dark:hover:bg-night-3 hover:border-ink-3 dark:hover:border-snow-3'
                        }`}
                      >
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            isSelected
                              ? 'border-brand bg-brand text-white'
                              : 'border-line dark:border-night-line bg-white dark:bg-night-2 text-ink dark:text-snow group-hover:border-brand/40'
                          }`}
                        >
                          <DayIcon className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="font-semiwide text-xs font-extrabold text-ink dark:text-snow">{opt.label}</div>
                          <div className="text-[11px] text-ink-3 dark:text-snow-3 mt-0.5">{opt.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Groupe (if attending) */}
              {selectedDay !== 'absent' && (
                <div className="space-y-3 pt-2 border-t border-line dark:border-night-line">
                  <label className="block font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                    2. Dans quel groupe souhaitez-vous rouler ? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GROUP_OPTIONS.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setSelectedGroup(grp.id)}
                        className={`flex items-center justify-between p-3 rounded-sm border text-left transition-colors min-h-[46px] cursor-pointer ${
                          selectedGroup === grp.id
                            ? 'border-brand bg-brand-tint/60 dark:bg-brand/15 dark:border-brand-soft ring-1 ring-brand font-bold'
                            : 'border-line dark:border-night-line bg-paper-2/40 hover:bg-paper-2 dark:bg-night-3/60 dark:hover:bg-night-3 hover:border-ink-3 dark:hover:border-snow-3'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {grp.id !== 'Autre' && <RoadSwatch group={grp.id.replace('Groupe ', '') as CyclingGroup} className="w-9" />}
                          <span className="font-semiwide text-xs font-extrabold text-ink dark:text-snow">{grp.label}</span>
                        </span>
                        <span className="font-narrow text-xs font-bold text-ink-3 dark:text-snow-3 tabular-nums">{grp.speed}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Admin Questions (if any) */}
              {poll.customQuestions && poll.customQuestions.length > 0 && selectedDay !== 'absent' && (
                <div className="space-y-4 pt-2 border-t border-line dark:border-night-line">
                  {poll.customQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-2">
                      <label className="block font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                        {idx + 3}. {q.title}
                      </label>
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const isSelected = q.allowMultiple
                            ? Array.isArray(customAnswers[q.id]) &&
                              (customAnswers[q.id] as string[]).includes(opt)
                            : customAnswers[q.id] === opt;

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                q.allowMultiple
                                  ? handleCustomCheckboxChange(q.id, opt)
                                  : handleCustomRadioChange(q.id, opt)
                              }
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm border text-xs text-left transition-colors min-h-[44px] cursor-pointer ${
                                isSelected
                                  ? 'border-brand bg-brand-tint/60 dark:bg-brand/15 text-ink dark:text-snow font-bold ring-1 ring-brand'
                                  : 'border-line dark:border-night-line text-ink-2 dark:text-snow-2 bg-paper-2/40 hover:bg-paper-2 dark:bg-night-3/60 dark:hover:bg-night-3'
                              }`}
                            >
                              <span className="font-semiwide text-xs font-extrabold">{opt}</span>
                              <span
                                className={`size-4 rounded-xs border flex items-center justify-center text-xs shrink-0 ml-2 ${
                                  isSelected
                                    ? 'bg-brand border-brand text-white'
                                    : 'border-line dark:border-night-line'
                                }`}
                              >
                                {isSelected ? <CheckIcon className="size-3 stroke-[2.5]" aria-hidden="true" /> : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Question 4: Commentaire */}
              <div className="space-y-1.5 pt-2 border-t border-line dark:border-night-line">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="poll-comment"
                    className="block font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3"
                  >
                    Commentaire / Remarque (facultatif)
                  </label>
                  <span className="font-narrow text-xs font-bold text-ink-3 dark:text-snow-3 tabular-nums">
                    {comment.length}/500
                  </span>
                </div>
                <textarea
                  id="poll-comment"
                  rows={2}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Je rejoins le groupe au carrefour de Corroy..."
                  className="w-full rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-3 p-3 font-sans text-xs text-ink dark:text-snow placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center rounded-sm bg-brand hover:bg-brand-strong py-3 px-5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white shadow-2xs transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isPending
                  ? 'Enregistrement en cours...'
                  : myResponse
                    ? 'Mettre à jour ma réponse'
                    : 'Confirmer ma participation'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Tally & List of Participants */}
        <div className="lg:col-span-7 space-y-6">
          {/* Summary Stats Grid */}
          <section
            aria-label="Télémétrie des pelotons"
            className="relative corner-ticks rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-4 sm:p-5 dark:[--tick:var(--color-snow-3)]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-line dark:divide-night-line">
              <div className="space-y-0.5 text-center">
                <div className="font-narrow text-2xl sm:text-3xl font-extrabold text-ink dark:text-snow tabular-nums">
                  {saturdayCount}
                </div>
                <div className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                  Samedi matin
                </div>
              </div>

              <div className="space-y-0.5 text-center sm:pl-4 pt-3 sm:pt-0">
                <div className="font-narrow text-2xl sm:text-3xl font-extrabold text-ink dark:text-snow tabular-nums">
                  {sundayCount}
                </div>
                <div className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                  Dimanche matin
                </div>
              </div>

              <div className="space-y-0.5 text-center sm:pl-4 pt-3 sm:pt-0">
                <div className="font-narrow text-2xl sm:text-3xl font-extrabold text-vert dark:text-vert-vif tabular-nums">
                  {responses.filter((r) => r.dayChoice === 'les-deux').length}
                </div>
                <div className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-vert dark:text-vert-vif">
                  Les 2 jours
                </div>
              </div>

              <div className="space-y-0.5 text-center sm:pl-4 pt-3 sm:pt-0">
                <div className="font-narrow text-2xl sm:text-3xl font-extrabold text-ink-3 dark:text-snow-3 tabular-nums">
                  {absentCount}
                </div>
                <div className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                  Absents
                </div>
              </div>
            </div>
          </section>

          {/* Group Breakdown Cards */}
          <div className="rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-semiwide text-sm font-extrabold uppercase tracking-tight text-ink dark:text-snow">
              Répartition par Groupe de niveau
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GROUP_OPTIONS.filter((g) => g.id !== 'Autre').map((grp) => {
                const count = groupCounts[grp.id] || 0;
                const percentage = activeAttendees.length > 0 ? (count / activeAttendees.length) * 100 : 0;

                return (
                  <div key={grp.id} className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-3 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <RoadSwatch group={grp.id.replace('Groupe ', '') as CyclingGroup} className="w-9" />
                        <span className="font-semiwide text-xs font-extrabold text-ink dark:text-snow">{grp.label}</span>
                      </span>
                      <span className="font-narrow text-xs font-extrabold tabular-nums text-ink dark:text-snow">
                        {count} coureur{count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="relative h-2 w-full border border-ink/40 dark:border-snow-3/40 bg-paper-2 dark:bg-night overflow-hidden rounded-xs">
                      <div
                        className="absolute inset-y-0 left-0 w-(--w) bg-ink transition-[width] duration-500 ease-(--ease-plot) dark:bg-snow-2"
                        style={{ '--w': `${percentage}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participants Directory */}
          <div className="rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line dark:border-night-line pb-4">
              <div>
                <h3 className="font-semiwide text-sm font-extrabold uppercase tracking-tight text-ink dark:text-snow tabular-nums">
                  Liste des participants ({filteredResponses.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-3 px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.04em] text-ink dark:text-snow focus:outline-hidden min-h-[44px] cursor-pointer"
                  aria-label="Filtrer par jour"
                >
                  <option value="all">Tous les jours</option>
                  <option value="samedi">Samedi</option>
                  <option value="dimanche">Dimanche</option>
                  <option value="absent">Absents</option>
                </select>

                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-3 px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.04em] text-ink dark:text-snow focus:outline-hidden min-h-[44px] cursor-pointer"
                  aria-label="Filtrer par groupe"
                >
                  <option value="all">Tous les groupes</option>
                  <option value="Groupe A">Groupe A</option>
                  <option value="Groupe B">Groupe B</option>
                  <option value="Groupe C">Groupe C</option>
                  <option value="Groupe VTT">Groupe VTT</option>
                </select>
              </div>
            </div>

            {filteredResponses.length === 0 ? (
              <p className="text-xs text-center py-8 text-ink-3 dark:text-snow-3 italic">
                Aucune réponse correspondant aux filtres sélectionnés.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredResponses.map((res) => {
                  const dayBadge = DAY_OPTIONS.find((d) => d.id === res.dayChoice);
                  const isAbsent = res.dayChoice === 'absent';
                  const initials = getInitials(res.memberName);

                  return (
                    <div
                      key={res.id}
                      className={`flex items-start justify-between p-3 rounded-sm border border-line dark:border-night-line transition-colors ${
                        isAbsent
                          ? 'bg-paper-2/40 dark:bg-night-3/40 opacity-60'
                          : 'bg-paper dark:bg-night-3 hover:border-ink dark:hover:border-snow-3'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Stamp avatar */}
                        <div className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-night-2 dark:bg-night-line border border-line dark:border-night-line flex items-center justify-center font-narrow font-bold text-xs text-white select-none">
                          <span>{initials}</span>
                          {res.memberPhotoUrl &&
                            !res.memberPhotoUrl.includes('placehold') &&
                            !res.memberPhotoUrl.includes('default-avatar') && (
                              <Image
                                src={res.memberPhotoUrl}
                                alt={res.memberName}
                                fill
                                unoptimized
                                sizes="36px"
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                        </div>

                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-semiwide text-xs font-extrabold text-ink dark:text-snow truncate">
                            {res.memberName}
                          </div>
                          <div className="flex items-center gap-1.5 font-narrow text-xs text-ink-3 dark:text-snow-3">
                            {dayBadge && (
                              <span className="inline-flex items-center gap-1 font-bold text-ink dark:text-snow truncate">
                                <dayBadge.Icon className="size-3.5 text-brand-vif shrink-0" aria-hidden="true" />
                                <span className="truncate">{dayBadge.label}</span>
                              </span>
                            )}
                            {!isAbsent && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-ink-2 dark:text-snow-2 shrink-0">{res.groupChoice}</span>
                              </>
                            )}
                          </div>
                          {res.comment && (
                            <p className="text-xs italic text-ink-2 dark:text-snow-2 bg-paper-2 dark:bg-night-2 p-2 rounded-sm border border-line dark:border-night-line mt-1 line-clamp-2 break-words">
                              &laquo; {res.comment} &raquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
