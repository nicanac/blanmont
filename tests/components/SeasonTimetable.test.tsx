/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SeasonTimetable from '@/app/components/home/SeasonTimetable';
import type { CalendarEvent } from '@/app/types';

const sampleEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    date: '26/09/2026',
    isoDate: '2026-09-26',
    departure: '08h30',
    location: 'Blanmont',
    distances: '75 / 85 km',
    address: 'Place de la Féchère, 1450 Chastre',
  },
  {
    id: 'event-2',
    date: '03/10/2026',
    isoDate: '2026-09-27',
    departure: '09h00',
    location: 'Villers-la-Ville',
    distances: '65 km',
    gpxUrl: 'https://example.com/route.gpx',
  },
];

describe('SeasonTimetable Component (app/components/home/SeasonTimetable.tsx)', () => {
  it('returns null if there are no upcoming events', () => {
    const { container } = render(<SeasonTimetable events={[]} totalThisSeason={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders section title, season count, and event rows', () => {
    render(<SeasonTimetable events={sampleEvents} totalThisSeason={42} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Les prochaines sorties/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/42 sorties au programme cette saison/i)).toBeInTheDocument();

    expect(screen.getByText('Blanmont')).toBeInTheDocument();
    expect(screen.getByText('Villers-la-Ville')).toBeInTheDocument();
    expect(screen.getAllByText('75 / 85 km').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('08h30')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Tout le calendrier/i })).toHaveAttribute(
      'href',
      '/calendrier'
    );
  });
});
