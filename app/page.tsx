import Link from 'next/link';
import styles from './page.module.css';

/**
 * The Landing Page (Home).
 * Displays a hero section with call-to-action buttons for Traces and Members.
 */
export default function Home() {
  return (
    <div className={styles.hero}>
      <div className="container">
        <h1 className={styles.title}>
          RIDE BEYOND<br />
          <span className={styles.highlight}>THE HORIZON</span>
        </h1>
        <p className={styles.subtitle}>
          Join the premier road cycling community. Explore curated traces, connect with riders, and push your limits.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/traces" className="btn-primary">
            Explore Traces
          </Link>
          <Link href="/members" className={styles.secondaryLink}>
            Meet the Team →
          </Link>
        </div>
      </div>
    </div>
  );
}
