'use client';

import Link from 'next/link';
import { Trace } from '../types';
import { stripSuffix } from '../utils/string.utils';
import styles from './page.module.css';

interface TraceCardProps {
    trace: Trace;
}

export default function TraceCard({ trace }: TraceCardProps) {
    const getKomootEmbedUrl = (url?: string) => {
        if (!url) return null;
        const match = url.match(/komoot\.[a-z]+(\/[a-z]{2})?\/tour\/(\d+)/);
        const matchSimple = url.match(/komoot\.[a-z]+\/tour\/(\d+)/);
        const tourId = match ? match[2] : (matchSimple ? matchSimple[1] : null);
        if (tourId) {
            return `https://www.komoot.com/tour/${tourId}/embed?profile=1`;
        }
        return null;
    };

    // Get rating color based on quality score
    const getRatingColor = (quality: number): string => {
        if (quality > 4) {
            return '#22c55e'; // Green for excellent ratings (5 stars)
        } else if (quality === 4) {
            return '#84cc16'; // Yellow-green for good ratings (4 stars)
        } else if (quality === 3) {
            return '#eab308'; // Yellow for average ratings (3 stars)
        } else if (quality === 2) {
            return '#f97316'; // Orange for below average (2 stars)
        } else {
            return '#ef4444'; // Red for poor ratings (1 star)
        }
    };

    const embedUrl = getKomootEmbedUrl(trace.mapUrl);
    const ratingColor = getRatingColor(trace.quality);
    const ratingColorStyle = { color: ratingColor };

    return (
        <div className={styles.card}>
            <div className={styles.mediaContainer}>
                {trace.photoUrl ? (
                    <div className={styles.cardImage} style={{ backgroundImage: `url(${trace.photoUrl})` }} />
                ) : embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className={styles.mapFrame}
                        title={`Map of ${trace.name}`}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.cardImage} style={{ backgroundColor: '#2a2a2a' }} />
                )}
            </div>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <div className={styles.badges}>
                        <span className={styles.tag} style={{ backgroundColor: ratingColor, color: "white" }}>{trace.surface}</span>
                        {trace.start && <span className={styles.tag}>{trace.start}</span>}
                    </div>
                    <span className={styles.rating} style={ratingColorStyle}>
                        {'★'.repeat(trace.quality)}
                    </span>
                </div>

                <Link href={`/traces/${trace.id}`} className={styles.name}>
                    {stripSuffix(trace.name, '#')}
                </Link>

                <p className={styles.description}>
                    {trace.description || "No description provided."}
                </p>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{trace.distance}km</span>
                        <span className={styles.statLabel}>Distance</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{trace.elevation || '-'}m</span>
                        <span className={styles.statLabel}>Elevation</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href={`/traces/${trace.id}`} className={styles.btnAction} style={{ backgroundColor: ratingColor, color: "white", border: "none" }}>
                        Details
                    </Link>
                    {trace.gpxUrl && (
                        <a href={trace.gpxUrl} target="_blank" rel="noopener noreferrer" className={styles.btnAction}>
                            GPX
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
