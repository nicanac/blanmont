/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PointageExpressClient, {
  getDefaultPointageEventId,
} from '@/app/admin/pointage-express/PointageExpressClient';
import type { CalendarEvent, Member } from '@/app/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Pointage Express - Event Selection Logic', () => {
  const mockMembers: Member[] = [
    {
      id: 'mem-1',
      name: 'Adrien Delforge',
      preferredGroup: 'A',
      role: ['Membre'],
      bio: '',
      photoUrl: '',
    },
    {
      id: 'mem-2',
      name: 'Alain Chavée',
      preferredGroup: 'B',
      role: ['Membre'],
      bio: '',
      photoUrl: '',
    },
  ];

  const fullSeasonEvents: CalendarEvent[] = [
    {
      id: 'event-spring-early',
      isoDate: '2026-03-01',
      location: 'Blanmont',
      group: 'Sortie Ouverture',
    },
    {
      id: 'event-last-week',
      isoDate: '2026-09-20',
      location: 'Blanmont',
      distances: '75 km',
    },
    {
      id: 'event-today',
      isoDate: '2026-09-25',
      location: 'Place de Blanmont',
      distances: '80 km',
    },
    {
      id: 'event-this-saturday',
      isoDate: '2026-09-26',
      location: 'Blanmont',
      distances: '85 km',
    },
    {
      id: 'event-this-sunday',
      isoDate: '2026-09-27',
      location: 'Blanmont',
      distances: '90 km',
    },
    {
      id: 'event-end-of-year',
      isoDate: '2026-12-27',
      location: 'Blanmont (70-90)',
      distances: '70-90 km',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = new URL('https://blanmont.be/admin/pointage-express');
  });

  describe('getDefaultPointageEventId helper', () => {
    it('returns empty string when events array is empty', () => {
      expect(getDefaultPointageEventId([])).toBe('');
    });

    it('selects the event of the day when an event occurs today', () => {
      const selectedId = getDefaultPointageEventId(fullSeasonEvents, '2026-09-25');
      expect(selectedId).toBe('event-today');
    });

    it('selects the next upcoming event in the calendar when today has no event', () => {
      // Suppose today is Friday 2026-09-25 with NO event (filter out event-today)
      const eventsWithoutToday = fullSeasonEvents.filter((e) => e.id !== 'event-today');
      const selectedId = getDefaultPointageEventId(eventsWithoutToday, '2026-09-25');
      // Should pick Saturday 2026-09-26, NOT December 27!
      expect(selectedId).toBe('event-this-saturday');
    });

    it('selects the next upcoming event even when events are passed in unsorted order', () => {
      const shuffled = [
        fullSeasonEvents[5], // Dec 27
        fullSeasonEvents[0], // Mar 01
        fullSeasonEvents[3], // Sep 26
        fullSeasonEvents[1], // Sep 20
      ];
      const selectedId = getDefaultPointageEventId(shuffled, '2026-09-25');
      expect(selectedId).toBe('event-this-saturday');
    });

    it('selects the most recent past event when all events have passed', () => {
      const pastOnlyEvents: CalendarEvent[] = [
        { id: 'event-1', isoDate: '2026-03-01', location: 'Blanmont' },
        { id: 'event-2', isoDate: '2026-09-20', location: 'Blanmont' },
      ];
      const selectedId = getDefaultPointageEventId(pastOnlyEvents, '2026-12-30');
      expect(selectedId).toBe('event-2');
    });

    it('handles events with missing isoDate safely', () => {
      const eventsWithMalformed: CalendarEvent[] = [
        { id: 'event-malformed', location: 'Unknown' } as any,
        { id: 'event-future', isoDate: '2026-10-01', location: 'Blanmont' },
      ];
      const selectedId = getDefaultPointageEventId(eventsWithMalformed, '2026-09-25');
      expect(selectedId).toBe('event-future');
    });
  });

  describe('PointageExpressClient UI event rendering', () => {
    it('groups options into upcoming and past, selecting the appropriate default event', () => {
      render(
        <PointageExpressClient
          initialEvents={fullSeasonEvents}
          members={mockMembers}
          initialAttendanceMap={{}}
        />
      );

      const select = screen.getByRole('combobox', {
        name: /sortie sélectionnée pour le pointage/i,
      }) as HTMLSelectElement;

      expect(select).toBeInTheDocument();
      // Should have optgroups
      const optgroups = select.querySelectorAll('optgroup');
      expect(optgroups.length).toBeGreaterThan(0);

      // Verify options are available
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(fullSeasonEvents.length);
    });

    it('allows changing the selected event and updates attendance data reactively', () => {
      const attendanceMap = {
        'event-this-saturday': {
          'mem-1': {
            name: 'Adrien Delforge',
            group: 'A',
            markedAt: '2026-09-26T08:15:00Z',
          },
        },
      };

      render(
        <PointageExpressClient
          initialEvents={fullSeasonEvents}
          members={mockMembers}
          initialAttendanceMap={attendanceMap}
        />
      );

      const select = screen.getByRole('combobox', {
        name: /sortie sélectionnée pour le pointage/i,
      }) as HTMLSelectElement;

      // Select Saturday event
      fireEvent.change(select, { target: { value: 'event-this-saturday' } });
      expect(select.value).toBe('event-this-saturday');

      // Check that 1 present is displayed in stats
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('respects eventId URL search parameter if present', () => {
      window.location.search = '?eventId=event-this-sunday';

      render(
        <PointageExpressClient
          initialEvents={fullSeasonEvents}
          members={mockMembers}
          initialAttendanceMap={{}}
        />
      );

      const select = screen.getByRole('combobox', {
        name: /sortie sélectionnée pour le pointage/i,
      }) as HTMLSelectElement;

      expect(select.value).toBe('event-this-sunday');
    });
  });
});
