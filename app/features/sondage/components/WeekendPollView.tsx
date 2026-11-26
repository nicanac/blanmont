'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ArrowRightIcon, CalendarDaysIcon, CheckCircleIcon, ChevronDownIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';
import { useAuth } from '@/app/context/AuthContext';
import { RoadSwatch } from '@/app/components/carte/RoadSwatch';
import type { CyclingGroup } from '@/app/constants/cycling';
import type { WeekendPoll, PollResponse, Member, PollSlot } from '@/app/types';
import { submitWeekendPollResponseAction, deleteWeekendPollResponseAction } from '@/app/actions';
import {
  POLL_SLOTS,
  POLL_GROUP_OPTIONS,
  responseSlots,
  responseGroupKey,
  pollGroupName,
  slotsLabel,
  tallySlots,
} from '@/app/lib/poll-slots';

interface WeekendPollViewProps {
  poll: WeekendPoll | null;
  responses: PollResponse[];
  members: Member[];
}

/** Last group picked on this device, preselected on the next poll ("choix conservé"). */
const REMEMBERED_GROUP_KEY = 'blanmont:sondage-group';

/** Questions auto-added before 2026-11 to pick a Saturday distance: the group now decides it. */
const isDistanceQuestion = (id: string): boolean => id.startsWith('q-distance-');

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const plural = (n: number): string => (n > 1 ? 's' : '');

type SaveStatus = 'idle' | 'saving' | 'saved' | 'need-group' | 'error';

