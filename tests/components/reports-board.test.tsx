/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsBoard from '@/app/components/feedback/reports/ReportsBoard';
import type { FeedbackReport } from '@/app/lib/feedback/reports';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mk = (over: Partial<FeedbackReport>): FeedbackReport => ({
  number: 1, id: 'REV-1', title: 'Titre', status: 'open', category: 'ui', priority: 'important', author: 'Nico',
  comment: 'Description', routePath: '/', consoleErrors: [], issueUrl: 'https://github.com/o/r/issues/1', commentsCount: 0,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...over,
});

let reports: FeedbackReport[];

function stubFetch(listStatus = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const ok = (body: unknown, status = 200) =>
        Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);
      if (url === '/api/feedback/reports') {
        return listStatus === 200 ? ok({ reports }) : ok({ error: 'GITHUB_FEEDBACK_TOKEN manquant côté serveur.' }, listStatus);
      }
      if (url.endsWith('/vote')) return ok({ votes: 3, voted: true });
      const n = Number(url.split('/').pop());
      if (init?.method === 'POST') {
        const action = JSON.parse(init.body as string).action;
        return ok({ report: { ...reports.find((r) => r.number === n)!, status: action === 'resolve' ? 'resolved' : 'open' } });
      }
      return ok({ report: reports.find((r) => r.number === n), comments: [{ id: 1, author: 'Paul (Trésorier)', text: 'Je regarde', createdAt: new Date().toISOString(), viaApp: true }] });
    })
  );
}

describe('ReportsBoard', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
    reports = [
      mk({ number: 1, title: 'Calendrier cassé', priority: 'critical', category: 'bug' }),
      mk({ number: 2, title: 'Faute de frappe', category: 'copy' }),
      mk({ number: 3, title: 'Déjà réglé', status: 'resolved' }),
    ];
    stubFetch();
  });

  it('lists open reports by default with a count per tab, and switches tab', async () => {
    render(<ReportsBoard />);
    expect(await screen.findByText('Calendrier cassé')).toBeInTheDocument();
    expect(screen.queryByText('Déjà réglé')).toBeNull();
    const tabs = within(screen.getByRole('group', { name: 'Statut des retours' }));
    expect(tabs.getByRole('button', { name: /à traiter/i })).toHaveTextContent('2');
    await userEvent.click(tabs.getByRole('button', { name: /résolu/i }));
    expect(screen.getByText('Déjà réglé')).toBeInTheDocument();
  });

  it('searches and filters, with a way back from an empty result', async () => {
    render(<ReportsBoard />);
    await screen.findByText('Calendrier cassé');
    await userEvent.type(screen.getByRole('searchbox'), 'frappe');
    expect(screen.queryByText('Calendrier cassé')).toBeNull();
    expect(screen.getByText('Faute de frappe')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText(/aucun retour ne correspond/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /effacer les filtres/i }));
    expect(screen.getByText('Calendrier cassé')).toBeInTheDocument();
  });

  it('opens a report with its replies and resolves it, moving on to the next one', async () => {
    render(<ReportsBoard />);
    await userEvent.click(await screen.findByText('Calendrier cassé'));
    const dialog = await screen.findByRole('dialog', { name: 'Calendrier cassé' });
    expect(await within(dialog).findByText('Je regarde')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /marquer résolu/i }));
    // the resolved report leaves the open tab and the dialog jumps to the remaining one
    expect(await screen.findByRole('dialog', { name: 'Faute de frappe' })).toBeInTheDocument();
  });

  it('shows the vote count on cards and toggles a +1 from the dialog', async () => {
    reports[0] = { ...reports[0], votes: 2, voted: false };
    render(<ReportsBoard />);
    await userEvent.click(await screen.findByText('Calendrier cassé'));
    const dialog = await screen.findByRole('dialog', { name: 'Calendrier cassé' });
    const plusOne = within(dialog).getByRole('button', { name: /ajouter un \+1 \(2\)/i });
    expect(plusOne).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(plusOne);
    expect(await within(dialog).findByRole('button', { name: /retirer mon \+1 \(3\)/i })).toHaveAttribute('aria-pressed', 'true');
    expect(fetch).toHaveBeenCalledWith('/api/feedback/reports/1/vote', expect.objectContaining({ method: 'POST' }));
  });

  it('explains a missing server token', async () => {
    stubFetch(503);
    render(<ReportsBoard />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/GITHUB_FEEDBACK_TOKEN/);
    await waitFor(() => expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument());
  });
});
