import { getTraces } from '../lib/notion';
import styles from './page.module.css';
import TraceList from './TraceList';

export const revalidate = 60;

export default async function TracesPage() {
    const traces = await getTraces();

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Curated Traces</h1>
                <p className={styles.subtitle}>Explore our favorite local loops and epic climbs.</p>
            </header>

            <TraceList initialTraces={traces} />
        </div>
    );
}
