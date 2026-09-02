'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { Feedback, Member } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/20/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface FeedbackFormProps {
  traceId: string;
  members?: Member[];
  feedbackList: Feedback[];
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function FeedbackForm({
  traceId,
  feedbackList,
  onSubmit,
}: FeedbackFormProps): React.ReactElement {
  const { user, isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Compute existing feedback without causing cascading renders in useEffect
  const existingFeedback = useMemo(() => {
    if (!isAuthenticated || !user?.id) return null;
    return feedbackList.find((f) => f.memberId === user.id && f.traceId === traceId) || null;
  }, [isAuthenticated, user, feedbackList, traceId]);

  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [commentText, setCommentText] = useState(existingFeedback?.comment || '');

  if (!isAuthenticated) {
    return (
      <div className="rounded-md border border-[#e4e0d8] bg-white p-6 text-center space-y-3">
        <h4 className="text-sm font-bold text-[#101216]">Connexion Requise</h4>
        <p className="text-xs text-[#5c6370]">
          Veuillez vous connecter pour laisser votre avis sur ce parcours.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-[#e03e3e] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-[#c93434] transition-colors min-h-[44px] leading-snug flex items-center justify-center max-w-xs mx-auto"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const handleFormSubmit = (formData: FormData): void => {
    startTransition(async () => {
      try {
        await onSubmit(formData);
        toast.success(
          existingFeedback ? 'Votre avis a été mis à jour avec succès !' : 'Merci pour votre avis !'
        );
      } catch (err) {
        console.error(err);
        toast.error('Impossible d’enregistrer votre avis. Veuillez réessayer.');
      }
    });
  };

  return (
    <form action={handleFormSubmit} id="feedback-form" className="space-y-4">
      <input type="hidden" name="traceId" value={traceId} />
      <input type="hidden" name="memberId" value={user?.id || ''} />
      {existingFeedback && <input type="hidden" name="feedbackId" value={existingFeedback.id} />}
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1.5 text-xs text-[#3a3f4a]">
        <span>Publié en tant que :</span>
        <strong className="text-[#101216]">{user?.name}</strong>
      </div>

      {/* Star Rating Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#3a3f4a]">
          Votre note
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1.5 text-2xl focus:outline-hidden hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            >
              <StarIcon
                className={`h-6 w-6 ${
                  star <= rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-[#3a3f4a] tabular-nums">{rating} / 5</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="comment"
            className="block text-xs font-bold uppercase tracking-wider text-[#3a3f4a]"
          >
            Commentaire
          </label>
          <span className="text-xs text-[#5c6370] tabular-nums">
            {commentText.length}/1000
          </span>
        </div>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          maxLength={1000}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
          placeholder="Qualité du revêtement, sécurité, points d'eau, paysages, braquets recommandés..."
          className="w-full rounded-md border border-[#e4e0d8] p-3 text-xs text-[#101216] placeholder:text-slate-400 focus:border-[#e03e3e] focus:outline-hidden"
        />
      </div>

      {existingFeedback && (
        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-800 border border-blue-100">
          <InformationCircleIcon className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
          <span>Vous avez déjà noté ce parcours. Valider mettra à jour votre avis existant.</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !commentText.trim()}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        {isPending
          ? 'Envoi en cours...'
          : existingFeedback
          ? 'Mettre à jour mon avis'
          : 'Publier mon avis'}
      </button>
    </form>
  );
}
