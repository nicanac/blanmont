'use client';

import React, { useState, useTransition } from 'react';
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
  CheckCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  LockClosedIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface WeekendPollViewProps {
  poll: WeekendPoll | null;
  responses: PollResponse[];
  members: Member[];
}

const DAY_OPTIONS: { id: PollDayChoice; label: string; subtitle: string; icon: string }[] = [
  { id: 'samedi', label: 'Samedi matin', subtitle: 'Sortie officielle du club', icon: '🚴‍♂️' },
  { id: 'dimanche', label: 'Dimanche matin', subtitle: 'Sortie dominicale', icon: '🚴‍♀️' },
  { id: 'les-deux', label: 'Les 2 jours', subtitle: 'Samedi & Dimanche', icon: '🔥' },
  { id: 'absent', label: 'Absent ce weekend', subtitle: 'Ne roule pas ce weekend', icon: '🚫' },
];

const GROUP_OPTIONS: { id: CyclingGroupChoice; label: string; speed: string; color: string }[] = [
  { id: 'Groupe A', label: 'Groupe A', speed: '> 30 km/h', color: 'border-red-200 bg-red-50 text-red-800' },
  { id: 'Groupe B', label: 'Groupe B', speed: '25 - 28 km/h', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { id: 'Groupe C', label: 'Groupe C', speed: '< 25 km/h', color: 'border-green-200 bg-green-50 text-green-800' },
  { id: 'Groupe VTT', label: 'Groupe VTT', speed: 'Sentiers & Bois', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { id: 'Autre', label: 'Autre / Libre', speed: 'Horaires décalés', color: 'border-slate-200 bg-slate-50 text-slate-700' },
];

export default function WeekendPollView({ poll, responses, members }: WeekendPollViewProps) {
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
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
          <CalendarDaysIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Aucun sondage actif pour le moment</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Le prochain sondage pour les sorties du weekend sera ouvert prochainement par les capitaines de route.
        </p>
        <Link
          href="/calendrier"
          className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-colors"
        >
          <span>Consulter le calendrier des sorties</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const isClosed = poll.status === 'closed';

  const handleCustomRadioChange = (questionId: string, option: string) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleCustomCheckboxChange = (questionId: string, option: string) => {
    setCustomAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
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

  const handleDeleteResponse = () => {
    if (!user || !myResponse) return;
    if (!confirm('Voulez-vous retirer votre réponse à ce sondage ?')) return;

    startTransition(async () => {
      try {
        await deleteWeekendPollResponseAction(poll.id, user.id);
        toast.success('Votre réponse a été retirée.');
        setIsEditing(true);
      } catch (err: unknown) {
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
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
                <LockClosedIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Connexion requise</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connectez-vous avec votre compte membre pour voter et indiquer vos préférences de sortie.
              </p>
              <Link
                href="/login?redirect=/sondage"
                className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-colors"
              >
                Se connecter pour répondre
              </Link>
            </div>
          ) : isClosed ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-3">
              <InformationCircleIcon className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Les votes sont clôturés</h3>
              <p className="text-xs text-slate-500">
                Ce sondage est désormais fermé. Rendez-vous au départ selon les groupes ci-contre !
              </p>
            </div>
          ) : myResponse && !isEditing ? (
            /* Already voted summary card */
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-base font-bold text-emerald-950">
                    Votre participation est confirmée
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  <span>Modifier</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-emerald-100">
                  <span className="text-slate-500">Membre :</span>
                  <strong className="text-slate-900">{user?.name}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-100">
                  <span className="text-slate-500">Jour(s) :</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {DAY_OPTIONS.find((d) => d.id === myResponse.dayChoice)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-100">
                  <span className="text-slate-500">Groupe :</span>
                  <span className="font-bold text-slate-900">{myResponse.groupChoice}</span>
                </div>
                {myResponse.comment && (
                  <div className="py-2 border-b border-emerald-100">
                    <span className="text-slate-500 block mb-1">Remarque :</span>
                    <p className="italic text-slate-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
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
                  className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Annuler ma participation
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Modifier mon choix
                </button>
              </div>
            </div>
          ) : (
            /* Interactive QCM Voting Form */
            <form
              onSubmit={handleSubmitResponse}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {myResponse ? 'Modifier votre réponse' : 'Votre réponse au sondage'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connecté en tant que <strong className="text-slate-800">{user?.name}</strong>
                  </p>
                </div>
                {myResponse && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Fermer
                  </button>
                )}
              </div>

              {/* Question 1: Jours */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Quel(s) jour(s) roulez-vous ce weekend ? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedDay(opt.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        selectedDay === opt.id
                          ? 'border-[#e03e3e] bg-red-50/50 ring-2 ring-[#e03e3e]/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                        <div className="text-[11px] text-slate-500">{opt.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Groupe (if attending) */}
              {selectedDay !== 'absent' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Dans quel groupe souhaitez-vous rouler ? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GROUP_OPTIONS.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setSelectedGroup(grp.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          selectedGroup === grp.id
                            ? 'border-[#e03e3e] bg-red-50/50 ring-2 ring-[#e03e3e]/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <span className="text-xs text-slate-900">{grp.label}</span>
                        <span className="text-[11px] font-medium text-slate-500">{grp.speed}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Admin Questions (if any) */}
              {poll.customQuestions && poll.customQuestions.length > 0 && selectedDay !== 'absent' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {poll.customQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
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
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all ${
                                isSelected
                                  ? 'border-[#e03e3e] bg-red-50/40 text-slate-900 font-bold'
                                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt}</span>
                              <span
                                className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                                  isSelected
                                    ? 'bg-[#e03e3e] border-[#e03e3e] text-white'
                                    : 'border-slate-300'
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
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label
                  htmlFor="poll-comment"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Commentaire / Remarque (facultatif)
                </label>
                <textarea
                  id="poll-comment"
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Je rejoins le groupe au carrefour de Corroy..."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-[#e03e3e] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c93434] transition-all disabled:opacity-50 active:scale-98"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-900">{saturdayCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Samedi matin
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-900">{sundayCount}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Dimanche matin
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-black text-emerald-600">
                {responses.filter((r) => r.dayChoice === 'les-deux').length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Les 2 jours
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-black text-slate-400">{absentCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Absents
              </div>
            </div>
          </div>

          {/* Group Breakdown Cards */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Répartition par Groupe de niveau
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GROUP_OPTIONS.filter((g) => g.id !== 'Autre').map((grp) => {
                const count = groupCounts[grp.id] || 0;
                const percentage = activeAttendees.length > 0 ? (count / activeAttendees.length) * 100 : 0;

                return (
                  <div key={grp.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{grp.label}</span>
                      <span className="text-sm font-extrabold text-slate-900">{count} coureur{count > 1 ? 's' : ''}</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Liste des participants ({filteredResponses.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
                >
                  <option value="all">Tous les jours</option>
                  <option value="samedi">Samedi</option>
                  <option value="dimanche">Dimanche</option>
                  <option value="absent">Absents</option>
                </select>

                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
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

                  return (
                    <div
                      key={res.id}
                      className={`flex items-start justify-between p-3 rounded-2xl border transition-all ${
                        isAbsent
                          ? 'border-slate-100 bg-slate-50/40 opacity-60'
                          : 'border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                          {res.memberPhotoUrl ? (
                            <Image
                              src={res.memberPhotoUrl}
                              alt={res.memberName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span>{res.memberName.charAt(0)}</span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900">
                            {res.memberName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>{dayBadge?.icon} {dayBadge?.label}</span>
                            {!isAbsent && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-slate-700">{res.groupChoice}</span>
                              </>
                            )}
                          </div>
                          {res.comment && (
                            <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-1">
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
