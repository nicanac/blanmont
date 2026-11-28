/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeekendTraces, {
  traceDayLabel,
  traceFacts,
} from '@/app/features/sondage/components/WeekendTraces';
import type { WeekendTrace } from '@/app/lib/poll-share';

// Leaflet is client-only: the dynamic MapPreview is replaced by a probe.
vi.mock('next/dynamic', () => ({
  default: () =>
    function MapProbe(props: { summaryPolyline?: string; interactive?: boolean }) {
      return (
        <div
          data-testid="trace-map"
          data-polyline={props.summaryPolyline}
          data-interactive={String(props.interactive)}
        />
      );
    },
}));

const NBSP = ' ';
const GARMIN = 'https://connect.garmin.com/app/course/532374522';

const garminTrace: WeekendTrace = {
  eventId: 'evt-sat',
  isoDate: '2026-11-28',
  url: GARMIN,
  route: {
    name: 'NordEst Tirlemont 105km',
    distanceKm: 104.69488,
    elevationM: 523,
    polyline: '_p~iF~ps|U_ulLnnqC',
  },
};

describe('trace helpers', () => {
  it('prints the day without the year, capitalised', () => {
    expect(traceDayLabel('2026-11-28')).toBe('Samedi 28 novembre');
    expect(traceDayLabel('2026-11-29')).toBe('Dimanche 29 novembre');
  });

  it('prints distance and D+ in French units', () => {
    expect(traceFacts({ distanceKm: 104.69488, elevationM: 1523 })).toBe(
      `104,7${NBSP}km · 1${' '}523${NBSP}m D+`
    );
    expect(traceFacts({ distanceKm: 64 })).toBe(`64,0${NBSP}km`);
  });
});

describe('WeekendTraces', () => {
  it('renders nothing without trace', () => {
    const { container } = render(<WeekendTraces traces={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prints the map, the course and its figures, and the GPX download', () => {
    render(<WeekendTraces traces={[garminTrace]} />);

    const section = screen.getByRole('region', { name: 'Tracé GPS du week-end' });
    const figure = within(section).getByRole('figure');
    expect(within(figure).getByText('Samedi 28 novembre')).toBeInTheDocument();
    expect(within(figure).getByText('NordEst Tirlemont 105km')).toBeInTheDocument();
    // Raw text: the default matcher would collapse the non-breaking spaces.
    expect(
      within(figure).getByText(`104,7${NBSP}km · 523${NBSP}m D+`, { normalizer: (t) => t })
    ).toBeInTheDocument();

    const map = within(figure).getByTestId('trace-map');
    expect(map).toHaveAttribute('data-polyline', garminTrace.route!.polyline);
    expect(map).toHaveAttribute('data-interactive', 'false');

    // Like the home page (#259): the member route downloads the Garmin course as GPX,
    // in the same tab, and the Garmin link itself never reaches the button.
    const link = within(figure).getByRole('link', {
      name: 'Télécharger la trace GPX · Samedi 28 novembre',
    });
    expect(link).toHaveAttribute('href', '/api/trace/evt-sat');
    expect(link).toHaveTextContent('Télécharger la trace GPX');
    expect(link).not.toHaveAttribute('target');
    expect(within(figure).queryByText(/Garmin Connect/)).not.toBeInTheDocument();
    expect(figure.innerHTML).not.toContain(GARMIN);
  });

  it('encodes the event id in the member link', () => {
    render(<WeekendTraces traces={[{ ...garminTrace, eventId: 'sortie 1/2' }]} />);
    expect(screen.getByRole('link', { name: /Télécharger la trace GPX/ })).toHaveAttribute(
      'href',
      '/api/trace/sortie%201%2F2'
    );
  });

  it('falls back to the day and the download when the trace cannot be drawn', () => {
    render(
      <WeekendTraces
        traces={[
          {
            eventId: 'evt-sun',
            isoDate: '2026-11-29',
            url: 'https://www.strava.com/routes/1',
            route: null,
          },
        ]}
      />
    );

    expect(screen.queryByTestId('trace-map')).not.toBeInTheDocument();
    expect(screen.getByText('Dimanche 29 novembre')).toBeInTheDocument();
    // Every source goes through the member route, which redirects to Strava/Komoot pages.
    expect(
      screen.getByRole('link', { name: 'Télécharger la trace GPX · Dimanche 29 novembre' })
    ).toHaveAttribute('href', '/api/trace/evt-sun');
  });

  it('lists the Saturday and Sunday traces under a plural heading', () => {
    render(
      <WeekendTraces
        traces={[
          garminTrace,
          { eventId: 'evt-sun', isoDate: '2026-11-29', url: 'https://example.org/dimanche.gpx' },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'Tracés GPS du week-end' })).toBeInTheDocument();
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: 'Télécharger la trace GPX · Samedi 28 novembre' })
    ).toHaveAttribute('href', '/api/trace/evt-sat');
    expect(
      screen.getByRole('link', { name: 'Télécharger la trace GPX · Dimanche 29 novembre' })
    ).toHaveAttribute('href', '/api/trace/evt-sun');
  });
});