/** Selectable card shared by the slot checkboxes and the group radios. */
function ChoiceCard({
  type,
  name,
  checked,
  onChange,
  title,
  detail,
}: {
  type: 'checkbox' | 'radio';
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
}): React.ReactElement {
  return (
    <label
      className={`flex min-h-[44px] cursor-pointer flex-col gap-1 rounded-md border p-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand has-disabled:cursor-not-allowed has-disabled:opacity-60 sm:p-3 ${
        checked
          ? 'border-brand bg-brand-tint dark:border-brand-soft dark:bg-brand/15'
          : 'border-line bg-white hover:border-line-strong dark:border-night-line dark:bg-night-2 dark:hover:border-snow-3'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <input
          type={type}
          name={name}
          checked={checked}
          onChange={onChange}
          className="size-[18px] shrink-0 cursor-pointer accent-brand focus-visible:outline-none"
        />
        <span className="text-sm leading-snug text-ink dark:text-snow">{title}</span>
      </span>
      <span className="text-xs leading-snug text-ink-3 sm:text-sm dark:text-snow-3">{detail}</span>
    </label>
  );
}

/**
 * Quick vote: every tick saves at once (no submit button); unticking every slot withdraws the answer.
 */
function QuickVoteCard({
  poll,
  user,
  myResponse,
  responses,
}: {
  poll: WeekendPoll;
  user: { id: string; name: string; avatarUrl?: string };
  myResponse: PollResponse | null;
  responses: PollResponse[];
}): React.ReactElement {
  const { label } = useGroupLabels();
  const [, startTransition] = useTransition();
  const initialSlots = myResponse ? responseSlots(myResponse) : [];
  const [slots, setSlots] = useState<PollSlot[]>(initialSlots);
  const [absent, setAbsent] = useState(Boolean(myResponse) && initialSlots.length === 0);
  const [groupKey, setGroupKey] = useState<string | null>(() => {
    if (myResponse) return responseGroupKey(myResponse);
    // Only rendered client-side (auth resolves in the browser), so localStorage is safe here.
    return typeof window === 'undefined' ? null : window.localStorage.getItem(REMEMBERED_GROUP_KEY);
  });
  const [comment, setComment] = useState(myResponse?.comment ?? '');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>(
    myResponse?.customAnswers ?? {}
  );
  const [hasAnswer, setHasAnswer] = useState(Boolean(myResponse));
  const [status, setStatus] = useState<SaveStatus>(myResponse ? 'saved' : 'idle');
  const isClosed = poll.status === 'closed';
  const questions = (poll.customQuestions ?? []).filter((q) => !isDistanceQuestion(q.id));

  // Live count per option among riders (absents excluded).
  const optionCount = (key: string): number =>
    responses.filter((r) => responseSlots(r).length > 0 && responseGroupKey(r) === key).length;

  const save = (next: {
    slots: PollSlot[];
    absent: boolean;
    groupKey: string | null;
    comment: string;
    customAnswers: Record<string, string | string[]>;
  }): void => {
    const option = POLL_GROUP_OPTIONS.find((o) => o.key === next.groupKey);
    if (!next.absent && next.slots.length === 0) {
      if (!hasAnswer) return setStatus('idle');
      setStatus('saving');
      startTransition(async () => {
        try {
          await deleteWeekendPollResponseAction(poll.id, user.id);
          setHasAnswer(false);
          setStatus('idle');
        } catch {
          setStatus('error');
          toast.error('Erreur lors du retrait de la réponse.');
        }
      });
      return;
    }
    if (!next.absent && !option) return setStatus('need-group');

    setStatus('saving');
    startTransition(async () => {
      try {
        await submitWeekendPollResponseAction({
          pollId: poll.id,
          memberId: user.id,
          memberName: user.name,
          memberPhotoUrl: user.avatarUrl,
          slots: next.absent ? [] : next.slots,
          groupChoice: option?.group,
          groupVariant: option?.variant,
          customAnswers: next.customAnswers,
          comment: next.comment,
        });
        setHasAnswer(true);
        setStatus('saved');
      } catch (err: unknown) {
        setStatus('error');
        toast.error(`Erreur : ${err instanceof Error ? err.message : String(err)}`);
      }
    });
  };

  const current = { slots, absent, groupKey, comment, customAnswers };

  const toggleSlot = (id: PollSlot): void => {
    const nextSlots = slots.includes(id) ? slots.filter((s) => s !== id) : [...slots, id];
    setSlots(nextSlots);
    setAbsent(false);
    save({ ...current, slots: nextSlots, absent: false });
  };

  const toggleAbsent = (): void => {
    const nextAbsent = !absent;
    setAbsent(nextAbsent);
    setSlots([]);
    save({ ...current, slots: [], absent: nextAbsent });
  };

  const pickGroup = (key: string): void => {
    setGroupKey(key);
    window.localStorage.setItem(REMEMBERED_GROUP_KEY, key);
    save({ ...current, groupKey: key });
  };

  const answerQuestion = (id: string, option: string, multiple?: boolean): void => {
    const prev = customAnswers[id];
    const value = multiple
      ? Array.isArray(prev) && prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...(Array.isArray(prev) ? prev : []), option]
      : option;
    const next = { ...customAnswers, [id]: value };
    setCustomAnswers(next);
    save({ ...current, customAnswers: next });
  };

  const statusLine: Record<SaveStatus, { text: string; tone: string }> = {
    idle: { text: 'Cochez vos créneaux : votre réponse s’enregistre toute seule.', tone: 'text-ink-3 dark:text-snow-3' },
    saving: { text: 'Enregistrement…', tone: 'text-ink-3 dark:text-snow-3' },
    saved: {
      text: absent
        ? 'Absence enregistrée · modifiable à tout moment'
        : `${slotsLabel(slots)} enregistré · modifiable à tout moment`,
      tone: 'text-vert-strong dark:text-vert-vif',
    },
    'need-group': { text: 'Choisissez votre groupe pour enregistrer.', tone: 'text-brand dark:text-brand-soft' },
    error: { text: 'Échec de l’enregistrement, réessayez.', tone: 'text-brand dark:text-brand-soft' },
  };

  return (
    <section
      aria-labelledby="sondage-title"
      className="flex flex-col gap-3 rounded-md border border-line bg-white p-3 sm:gap-4 sm:p-6 dark:border-night-line dark:bg-night-2"
    >
      <header className="flex items-center justify-between gap-4">
        <h1 id="sondage-title" className="text-lg font-bold leading-tight text-ink dark:text-snow">
          Votre week-end à vélo
        </h1>
        <span className="truncate text-xs text-ink-3 dark:text-snow-3">{user.name}</span>
      </header>

      {isClosed && (
        <p className="rounded-sm border border-line bg-paper-2 px-3 py-2 text-sm text-ink-2 dark:border-night-line dark:bg-night-3 dark:text-snow-2">
          Les votes sont clôturés. Rendez-vous au départ selon les groupes ci-dessous !
        </p>
      )}

      <fieldset disabled={isClosed} className="flex flex-col gap-2 sm:gap-3">
        <legend className="contents">
          <span className="block font-semiwide text-lg font-extrabold uppercase leading-tight text-ink sm:text-xl dark:text-snow">
            Quand roulez-vous ?
          </span>
        </legend>
        <p className="text-sm text-ink-3 dark:text-snow-3">Plusieurs créneaux possibles, ou « Absent » uniquement.</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {POLL_SLOTS.map((slot) => (
            <ChoiceCard
              key={slot.id}
              type="checkbox"
              name="slots"
              checked={slots.includes(slot.id)}
              onChange={() => toggleSlot(slot.id)}
              title={slot.label}
              detail={slot.departure}
            />
          ))}
          <ChoiceCard
            type="checkbox"
            name="absent"
            checked={absent}
            onChange={toggleAbsent}
            title="Absent ce week-end"
            detail="Aucun créneau sélectionné"
          />
        </div>
      </fieldset>

      <p role="status" aria-live="polite" className={`flex items-center gap-2 text-sm ${statusLine[status].tone}`}>
        {status === 'saved' && <CheckCircleIcon className="size-6 shrink-0" aria-hidden="true" />}
        <span>{statusLine[status].text}</span>
      </p>

      <fieldset disabled={isClosed} className="flex flex-col gap-2 sm:gap-3">
        <legend className="contents">
          <span className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-lg font-bold leading-tight text-ink dark:text-snow">Avec quel groupe ?</span>
            <span className="text-right text-xs text-ink-3 dark:text-snow-3">Choix conservé pour la prochaine fois</span>
          </span>
        </legend>
        <p className="text-sm text-ink-3 dark:text-snow-3">Pas de distance à choisir : elle dépend de votre groupe.</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {POLL_GROUP_OPTIONS.map((opt) => {
            const count = optionCount(opt.key);
            const name = pollGroupName({ groupChoice: opt.group, groupVariant: opt.variant }, label);
            return (
              <ChoiceCard
                key={opt.key}
                type="radio"
                name="group"
                checked={groupKey === opt.key}
                onChange={() => pickGroup(opt.key)}
                title={count > 0 ? `${name} · ${count} coureur${plural(count)}` : name}
                detail={opt.detail.replace('{GR1}', label('A'))}
              />
            );
          })}
        </div>
      </fieldset>

      {questions.map((q) => (
        <fieldset key={q.id} disabled={isClosed} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-ink dark:text-snow">{q.title}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => {
              const ans = customAnswers[q.id];
              const checked = Array.isArray(ans) ? ans.includes(opt) : ans === opt;
              return (
                <label
                  key={opt}
                  className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border px-3 text-sm ${
                    checked
                      ? 'border-brand bg-brand-tint text-ink dark:bg-brand/15 dark:text-snow'
                      : 'border-line bg-white text-ink dark:border-night-line dark:bg-night-2 dark:text-snow'
                  }`}
                >
                  <input
                    type={q.allowMultiple ? 'checkbox' : 'radio'}
                    name={q.id}
                    checked={checked}
                    onChange={() => answerQuestion(q.id, opt, q.allowMultiple)}
                    className="size-4 accent-brand"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <details className="group">
        <summary className="-my-2 flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-semibold text-ink dark:text-snow">Ajouter une remarque</span>
          <span className="flex items-center gap-2 text-xs text-ink-3 dark:text-snow-3">
            {comment.trim() ? 'Remarque ajoutée' : 'Facultatif'}
            <ChevronDownIcon className="size-6 transition-transform group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => {
            if (comment.trim() !== (myResponse?.comment ?? '').trim()) save(current);
          }}
          disabled={isClosed}
          maxLength={500}
          rows={2}
          aria-label="Remarque"
          placeholder="Ex. : je pars plus tôt, je cherche un covoiturage…"
          className="mt-2 w-full rounded-md border border-line bg-white p-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none dark:border-night-line dark:bg-night-3 dark:text-snow"
        />
      </details>
    </section>
  );
}

