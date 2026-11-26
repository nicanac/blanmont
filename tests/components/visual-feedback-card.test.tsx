/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisualFeedbackCard from '@/app/admin/settings/components/VisualFeedbackCard';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const initial = {
  settings: { enabled: false, audience: 'admins', updatedAt: '' },
  token: { source: 'none' },
  repo: 'o/r',
  killed: false,
};

describe('VisualFeedbackCard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              init?.method === 'PUT'
                ? { settings: { ...JSON.parse(init.body as string), updatedAt: 'now' } }
                : initial
            ),
        } as Response)
      )
    );
  });

  it('loads the setting, warns when the GitHub token is missing and saves a toggle', async () => {
    render(<VisualFeedbackCard />);
    const toggle = await screen.findByRole('switch', { name: /activer les retours visuels/i });
    await waitFor(() => expect(toggle).toBeEnabled());
    expect(toggle).not.toBeChecked();
    expect(screen.getByText(/aucun jeton github/i)).toBeInTheDocument();

    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toBeChecked());
    const put = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find((c) => c[1]?.method === 'PUT')!;
    expect(JSON.parse(put[1].body)).toEqual({ enabled: true, audience: 'admins' });
  });

  it('tests and stores a pasted token, then shows it masked and never echoes it back', async () => {
    const calls: { url: string; method?: string; body?: string }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        calls.push({ url, method: init?.method, body: init?.body as string });
        const body =
          url === '/api/admin/feedback-token'
            ? { token: { source: 'admin', last4: 'wxyz', updatedAt: '2026-11-26T10:00:00Z' } }
            : initial;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
      })
    );
    render(<VisualFeedbackCard />);
    const input = await screen.findByLabelText(/jeton github/i);
    await userEvent.type(input, 'github_pat_abcdefghijklmnopqrstuvwxyz');
    await userEvent.click(screen.getByRole('button', { name: /tester et enregistrer/i }));
    expect(await screen.findByText(/jeton enregistré \(…wxyz\)/i)).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(calls.find((c) => c.method === 'PUT')?.body).toContain('github_pat_abcdefghijklmnopqrstuvwxyz');
    expect(screen.queryByText(/abcdefghijklmnop/)).toBeNull();
  });

  it('shows the server refusal when GitHub rejects the token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve(
          url === '/api/admin/feedback-token'
            ? ({ ok: false, json: () => Promise.resolve({ error: 'GitHub refuse ce jeton (invalide ou expiré).' }) } as Response)
            : ({ ok: true, json: () => Promise.resolve(initial) } as Response)
        )
      )
    );
    render(<VisualFeedbackCard />);
    await userEvent.type(await screen.findByLabelText(/jeton github/i), 'github_pat_abcdefghijklmnopqrstuvwxyz');
    await userEvent.click(screen.getByRole('button', { name: /tester et enregistrer/i }));
    expect(await screen.findByText(/GitHub refuse ce jeton/)).toBeInTheDocument();
  });

  it('changes the audience', async () => {
    render(<VisualFeedbackCard />);
    const members = await screen.findByRole('radio', { name: /membres connectés/i });
    await waitFor(() => expect(members).toBeEnabled());
    await userEvent.click(members);
    await waitFor(() => expect(members).toBeChecked());
  });
});
