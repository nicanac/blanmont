'use client';

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const theme = createTheme({
    palette: {
        mode: 'dark', // Matching the existing dark theme
        primary: {
            main: '#e03e3e', // Brand primary color
        },
        background: {
            default: '#111', // Dark background
            paper: '#1a1a1a', // Secondary background
        },
        text: {
            primary: '#fff',
            secondary: '#aaa',
        }
    },

    // typography: {
    //     fontFamily: 'var(--font-geist-sans), sans-serif',
    // },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundImage: 'none', // Remove default gradient in dark mode
                    backgroundColor: '#1a1a1a',
                }
            }
        }
    }
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                {children}
            </ThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}
