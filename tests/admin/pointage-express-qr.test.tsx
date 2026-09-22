/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PointageExpressClient from '@/app/admin/pointage-express/PointageExpressClient';
import type { CalendarEvent, Member } from '@/app/types';
import { toast } from 'sonner';

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

describe('PointageExpressClient QR Code Scan Integration', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 'event-2026-05-16',
      isoDate: '2026-05-16',
      dateFormatted: 'Samedi 16 Mai 2026',
      location: 'Blanmont',
      departure: '8h30',
      distances: '80 km',
    },
  ];

  const mockMembers: Member[] = [
    {
      id: 'mem-101',
      name: 'Nicolas Bruyère',
      role: ['Membre'],
      bio: '',
      photoUrl: '',
      preferredGroup: 'A',
    },
    {
      id: 'mem-102',
      name: 'Laurent VTT',
      role: ['Membre'],
      bio: '',
      photoUrl: '',
      preferredGroup: 'VTT',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Reset URL search
    delete (window as any).location;
    (window as any).location = new URL('https://blanmont.be/admin/pointage-express');
  });

  it('automatically checks in member when URL contains memberId from QR code scan', async () => {
    window.location.search = '?memberId=mem-101';

    render(
      <PointageExpressClient
        initialEvents={mockEvents}
        members={mockMembers}
        initialAttendanceMap={{}}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/attendance',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            eventId: 'event-2026-05-16',
            isoDate: '2026-05-16',
            memberId: 'mem-101',
            name: 'Nicolas Bruyère',
            group: 'A',
            action: 'add',
          }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Pointage QR validé : Nicolas Bruyère')
      );
    });
  });

  it('informs that member is already present if scanned twice', async () => {
    window.location.search = '?memberId=mem-101';

    render(
      <PointageExpressClient
        initialEvents={mockEvents}
        members={mockMembers}
        initialAttendanceMap={{
          'event-2026-05-16': {
            'mem-101': {
              name: 'Nicolas Bruyère',
              group: 'A',
              markedAt: new Date().toISOString(),
            },
          },
        }}
      />
    );

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('Nicolas Bruyère est déjà pointé(e) présent(e).')
      );
    });

    // fetch shouldn't be called to re-add
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
