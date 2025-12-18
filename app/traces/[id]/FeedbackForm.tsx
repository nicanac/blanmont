'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Member, Feedback } from '../../types';
import styles from './page.module.css';

interface FeedbackFormProps {
    traceId: string;
    members: Member[];
    feedbackList: Feedback[];
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function FeedbackForm({ traceId, members, feedbackList, onSubmit }: FeedbackFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editMemberId = searchParams.get('editMemberId');

    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [feedbackId, setFeedbackId] = useState<string | null>(null);

    // Sync state with URL param if present
    useEffect(() => {
        if (editMemberId) {
            setSelectedMemberId(editMemberId);
            // Clean up URL after picking it up (optional, but nicer)
            // router.replace('?', { scroll: false }); 
        }
    }, [editMemberId]);

    // Watch for member selection to pre-fill form
    useEffect(() => {
        if (!selectedMemberId) {
            setRating(5);
            setComment('');
            setFeedbackId(null);
            return;
        }

        const existing = feedbackList.find(f => f.memberId === selectedMemberId);
        if (existing) {
            setRating(existing.rating);
            setComment(existing.comment);
            setFeedbackId(existing.id);
        } else {
            setRating(5);
            setComment('');
            setFeedbackId(null);
        }
    }, [selectedMemberId, feedbackList]);

    return (
        <form id="feedback-form" action={onSubmit} className={styles.form}>
            {/* Hidden field to force 'Update' mode if feedbackId exists */}
            {feedbackId && <input type="hidden" name="feedbackId" value={feedbackId} />}

            <div className={styles.formGroup}>
                <label>Who are you?</label>
                <select
                    name="memberId"
                    className={styles.input}
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    <option value="">Select Member...</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            {feedbackId && (
                <div className={styles.infoMessage}>
                    💡 You reviewed this trace. Edit your review below.
                </div>
            )}

            <div className={styles.formGroup}>
                <label>Rating (1-5)</label>
                <select
                    name="rating"
                    className={styles.input}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label>Comment</label>
                <textarea
                    name="comment"
                    rows={3}
                    className={styles.input}
                    placeholder="Road conditions, hazards..."
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
            </div>
            <button type="submit" className="btn-primary">
                {feedbackId ? 'Update Feedback' : 'Submit Feedback'}
            </button>
        </form>
    );
}
