import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { register, onRequestError } from '@/instrumentation';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureRequestError: vi.fn(),
  captureException: vi.fn(),
  replayIntegration: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
}));

describe('instrumentation.ts', () => {
  const originalRuntime = process.env.NEXT_RUNTIME;

  afterEach(() => {
    process.env.NEXT_RUNTIME = originalRuntime;
    vi.clearAllMocks();
  });

  it('exports onRequestError hook from sentry', () => {
    expect(onRequestError).toBeDefined();
  });

  it('handles register in nodejs runtime', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    await expect(register()).resolves.toBeUndefined();
  });

  it('handles register in edge runtime', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    await expect(register()).resolves.toBeUndefined();
  });

  it('handles register when NEXT_RUNTIME is not nodejs or edge', async () => {
    delete process.env.NEXT_RUNTIME;
    await expect(register()).resolves.toBeUndefined();
  });
});
