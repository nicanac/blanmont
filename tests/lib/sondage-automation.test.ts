import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoCreateUpcomingWeekendPoll } from '@/app/lib/sondage-automation';
import * as pollsModule from '@/app/lib/firebase/polls';
import * as helpersModule from '@/app/lib/sondage-helpers';

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    revalidatePath: vi.fn(),
    unstable_cache: ((fn: (...args: unknown[]) => unknown) => fn) as typeof actual.unstable_cache,
  };
});

describe('autoCreateUpcomingWeekendPoll', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a new weekend poll when none exists for the upcoming Saturday', async () => {
    const targetDate = '2026-09-19';

    vi.spyOn(helpersModule, 'getUpcomingSaturdayIso').mockReturnValue(targetDate);
    vi.spyOn(helpersModule, 'getSaturdaySortieDetails').mockResolvedValue({
      found: true,
      isoDate: targetDate,
      formattedDate: 'Samedi 19 septembre 2026',
      location: 'Blanmont',
      departure: '8h30',
      distancesRaw: '70, 95 km',
      distanceList: [70, 95],
      distanceOptions: ['Parcours court (~70 km)', 'Parcours long (~95 km)'],
      suggestedQuestionTitle: 'Option de distance / parcours (Samedi)',
      suggestedTitle: 'Sortie du Weekend - 2026-09-19 (Blanmont)',
      suggestedDescription: 'Sortie officielle du club.',
      source: 'both',
    });

    vi.spyOn(pollsModule, 'getWeekendPollByDate').mockResolvedValue(null);
    vi.spyOn(pollsModule, 'getAllWeekendPolls').mockResolvedValue([]);
    const createSpy = vi.spyOn(pollsModule, 'createWeekendPoll').mockResolvedValue({
      success: true,
      id: 'new-poll-123',
    });

    const result = await autoCreateUpcomingWeekendPoll();

    expect(result.success).toBe(true);
    expect(result.created).toBe(true);
    expect(result.alreadyExisted).toBe(false);
    expect(result.pollId).toBe('new-poll-123');
    expect(result.weekendIsoDate).toBe(targetDate);
    expect(result.distanceOptionsCount).toBe(2);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sortie du Weekend - 2026-09-19 (Blanmont)',
        weekendIsoDate: targetDate,
        status: 'active',
        customQuestions: [
          expect.objectContaining({
            title: 'Option de distance / parcours (Samedi)',
            options: ['Parcours court (~70 km)', 'Parcours long (~95 km)'],
            allowMultiple: false,
          }),
        ],
      })
    );
  });

  it('is idempotent: skips creation if a poll already exists for that weekend', async () => {
    const targetDate = '2026-09-19';

    vi.spyOn(helpersModule, 'getUpcomingSaturdayIso').mockReturnValue(targetDate);
    vi.spyOn(pollsModule, 'getWeekendPollByDate').mockResolvedValue({
      id: 'existing-poll-456',
      title: 'Sortie du Weekend - 2026-09-19 (Blanmont)',
      weekendIsoDate: targetDate,
      status: 'active',
      createdAt: '2026-09-14T06:00:00.000Z',
    });

    const createSpy = vi.spyOn(pollsModule, 'createWeekendPoll');

    const result = await autoCreateUpcomingWeekendPoll();

    expect(result.success).toBe(true);
    expect(result.created).toBe(false);
    expect(result.alreadyExisted).toBe(true);
    expect(result.pollId).toBe('existing-poll-456');
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('allows force creation even if a poll already exists for that weekend', async () => {
    const targetDate = '2026-09-19';

    vi.spyOn(helpersModule, 'getUpcomingSaturdayIso').mockReturnValue(targetDate);
    vi.spyOn(pollsModule, 'getWeekendPollByDate').mockResolvedValue({
      id: 'existing-poll-456',
      title: 'Existing',
      weekendIsoDate: targetDate,
      status: 'active',
      createdAt: '2026-09-14T06:00:00.000Z',
    });

    vi.spyOn(helpersModule, 'getSaturdaySortieDetails').mockResolvedValue({
      found: false,
      isoDate: targetDate,
      formattedDate: 'Samedi 19 septembre 2026',
      location: 'Blanmont',
      departure: '8h30',
      distanceList: [],
      distanceOptions: [],
      suggestedQuestionTitle: 'Option de parcours',
      suggestedTitle: 'Sortie du Weekend - 2026-09-19',
      suggestedDescription: 'Consignes du peloton',
      source: 'none',
    });

    vi.spyOn(pollsModule, 'getAllWeekendPolls').mockResolvedValue([]);
    const createSpy = vi.spyOn(pollsModule, 'createWeekendPoll').mockResolvedValue({
      success: true,
      id: 'forced-poll-789',
    });

    const result = await autoCreateUpcomingWeekendPoll({ force: true });

    expect(result.success).toBe(true);
    expect(result.created).toBe(true);
    expect(result.pollId).toBe('forced-poll-789');
    expect(createSpy).toHaveBeenCalled();
  });

  it('automatically archives / closes past active polls', async () => {
    const targetDate = '2026-09-19';

    vi.spyOn(helpersModule, 'getUpcomingSaturdayIso').mockReturnValue(targetDate);
    vi.spyOn(helpersModule, 'getSaturdaySortieDetails').mockResolvedValue({
      found: true,
      isoDate: targetDate,
      formattedDate: 'Samedi 19 septembre 2026',
      location: 'Blanmont',
      departure: '8h30',
      distanceList: [],
      distanceOptions: [],
      suggestedQuestionTitle: 'Distance',
      suggestedTitle: 'Sortie du Weekend - 2026-09-19',
      suggestedDescription: 'Description',
      source: 'calendar',
    });

    vi.spyOn(pollsModule, 'getWeekendPollByDate').mockResolvedValue(null);
    vi.spyOn(pollsModule, 'getAllWeekendPolls').mockResolvedValue([
      {
        id: 'past-active-poll-1',
        title: 'Past 1',
        weekendIsoDate: '2026-09-12',
        status: 'active',
        createdAt: '2026-09-07T06:00:00.000Z',
      },
      {
        id: 'past-closed-poll-2',
        title: 'Past 2',
        weekendIsoDate: '2026-09-05',
        status: 'closed',
        createdAt: '2026-08-31T06:00:00.000Z',
      },
    ]);

    const updateSpy = vi.spyOn(pollsModule, 'updateWeekendPoll').mockResolvedValue({
      success: true,
    });
    vi.spyOn(pollsModule, 'createWeekendPoll').mockResolvedValue({
      success: true,
      id: 'new-poll-999',
    });

    const result = await autoCreateUpcomingWeekendPoll();

    expect(result.success).toBe(true);
    expect(result.closedPreviousPollsCount).toBe(1);
    expect(updateSpy).toHaveBeenCalledWith('past-active-poll-1', { status: 'closed' });
    expect(updateSpy).not.toHaveBeenCalledWith('past-closed-poll-2', expect.anything());
  });

  it('handles creation errors gracefully without crashing', async () => {
    const targetDate = '2026-09-19';

    vi.spyOn(helpersModule, 'getUpcomingSaturdayIso').mockReturnValue(targetDate);
    vi.spyOn(helpersModule, 'getSaturdaySortieDetails').mockRejectedValue(
      new Error('Database connection failed')
    );
    vi.spyOn(pollsModule, 'getWeekendPollByDate').mockResolvedValue(null);

    const result = await autoCreateUpcomingWeekendPoll();

    expect(result.success).toBe(false);
    expect(result.created).toBe(false);
    expect(result.error).toContain('Database connection failed');
  });
});
