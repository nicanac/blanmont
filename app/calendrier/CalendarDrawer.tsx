'use client';

import React, { useEffect, useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  CalendarEvent,
  EventReview,
  RideEffortLevel,
  RidePaceLevel,
  RoadCondition,
  RideWeatherFeedback,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useIsMounted } from '../utils/useIsMounted';
import RideWeatherBadge from '../components/ui/RideWeatherBadge';
import { submitEventReviewAction, deleteEventReviewAction } from '../actions';
import { toast } from 'sonner';
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  MapIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';

type AttendeeInfo = { name: string; group: string };

interface CalendarDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  attendees?: AttendeeInfo[];
  reviews?: EventReview[];
  onReviewsUpdated?: (reviews: EventReview[]) => void;
}

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Checks if a calendar ride has completed
 */
export function isEventDone(isoDate: string, departure: string): boolean {
  if (!isoDate) return false;
  const [yr, mo, dy] = isoDate.split('-').map(Number);
  const now = new Date();
  const eventDate = new Date(yr, mo - 1, dy);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventDate < today) return true;
  if (eventDate > today) return false;

  // Same day: check if past departure + 3 hours
  try {
    const match = departure.match(/(\d{1,2})[h:](\d{0,2})/i);
    if (match) {
      const depHour = parseInt(match[1], 10);
      const depMin = match[2] ? parseInt(match[2], 10) : 0;
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), depHour + 3, depMin);
      return now >= endTime;
    }
  } catch {
    return now.getHours() >= 13;
  }
  return false;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Sortie galère / éprouvante',
  2: 'Difficile / météo rude',
  3: 'Bonne sortie d’entraînement',
  4: 'Très belle sortie / peloton soudé',
  5: 'Sortie d’anthologie / mémorable !',
};

const EFFORT_OPTIONS: { id: RideEffortLevel; label: string; icon: string }[] = [
  { id: 'tranquille', label: 'Tranquille', icon: '☕' },
  { id: 'modere', label: 'Modéré', icon: '🚴' },
  { id: 'soutenu', label: 'Soutenu', icon: '⚡' },
  { id: 'intense', label: 'Intense', icon: '🌪️' },
  { id: 'epique', label: 'Épique', icon: '💥' },
];

const PACE_OPTIONS: { id: RidePaceLevel; label: string }[] = [
  { id: 'trop-lent', label: 'Trop lent' },
  { id: 'parfait', label: 'Rythme parfait' },
  { id: 'trop-rapide', label: 'Bordures / Rapide' },
  { id: 'irregulier', label: 'Accordéon' },
];

const ROAD_OPTIONS: { id: RoadCondition; label: string }[] = [
  { id: 'impeccable', label: 'Bitume impeccable' },
  { id: 'bonne', label: 'Bon état général' },
  { id: 'degradee', label: 'Gravillons / Nids de poule' },
  { id: 'piegeuse', label: 'Tracé piégeux' },
];

const WEATHER_OPTIONS: { id: RideWeatherFeedback; label: string; icon: string }[] = [
  { id: 'soleil', label: 'Soleil', icon: '☀️' },
  { id: 'vent', label: 'Vent de face', icon: '💨' },
  { id: 'pluvieux', label: 'Pluie / Humide', icon: '🌧️' },
  { id: 'froid', label: 'Froid', icon: '❄️' },
  { id: 'ideal', label: 'Idéal', icon: '🌈' },
];

interface EventReviewFormProps {
  eventId: string;
  existingReview: EventReview | null;
  userName?: string;
  onCancel: () => void;
  onSubmitSuccess: (review: EventReview) => void;
  onDelete: (memberId: string) => void;
}

