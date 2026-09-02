'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PageHeroProps {
    title: React.ReactNode;
    description?: string | React.ReactNode;
    badge?: string;
    badgeIcon?: React.ReactNode;
    variant?: 'red' | 'green' | 'blue' | 'gray' | 'dark' | 'light';
    size?: 'sm' | 'md' | 'lg';
    watermark?: string;
    children?: React.ReactNode;
}

/**
 * Editorial Peloton page covers — every page opens on an ink cover with an
 * oversized uppercase headline, red italic accents, and atmospheric watermark.
 */
const variantStyles = {
    light: {
        bg: 'bg-[#0a0c10] border-b border-[#262b38]',
        accent: 'bg-[#e03e3e]/15',
        secondary: 'bg-white/5',
        badge: 'bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    red: {
        bg: 'bg-[#0a0c10] border-b border-[#262b38]',
        accent: 'bg-[#e03e3e]/20',
        secondary: 'bg-white/5',
        badge: 'bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    green: {
        bg: 'bg-[#0a0c10] border-b border-[#262b38]',
        accent: 'bg-emerald-500/15',
        secondary: 'bg-white/5',
        badge: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    blue: {
        bg: 'bg-[#0a0c10] border-b border-[#262b38]',
        accent: 'bg-sky-500/15',
        secondary: 'bg-white/5',
        badge: 'bg-sky-400/10 text-sky-400 border border-sky-400/25',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    gray: {
        bg: 'bg-[#0a0c10] border-b border-[#262b38]',
        accent: 'bg-white/10',
        secondary: 'bg-white/5',
        badge: 'bg-white/10 text-[#f5f6f8] border border-white/15',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    dark: {
        bg: 'bg-[#0a0c10] border-b border-[#262b38]',
        accent: 'bg-[#e03e3e]/25',
        secondary: 'bg-white/5',
        badge: 'bg-white/10 text-white border border-white/15',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
};

const sizeStyles = {
    sm: {
        padding: 'py-12 sm:py-14',
        title: 'text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold uppercase tracking-[-0.025em] leading-[1.02]',
        description: 'text-sm sm:text-base leading-relaxed',
    },
    md: {
        padding: 'py-14 sm:py-20',
        title: 'text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98]',
        description: 'text-base sm:text-lg leading-relaxed',
    },
    lg: {
        padding: 'py-16 sm:py-24',
        title: 'text-[clamp(2.5rem,7vw,5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98]',
        description: 'text-base sm:text-xl leading-relaxed',
    },
};

export function PageHero({
    title,
    description,
    badge,
    badgeIcon,
    variant = 'light',
    size = 'md',
    watermark = 'BLANMONT',
    children,
}: PageHeroProps): React.ReactElement {
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    return (
        <section className={`relative overflow-hidden ${styles.bg} ${sizes.padding}`}>
            {/* Atmospheric Background Watermark */}
            {watermark && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.025] leading-none text-center">
                    <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-white whitespace-nowrap">
                        {watermark}
                    </span>
                </div>
            )}

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-3xl">
                    <h1 className={`text-balance ${styles.title} ${sizes.title}`}>
                        {title}
                    </h1>
                    {description && (
                        <p className={`mt-5 max-w-[65ch] ${styles.description} ${sizes.description}`}>
                            {description}
                        </p>
                    )}
                    {(badge || children) && (
                        <div className="mt-7 flex flex-wrap items-center gap-4">
                            {badge && (
                                <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${styles.badge}`}>
                                    {badgeIcon || <SparklesIcon className="h-3.5 w-3.5" />}
                                    {badge}
                                </div>
                            )}
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
