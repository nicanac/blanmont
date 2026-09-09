'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
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
  { id: 'absent', label: 'Absent ce weekend', subtitle: 'Ne roule pas ce weekend', Icon: XMarkIcon },
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
      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e]">
          <CalendarDaysIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#101216] dark:text-white">Aucun sondage actif pour le moment</h2>
        <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed max-w-md mx-auto">
          Le prochain sondage pour les sorties du weekend sera ouvert prochainement par les capitaines de route.
        </p>
        <Link
          href="/calendrier"
          className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-colors min-h-[44px]"
        >
          <span>Consulter le calendrier des sorties</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
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
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-8 text-center shadow-xs space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e]">
                <LockClosedIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] dark:text-white">Connexion requise</h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Connectez-vous avec votre compte membre pour voter et indiquer vos préférences de sortie.
              </p>
              <Link
                href="/login?redirect=/sondage"
                className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-colors min-h-[44px]"
              >
                Se connecter pour répondre
              </Link>
            </div>
          ) : isClosed ? (
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-8 text-center shadow-xs space-y-3">
              <InformationCircleIcon className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="text-base font-bold text-[#101216] dark:text-white">Les votes sont clôturés</h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                Ce sondage est désormais fermé. Rendez-vous au départ selon les groupes ci-contre !
              </p>
            </div>
          ) : myResponse && !isEditing ? (
            /* Already voted summary card */
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-base font-bold text-[#101216] dark:text-white">
                    Votre participation est confirmée
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-3 py-1 text-xs font-semibold text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors min-h-[36px]"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  <span>Modifier</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#efece5] dark:border-[#262b38]">
                  <span className="text-[#5c6370] dark:text-[#a7adbb]">Membre :</span>
                  <strong className="text-[#101216] dark:text-white truncate max-w-[200px]">{user?.name}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-[#efece5] dark:border-[#262b38]">
                  <span className="text-[#5c6370] dark:text-[#a7adbb]">Jour(s) :</span>
                  <span className="font-bold text-[#101216] dark:text-white capitalize">
                    {DAY_OPTIONS.find((d) => d.id === myResponse.dayChoice)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#efece5] dark:border-[#262b38]">
                  <span className="text-[#5c6370] dark:text-[#a7adbb]">Groupe :</span>
                  <span className="font-bold text-[#101216] dark:text-white">{myResponse.groupChoice}</span>
                </div>
                {myResponse.comment && (
                  <div className="py-2 border-b border-[#efece5] dark:border-[#262b38]">
                    <span className="text-[#5c6370] dark:text-[#a7adbb] block mb-1">Remarque :</span>
                    <p className="italic text-[#3a3f4a] dark:text-[#d1d5db] bg-[#faf8f5] dark:bg-[#101216] p-2.5 rounded-md border border-[#efece5] dark:border-[#262b38] break-words">
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
                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors py-2"
                >
                  Annuler ma participation
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-slate-900 dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-[#101216] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors min-h-[36px]"
                >
                  Modifier mon choix
                </button>
              </div>
            </div>
          ) : (
            /* Interactive QCM Voting Form */
            <form
              onSubmit={handleSubmitResponse}
              className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#efece5] dark:border-[#262b38] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#101216] dark:text-white">
                    {myResponse ? 'Modifier votre réponse' : 'Votre réponse au sondage'}
                  </h3>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] mt-0.5">
                    Connecté en tant que <strong className="text-[#101216] dark:text-white">{user?.name}</strong>
                  </p>
                </div>
                {myResponse && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-400 hover:text-[#3a3f4a] dark:hover:text-white p-1"
                  >
                    Fermer
                  </button>
                )}
              </div>

              {/* Question 1: Jours */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3a3f4a] dark:text-[#d1d5db]">
                  1. Quel(s) jour(s) roulez-vous ce weekend ? *
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
                        className={`group flex items-start gap-3 p-3.5 rounded-md border text-left transition-all min-h-[54px] ${
                          isSelected
                            ? 'border-[#e03e3e] bg-red-50/50 dark:bg-red-950/30 ring-2 ring-[#e03e3e]/20'
                            : 'border-[#e4e0d8] dark:border-[#262b38] hover:border-slate-300 dark:hover:border-white/20 hover:bg-[#f2efe9]/60 dark:hover:bg-[#1d2128]'
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            isSelected
                              ? 'border-[#e03e3e] bg-[#e03e3e] text-white'
                              : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] text-[#101216] dark:text-[#f5f6f8] group-hover:border-[#e03e3e]/40'
                          }`}
                        >
                          <DayIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#101216] dark:text-white">{opt.label}</div>
                          <div className="text-xs text-[#5c6370] dark:text-[#a7adbb]">{opt.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Groupe (if attending) */}
              {selectedDay !== 'absent' && (
                <div className="space-y-3 pt-2 border-t border-[#efece5] dark:border-[#262b38]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3a3f4a] dark:text-[#d1d5db]">
                    2. Dans quel groupe souhaitez-vous rouler ? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GROUP_OPTIONS.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setSelectedGroup(grp.id)}
                        className={`flex items-center justify-between p-3 rounded-md border text-left transition-all min-h-[44px] ${
                          selectedGroup === grp.id
                            ? 'border-[#e03e3e] bg-red-50/50 dark:bg-red-950/30 ring-2 ring-[#e03e3e]/20 font-bold'
                            : 'border-[#e4e0d8] dark:border-[#262b38] hover:border-slate-300 dark:hover:border-white/20 hover:bg-[#f2efe9]/60 dark:hover:bg-[#1d2128]'
                        }`}
                      >
                        <span className="text-xs text-[#101216] dark:text-white">{grp.label}</span>
                        <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] font-medium tabular-nums">{grp.speed}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Admin Questions (if any) */}
              {poll.customQuestions && poll.customQuestions.length > 0 && selectedDay !== 'absent' && (
                <div className="space-y-4 pt-2 border-t border-[#efece5] dark:border-[#262b38]">
                  {poll.customQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-2">
                      <label className="block text-xs font-bold text-[#101216] dark:text-white">
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
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border text-xs text-left transition-all min-h-[44px] ${
                                isSelected
                                  ? 'border-[#e03e3e] bg-red-50/50 dark:bg-red-950/30 text-red-950 dark:text-red-200 font-bold'
                                  : 'border-[#e4e0d8] dark:border-[#262b38] text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#1d2128]'
                              }`}
                            >
                              <span>{opt}</span>
                              <span
                                className={`h-4 w-4 rounded-full border flex items-center justify-center text-xs shrink-0 ml-2 ${
                                  isSelected
                                    ? 'bg-[#e03e3e] border-[#e03e3e] text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isSelected ? '✓' : ''}
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
              <div className="space-y-1.5 pt-2 border-t border-[#efece5] dark:border-[#262b38]">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="poll-comment"
                    className="block text-xs font-bold uppercase tracking-wider text-[#3a3f4a] dark:text-[#d1d5db]"
                  >
                    Commentaire / Remarque (facultatif)
                  </label>
                  <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] tabular-nums">
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
                  className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-3 text-xs text-[#101216] dark:text-white placeholder:text-[#5c6370] dark:placeholder:text-[#a7adbb] focus:border-[#e03e3e] focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center rounded-md bg-[#e03e3e] py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#c93434] transition-all disabled:opacity-50 active:scale-[0.98] min-h-[44px]"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-[#101216] dark:text-white tabular-nums">{saturdayCount}</div>
              <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider mt-0.5">
                Samedi matin
              </div>
            </div>
            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-[#101216] dark:text-white tabular-nums">{sundayCount}</div>
              <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider mt-0.5">
                Dimanche matin
              </div>
            </div>
            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {responses.filter((r) => r.dayChoice === 'les-deux').length}
              </div>
              <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider mt-0.5">
                Les 2 jours
              </div>
            </div>
            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-400 dark:text-slate-500 tabular-nums">{absentCount}</div>
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                Absents
              </div>
            </div>
          </div>

          {/* Group Breakdown Cards */}
          <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#3a3f4a] dark:text-[#d1d5db]">
              Répartition par Groupe de niveau
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GROUP_OPTIONS.filter((g) => g.id !== 'Autre').map((grp) => {
                const count = groupCounts[grp.id] || 0;
                const percentage = activeAttendees.length > 0 ? (count / activeAttendees.length) * 100 : 0;

                return (
                  <div key={grp.id} className="rounded-md border border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#1d2128] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#101216] dark:text-white">{grp.label}</span>
                      <span className="text-sm font-extrabold text-[#101216] dark:text-white tabular-nums">
                        {count} coureur{count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#262b38] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#e03e3e] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participants Directory */}
          <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#efece5] dark:border-[#262b38] pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#101216] dark:text-white tabular-nums">
                  Liste des participants ({filteredResponses.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-[#1d2128] px-3 py-1.5 text-xs font-medium text-[#3a3f4a] dark:text-[#a7adbb] focus:outline-hidden min-h-[36px]"
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
                  className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-[#1d2128] px-3 py-1.5 text-xs font-medium text-[#3a3f4a] dark:text-[#a7adbb] focus:outline-hidden min-h-[36px]"
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
              <p className="text-xs text-center py-8 text-slate-400 italic">
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
                      className={`flex items-start justify-between p-3 rounded-md border transition-all ${
                        isAbsent
                          ? 'border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/40 dark:bg-[#1d2128]/40 opacity-60'
                          : 'border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#1d2128] hover:bg-white dark:hover:bg-[#161922]/80'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Layered Avatar Container for 100% resilient fallback */}
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#161922] dark:bg-[#262b38] border border-[#e4e0d8] dark:border-white/10 flex items-center justify-center font-bold text-xs text-white select-none">
                          <span>{initials}</span>
                          {res.memberPhotoUrl &&
                            !res.memberPhotoUrl.includes('placehold') &&
                            !res.memberPhotoUrl.includes('default-avatar') && (
                              <img
                                src={res.memberPhotoUrl}
                                alt={res.memberName}
                                className="absolute inset-0 h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                        </div>

                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#101216] dark:text-white truncate">
                            {res.memberName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                            {dayBadge && (
                              <span className="inline-flex items-center gap-1 font-medium text-[#101216] dark:text-[#e4e0d8] truncate">
                                <dayBadge.Icon className="h-3.5 w-3.5 text-[#e03e3e] shrink-0" />
                                <span className="truncate">{dayBadge.label}</span>
                              </span>
                            )}
                            {!isAbsent && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-[#3a3f4a] dark:text-[#d1d5db] shrink-0">{res.groupChoice}</span>
                              </>
                            )}
                          </div>
                          {res.comment && (
                            <p className="text-xs text-[#3a3f4a] dark:text-[#d1d5db] italic line-clamp-2 mt-1 break-words">
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
