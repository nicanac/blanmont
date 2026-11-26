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
  githubConfigured: false,
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
    expect(screen.getByText(/GITHUB_FEEDBACK_TOKEN est absent/)).toBeInTheDocument();

    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toBeChecked());
    const put = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find((c) => c[1]?.method === 'PUT')!;
    expect(JSON.parse(put[1].body)).toEqual({ enabled: true, audience: 'admins' });
  });

  it('changes the audience', async () => {
    render(<VisualFeedbackCard />);
    const members = await screen.findByRole('radio', { name: /membres connectés/i });
    await waitFor(() => expect(members).toBeEnabled());
    await userEvent.click(members);
    await waitFor(() => expect(members).toBeChecked());
  });
});
