'use client';

import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/20/solid';

export default function HeroActions() {
    return (
        <div className="flex items-center gap-x-4">
            <Link
                href="/traces"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
                <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
                Explorer les Parcours
            </Link>
            <Link
                href="/le-club"
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
                Découvrir le Club
            </Link>
        </div>
    );
}
