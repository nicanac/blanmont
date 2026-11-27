/**
 * @vitest-environment jsdom
 */
import React, { useState } from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import EventTraceLinker from '@/app/admin/traces/components/EventTraceLinker';
import EventTraceFields, { type EventTraceValue } from '@/app/admin/events/components/EventTraceFields';
import type { TraceLinksPayload } from '@/app/lib/event-trace';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const PAYLOAD: TraceLinksPayload = {
  traces: [
    { id: 'dyle', name: 'Vallée de la Dyle', distance: 85, elevation: 950, link: 'https://f.io/dyle.gpx' },
    { id: 'villers', name: 'Abbaye de Villers', distance: 62, link: 'https://www.komoot.com/tour/9' },
  ],
  events: [
    { id: 'sat', isoDate: '2026-11-28', location: 'Blanmont', group: 'Blanmont' },
    { id: 'sun', isoDate: '2026-11-29', location: 'Gembloux', group: 'Gravel', traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' },
  ],
};

/** fetch stub: the trace-links GET answers `links`, every PUT answers `put`. */
function stubFetch(links: Response, put: () => Response = () => Response.json({ success: true })) {
  const fetchMock = vi.fn((url: string, init?: RequestInit) =>
    Promise.resolve(init?.method === 'PUT' ? put() : links.clone())
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const putCalls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls
    .filter(([, init]) => init?.method === 'PUT')
    .map(([url, init]) => [url, JSON.parse(init.body)]);

describe('Linking a catalog trace to a ride (#255)', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('EventTraceLinker (/admin/traces)', () => {
    it('lists the upcoming rides with the trace each one follows', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<EventTraceLinker />);

      const list = await screen.findByRole('list');
      const rows = within(list).getAllByRole('form');
      expect(rows).toHaveLength(2);
      expect(within(rows[0]).getByText('Aucune trace')).toBeInTheDocument();
      expect(within(rows[1]).getByText('Abbaye de Villers', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('2 sorties à venir')).toBeInTheDocument();
      // Nothing to save until a different trace is picked.
      for (const row of rows) expect(within(row).getByRole('button')).toBeDisabled();
    });

    it('links the picked trace on submit only, then shows it', async () => {
      const fetchMock = stubFetch(Response.json(PAYLOAD));
      render(<EventTraceLinker />);
      const [saturday] = within(await screen.findByRole('list')).getAllByRole('form');

      fireEvent.change(within(saturday).getByLabelText('Trace du catalogue'), { target: { value: 'dyle' } });
      expect(putCalls(fetchMock)).toEqual([]); // no auto-save on change

      fireEvent.click(within(saturday).getByRole('button', { name: /Lier/ }));

      await waitFor(() => expect(toast.success).toHaveBeenCalled());
      expect(putCalls(fetchMock)).toEqual([['/api/admin/events/sat', { traceId: 'dyle' }]]);
      expect(within(saturday).getByText('Vallée de la Dyle', { selector: 'span' })).toBeInTheDocument();
      expect(within(saturday).getByRole('button')).toBeDisabled();
    });

    it('removes a linked trace and its link', async () => {
      const fetchMock = stubFetch(Response.json(PAYLOAD));
      render(<EventTraceLinker />);
      const [, sunday] = within(await screen.findByRole('list')).getAllByRole('form');

      fireEvent.change(within(sunday).getByLabelText('Trace du catalogue'), { target: { value: '' } });
      fireEvent.click(within(sunday).getByRole('button', { name: /Retirer/ }));

      await waitFor(() => expect(toast.success).toHaveBeenCalled());
      expect(putCalls(fetchMock)).toEqual([['/api/admin/events/sun', { traceId: '', gpxUrl: '' }]]);
      expect(within(sunday).getByText('Aucune trace')).toBeInTheDocument();
    });

    it('shows the server reason when the link is refused, and keeps the ride as it was', async () => {
      stubFetch(Response.json(PAYLOAD), () =>
        Response.json({ error: 'Trace introuvable dans le catalogue' }, { status: 404 })
      );
      render(<EventTraceLinker />);
      const [saturday] = within(await screen.findByRole('list')).getAllByRole('form');

      fireEvent.change(within(saturday).getByLabelText('Trace du catalogue'), { target: { value: 'dyle' } });
      fireEvent.click(within(saturday).getByRole('button', { name: /Lier/ }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Trace introuvable dans le catalogue'));
      expect(within(saturday).getByText('Aucune trace')).toBeInTheDocument();
    });

    it('is hidden without access to the Événements section', async () => {
      const fetchMock = stubFetch(Response.json({ error: 'Forbidden' }, { status: 403 }));
      const { container } = render(<EventTraceLinker />);

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      await waitFor(() => expect(container).toBeEmptyDOMElement());
    });
  });

  describe('EventTraceFields (event forms)', () => {
    function Form({ initial }: { initial: EventTraceValue }) {
      const [value, setValue] = useState(initial);
      return (
        <>
          <EventTraceFields value={value} onChange={setValue} />
          <output data-testid="value">{JSON.stringify(value)}</output>
        </>
      );
    }
    const current = () => JSON.parse(screen.getByTestId('value').textContent || '{}');

    it('fills and locks the link from the picked trace', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={{ traceId: '', gpxUrl: '' }} />);
      const select = screen.getByLabelText('Trace du catalogue');
      await waitFor(() => expect(select).toBeEnabled());

      fireEvent.change(select, { target: { value: 'dyle' } });

      expect(current()).toEqual({ traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' });
      expect(screen.getByLabelText(/Lien de la trace/)).toHaveAttribute('readonly');
    });

    it('goes back to a link typed by hand with "Aucune"', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={{ traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' }} />);
      const select = screen.getByLabelText('Trace du catalogue');
      await waitFor(() => expect(select).toBeEnabled());

      fireEvent.change(select, { target: { value: '' } });
      const input = screen.getByLabelText(/Lien de la trace/);
      expect(input).not.toHaveAttribute('readonly');
      fireEvent.change(input, { target: { value: 'https://www.strava.com/routes/1' } });

      expect(current()).toEqual({ traceId: '', gpxUrl: 'https://www.strava.com/routes/1' });
    });

    it('still lets the link be fixed by hand when the catalogue cannot load', async () => {
      stubFetch(new Response('down', { status: 500 }));
      vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<Form initial={{ traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' }} />);

      await screen.findByText(/Catalogue indisponible/);
      expect(screen.getByLabelText('Trace du catalogue')).toBeDisabled();
      expect(screen.getByLabelText(/Lien de la trace/)).not.toHaveAttribute('readonly');
    });
  });
});
