/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FeedbackGate from '@/app/components/feedback/FeedbackGate';

vi.mock('@/app/context/AuthContext', () => ({ useAuthOptional: () => null }));
vi.mock('@/app/components/feedback/FeedbackOverlay', () => ({
  default: () => <button>overlay</button>,
}));

const stub = (body: unknown, ok = true) =>
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response)));

describe('FeedbackGate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('renders nothing when the server refuses', async () => {
    stub({ allowed: false });
    render(<FeedbackGate />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText('overlay')).toBeNull();
  });

  it('mounts the overlay when allowed', async () => {
    stub({ allowed: true });
    render(<FeedbackGate />);
    expect(await screen.findByText('overlay')).toBeInTheDocument();
  });

  it('does not even fetch when the kill-switch is set', () => {
    vi.stubEnv('NEXT_PUBLIC_FEEDBACK_ENABLED', 'false');
    stub({ allowed: true });
    render(<FeedbackGate />);
    expect(fetch).not.toHaveBeenCalled();
  });
});
