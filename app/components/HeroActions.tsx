'use client';

import Link from 'next/link';
import { GlobeAltIcon, ArrowRightIcon } from '@heroicons/react/20/solid';

export default function HeroActions() {
    return (
        <div className="flex items-center gap-x-6">
            <Link
                href="/traces"
                className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 flex items-center gap-2"
            >
                <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
                Explorer les Parcours
            </Link>
            <Link
                href="/le-club"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 group"
            >
                Découvrir le Club <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
