'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';
import { useAuth } from '@/app/context/AuthContext';
import { RoadSwatch } from '@/app/components/carte/RoadSwatch';
import { SheetHeader } from '@/app/components/carte/SheetHeader';
import { buttonVariants } from '@/app/components/ui/Button';
import { buildPollShareMessage, type WeekendTrace } from '@/app/lib/poll-share';
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
  /** GPS traces the calendar lists for the poll's weekend. */
  traces?: WeekendTrace[];
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

const SHEET_TITLE = 'Votre week-end à vélo';
const SHEET_NAME = 'Sondage du week-end';
const ctaClass =
  'inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-brand px-6 py-2.5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white shadow-2xs transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

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

/** Figma 23:2597: previews the live poll summary and opens WhatsApp with it (wa.me lets the user pick the group). */
function ShareGroupCard({ message }: { message: string }): React.ReactElement {
  return (
    <section
      aria-labelledby="sondage-partage"
      className="mt-6 flex flex-col items-start gap-4 rounded-md border border-line bg-white p-5 sm:p-8 dark:border-night-line dark:bg-night-2"
    >
      <h2 id="sondage-partage" className="text-lg font-bold leading-[1.3] text-ink dark:text-snow">
        Prévenir le groupe
      </h2>
      <p className="text-sm text-ink-3 dark:text-snow-3">
        Un message, un lien : chacun vote directement dans le sondage.
      </p>
      <p className="w-full whitespace-pre-line break-words rounded-md border border-line bg-paper p-4 text-base leading-[1.6] text-ink-2 dark:border-night-line dark:bg-night-3 dark:text-snow-2">
        {/* WhatsApp renders *bold*; the preview shows the plain text. */}
        {message.replaceAll('*', '')}
      </p>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: 'outline' })}
      >
        <ShareIcon className="size-4 shrink-0" aria-hidden="true" />
        Partager sur WhatsApp
      </a>
      <p className="text-xs leading-[1.4] text-ink-3 dark:text-snow-3">
        Ouvre WhatsApp avec le message et le lien du sondage.
      </p>
    </section>
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
    idle: {
      text: 'Cochez vos créneaux : votre réponse s’enregistre toute seule.',
      tone: 'text-ink-3 dark:text-snow-3',
    },
    saving: { text: 'Enregistrement…', tone: 'text-ink-3 dark:text-snow-3' },
    saved: {
      text: absent
        ? 'Absence enregistrée · modifiable à tout moment'
        : `${slotsLabel(slots)} enregistré · modifiable à tout moment`,
      tone: 'text-vert-strong dark:text-vert-vif',
    },
    'need-group': {
      text: 'Choisissez votre groupe pour enregistrer.',
      tone: 'text-brand dark:text-brand-soft',
    },
    error: {
      text: 'Échec de l’enregistrement, réessayez.',
      tone: 'text-brand dark:text-brand-soft',
    },
  };

  // Printed inside the page cartouche (SheetHeader), which carries the title and the card chrome.
  return (
    <section aria-label={`Réponse de ${user.name}`} className="flex flex-col gap-3 sm:gap-4">
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
        <p className="text-sm text-ink-3 dark:text-snow-3">
          Plusieurs créneaux possibles, ou « Absent » uniquement.
        </p>
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

      <p
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 text-sm ${statusLine[status].tone}`}
      >
        {status === 'saved' && <CheckCircleIcon className="size-6 shrink-0" aria-hidden="true" />}
        <span>{statusLine[status].text}</span>
      </p>

      <fieldset disabled={isClosed} className="flex flex-col gap-2 sm:gap-3">
        <legend className="contents">
          <span className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-lg font-bold leading-tight text-ink dark:text-snow">
              Avec quel groupe ?
            </span>
            <span className="text-right text-xs text-ink-3 dark:text-snow-3">
              Choix conservé pour la prochaine fois
            </span>
          </span>
        </legend>
        <p className="text-sm text-ink-3 dark:text-snow-3">
          Pas de distance à choisir : elle dépend de votre groupe.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {POLL_GROUP_OPTIONS.map((opt) => {
            const count = optionCount(opt.key);
            const name = pollGroupName(
              { groupChoice: opt.group, groupVariant: opt.variant },
              label
            );
            return (
              <ChoiceCard
                key={opt.key}
                type="radio"
                name="group"
                checked={groupKey === opt.key}
                onChange={() => pickGroup(opt.key)}
                title={count > 0 ? `${name} · ${count} membre${plural(count)}` : name}
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
          <span className="text-sm font-semibold text-ink dark:text-snow">
            Ajouter une remarque
          </span>
          <span className="flex items-center gap-2 text-xs text-ink-3 dark:text-snow-3">
            {comment.trim() ? 'Remarque ajoutée' : 'Facultatif'}
            <ChevronDownIcon
              className="size-6 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
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

export default function WeekendPollView({
  poll,
  responses,
  members: _members,
  traces = [],
}: WeekendPollViewProps): React.ReactElement {
  const { fullName: groupFullName, label } = useGroupLabels();
  const { user, isAuthenticated } = useAuth();
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterSlot, setFilterSlot] = useState<string>('all');

  if (!poll) {
    return (
      <SheetHeader
        sheet={SHEET_NAME}
        title={SHEET_TITLE}
        description="Aucun sondage actif pour le moment. Le prochain sondage des sorties du week-end sera ouvert par les capitaines de route."
        actions={
          <Link href="/calendrier" className={ctaClass}>
            <span>Consulter le calendrier des sorties</span>
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        }
      />
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

  // Live tally printed as the cartouche legend (SheetHeader rule: key facts in the legend, not metric tiles).
  const legend = [
    ...POLL_SLOTS.map((s) => ({
      term: s.label,
      value: `${tally.bySlot[s.id]} membre${plural(tally.bySlot[s.id])}`,
      hint: s.departure,
    })),
    { term: 'Absents', value: `${tally.absent} membre${plural(tally.absent)}` },
  ];
  const signedIn = isAuthenticated && user;

  // Group breakdown printed in the cartouche legend column, under the slot tally.
  const groupBreakdown = (
    <section aria-labelledby="sondage-groupes" className="space-y-3">
      <h2
        id="sondage-groupes"
        className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3"
      >
        Répartition par Groupe de niveau
      </h2>
      <ul className="space-y-3">
        {Object.keys(groupCounts).map((grp) => {
          const count = groupCounts[grp];
          const percentage = riders.length > 0 ? (count / riders.length) * 100 : 0;
          return (
            <li key={grp} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5">
                  <RoadSwatch group={grp.replace('Groupe ', '') as CyclingGroup} className="w-7" />
                  <span className="font-semiwide text-xs font-extrabold text-ink dark:text-snow">
                    {groupFullName(grp)}
                  </span>
                </span>
                <span className="font-narrow text-xs font-extrabold tabular-nums text-ink dark:text-snow">
                  {count} membre{plural(count)}
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-xs border border-ink/40 bg-paper-2 dark:border-snow-3/40 dark:bg-night">
                <div
                  className="absolute inset-y-0 left-0 w-(--w) bg-ink transition-[width] duration-500 ease-(--ease-plot) dark:bg-snow-2"
                  style={{ '--w': `${percentage}%` } as React.CSSProperties}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <>
      <SheetHeader
        sheet={SHEET_NAME}
        title={SHEET_TITLE}
        description={poll.title}
        legend={legend}
        legendFooter={groupBreakdown}
        actions={
          signedIn ? undefined : (
            <Link href="/login?redirect=/sondage" className={ctaClass}>
              Se connecter pour répondre
            </Link>
          )
        }
      >
        {signedIn ? (
          <QuickVoteCard
            key={user.id}
            poll={poll}
            user={user}
            myResponse={myResponse}
            responses={responses}
          />
        ) : (
          <p className="max-w-[62ch] text-sm leading-relaxed text-ink-2 dark:text-snow-2">
            Connectez-vous avec votre compte membre pour indiquer vos créneaux et votre groupe.
          </p>
        )}
      </SheetHeader>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="space-y-4 rounded-sm border border-line bg-white p-5 shadow-2xs sm:p-6 dark:border-night-line dark:bg-night-2">
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
            <ul className="grid max-h-[500px] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className="truncate font-semiwide text-xs font-extrabold text-ink dark:text-snow">
                        {res.memberName}
                      </div>
                      <div className="font-narrow text-xs text-ink-3 dark:text-snow-3">
                        <span className="font-bold text-ink dark:text-snow">
                          {slotsLabel(slots)}
                        </span>
                        {!isAbsentRow && res.groupChoice && (
                          <span className="font-bold text-ink-2 dark:text-snow-2">
                            {' '}
                            • {pollGroupName(res, label)}
                          </span>
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

        <ShareGroupCard
          message={buildPollShareMessage({ poll, responses, traces, groupName: label })}
        />
      </section>
    </>
  );
}
