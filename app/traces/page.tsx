import { getTraces } from '../lib/firebase';
import TraceList from '../features/traces/components/TraceList';

export const revalidate = 60;

/**
 * Traces Listing Page.
 * Fetches and displays a list of all curated cycling traces.
 * Revalidates every 60 seconds.
 */
export default async function TracesPage() {
    const traces = await getTraces();

    return (
        <TraceList initialTraces={traces} />
    );
}
