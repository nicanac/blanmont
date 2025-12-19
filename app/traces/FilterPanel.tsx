'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import Divider from '@mui/material/Divider';

export interface FilterState {
    minDist: number;
    maxDist: number;
    minElev: number;
    maxElev: number;
    selectedStarts: string[];
    selectedSurfaces: string[];
    minQuality: number;
}

interface FilterPanelProps {
    minDist: number;
    maxDist: number;
    minElev: number;
    maxElev: number;
    availableStarts: string[];
    availableSurfaces: string[];
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export default function FilterPanel({
    minDist, maxDist,
    minElev, maxElev,
    availableStarts,
    availableSurfaces,
    filters,
    onFilterChange
}: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setIsOpen(open);
    };

    const handleDistChange = (_event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            onFilterChange({ ...filters, minDist: newValue[0], maxDist: newValue[1] });
        }
    };

    const handleElevChange = (_event: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            onFilterChange({ ...filters, minElev: newValue[0], maxElev: newValue[1] });
        }
    };

    const handleCheckboxChange = (key: 'selectedStarts' | 'selectedSurfaces', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        onFilterChange({ ...filters, [key]: updated });
    };

    return (

        <>
            <Button
                onClick={toggleDrawer(true)}
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                }}
            >
                Filter Traces
            </Button>

            <Drawer
                anchor="left"
                open={isOpen}
                onClose={toggleDrawer(false)}
            >
                <Box
                    sx={{
                        width: { xs: '100vw', sm: 350 },
                        p: 3,
                        height: '100%',
                        overflowY: 'auto',
                        // Custom Scrollbar Styling
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.1)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: 'rgba(255,255,255,0.3)',
                        },
                    }}
                    role="presentation"
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Filters
                        </Typography>
                        <IconButton onClick={toggleDrawer(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />

                    <Stack spacing={4}>
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography gutterBottom fontWeight="bold">Distance</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'mono' }}>
                                    {filters.minDist} - {filters.maxDist} km
                                </Typography>
                            </Stack>
                            <Slider
                                value={[filters.minDist, filters.maxDist]}
                                onChange={handleDistChange}
                                valueLabelDisplay="auto"
                                min={minDist}
                                max={maxDist}
                                disableSwap
                            />
                        </Box>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography gutterBottom fontWeight="bold">Elevation</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'mono' }}>
                                    {filters.minElev} - {filters.maxElev} m
                                </Typography>
                            </Stack>
                            <Slider
                                value={[filters.minElev, filters.maxElev]}
                                onChange={handleElevChange}
                                valueLabelDisplay="auto"
                                min={minElev}
                                max={maxElev}
                                disableSwap
                            />
                        </Box>

                        <Box>
                            <Typography gutterBottom fontWeight="bold">Start Location</Typography>
                            <FormGroup>
                                {availableStarts.map(start => (
                                    <FormControlLabel
                                        key={start}
                                        control={
                                            <Checkbox
                                                checked={filters.selectedStarts.includes(start)}
                                                onChange={() => handleCheckboxChange('selectedStarts', start)}
                                                size="small"
                                            />
                                        }
                                        label={start}
                                    />
                                ))}
                            </FormGroup>
                        </Box>

                        <Box>
                            <Typography gutterBottom fontWeight="bold">Surface</Typography>
                            <FormGroup>
                                {availableSurfaces.map(surface => (
                                    <FormControlLabel
                                        key={surface}
                                        control={
                                            <Checkbox
                                                checked={filters.selectedSurfaces.includes(surface)}
                                                onChange={() => handleCheckboxChange('selectedSurfaces', surface)}
                                                size="small"
                                            />
                                        }
                                        label={surface}
                                    />
                                ))}
                            </FormGroup>
                        </Box>

                        <Box>
                            <FormControl fullWidth size="small">
                                <InputLabel>Minimum Rating</InputLabel>
                                <Select
                                    value={filters.minQuality}
                                    label="Minimum Rating"
                                    onChange={(e) => onFilterChange({ ...filters, minQuality: Number(e.target.value) })}
                                >
                                    <MenuItem value={0}>Any Rating</MenuItem>
                                    <MenuItem value={2}>2+ Stars</MenuItem>
                                    <MenuItem value={3}>3+ Stars</MenuItem>
                                    <MenuItem value={4}>4+ Stars</MenuItem>
                                    <MenuItem value={5}>5 Stars Only</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() => onFilterChange({
                                minDist: minDist,
                                maxDist: maxDist,
                                minElev: minElev,
                                maxElev: maxElev,
                                selectedStarts: [],
                                selectedSurfaces: [],
                                minQuality: 0
                            })}
                        >
                            Reset All Filters
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}
