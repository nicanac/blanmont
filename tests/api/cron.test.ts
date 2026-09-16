import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getWeekendPollCron } from '@/app/api/cron/create-weekend-poll/route';
import * as sondageAuto from '@/app/lib/sondage-automation';

describe('Cron API Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/cron/create-weekend-poll', () => {
    it('executes automated poll creation and returns 200', async () => {
      vi.spyOn(sondageAuto, 'autoCreateUpcomingWeekendPoll').mockResolvedValue({
        success: true,
        action: 'created',
        pollId: 'poll-new-123',
        message: 'Sondage créé avec succès',
      });

      const request = new Request('http://localhost:3000/api/cron/create-weekend-poll');
      const response = await getWeekendPollCron(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.action).toBe('created');
      expect(data.pollId).toBe('poll-new-123');
    });

    it('returns 500 if automated poll creation reports failure', async () => {
      vi.spyOn(sondageAuto, 'autoCreateUpcomingWeekendPoll').mockResolvedValue({
        success: false,
        action: 'error',
        error: 'Database timeout',
      });

      const request = new Request('http://localhost:3000/api/cron/create-weekend-poll');
      const response = await getWeekendPollCron(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database timeout');
    });

    it('validates CRON_SECRET authorization when configured', async () => {
      const originalSecret = process.env.CRON_SECRET;
      process.env.CRON_SECRET = 'super-secret-cron-key';

      try {
        // Request without secret
        const unauthReq = new Request('http://localhost:3000/api/cron/create-weekend-poll');
        const unauthRes = await getWeekendPollCron(unauthReq);
        expect(unauthRes.status).toBe(401);

        // Request with valid secret
        vi.spyOn(sondageAuto, 'autoCreateUpcomingWeekendPoll').mockResolvedValue({
          success: true,
          action: 'skipped',
          message: 'Already exists',
        });

        const authReq = new Request('http://localhost:3000/api/cron/create-weekend-poll', {
          headers: { authorization: 'Bearer super-secret-cron-key' },
        });
        const authRes = await getWeekendPollCron(authReq);
        expect(authRes.status).toBe(200);
      } finally {
        process.env.CRON_SECRET = originalSecret;
      }
    });
  });
});
