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
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }));

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
    vi.mocked(toast.warning).mockClear();
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

  describe('Ride traces → catalogue (#263)', () => {
    const BUTTON = { name: 'Ajouter les traces des sorties au catalogue' };
    const AFTER: TraceLinksPayload = {
      ...PAYLOAD,
      events: [{ ...PAYLOAD.events[0], traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' }, PAYLOAD.events[1]],
    };

    /** GET trace-links answers `links` in turn; each POST of the backfill answers the next report. */
    function stubBackfill(links: TraceLinksPayload[], reports: (Record<string, number> | number)[]) {
      const fetchMock = vi.fn((url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          const next = reports.shift();
          return Promise.resolve(
            typeof next === 'number' ? new Response('{}', { status: next }) : Response.json(next)
          );
        }
        return Promise.resolve(Response.json(links.length > 1 ? links.shift() : links[0]));
      });
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    }
    const posts = (fetchMock: ReturnType<typeof vi.fn>) =>
      fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST').map(([url]) => url);

    it('runs until no ride is left, sums the runs, then shows the rides as linked', async () => {
      const fetchMock = stubBackfill(
        [PAYLOAD, AFTER],
        [
          { linked: 2, created: 1, failed: 0, remaining: 3 },
          { linked: 3, created: 2, failed: 0, remaining: 0 },
        ]
      );
      render(<EventTraceLinker />);

      fireEvent.click(await screen.findByRole('button', BUTTON));

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('5 sorties liées · 3 traces ajoutées au catalogue')
      );
      expect(posts(fetchMock)).toEqual(['/api/admin/events/trace-catalog', '/api/admin/events/trace-catalog']);
      const [saturday] = within(await screen.findByRole('list')).getAllByRole('form');
      await waitFor(() =>
        expect(within(saturday).getByText('Vallée de la Dyle', { selector: 'span' })).toBeInTheDocument()
      );
    });

    it('stops when a run links nothing and says what is left', async () => {
      const fetchMock = stubBackfill([PAYLOAD], [{ linked: 0, created: 0, failed: 1, remaining: 1 }]);
      render(<EventTraceLinker />);

      fireEvent.click(await screen.findByRole('button', BUTTON));

      await waitFor(() =>
        expect(toast.warning).toHaveBeenCalledWith(
          '0 sortie liée · 0 trace ajoutée au catalogue · 1 à reprendre : relancez plus tard.'
        )
      );
      expect(posts(fetchMock)).toHaveLength(1);
    });

    it('says so when every ride is already in the catalogue', async () => {
      stubBackfill([PAYLOAD], [{ linked: 0, created: 0, failed: 0, remaining: 0 }]);
      render(<EventTraceLinker />);

      fireEvent.click(await screen.findByRole('button', BUTTON));

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Toutes les traces des sorties sont déjà dans le catalogue.')
      );
    });

    it('shows an error and stays usable when the server refuses', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      stubBackfill([PAYLOAD], [500]);
      render(<EventTraceLinker />);
      const button = await screen.findByRole('button', BUTTON);

      fireEvent.click(button);

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith("Impossible d'ajouter les traces des sorties au catalogue")
      );
      expect(button).toBeEnabled();
    });
  });

  describe('EventTraceFields (event forms)', () => {
    const row = (over: Partial<EventTraceValue> = {}): EventTraceValue => ({
      label: '',
      traceId: '',
      gpxUrl: '',
      ...over,
    });
    function Form({ initial, distances }: { initial: EventTraceValue[]; distances?: string }) {
      const [value, setValue] = useState(initial);
      return (
        <>
          <EventTraceFields value={value} onChange={setValue} distances={distances} />
          <output data-testid="value">{JSON.stringify(value)}</output>
        </>
      );
    }
    const current = () => JSON.parse(screen.getByTestId('value').textContent || '{}');

    it('fills and locks the link from the picked trace', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={[row()]} />);
      const select = screen.getByLabelText('Trace du catalogue');
      await waitFor(() => expect(select).toBeEnabled());

      fireEvent.change(select, { target: { value: 'dyle' } });

      expect(current()).toEqual([row({ traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' })]);
      expect(screen.getByLabelText(/Lien de la trace/)).toHaveAttribute('readonly');
    });

    it('goes back to a link typed by hand with "Aucune"', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={[row({ traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' })]} />);
      const select = screen.getByLabelText('Trace du catalogue');
      await waitFor(() => expect(select).toBeEnabled());

      fireEvent.change(select, { target: { value: '' } });
      const input = screen.getByLabelText(/Lien de la trace/);
      expect(input).not.toHaveAttribute('readonly');
      fireEvent.change(input, { target: { value: 'https://www.strava.com/routes/1' } });

      expect(current()).toEqual([row({ gpxUrl: 'https://www.strava.com/routes/1' })]);
    });

    it('still lets the link be fixed by hand when the catalogue cannot load', async () => {
      stubFetch(new Response('down', { status: 500 }));
      vi.spyOn(console, 'error').mockImplementation(() => {});
      render(<Form initial={[row({ traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' })]} />);

      await screen.findByText(/Catalogue indisponible/);
      expect(screen.getByLabelText('Trace du catalogue')).toBeDisabled();
      expect(screen.getByLabelText(/Lien de la trace/)).not.toHaveAttribute('readonly');
    });

    it('shows a single trace as before: no label field, no remove button', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={[row()]} />);
      await waitFor(() => expect(screen.getByLabelText('Trace du catalogue')).toBeEnabled());

      expect(screen.queryByLabelText('Groupe ou distance')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Retirer/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ajouter une trace/ })).toBeEnabled();
    });

    it('adds a trace per group or distance, each named and picked on its own', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={[row({ traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' })]} distances="60-85" />);
      await waitFor(() => expect(screen.getByLabelText('Trace du catalogue')).toBeEnabled());

      fireEvent.click(screen.getByRole('button', { name: /Ajouter une trace/ }));

      const first = screen.getByRole('group', { name: /Trace 1/ });
      const second = screen.getByRole('group', { name: /Trace 2/ });
      // The new row's label field takes the focus.
      await waitFor(() => expect(within(second).getByLabelText('Groupe ou distance')).toHaveFocus());

      fireEvent.change(within(first).getByLabelText('Groupe ou distance'), { target: { value: 'GR1' } });
      fireEvent.change(within(second).getByLabelText('Groupe ou distance'), { target: { value: '60 km' } });
      fireEvent.change(within(second).getByLabelText('Trace du catalogue'), { target: { value: 'villers' } });

      expect(current()).toEqual([
        row({ label: 'GR1', traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' }),
        row({ label: '60 km', traceId: 'villers', gpxUrl: 'https://www.komoot.com/tour/9' }),
      ]);
      // Distances of the ride are offered as labels.
      const options = Array.from(document.querySelectorAll('#trace-label-suggestions option')).map(
        (o) => (o as HTMLOptionElement).value
      );
      expect(options).toEqual(expect.arrayContaining(['60 km', '85 km']));
    });

    it('removes a trace; the next one becomes the main trace', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(
        <Form
          initial={[
            row({ label: 'GR1', traceId: 'dyle', gpxUrl: 'https://f.io/dyle.gpx' }),
            row({ label: 'GR3', gpxUrl: 'https://www.strava.com/routes/1' }),
          ]}
        />
      );
      await waitFor(() => expect(screen.getAllByLabelText('Trace du catalogue')[0]).toBeEnabled());

      fireEvent.click(screen.getByRole('button', { name: 'Retirer la trace 1' }));

      expect(current()).toEqual([row({ label: 'GR3', gpxUrl: 'https://www.strava.com/routes/1' })]);
      // Back to one trace: its label stays visible since it has one.
      expect(screen.getByLabelText('Groupe ou distance')).toHaveValue('GR3');
      await waitFor(() => expect(screen.getByRole('button', { name: /Ajouter une trace/ })).toHaveFocus());
    });

    it('stops at the maximum number of traces', async () => {
      stubFetch(Response.json(PAYLOAD));
      render(<Form initial={Array.from({ length: 6 }, (_, i) => row({ label: `${60 + i * 10} km` }))} />);
      await waitFor(() => expect(screen.getAllByLabelText('Trace du catalogue')[0]).toBeEnabled());
      expect(screen.getByRole('button', { name: /Ajouter une trace/ })).toBeDisabled();
      expect(screen.getByText('6 traces au plus par sortie.')).toBeInTheDocument();
    });
  });
});
