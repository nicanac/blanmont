import { describe, it, expect, vi, beforeEach } from 'vitest';
import type React from 'react';

const { getSessionUser, withTraceRoutes } = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  withTraceRoutes: vi.fn(async (traces: unknown[]) =>
    traces.map((t) => ({ ...(t as object), route: null }))
  ),
}));

vi.mock('@/app/lib/firebase', () => ({
  getActiveWeekendPoll: vi.fn(async () => ({ id: 'p1', weekendIsoDate: '2026-11-28' })),
  getPollResponses: vi.fn(async () => []),
  getMembers: vi.fn(async () => []),
}));
vi.mock('@/app/lib/firebase/calendar', () => ({ getCalendarEvents: vi.fn(async () => []) }));
vi.mock('@/app/lib/poll-share', () => ({
  weekendTraces: vi.fn(() => [{ url: 'https://connect.garmin.com/modern/course/1' }]),
}));
vi.mock('@/app/lib/trace-route', () => ({ withTraceRoutes }));
vi.mock('@/app/lib/auth/session', () => ({ getSessionUser }));
vi.mock('@/app/features/sondage/components/WeekendPollView', () => ({ default: () => null }));

import SondagePage from '@/app/sondage/page';

/** Props the page hands to WeekendPollView. */
async function viewProps(): Promise<{ traces: unknown[] }> {
  const page = (await SondagePage()) as React.ReactElement<{ children: React.ReactElement<{ traces: unknown[] }> }>;
  return page.props.children.props;
}

describe('SondagePage weekend traces (#252)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends no trace to a guest', async () => {
    getSessionUser.mockResolvedValue(null);
    expect((await viewProps()).traces).toEqual([]);
    expect(withTraceRoutes).not.toHaveBeenCalled();
  });

  it('sends the weekend traces to a signed-in member', async () => {
    getSessionUser.mockResolvedValue({ uid: 'u1' });
    expect((await viewProps()).traces).toHaveLength(1);
  });
});