export default function WeekendPollView({ poll, responses, members: _members }: WeekendPollViewProps): React.ReactElement {
  const { fullName: groupFullName, label } = useGroupLabels();
  const { user, isAuthenticated } = useAuth();
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterSlot, setFilterSlot] = useState<string>('all');

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

  const myResponse = user ? (responses.find((r) => r.memberId === user.id) ?? null) : null;
  const tally = tallySlots(responses);
  const riders = responses.filter((r) => responseSlots(r).length > 0);

  const groupCounts: Record<string, number> = {
    'Groupe A': 0,
    'Groupe B': 0,
    'Groupe BC': 0,
    'Groupe C': 0,
    'Groupe VTT': 0,
  };
  riders.forEach((r) => {
    if (r.groupChoice && groupCounts[r.groupChoice] !== undefined) groupCounts[r.groupChoice]++;
  });

  const filteredResponses = responses.filter((r) => {
    if (filterGroup !== 'all' && r.groupChoice !== filterGroup) return false;
    const slots = responseSlots(r);
    if (filterSlot === 'absent') return slots.length === 0;
    if (filterSlot !== 'all') return slots.includes(filterSlot as PollSlot);
    return true;
  });

  const tallyCells: { value: number; label: string; muted?: boolean }[] = [
    ...POLL_SLOTS.map((s) => ({ value: tally.bySlot[s.id], label: s.label })),
    { value: tally.absent, label: 'Absents', muted: true },
  ];

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl">
        {!isAuthenticated || !user ? (
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
        ) : (
          <QuickVoteCard key={user.id} poll={poll} user={user} myResponse={myResponse} responses={responses} />
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <section
            aria-label="Télémétrie des pelotons"
            className="relative corner-ticks rounded-sm border border-line bg-white p-4 sm:p-5 dark:border-night-line dark:bg-night-2 dark:[--tick:var(--color-snow-3)]"
          >
            <div className="grid grid-cols-2 gap-4">
              {tallyCells.map((cell) => (
                <div key={cell.label} className="space-y-0.5 text-center">
                  <div
                    className={`font-narrow text-2xl font-extrabold tabular-nums sm:text-3xl ${
                      cell.muted ? 'text-ink-3 dark:text-snow-3' : 'text-ink dark:text-snow'
                    }`}
                  >
                    {cell.value}
                  </div>
                  <div className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                    {cell.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4 rounded-sm border border-line bg-white p-5 shadow-2xs sm:p-6 dark:border-night-line dark:bg-night-2">
            <h2 className="font-semiwide text-sm font-extrabold uppercase tracking-tight text-ink dark:text-snow">
              Répartition par Groupe de niveau
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(groupCounts).map((grp) => {
                const count = groupCounts[grp];
                const percentage = riders.length > 0 ? (count / riders.length) * 100 : 0;
                return (
                  <div key={grp} className="space-y-2 rounded-sm border border-line bg-paper p-3.5 dark:border-night-line dark:bg-night-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <RoadSwatch group={grp.replace('Groupe ', '') as CyclingGroup} className="w-9" />
                        <span className="font-semiwide text-xs font-extrabold text-ink dark:text-snow">{groupFullName(grp)}</span>
                      </span>
                      <span className="font-narrow text-xs font-extrabold tabular-nums text-ink dark:text-snow">
                        {count} coureur{plural(count)}
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-xs border border-ink/40 bg-paper-2 dark:border-snow-3/40 dark:bg-night">
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
        </div>

        <div className="space-y-4 rounded-sm border border-line bg-white p-5 shadow-2xs sm:p-6 lg:col-span-7 dark:border-night-line dark:bg-night-2">
          <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-night-line">
            <h2 className="font-semiwide text-sm font-extrabold uppercase tracking-tight tabular-nums text-ink dark:text-snow">
              Liste des participants ({filteredResponses.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={filterSlot}
                onChange={(e) => setFilterSlot(e.target.value)}
                className="min-h-[44px] cursor-pointer rounded-sm border border-line bg-paper px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.04em] text-ink focus:outline-hidden dark:border-night-line dark:bg-night-3 dark:text-snow"
                aria-label="Filtrer par créneau"
              >
                <option value="all">Tous les créneaux</option>
                {POLL_SLOTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
                <option value="absent">Absents</option>
              </select>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="min-h-[44px] cursor-pointer rounded-sm border border-line bg-paper px-3 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.04em] text-ink focus:outline-hidden dark:border-night-line dark:bg-night-3 dark:text-snow"
                aria-label="Filtrer par groupe"
              >
                <option value="all">Tous les groupes</option>
                {Object.keys(groupCounts).map((grp) => (
                  <option key={grp} value={grp}>
                    {groupFullName(grp)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredResponses.length === 0 ? (
            <p className="py-8 text-center text-xs italic text-ink-3 dark:text-snow-3">
              Aucune réponse correspondant aux filtres sélectionnés.
            </p>
          ) : (
            <ul className="grid max-h-[500px] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredResponses.map((res) => {
                const slots = responseSlots(res);
                const isAbsentRow = slots.length === 0;
                return (
                  <li
                    key={res.id}
                    className={`flex items-start gap-3 rounded-sm border border-line p-3 transition-colors dark:border-night-line ${
                      isAbsentRow
                        ? 'bg-paper-2/40 opacity-60 dark:bg-night-3/40'
                        : 'bg-paper hover:border-ink dark:bg-night-3 dark:hover:border-snow-3'
                    }`}
                  >
                    <div className="relative flex size-9 shrink-0 select-none items-center justify-center overflow-hidden rounded-sm border border-line bg-night-2 font-narrow text-xs font-bold text-white dark:border-night-line dark:bg-night-line">
                      <span>{getInitials(res.memberName)}</span>
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
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="truncate font-semiwide text-xs font-extrabold text-ink dark:text-snow">{res.memberName}</div>
                      <div className="font-narrow text-xs text-ink-3 dark:text-snow-3">
                        <span className="font-bold text-ink dark:text-snow">{slotsLabel(slots)}</span>
                        {!isAbsentRow && res.groupChoice && (
                          <span className="font-bold text-ink-2 dark:text-snow-2"> • {pollGroupName(res, label)}</span>
                        )}
                      </div>
                      {res.comment && (
                        <p className="mt-1 line-clamp-2 break-words rounded-sm border border-line bg-paper-2 p-2 text-xs italic text-ink-2 dark:border-night-line dark:bg-night-2 dark:text-snow-2">
                          &laquo; {res.comment} &raquo;
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
