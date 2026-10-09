import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({ name: 'Replay' })),
  captureRouterTransitionStart: vi.fn(),
}));

describe('Sentry configuration files', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes instrumentation-client without errors', async () => {
    const sentry = await import('@sentry/nextjs');
    const clientModule = await import('@/instrumentation-client');
    expect(sentry.init).toHaveBeenCalled();
    expect(clientModule.onRouterTransitionStart).toBeDefined();
  });

  it('initializes sentry.server.config without errors', async () => {
    const sentry = await import('@sentry/nextjs');
    await import('@/sentry.server.config');
    expect(sentry.init).toHaveBeenCalled();
  });

  it('initializes sentry.edge.config without errors', async () => {
    const sentry = await import('@sentry/nextjs');
    await import('@/sentry.edge.config');
    expect(sentry.init).toHaveBeenCalled();
  });

  it('initializes sentry.client.config without errors', async () => {
    const sentry = await import('@sentry/nextjs');
    await import('@/sentry.client.config');
    expect(sentry.init).toHaveBeenCalled();
  });
});
