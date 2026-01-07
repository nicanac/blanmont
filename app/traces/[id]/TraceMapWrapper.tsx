'use client';

import dynamic from 'next/dynamic';

const MapPreview = dynamic(() => import('../../features/traces/components/MapPreview'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">
            Chargement de la carte...
        </div>
    )
});

interface Props {
    polyline: string;
}

export default function TraceMapWrapper({ polyline }: Props) {
    return <MapPreview summaryPolyline={polyline} />;
}
