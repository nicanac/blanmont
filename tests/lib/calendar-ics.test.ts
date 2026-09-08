import { describe, it, expect } from 'vitest';
import { generateICalendarFeed } from '@/app/lib/calendar-ics';
import { CalendarEvent } from '@/app/types';

describe('calendar-ics - generateICalendarFeed', () => {
  it('generates valid RFC 5545 header and footer structure', () => {
    const feed = generateICalendarFeed([]);

    expect(feed).toContain('BEGIN:VCALENDAR');
    expect(feed).toContain('VERSION:2.0');
    expect(feed).toContain('PRODID:-//Club de Blanmont//CC Saint-Martin Blanmont//FR');
    expect(feed).toContain('CALSCALE:GREGORIAN');
    expect(feed).toContain('X-WR-TIMEZONE:Europe/Brussels');
    expect(feed).toContain('END:VCALENDAR');
  });

  it('generates VEVENT blocks for calendar events with timed departures', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Sortie des Bosses',
        date: '14 mars 2026',
        isoDate: '2026-03-14',
        departure: '8h30',
        location: 'Place de Blanmont',
        distances: '70 km / 90 km',
        group: 'Groupe 1 & 2',
      },
    ];

    const feed = generateICalendarFeed(events);

    expect(feed).toContain('BEGIN:VEVENT');
    expect(feed).toContain('UID:event-1@blanmont.be');
    expect(feed).toContain('DTSTART;TZID=Europe/Brussels:20260314T083000');
    expect(feed).toContain('DTEND;TZID=Europe/Brussels:20260314T123000');
    expect(feed).toContain('SUMMARY:Sortie Blanmont : Place de Blanmont (70 km / 90 km)');
    expect(feed).toContain('LOCATION:Place de Blanmont');
    expect(feed).toContain('END:VEVENT');
  });

  it('formats all-day events when departure time is absent', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-all-day',
        title: 'Fête du Club',
        date: '20 juin 2026',
        isoDate: '2026-06-20',
        location: 'Local du Club',
      },
    ];

    const feed = generateICalendarFeed(events);

    expect(feed).toContain('DTSTART;VALUE=DATE:20260620');
    expect(feed).toContain('DTEND;VALUE=DATE:20260621');
  });

  it('escapes special characters such as semicolons and commas in text fields', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-special',
        title: 'Événement, avec virgule; et point-virgule',
        date: '10 mai 2026',
        isoDate: '2026-05-10',
        location: 'Place, Blanmont; Belgique',
      },
    ];

    const feed = generateICalendarFeed(events);
    expect(feed).toContain('Place\\, Blanmont\\; Belgique');
  });

  it('skips events that do not have an isoDate', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-no-iso',
        title: 'Sans date ISO',
        date: 'Date indéterminée',
      },
    ];

    const feed = generateICalendarFeed(events);
    expect(feed).not.toContain('BEGIN:VEVENT');
  });
});
