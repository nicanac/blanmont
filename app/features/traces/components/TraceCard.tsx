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
        if (quality > 4) return 'text-green-500';
        if (quality === 4) return 'text-yellow-500';
        if (quality === 3) return 'text-yellow-400';
        return 'text-orange-500';
    };

    const ratingColorClass = getRatingColorClass(trace.quality);

    return (
        <div className={`group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white ${props.className || ''}`}>
            <div className="aspect-h-3 aspect-w-4 relative bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-52">
                {trace.photoUrl ? (
                    <Image
                        src={trace.photoUrl}
                        alt={trace.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <MapPinIcon className="h-12 w-12" />
                    </div>
                )}
                {/* Rating Badge Overlay */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <StarIcon className={`h-3 w-3 ${ratingColorClass}`} />
                    {trace.quality}
                </div>
                {trace.direction && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-gray-900/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/20">
                        {trace.direction}
                    </div>
                )}
                {props.imageOverlay}
            </div>
            <div className="flex flex-1 flex-col p-4 space-y-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors">
                    <Link href={`/traces/${trace.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {stripSuffix(trace.name, '#')}
                    </Link>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {trace.description || "Aucune description fournie."}
                </p>
                <div className="flex flex-1 flex-col justify-end">
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-slate-900 tabular-nums">{trace.distance}</span>
                            <span className="font-medium text-slate-500">km</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-slate-700 tabular-nums">{trace.elevation}</span>
                            <span className="font-medium text-slate-500">m D+</span>
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                            {trace.surface}
                        </span>
                        {trace.start && (
                            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 truncate">
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
                        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/70">
                            <a
                                href={trace.gpxUrl}
                                target="_blank"
                                className="relative z-10 flex items-center justify-center gap-2 text-xs font-semibold text-[#e03e3e] hover:text-[#c93434] transition-colors"
                                download
                            >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                <span>Télécharger GPX</span>
                            </a>
                        </div>
                    )
                )
            }
        </div >
    );
}
