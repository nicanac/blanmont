'use client';

import Link from 'next/link';
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
            <div className="aspect-h-3 aspect-w-4 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-52">
                {trace.photoUrl ? (
                    <img
                        src={trace.photoUrl}
                        alt={trace.name}
                        className="h-full w-full object-cover object-center sm:h-full sm:w-full"
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
                <h3 className="text-sm font-medium text-gray-900">
                    <Link href={`/traces/${trace.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {stripSuffix(trace.name, '#')}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{trace.description || "No description provided."}</p>
                <div className="flex flex-1 flex-col justify-end">
                    <div className="mt-4 flex items-center justify-between text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-1">
                            <span>{trace.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <span>{trace.elevation} m</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {trace.surface}
                        </span>
                        {trace.start && (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
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
                        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                            <a
                                href={trace.gpxUrl}
                                target="_blank"
                                className="relative z-10 flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:text-red-500"
                                download
                            >
                                <ArrowDownTrayIcon className="h-4 w-4" /> Download GPX
                            </a>
                        </div>
                    )
                )
            }
        </div >
    );
}