function EventReviewForm({
  eventId,
  existingReview,
  userName,
  onCancel,
  onSubmitSuccess,
  onDelete,
}: EventReviewFormProps): React.ReactElement {
  const [isSubmitting, startTransition] = useTransition();
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [effort, setEffort] = useState<RideEffortLevel | undefined>(existingReview?.effort ?? 'modere');
  const [pace, setPace] = useState<RidePaceLevel | undefined>(existingReview?.pace ?? 'parfait');
  const [roadCondition, setRoadCondition] = useState<RoadCondition | undefined>(existingReview?.roadCondition ?? 'bonne');
  const [weatherEncountered, setWeatherEncountered] = useState<RideWeatherFeedback | undefined>(
    existingReview?.weatherEncountered ?? 'soleil'
  );
  const [comment, setComment] = useState<string>(existingReview?.comment ?? '');
  const [stravaUrl, setStravaUrl] = useState<string>(existingReview?.stravaActivityUrl ?? '');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Veuillez écrire quelques mots pour résumer votre sortie.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitEventReviewAction({
          eventId,
          rating,
          comment: comment.trim(),
          effort,
          pace,
          roadCondition,
          weatherEncountered,
          stravaActivityUrl: stravaUrl.trim() || undefined,
        });

        if (res.success && res.review) {
          toast.success(existingReview ? 'Votre débrief a été mis à jour !' : 'Merci pour votre débrief de sortie !');
          onSubmitSuccess(res.review);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Erreur lors de la publication.');
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-5 sm:p-6 space-y-5 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between border-b border-[#e4e0d8] dark:border-[#262b38] pb-3">
        <div>
          <h4 className="text-sm font-bold text-[#101216] dark:text-white">
            {existingReview ? 'Modifier votre débrief de sortie' : 'Partager votre débrief de sortie'}
          </h4>
          <span className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
            Publié au nom de <strong className="text-[#101216] dark:text-white">{userName}</strong>
          </span>
        </div>

        {existingReview && (
          <button
            type="button"
            onClick={() => onDelete(existingReview.memberId)}
            className="min-h-[44px] inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold"
            title="Supprimer définitivement mon débrief"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Supprimer</span>
          </button>
        )}
      </div>

      {/* 1. Overall Star Rating */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          Note globale de la sortie
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 hover:scale-110 transition-transform focus:outline-hidden"
              aria-label={`${star} étoile${star > 1 ? 's' : ''} sur 5`}
            >
              <StarIcon
                className={`h-7 w-7 transition-colors ${
                  star <= (hoverRating ?? rating)
                    ? 'text-amber-400'
                    : 'text-[#e4e0d8] dark:text-[#262b38]'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-[#101216] dark:text-white tabular-nums">
            {rating} / 5
          </span>
        </div>
        <p className="text-xs font-medium text-[#e03e3e]">
          {RATING_LABELS[hoverRating ?? rating]}
        </p>
      </div>

      {/* 2. Effort Ressenti (RPE) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          Effort physique ressenti (RPE)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {EFFORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setEffort(opt.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center p-2 rounded-md border text-xs font-semibold transition-all ${
                effort === opt.id
                  ? 'border-[#e03e3e] bg-[#e03e3e]/10 text-[#e03e3e] dark:text-white font-bold'
                  : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] hover:border-[#101216]/30 dark:hover:border-white/30'
              }`}
            >
              <span className="text-base leading-none mb-1">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Allure & Peloton */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          Allure & Cohésion du peloton
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PACE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPace(opt.id)}
              className={`min-h-[44px] flex items-center justify-center px-3 py-2 rounded-md border text-xs font-semibold text-center transition-all ${
                pace === opt.id
                  ? 'border-[#e03e3e] bg-[#e03e3e]/10 text-[#e03e3e] dark:text-white font-bold'
                  : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] hover:border-[#101216]/30 dark:hover:border-white/30'
              }`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Routes & Revêtement */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          Qualité du tracé & de la chaussée
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ROAD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRoadCondition(opt.id)}
              className={`min-h-[44px] flex items-center justify-center px-3 py-2 rounded-md border text-xs font-semibold text-center transition-all ${
                roadCondition === opt.id
                  ? 'border-[#e03e3e] bg-[#e03e3e]/10 text-[#e03e3e] dark:text-white font-bold'
                  : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] hover:border-[#101216]/30 dark:hover:border-white/30'
              }`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Météo Rencontrée */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
          Météo vécue sur le vélo
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {WEATHER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setWeatherEncountered(opt.id)}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-xs font-semibold transition-all ${
                weatherEncountered === opt.id
                  ? 'border-[#e03e3e] bg-[#e03e3e]/10 text-[#e03e3e] dark:text-white font-bold'
                  : 'border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] hover:border-[#101216]/30 dark:hover:border-white/30'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Comment Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="debrief-comment"
          className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white"
        >
          Récit de la sortie, anecdotes & ambiance
        </label>
        <textarea
          id="debrief-comment"
          rows={3}
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Racontez vos sensations sur le vélo, l’ambiance dans le peloton, les faits marquants ou difficultés du parcours..."
          className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-3 text-xs text-[#101216] dark:text-white placeholder-[#a7adbb] focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e] focus:border-transparent caret-[#e03e3e]"
        />
      </div>

      {/* 7. Optional Strava URL */}
      <div className="space-y-1.5">
        <label
          htmlFor="strava-url"
          className="block text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white"
        >
          Lien activité Strava ou Garmin Connect (optionnel)
        </label>
        <input
          id="strava-url"
          type="url"
          value={stravaUrl}
          onChange={(e) => setStravaUrl(e.target.value)}
          placeholder="https://www.strava.com/activities/... ou https://connect.garmin.com/..."
          className="w-full min-h-[44px] rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-3 py-2 text-xs text-[#101216] dark:text-white placeholder-[#a7adbb] focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e] focus:border-transparent caret-[#e03e3e]"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] rounded-md border border-[#e4e0d8] dark:border-[#262b38] px-4 py-2 text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#faf8f5] dark:hover:bg-[#262b38] cursor-pointer"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2 text-xs font-bold uppercase tracking-[0.06em] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting
            ? 'Enregistrement en cours...'
            : existingReview
              ? 'Mettre à jour mon débrief'
              : 'Publier mon débrief'}
        </button>
      </div>
    </form>
  );
}

export default function CalendarDrawer({
  event,
  open,
  onClose,
  attendees = [],
  reviews = [],
  onReviewsUpdated,
}: CalendarDrawerProps): React.ReactElement | null {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const mounted = useIsMounted();
  const [activeTab, setActiveTab] = useState<'details' | 'debrief'>('details');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Find user's existing review if any
  const existingReview = useMemo(() => {
    if (!user?.id || !reviews.length) return null;
    return reviews.find((r) => r.memberId === user.id) || null;
  }, [user, reviews]);

  // Handle Escape key and lock body scroll
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!event || !open) return null;

  // Format Date in French
  const [yr, mo, dy] = event.isoDate.split('-');
  const dateObj = new Date(Number(yr), Number(mo) - 1, Number(dy));
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.location} ${event.address || ''}`
  )}`;

  const eventDone = isEventDone(event.isoDate, event.departure);
  const canDebrief = eventDone || isAdmin;

  // Aggregate stats
  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Attendees grouped by cycling group
  const groupedAttendees = attendees.reduce<Record<string, AttendeeInfo[]>>((acc, curr) => {
    const grp = curr.group || 'Sans groupe';
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(curr);
    return acc;
  }, {});

  const handleDeleteReview = (reviewMemberId: string): void => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce débrief ?')) return;

    startTransition(async () => {
      try {
        const res = await deleteEventReviewAction(event.id, reviewMemberId);
        if (res.success) {
          toast.success('Débrief supprimé.');
          if (onReviewsUpdated) {
            onReviewsUpdated(reviews.filter((r) => r.memberId !== reviewMemberId));
          }
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-xl lg:max-w-2xl bg-white dark:bg-[#161922] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#e4e0d8] dark:border-[#262b38]">
          {/* ──── Header: Editorial Peloton Cover ──── */}
          <div className="relative bg-[#101216] text-white p-6 sm:p-7 border-b border-[#262b38] overflow-hidden shrink-0">
            {/* Ambient Watermark */}
            <div className="absolute right-4 -bottom-6 pointer-events-none select-none opacity-[0.04] text-7xl sm:text-8xl font-black uppercase tracking-tighter text-white">
              PELOTON
            </div>

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="space-y-2">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/20 text-[#ff6b6b] border border-[#e03e3e]/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.06em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                    {isWeekend ? 'Sortie Club officielle' : 'Événement officiel'}
                  </span>

                  {eventDone ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold">
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Sortie terminée · Débriefings ouverts
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 text-white/80 border border-white/10 px-2.5 py-0.5 text-xs font-medium">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Sortie à venir
                    </span>
                  )}
                </div>

                {/* Location Title */}
                <h2
                  id="drawer-title"
                  className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-display"
                >
                  {event.location}
                </h2>

                {/* French Date Display */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[#a7adbb] capitalize">
                  <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
                  <span>{dateStr}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md p-2 text-[#a7adbb] hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                aria-label="Fermer la fiche de la sortie"
                title="Fermer la fiche"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* ──── Key Telemetry Stat Strip (Hairline Divided) ──── */}
          <div className="bg-[#faf8f5] dark:bg-[#101216] border-b border-[#e4e0d8] dark:border-[#262b38] grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#e4e0d8] dark:divide-[#262b38] shrink-0 text-center">
            <div className="p-3 sm:py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] block">
                Heure de départ
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#101216] dark:text-white tabular-nums">
                {event.departure}
              </span>
            </div>

            <div className="p-3 sm:py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] block">
                Distance prévue
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#101216] dark:text-white tabular-nums">
                {event.distances ? `${event.distances} km` : '—'}
              </span>
            </div>

            <div className="p-3 sm:py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] block">
                Groupe / Peloton
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#101216] dark:text-white truncate block">
                {event.group || 'Club'}
              </span>
            </div>

            <div className="p-3 sm:py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] block">
                Inscrits au départ
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#101216] dark:text-white tabular-nums">
                {attendees.length} {attendees.length === 1 ? 'cycliste' : 'cyclistes'}
              </span>
            </div>
          </div>

          {/* ──── Segmented View Tabs ──── */}
          <div className="flex border-b border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`min-h-[46px] flex items-center gap-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'border-[#e03e3e] text-[#e03e3e]'
                  : 'border-transparent text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>Programme & Parcours</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('debrief')}
              className={`min-h-[46px] flex items-center gap-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'debrief'
                  ? 'border-[#e03e3e] text-[#e03e3e]'
                  : 'border-transparent text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Débrief du Peloton</span>
              {reviews.length > 0 && (
                <span className="rounded-full bg-[#e03e3e]/10 text-[#e03e3e] dark:bg-[#e03e3e]/20 dark:text-[#ff6b6b] px-2 py-0.2 text-[11px] font-extrabold tabular-nums">
                  {reviews.length}
                </span>
              )}
            </button>
          </div>

          {/* ──── Scrollable Content Area ──── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: DETAILS & PARCOURS */}
            {activeTab === 'details' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Weather Forecast Badge */}
                <div>
                  <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} />
                </div>

                {/* Primary Route Action Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {event.gpxUrl ? (
                    <a
                      href={event.gpxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em] shadow-xs transition-colors"
                      title="Télécharger ou ouvrir l'itinéraire officiel"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>
                        {event.gpxUrl.includes('strava.com')
                          ? 'Ouvrir l\'itinéraire sur Strava'
                          : event.gpxUrl.includes('garmin.com')
                            ? 'Ouvrir le parcours Garmin Connect'
                            : event.gpxUrl.includes('komoot')
                              ? 'Ouvrir le circuit Komoot'
                              : 'Télécharger la trace GPX (GPS)'}
                      </span>
                    </a>
                  ) : null}

                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#1d2128] hover:border-[#101216]/30 dark:hover:border-white/30 text-[#101216] dark:text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors"
                    title="Localiser le point de départ dans Google Maps"
                  >
                    <MapPinIcon className="h-4 w-4 text-[#e03e3e]" />
                    <span>Point GPS Maps</span>
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-[#5c6370] dark:text-[#a7adbb]" />
                  </a>
                </div>

                {/* Meeting Point Card */}
                <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#1d2128] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e] shadow-2xs">
                        <MapPinIcon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
                        Point de Rassemblement & Départ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pl-10 text-xs">
                    <div className="font-bold text-[#101216] dark:text-white text-sm">
                      {event.location}
                    </div>
                    {event.address ? (
                      <div className="text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                        {event.address}
                      </div>
                    ) : (
                      <div className="text-[#5c6370] dark:text-[#a7adbb] italic">
                        Rendez-vous habituel sur la Place de Blanmont ou selon les consignes du capitaine de route.
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks & Alternatives */}
                {(event.remarks || event.alternative) && (
                  <div className="space-y-3">
                    {event.remarks && (
                      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#101216] dark:text-white uppercase tracking-wider">
                          <InformationCircleIcon className="h-4 w-4 text-[#e03e3e]" />
                          <span>Consignes & Remarques du club</span>
                        </div>
                        <p className="text-xs text-[#3a3f4a] dark:text-[#a7adbb] leading-relaxed pl-6">
                          {event.remarks}
                        </p>
                      </div>
                    )}

                    {event.alternative && (
                      <div className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          <span>Option Alternative / Raccourci proposé</span>
                        </div>
                        <p className="text-xs text-[#3a3f4a] dark:text-amber-200/80 leading-relaxed pl-4">
                          {event.alternative}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attendees Roster */}
                <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4e0d8] dark:border-[#262b38] pb-3">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4 text-[#101216] dark:text-white" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
                        Peloton au Départ ({attendees.length})
                      </h3>
                    </div>

                    <Link
                      href="/sondage"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{eventDone ? 'Consulter le sondage' : 'Gérer ma présence / Répondre au sondage'}</span>
                    </Link>
                  </div>

                  {attendees.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedAttendees).map(([groupName, members]) => (
                        <div key={groupName} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                              {groupName} ({members.length})
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {members
                              .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
                              .map((att, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] px-3 py-2 text-xs text-[#101216] dark:text-white shadow-2xs"
                                >
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#161922] dark:bg-[#262b38] text-[10px] font-bold text-white shrink-0 select-none">
                                    {getInitials(att.name)}
                                  </span>
                                  <span className="font-semibold truncate">{att.name}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] italic py-2">
                      Aucun membre n&apos;a encore confirmé sa participation pour cette sortie. Rendez-vous sur le sondage hebdomadaire pour vous inscrire !
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DEBRIEF & AVIS DU PELOTON */}
            {activeTab === 'debrief' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Summary Scorecard */}
                <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#1d2128] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                        Évaluation Générale du Peloton
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                          {averageRating ? `${averageRating} / 5` : '—'}
                        </span>
                        {averageRating && (
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.round(Number(averageRating))
                                    ? 'text-amber-400'
                                    : 'text-[#e4e0d8] dark:text-[#262b38]'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                        Basé sur {reviews.length} {reviews.length === 1 ? 'débriefing de membre' : 'débriefings de membres'}.
                      </p>
                    </div>

                    {/* Action Button to Open / Close Form */}
                    {canDebrief && isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#101216] dark:bg-white text-white dark:text-[#101216] hover:bg-[#161922] dark:hover:bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] shadow-xs transition-colors shrink-0 cursor-pointer"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        <span>{existingReview ? 'Modifier mon débrief' : 'Partager mon débrief de sortie'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* If Not Completed yet */}
                {!canDebrief && (
                  <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-6 text-center space-y-2">
                    <ClockIcon className="mx-auto h-8 w-8 text-[#5c6370] dark:text-[#a7adbb]" />
                    <h4 className="text-sm font-bold text-[#101216] dark:text-white">
                      Sortie non encore effectuée
                    </h4>
                    <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] max-w-sm mx-auto leading-relaxed">
                      Le formulaire d&apos;évaluation et les débriefings du peloton s&apos;ouvriront automatiquement dès le départ de cette sortie.
                    </p>
                  </div>
                )}

                {/* Login Prompt if not logged in and event is done */}
                {canDebrief && !isAuthenticated && (
                  <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-6 text-center space-y-3">
                    <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-[#e03e3e]" />
                    <h4 className="text-sm font-bold text-[#101216] dark:text-white">
                      Vous avez roulé dans le peloton ?
                    </h4>
                    <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] max-w-sm mx-auto leading-relaxed">
                      Connectez-vous avec votre compte membre du club pour raconter votre sortie, noter l&apos;allure et associer votre activité Strava ou Garmin.
                    </p>
                    <Link
                      href="/login"
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.06em] shadow-xs transition-colors"
                    >
                      <span>Se connecter pour débriefer</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}

                {/* Evaluation Form Subcomponent */}
                {canDebrief && isAuthenticated && (showForm || (!existingReview && reviews.length === 0)) && (
                  <EventReviewForm
                    key={`${event.id}-${existingReview?.id ?? 'new'}`}
                    eventId={event.id}
                    existingReview={existingReview}
                    userName={user?.name}
                    onCancel={() => setShowForm(false)}
                    onSubmitSuccess={(updatedReview) => {
                      setShowForm(false);
                      if (onReviewsUpdated) {
                        const updated = existingReview
                          ? reviews.map((r) => (r.id === updatedReview.id ? updatedReview : r))
                          : [updatedReview, ...reviews.filter((r) => r.id !== updatedReview.id)];
                        onReviewsUpdated(updated);
                      }
                    }}
                    onDelete={handleDeleteReview}
                  />
                )}

                {/* Reviews Stream */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e4e0d8] dark:border-[#262b38] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">
                      Récits &amp; Débriefings des Coureurs ({reviews.length})
                    </h3>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((rev) => {
                        const revDate = rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '';

                        const isAuthor = user?.id === rev.memberId;

                        return (
                          <div
                            key={rev.id}
                            className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] p-5 space-y-3.5 shadow-2xs"
                          >
                            {/* Author Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {rev.memberPhotoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={rev.memberPhotoUrl}
                                    alt={rev.memberName}
                                    className="h-10 w-10 rounded-full object-cover border border-[#e4e0d8] dark:border-[#262b38]"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#161922] dark:bg-[#262b38] text-xs font-bold text-white shrink-0 select-none">
                                    {getInitials(rev.memberName)}
                                  </div>
                                )}

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#101216] dark:text-white">
                                      {rev.memberName}
                                    </span>
                                    {rev.memberGroup && (
                                      <span className="rounded-xs border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#5c6370] dark:text-[#a7adbb]">
                                        {rev.memberGroup}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-[#5c6370] dark:text-[#a7adbb]">
                                    {revDate}
                                  </span>
                                </div>
                              </div>

                              {/* Star Rating Display */}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIcon
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= rev.rating
                                        ? 'text-amber-400'
                                        : 'text-[#e4e0d8] dark:text-[#262b38]'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-xs font-bold text-[#101216] dark:text-white tabular-nums">
                                  {rev.rating}/5
                                </span>
                              </div>
                            </div>

                            {/* Evaluation Tags Strip */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {rev.effort && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-0.5 text-[11px] font-semibold text-[#101216] dark:text-[#f5f6f8]">
                                  <span>Effort :</span>
                                  <span className="capitalize">{rev.effort}</span>
                                </span>
                              )}

                              {rev.pace && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-0.5 text-[11px] font-semibold text-[#101216] dark:text-[#f5f6f8]">
                                  <span>Allure :</span>
                                  <span className="capitalize">{rev.pace.replace('-', ' ')}</span>
                                </span>
                              )}

                              {rev.roadCondition && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-0.5 text-[11px] font-semibold text-[#101216] dark:text-[#f5f6f8]">
                                  <span>Route :</span>
                                  <span className="capitalize">{rev.roadCondition}</span>
                                </span>
                              )}

                              {rev.weatherEncountered && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#faf8f5] dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-0.5 text-[11px] font-semibold text-[#101216] dark:text-[#f5f6f8]">
                                  <span>Météo :</span>
                                  <span className="capitalize">{rev.weatherEncountered}</span>
                                </span>
                              )}
                            </div>

                            {/* Comment text */}
                            <p className="text-xs text-[#3a3f4a] dark:text-[#d1d5db] leading-relaxed whitespace-pre-line">
                              {rev.comment}
                            </p>

                            {/* Footer of Review: Strava link + Moderation */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#e4e0d8] dark:border-[#262b38] text-xs">
                              {rev.stravaActivityUrl ? (
                                <a
                                  href={rev.stravaActivityUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#fc5200] hover:underline"
                                >
                                  <span>Activité Strava du coureur</span>
                                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                </a>
                              ) : (
                                <span />
                              )}

                              {mounted && (isAuthor || isAdmin) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev.memberId)}
                                  className="text-[11px] font-semibold text-[#5c6370] dark:text-[#a7adbb] hover:text-rose-600 transition-colors"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#1d2128] p-8 text-center space-y-2">
                      <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-[#5c6370] dark:text-[#a7adbb]" />
                      <h4 className="text-xs font-bold text-[#101216] dark:text-white uppercase tracking-wider">
                        Aucun débriefing enregistré pour le moment
                      </h4>
                      <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] max-w-sm mx-auto leading-relaxed">
                        Soyez le premier membre du club à raconter la sortie, partager vos sensations et évaluer le rythme du peloton !
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ──── Footer ──── */}
          <div className="p-4 border-t border-[#e4e0d8] dark:border-[#262b38] flex justify-between items-center bg-[#faf8f5] dark:bg-[#101216] shrink-0">
            {mounted && isAdmin ? (
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="min-h-[44px] inline-flex items-center justify-center rounded-md bg-[#101216] dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-[#101216] hover:bg-[#161922] dark:hover:bg-slate-200 transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                <span>Modifier dans l&apos;admin</span>
              </Link>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-6 py-2 text-xs font-semibold text-[#101216] dark:text-white hover:bg-[#faf8f5] dark:hover:bg-[#262b38] hover:border-[#101216]/30 dark:hover:border-white/30 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
