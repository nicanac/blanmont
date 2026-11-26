import { describe, it, expect, afterEach, vi } from 'vitest';
import { getLeaderboardSheetCsvUrl } from '@/app/lib/leaderboard-sheet';

describe('getLeaderboardSheetCsvUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the configured Google Sheets CSV export URL', () => {
    const url = 'https://docs.google.com/spreadsheets/d/example-id/export?format=csv&gid=1';
    vi.stubEnv('LEADERBOARD_SHEET_CSV_URL', ` ${url} `);
    expect(getLeaderboardSheetCsvUrl()).toBe(url);
  });

  it('returns null when missing', () => {
    vi.stubEnv('LEADERBOARD_SHEET_CSV_URL', '');
    expect(getLeaderboardSheetCsvUrl()).toBeNull();
  });

  it('refuses non-HTTPS or non-Google hosts', () => {
    vi.stubEnv('LEADERBOARD_SHEET_CSV_URL', 'http://docs.google.com/x');
    expect(getLeaderboardSheetCsvUrl()).toBeNull();
    vi.stubEnv('LEADERBOARD_SHEET_CSV_URL', 'https://evil.example.com/docs.google.com');
    expect(getLeaderboardSheetCsvUrl()).toBeNull();
    vi.stubEnv('LEADERBOARD_SHEET_CSV_URL', 'not a url');
    expect(getLeaderboardSheetCsvUrl()).toBeNull();
  });
});
