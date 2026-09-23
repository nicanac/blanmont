import React from 'react';
import HeroTelemetryFrame from '@/app/components/HeroTelemetryFrame';
import type { HeroSettings } from '@/app/types';

interface HomeSliderProps {
  heroSettings: HeroSettings;
}

/**
 * The club's photo slider (slides managed in /admin/hero), printed as its own band
 * under the cover. The standing information cards already sit in the cover's lower
 * margin, so the band shows the photos only.
 */
export default function HomeSlider({ heroSettings }: HomeSliderProps): React.ReactElement {
  return (
    <section
      aria-labelledby="diaporama-title"
      className="border-b border-ink dark:border-night-line-strong"
    >
      <h2 id="diaporama-title" className="sr-only">
        Le peloton en photos
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <HeroTelemetryFrame settings={heroSettings} showCards={false} />
      </div>
    </section>
  );
}
