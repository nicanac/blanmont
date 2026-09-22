import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, PATCH, DELETE } from '@/app/api/traces/[id]/route';
import * as firebaseRoot from '@/app/lib/firebase';
import * as sessionModule from '@/app/lib/auth/session';

describe('Trace API Endpoints (/api/traces/[id])', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'trace-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/traces/[id]', () => {
    it('returns 200 with trace data when trace is found', async () => {
      const mockTrace = {
        id: 'trace-123',
        name: 'Tour du Brabant',
        distance: 85,
        elevation: 650,
      };

      vi.spyOn(firebaseRoot, 'getTrace').mockResolvedValue(mockTrace as any);

      const req = new NextRequest('http://localhost:3000/api/traces/trace-123');
      const res = await GET(req, mockContext);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('trace-123');
      expect(data.name).toBe('Tour du Brabant');
    });

    it('returns 404 when trace is not found', async () => {
      vi.spyOn(firebaseRoot, 'getTrace').mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/traces/trace-missing');
      const res = await GET(req, { params: Promise.resolve({ id: 'trace-missing' }) });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Trace not found');
    });

    it('returns 500 when database error occurs', async () => {
      vi.spyOn(firebaseRoot, 'getTrace').mockRejectedValue(new Error('Firebase DB timeout'));

      const req = new NextRequest('http://localhost:3000/api/traces/trace-123');
      const res = await GET(req, mockContext);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Failed to fetch trace');
    });
  });

  describe('PATCH /api/traces/[id]', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/traces/trace-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      const res = await PATCH(req, mockContext);
      expect(res.status).toBe(401);
    });

    it('updates trace properties when admin is authorized', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(firebaseRoot, 'updateTrace').mockResolvedValue({ success: true } as any);

      const req = new NextRequest('http://localhost:3000/api/traces/trace-123', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Collines de Villers',
          distance: 92,
          elevation: 740,
        }),
      });

      const res = await PATCH(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(firebaseRoot.updateTrace).toHaveBeenCalledWith(
        'trace-123',
        expect.objectContaining({
          name: 'Collines de Villers',
          distance: 92,
        })
      );
    });
  });

  describe('DELETE /api/traces/[id]', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/traces/trace-123', {
        method: 'DELETE',
      });

      const res = await DELETE(req, mockContext);
      expect(res.status).toBe(403);
    });

    it('deletes trace when admin is authorized', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(firebaseRoot, 'deleteTrace').mockResolvedValue({ success: true } as any);

      const req = new NextRequest('http://localhost:3000/api/traces/trace-123', {
        method: 'DELETE',
      });

      const res = await DELETE(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(firebaseRoot.deleteTrace).toHaveBeenCalledWith('trace-123');
    });
  });
});
