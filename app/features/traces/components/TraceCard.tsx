'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trace } from '../../../types';
import { stripSuffix } from '../../../utils/string.utils';
import { MapPinIcon, RocketLaunchIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/20/solid';

interface TraceCardProps {
    trace: Trace;
    className?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    imageOverlay?: React.ReactNode;
}

export default function TraceCard({ trace, ...props }: TraceCardProps) {

    // Get rating color based on quality score (helper for text color or stars)
    const getRatingColorClass = (quality: number): string => {
        if (quality > 4) return 'text-emerald-400';
        if (quality === 4) return 'text-amber-400';
        if (quality === 3) return 'text-amber-300';
        return 'text-orange-400';
    };

    const ratingColorClass = getRatingColorClass(trace.quality);

    const getSurfaceBadgeClass = (surface?: string): string => {
        if (!surface) return 'bg-slate-50 text-slate-700 border-slate-200';
        const s = surface.toLowerCase();
        if (s.includes('route') || s.includes('asphalt')) return 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
        if (s.includes('vtt') || s.includes('gravel') || s.includes('chemins') || s.includes('pav')) return 'bg-amber-50 text-amber-800 border-amber-200/70';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 ${props.className || ''}`}>
            <div className="aspect-h-3 aspect-w-4 relative bg-slate-100 sm:aspect-none group-hover:opacity-95 sm:h-52 overflow-hidden">
                {trace.photoUrl ? (
                    <Image
                        src={trace.photoUrl}
                        alt={trace.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-103"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <MapPinIcon className="h-12 w-12" />
                    </div>
                )}
                {/* Rating Badge Overlay */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs border border-white/10 shadow-sm">
                    <StarIcon className={`h-3.5 w-3.5 ${ratingColorClass}`} />
                    <span>{trace.quality}</span>
                </div>
                {trace.direction && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs border border-white/15 shadow-sm">
                        {trace.direction}
                    </div>
                )}
                {props.imageOverlay}
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors line-clamp-1">
                    <Link href={`/traces/${trace.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {stripSuffix(trace.name, '#')}
                    </Link>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {trace.description || "Circuit vélo autour de Blanmont."}
                </p>
                <div className="flex flex-1 flex-col justify-end pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-slate-900 tabular-nums">{trace.distance}</span>
                            <span className="font-semibold text-slate-500">km</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-slate-800 tabular-nums">{trace.elevation}</span>
                            <span className="font-semibold text-slate-500">m D+</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getSurfaceBadgeClass(trace.surface)}`}>
                            {trace.surface}
                        </span>
                        {trace.start && (
                            <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 text-xs font-medium text-slate-600 truncate">
                                {trace.start}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {props.children}

            {
                props.footer ? (
                    props.footer
                ) : (
                    trace.gpxUrl && (
                        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/80">
                            <a
                                href={trace.gpxUrl}
                                target="_blank"
                                className="relative z-10 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:text-[#c93434] transition-colors py-0.5"
                                download
                            >
                                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                                <span>Télécharger GPX</span>
                            </a>
                        </div>
                    )
                )
            }
        </div >
    );
}
