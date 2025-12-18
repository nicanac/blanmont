import { getTrace, getTraces, submitFeedback, getMembers, getFeedbackForTrace } from '../../lib/notion';
import { uploadMapPreview, generateMapPreview } from '../../actions';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';
import styles from './page.module.css';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';

// Revalidate every minute
export const revalidate = 60;

// Enable static generation for known paths (optional, but good for performance)
export async function generateStaticParams() {
    const traces = await getTraces();
    return traces.map((trace) => ({
        id: trace.id,
    }));
}

export default async function TraceDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const trace = await getTrace(params.id);

    if (!trace) {
        notFound();
    }



    // Fetch additional data
    const members = await getMembers();
    const feedbackList = await getFeedbackForTrace(trace.id);

    async function addFeedback(formData: FormData) {
        'use server'

        const rating = Number(formData.get('rating'));
        const comment = formData.get('comment') as string;
        const memberId = formData.get('memberId') as string;
        const feedbackId = formData.get('feedbackId') as string; // Capture ID for update

        if (trace && rating && comment && memberId) {
            await submitFeedback(trace.id, memberId, rating, comment, feedbackId || undefined);
            revalidatePath(`/traces/${trace.id}`);
        }
    }

    return (
        <div className="container">
            <div className={styles.hero}>
                {trace.photoUrl && (
                    <div className={styles.heroImage} style={{ backgroundImage: `url(${trace.photoUrl})` }} />
                )}
                <span className={styles.tag}>{trace.surface}</span>
                <h1 className={styles.title}>{trace.name}</h1>
                <div className={styles.meta}>
                    <div className={styles.stat}>{trace.distance}km</div>
                    <div className={styles.divider}>•</div>
                    <div className={styles.stat}>{'★'.repeat(trace.quality)}</div>
                </div>
                {(trace.start || trace.end) && (
                    <div className={styles.routePoints}>
                        {trace.start && <span>Start: <strong>{trace.start}</strong></span>}
                        {trace.end && <span>End: <strong>{trace.end}</strong></span>}
                    </div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.main}>
                    <p className={styles.description}>{trace.description}</p>

                    <div className={styles.actions}>
                        {trace.mapUrl && (
                            <a href={trace.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                View Interactive Map
                            </a>
                        )}

                        {trace.photoAlbumUrl && (
                            <a href={trace.photoAlbumUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#4285f4' }}>
                                📸 View Photo Album
                            </a>
                        )}
                    </div>

                    {/* Photo Previews */}
                    {trace.photoPreviews && trace.photoPreviews.length > 0 && (
                        <div className={styles.photoGrid}>
                            {trace.photoPreviews.map((url, i) => (
                                <a key={i} href={trace.photoAlbumUrl} target="_blank" rel="noopener noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`Ride preview ${i + 1}`}
                                        className={styles.photoPreview}
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                    />
                                </a>
                            ))}
                        </div>
                    )}



                    {/* Feedback List */}
                    <div className={styles.commentsSection}>
                        <h3>Community Feedback</h3>
                        <FeedbackList feedbackList={feedbackList} members={members} />
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.feedbackBox}>
                        <h3>Ride Feedback</h3>
                        <p className={styles.feedbackHint}>Ridden this route? Let the club know.</p>

                        <Suspense fallback={<div>Loading form...</div>}>
                            <FeedbackForm
                                traceId={trace.id}
                                members={members}
                                feedbackList={feedbackList}
                                onSubmit={addFeedback}
                            />
                        </Suspense>
                    </div>
                    {/* Admin Section (Simplified, no auth for now as per request) */}
                    <div className={styles.adminBox}>
                        <h3>Admin Tools</h3>
                        <p className={styles.feedbackHint}>Update Map Preview (jpg url)</p>
                        <form action={uploadMapPreview} className={styles.form}>
                            <input type="hidden" name="traceId" value={trace.id} />
                            <div className={styles.formGroup}>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    placeholder="https://example.com/map.jpg"
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.btnSecondary}>Update Cover Image</button>
                        </form>

                        <div className={styles.divider} style={{ margin: '1rem 0' }}>Or</div>

                        <form action={generateMapPreview} className={styles.form}>
                            <input type="hidden" name="traceId" value={trace.id} />
                            <button type="submit" className={styles.btnSecondary}>
                                ✨ Auto-Generate from Komoot
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
