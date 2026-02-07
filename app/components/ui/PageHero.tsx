'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PageHeroProps {
    title: string;
    description?: string | React.ReactNode;
    badge?: string;
    badgeIcon?: React.ReactNode;
    variant?: 'red' | 'green' | 'gray' | 'dark';
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
}

const variantStyles = {
    red: {
        bg: 'bg-gradient-to-r from-red-600 via-red-700 to-red-800',
        accent: 'from-yellow-400/20',
        secondary: 'from-red-900/30',
        badge: 'bg-white/10 text-white/90',
        title: 'text-white',
        description: 'text-red-100',
    },
    green: {
        bg: 'bg-gradient-to-r from-green-600 via-green-700 to-green-800',
        accent: 'from-emerald-400/20',
        secondary: 'from-green-900/30',
        badge: 'bg-white/10 text-white/90',
        title: 'text-white',
        description: 'text-green-100',
    },
    gray: {
        bg: 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900',
        accent: 'from-gray-400/20',
        secondary: 'from-gray-900/30',
        badge: 'bg-white/10 text-white/90',
        title: 'text-white',
        description: 'text-gray-300',
    },
    dark: {
        bg: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900',
        accent: 'from-red-500/20',
        secondary: 'from-gray-900/30',
        badge: 'bg-red-600/20 text-red-200',
        title: 'text-white',
        description: 'text-gray-300',
    },
};

const sizeStyles = {
    sm: {
        padding: 'py-12',
        title: 'text-3xl sm:text-4xl',
        description: 'text-base',
    },
    md: {
        padding: 'py-16',
        title: 'text-3xl sm:text-4xl lg:text-5xl',
        description: 'text-lg',
    },
    lg: {
        padding: 'py-20',
        title: 'text-4xl sm:text-5xl lg:text-6xl',
        description: 'text-lg',
    },
};

export function PageHero({
    title,
    description,
    badge,
    badgeIcon,
    variant = 'red',
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
                        <div className={`inline-flex items-center gap-2 rounded-full backdrop-blur-sm px-4 py-1.5 text-sm mb-6 ${styles.badge}`}>
                            {badgeIcon || <SparklesIcon className="h-4 w-4" />}
                            {badge}
                        </div>
                    )}
                    <h1 className={`font-bold tracking-tight ${styles.title} ${sizes.title}`}>
                        {title}
                    </h1>
                    {description && (
                        <p className={`mx-auto mt-6 max-w-2xl ${styles.description} ${sizes.description}`}>
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
