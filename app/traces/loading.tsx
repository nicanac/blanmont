import styles from './page.module.css';

export default function Loading() {
    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Curated Traces</h1>
                <p className={styles.subtitle}>Explore our favorite local loops and epic climbs.</p>
            </header>

            <div className={styles.grid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={styles.card}>
                        <div className={`${styles.mediaContainer} ${styles.skeleton} ${styles.skeletonMedia}`} />

                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '30%' }} />
                                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '20%' }} />
                            </div>

                            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />

                            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                            <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80%' }} />

                            <div className={styles.stats}>
                                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '40px', height: '24px' }} />
                                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '40px', height: '24px' }} />
                            </div>

                            <div className={styles.actions}>
                                <div className={`${styles.skeleton} ${styles.btnAction}`} style={{ border: 'none' }} />
                                <div className={`${styles.skeleton} ${styles.btnAction}`} style={{ border: 'none' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
