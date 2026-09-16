import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/rejoindre/route';
import * as trialRequestsDb from '@/app/lib/firebase/trial-requests';

describe('POST /api/rejoindre', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects incomplete payload with 400 and validation errors', async () => {
    const invalidBody = {
      name: 'A', // min 2 chars
      email: 'not-an-email',
      // missing phone, preferredGroup, bikeType, experienceLevel
    };

    const request = new Request('http://localhost:3000/api/rejoindre', {
      method: 'POST',
      body: JSON.stringify(invalidBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe('Données invalides');
    expect(json.details).toBeDefined();
  });

  it('saves valid trial request and returns 200 with confirmation message', async () => {
    const validBody = {
      name: 'Pierre Dupont',
      email: 'pierre.dupont@example.com',
      phone: '+32475123456',
      preferredGroup: 'B',
      bikeType: 'Route',
      experienceLevel: 'Confirmé',
      firstRideDate: '2026-05-02',
      message: 'Hâte de rouler avec le peloton !',
    };

    const mockSaved = { id: 'trial-1', ...validBody, createdAt: '2026-04-01T10:00:00Z' };
    vi.spyOn(trialRequestsDb, 'createTrialRequest').mockResolvedValue(mockSaved as any);

    const request = new Request('http://localhost:3000/api/rejoindre', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/enregistrée avec succès/i);
    expect(json.request.id).toBe('trial-1');
  });

  it('handles server errors gracefully with 500 response', async () => {
    const validBody = {
      name: 'Pierre Dupont',
      email: 'pierre.dupont@example.com',
      phone: '+32475123456',
      preferredGroup: 'B',
      bikeType: 'Route',
      experienceLevel: 'Confirmé',
    };

    vi.spyOn(trialRequestsDb, 'createTrialRequest').mockRejectedValue(new Error('DB Connection Lost'));

    const request = new Request('http://localhost:3000/api/rejoindre', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toMatch(/erreur est survenue/i);
  });
});
