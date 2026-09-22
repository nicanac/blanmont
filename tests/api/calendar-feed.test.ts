import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getSubscribeIcs } from '@/app/api/calendar/subscribe.ics/route';
import { GET as getCalendarIcs } from '@/app/api/calendar/ics/route';
import * as calendarModule from '@/app/lib/firebase/calendar';
import * as icsModule from '@/app/lib/calendar-ics';

describe('iCalendar Feed API Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/calendar/subscribe.ics', () => {
    it('returns 200 with text/calendar content type and valid iCal headers', async () => {
      const mockEvents = [
        {
          id: 'ev-1',
          isoDate: '2026-05-16',
          location: 'Blanmont',
          departure: '8h30',
        },
      ];

      vi.spyOn(calendarModule, 'getCalendarEvents').mockResolvedValue(mockEvents as any);
      vi.spyOn(icsModule, 'generateICalendarFeed').mockReturnValue(
        'BEGIN:VCALENDAR\nVERSION:2.0\nSUMMARY:Sortie Blanmont\nEND:VCALENDAR'
      );

      const req = new NextRequest('https://blanmont.be/api/calendar/subscribe.ics', {
        headers: { host: 'blanmont.be' },
      });

      const res = await getSubscribeIcs(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/calendar');
      expect(res.headers.get('Content-Disposition')).toContain('filename="calendrier-cc-blanmont.ics"');

      const body = await res.text();
      expect(body).toContain('BEGIN:VCALENDAR');
      expect(body).toContain('SUMMARY:Sortie Blanmont');
      expect(body).toContain('END:VCALENDAR');
    });

    it('returns 500 when calendar events fetching throws an error', async () => {
      vi.spyOn(calendarModule, 'getCalendarEvents').mockRejectedValue(new Error('Firebase DB timeout'));

      const req = new NextRequest('http://localhost:3000/api/calendar/subscribe.ics');
      const res = await getSubscribeIcs(req);

      expect(res.status).toBe(500);
      const text = await res.text();
      expect(text).toBe('Error generating calendar feed');
    });
  });

  describe('GET /api/calendar/ics', () => {
    it('delegates to the subscribe.ics handler and returns 200', async () => {
      vi.spyOn(calendarModule, 'getCalendarEvents').mockResolvedValue([]);
      vi.spyOn(icsModule, 'generateICalendarFeed').mockReturnValue(
        'BEGIN:VCALENDAR\nEND:VCALENDAR'
      );

      const req = new NextRequest('http://localhost:3000/api/calendar/ics');
      const res = await getCalendarIcs(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/calendar');
    });
  });
});
