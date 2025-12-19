import { getTraces } from '../lib/notion';
import TraceList from './TraceList';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const revalidate = 60;

/**
 * Traces Listing Page.
 * Fetches and displays a list of all curated cycling traces.
 * Revalidates every 60 seconds.
 */
export default async function TracesPage() {
    const traces = await getTraces();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                    Curated Traces
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Explore our favorite local loops and epic climbs.
                </Typography>
            </Box>

            <TraceList initialTraces={traces} />
        </Container>
    );
}
