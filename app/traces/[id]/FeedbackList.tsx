'use client';

import { useRouter } from 'next/navigation';
import { Feedback } from '../../types';
import styles from './page.module.css';

interface FeedbackListProps {
    feedbackList: Feedback[];
    members: { id: string; name: string }[];
}

export default function FeedbackList({ feedbackList, members }: FeedbackListProps) {
    const router = useRouter();

    const handleEdit = (memberId: string) => {
        if (!memberId) return;
        // Update URL to trigger form pre-fill
        router.replace(`?editMemberId=${memberId}`, { scroll: false });

        // Scroll to form (give time for router to update/DOM to react if needed, though scrollIntoView is direct)
        // We use ID "feedback-form" which we added to FeedbackForm
        const form = document.getElementById('feedback-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (feedbackList.length === 0) {
        return <p className={styles.noComments}>No feedback yet. Be the first!</p>;
    }

    return (
        <div className={styles.commentList}>
            {feedbackList.map((fb) => {
                const author = members.find(m => m.id === fb.memberId)?.name || 'Unknown Rider';
                const isEditable = members.some(m => m.id === fb.memberId);

                return (
                    <div key={fb.id} className={styles.commentCard}>
                        <div className={styles.commentHeader}>
                            <span className={styles.commentAuthor}>{author}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className={styles.commentRating}>{'★'.repeat(fb.rating)}</span>
                                {isEditable && (
                                    <button
                                        onClick={() => handleEdit(fb.memberId!)}
                                        className={styles.btnLink}
                                        title="Edit this feedback"
                                    >
                                        ✏️
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className={styles.commentText}>{fb.comment}</p>
                    </div>
                );
            })}
        </div>
    );
}
