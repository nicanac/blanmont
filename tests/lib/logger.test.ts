import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    // eslint-disable-next-line no-console
    vi.spyOn(console, 'log').mockImplementation(() => {});
    // eslint-disable-next-line no-console
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // eslint-disable-next-line no-console
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it('should log info in development', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('../../app/lib/logger');
    logger.info('test info', { data: 1 });
    // eslint-disable-next-line no-console
    expect(console.log).toHaveBeenCalledWith('[INFO] test info', { data: 1 });
  });

  it('should not log info in production', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../../app/lib/logger');
    logger.info('test info');
    // eslint-disable-next-line no-console
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should always log warn', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../../app/lib/logger');
    logger.warn('test warn', { data: 2 });
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalledWith('[WARN] test warn', { data: 2 });
  });

  it('should always log error', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../../app/lib/logger');
    logger.error('test error', { data: 3 });
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith('[ERROR] test error', { data: 3 });
  });
});
