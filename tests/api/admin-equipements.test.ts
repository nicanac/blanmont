import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET as getPublicEquipments } from '@/app/api/equipements/route';
import {
  GET as getAdminEquipments,
  POST as createAdminEquipment,
} from '@/app/api/admin/equipements/route';
import {
  GET as getAdminEquipmentById,
  PUT as updateAdminEquipmentById,
  DELETE as deleteAdminEquipmentById,
} from '@/app/api/admin/equipements/[id]/route';
import * as equipmentModule from '@/app/lib/firebase/equipment';
import * as sessionModule from '@/app/lib/auth/session';

describe('Equipments API Endpoints (Public & Admin)', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'eq-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/equipements (Public)', () => {
    it('returns 200 with list of equipment', async () => {
      const mockItems = [{ id: 'eq-1', name: 'Maillot Homme' }];
      vi.spyOn(equipmentModule, 'getEquipment').mockResolvedValue(mockItems as any);

      const res = await getPublicEquipments();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Maillot Homme');
    });

    it('returns 500 when fetching throws', async () => {
      vi.spyOn(equipmentModule, 'getEquipment').mockRejectedValue(new Error('Firebase DB failure'));

      const res = await getPublicEquipments();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Failed to fetch equipment');
    });
  });

  describe('Admin Equipments Routes (/api/admin/equipements)', () => {
    it('GET requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/equipements');
      const res = await getAdminEquipments(req);
      expect(res.status).toBe(401);
    });

    it('POST creates equipment when admin is authorized', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const created = { id: 'new-eq', name: 'Chaussettes Blanmont' };
      vi.spyOn(equipmentModule, 'createEquipment').mockResolvedValue(created as any);

      const req = new NextRequest('http://localhost:3000/api/admin/equipements', {
        method: 'POST',
        body: JSON.stringify({ name: 'Chaussettes Blanmont' }),
      });

      const res = await createAdminEquipment(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('Chaussettes Blanmont');
    });
  });

  describe('Admin Equipment Detail Routes (/api/admin/equipements/[id])', () => {
    it('GET returns 404 if item does not exist', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(equipmentModule, 'getEquipmentById').mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/admin/equipements/eq-123');
      const res = await getAdminEquipmentById(req, mockContext);
      expect(res.status).toBe(404);
    });

    it('PUT updates equipment item', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(equipmentModule, 'updateEquipment').mockResolvedValue(undefined as any);

      const req = new NextRequest('http://localhost:3000/api/admin/equipements/eq-123', {
        method: 'PUT',
        body: JSON.stringify({ price: 75 }),
      });

      const res = await updateAdminEquipmentById(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(equipmentModule.updateEquipment).toHaveBeenCalledWith('eq-123', { price: 75 });
    });

    it('DELETE removes equipment item', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(equipmentModule, 'deleteEquipment').mockResolvedValue(undefined as any);

      const req = new NextRequest('http://localhost:3000/api/admin/equipements/eq-123', {
        method: 'DELETE',
      });

      const res = await deleteAdminEquipmentById(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(equipmentModule.deleteEquipment).toHaveBeenCalledWith('eq-123');
    });
  });
});
