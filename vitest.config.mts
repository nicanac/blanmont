import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // 2 workers: parallel agent sessions each run their own suite, so one run must not take the whole machine
    maxWorkers: 2,
    include: ['tests/**/*.test.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/e2e/**', '**/*.e2e.*'],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
  },
});
