'use client';

import { useState, useEffect } from 'react';
import { Feedback, Member } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/20/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface FeedbackFormProps {
  traceId: string;
  members?: Member[];
  feedbackList: Feedback[];
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function FeedbackForm({ traceId, feedbackList, onSubmit }: FeedbackFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
  const [rating, setRating] = useState<number>(5);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const found = feedbackList.find((f) => f.memberId === user.id && f.traceId === traceId);
      setExistingFeedback(found || null);
      if (found) {
        setRating(found.rating);
      }
    }
  }, [isAuthenticated, user?.id, feedbackList, traceId]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-md border border-[#e4e0d8] bg-white p-6 text-center space-y-3">
        <h4 className="text-sm font-bold text-[#101216]">Connexion Requise</h4>
        <p className="text-xs text-[#5c6370]">
          Veuillez vous connecter pour laisser votre avis sur ce parcours.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-[#e03e3e] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={onSubmit} id="feedback-form" className="space-y-4">
      <input type="hidden" name="traceId" value={traceId} />
      <input type="hidden" name="memberId" value={user?.id || ''} />
      {existingFeedback && <input type="hidden" name="feedbackId" value={existingFeedback.id} />}
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1.5 text-xs text-[#3a3f4a]">
        <span>Publié en tant que :</span>
        <strong className="text-[#101216]">{user?.name}</strong>
      </div>

      {/* Star Rating Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-[#3a3f4a]">Votre note</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 text-2xl focus:outline-hidden hover:scale-110 transition-transform"
              aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            >
              <StarIcon
                className={`h-6 w-6 ${
                  star <= rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-[#3a3f4a]">{rating} / 5</span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="space-y-1">
        <label htmlFor="comment" className="block text-xs font-semibold text-[#3a3f4a]">
          Commentaire
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          defaultValue={existingFeedback?.comment || ''}
          key={existingFeedback ? existingFeedback.id : 'new'}
          required
          placeholder="Qualité de la route, points d'eau, paysages, difficulté..."
          className="w-full rounded-xl border border-[#e4e0d8] p-3 text-xs text-[#101216] placeholder:text-slate-400 focus:border-[#e03e3e] focus:ring-1 focus:ring-[#e03e3e] focus:outline-hidden"
        />
      </div>

      {existingFeedback && (
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800 border border-blue-100">
          <InformationCircleIcon className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
          <span>Vous avez déjà noté ce parcours. Soumettre à nouveau mettra à jour votre avis.</span>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-[#e03e3e] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-all active:scale-95"
      >
        {existingFeedback ? 'Mettre à jour mon avis' : 'Envoyer mon avis'}
      </button>
    </form>
  );
}
