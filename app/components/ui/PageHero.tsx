'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PageHeroProps {
    title: string;
    description?: string | React.ReactNode;
    badge?: string;
    badgeIcon?: React.ReactNode;
    variant?: 'red' | 'green' | 'gray' | 'dark' | 'light';
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
}

const variantStyles = {
    light: {
        bg: 'bg-gradient-to-b from-slate-50 via-white to-slate-50/60 border-b border-slate-200/70',
        accent: 'from-red-500/5',
        secondary: 'from-slate-200/30',
        badge: 'bg-red-50 text-[#e03e3e] border border-red-200/70 font-semibold',
        title: 'text-slate-900',
        description: 'text-slate-600',
    },
    red: {
        bg: 'bg-gradient-to-b from-red-50/40 via-white to-slate-50/60 border-b border-red-100/60',
        accent: 'from-red-500/5',
        secondary: 'from-red-900/5',
        badge: 'bg-red-50 text-[#e03e3e] border border-red-200/70 font-semibold',
        title: 'text-slate-900',
        description: 'text-slate-600',
    },
    green: {
        bg: 'bg-gradient-to-b from-emerald-50/40 via-white to-slate-50/60 border-b border-emerald-100/60',
        accent: 'from-emerald-400/10',
        secondary: 'from-green-900/5',
        badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold',
        title: 'text-slate-900',
        description: 'text-slate-600',
    },
    gray: {
        bg: 'bg-gradient-to-b from-slate-100/60 via-white to-slate-50 border-b border-slate-200/70',
        accent: 'from-slate-400/10',
        secondary: 'from-slate-300/20',
        badge: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold',
        title: 'text-slate-900',
        description: 'text-slate-600',
    },
    dark: {
        bg: 'bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 text-white',
        accent: 'from-red-500/10',
        secondary: 'from-slate-800/30',
        badge: 'bg-white/10 text-white/90 border border-white/10 font-semibold',
        title: 'text-white',
        description: 'text-slate-300',
    },
};

const sizeStyles = {
    sm: {
        padding: 'py-10 sm:py-12',
        title: 'text-2xl sm:text-3xl font-bold leading-tight',
        description: 'text-sm sm:text-base leading-relaxed',
    },
    md: {
        padding: 'py-12 sm:py-16',
        title: 'text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight',
        description: 'text-base sm:text-lg leading-relaxed',
    },
    lg: {
        padding: 'py-16 sm:py-20',
        title: 'text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight',
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
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${styles.accent} to-transparent rounded-full blur-3xl`}></div>
            <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${styles.secondary} to-transparent rounded-full blur-2xl`}></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {badge && (
                        <div className={`inline-flex items-center gap-2 rounded-full backdrop-blur-xs px-3.5 py-1 text-xs uppercase tracking-wider mb-5 ${styles.badge}`}>
                            {badgeIcon || <SparklesIcon className="h-3.5 w-3.5" />}
                            {badge}
                        </div>
                    )}
                    <h1 className={`tracking-tight text-balance ${styles.title} ${sizes.title}`}>
                        {title}
                    </h1>
                    {description && (
                        <p className={`mx-auto mt-4 max-w-2xl ${styles.description} ${sizes.description}`}>
                            {description}
                        </p>
                    )}
                    {children && (
                        <div className="mt-8">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
