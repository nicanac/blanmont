'use client';

import { useState, useEffect } from 'react';
import { Feedback, Member } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

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
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    // Initial check for existing feedback
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            const found = feedbackList.find(f => f.memberId === user.id && f.traceId === traceId);
            setExistingFeedback(found || null);
            if (found) {
                setRating(found.rating);
            }
        }
    }, [isAuthenticated, user?.id, feedbackList, traceId]);


    if (!isAuthenticated) {
        return (
            <div className="py-6 text-center bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900 mb-1">
                    Connexion Requise
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Veuillez vous connecter pour laisser un commentaire.
                </p>
                <Link href="/login" className="inline-block">
                    <button className="bg-brand-primary hover:bg-brand-dark text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm text-sm">
                        Se connecter
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <form action={onSubmit} id="feedback-form" className="space-y-4">
            <input type="hidden" name="traceId" value={traceId} />
            <input type="hidden" name="memberId" value={user?.id || ''} />
            {existingFeedback && <input type="hidden" name="feedbackId" value={existingFeedback.id} />}

            {/* User Info */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">Publié en tant que :</span>
                <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
            </div>

            {/* Rating Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(null)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            {star <= (hoverRating || rating) ? (
                                <StarIcon className="h-8 w-8 text-yellow-400" />
                            ) : (
                                <StarIconOutline className="h-8 w-8 text-gray-300" />
                            )}
                        </button>
                    ))}
                    <input type="hidden" name="rating" value={rating} />
                </div>
            </div>

            {/* Comment Input */}
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire
                </label>
                <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    defaultValue={existingFeedback?.comment || ''}
                    key={existingFeedback ? existingFeedback.id : 'new'}
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-3 border resize-none"
                    placeholder="Racontez votre expérience..."
                />
            </div>

            {/* Existing Feedback Alert */}
            {existingFeedback && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                    <span className="text-blue-500 text-lg">ℹ️</span>
                    <p className="text-sm text-blue-700">
                        Vous avez déjà noté ce parcours. Soumettre à nouveau mettra à jour votre avis.
                    </p>
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-dark text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
                {existingFeedback ? 'Mettre à jour l\'avis' : 'Envoyer l\'avis'}
            </button>
        </form>
    );
}

