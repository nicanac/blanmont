'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PageHeroProps {
    title: string;
    description?: string | React.ReactNode;
    badge?: string;
    badgeIcon?: React.ReactNode;
    variant?: 'red' | 'green' | 'blue' | 'gray' | 'dark' | 'light';
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
}

/**
 * Editorial Peloton page covers — every page opens on an ink cover with an
 * oversized uppercase headline. Variants only tune the accent glow and the
 * status chip, never the ground.
 */
const variantStyles = {
    light: {
        bg: 'bg-[#0a0c10] border-b border-white/10',
        accent: 'bg-[#e03e3e]/15',
        secondary: 'bg-white/5',
        badge: 'bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    red: {
        bg: 'bg-[#0a0c10] border-b border-white/10',
        accent: 'bg-[#e03e3e]/20',
        secondary: 'bg-white/5',
        badge: 'bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    green: {
        bg: 'bg-[#0a0c10] border-b border-white/10',
        accent: 'bg-emerald-500/15',
        secondary: 'bg-white/5',
        badge: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    blue: {
        bg: 'bg-[#0a0c10] border-b border-white/10',
        accent: 'bg-sky-500/15',
        secondary: 'bg-white/5',
        badge: 'bg-sky-400/10 text-sky-400 border border-sky-400/25',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    gray: {
        bg: 'bg-[#0a0c10] border-b border-white/10',
        accent: 'bg-white/10',
        secondary: 'bg-white/5',
        badge: 'bg-white/10 text-[#f5f6f8] border border-white/15',
        title: 'text-white',
        description: 'text-[#a7adbb]',
    },
    dark: {
        bg: 'bg-[#0a0c10] border-b border-white/10',
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
        title: 'text-[clamp(1.75rem,4vw,2.5rem)] font-bold uppercase tracking-[-0.02em] leading-[1.02]',
        description: 'text-sm sm:text-base leading-relaxed',
    },
    md: {
        padding: 'py-14 sm:py-20',
        title: 'text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98]',
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
    children,
}: PageHeroProps): React.ReactElement {
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    return (
        <section className={`relative overflow-hidden ${styles.bg} ${sizes.padding}`}>
            {/* Accent glow — the variant's only signature on the ink cover */}
            <div className={`pointer-events-none absolute -top-24 right-0 w-96 h-96 ${styles.accent} rounded-full blur-[120px]`}></div>
            <div className={`pointer-events-none absolute bottom-0 left-0 w-64 h-64 ${styles.secondary} rounded-full blur-[100px]`}></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
