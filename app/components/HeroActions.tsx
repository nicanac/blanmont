'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import ExploreIcon from '@mui/icons-material/Explore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function HeroActions() {
    return (
        <Stack
            sx={{ pt: 4 }}
            direction="row"
            spacing={2}
            justifyContent="center"
        >
            <Button component={Link} href="/traces" variant="contained" size="large" startIcon={<ExploreIcon />} sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}>
                Explore Traces
            </Button>
            <Button component={Link} href="/members" variant="outlined" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}>
                Meet the Team
            </Button>
        </Stack>
    );
}
