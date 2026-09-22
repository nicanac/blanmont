import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateProspectStatusAction,
  updateProspectDetailsAction,
  convertProspectToMemberAction,
  deleteProspectAction,
} from '@/app/admin/prospects/actions';
import * as trialDb from '@/app/lib/firebase/trial-requests';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Admin Prospects Server Actions (app/admin/prospects/actions.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateProspectStatusAction', () => {
    it('returns error if id is missing', async () => {
      const res = await updateProspectStatusAction('', 'contacted');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/manquant/i);
    });

    it('updates status and triggers cache revalidation', async () => {
      vi.spyOn(trialDb, 'updateTrialRequestStatus').mockResolvedValue(true);
      const res = await updateProspectStatusAction('tr-123', 'contacted');
      expect(res.success).toBe(true);
      expect(trialDb.updateTrialRequestStatus).toHaveBeenCalledWith('tr-123', 'contacted');
    });

    it('returns error when DB update fails', async () => {
      vi.spyOn(trialDb, 'updateTrialRequestStatus').mockResolvedValue(false);
      const res = await updateProspectStatusAction('tr-123', 'contacted');
      expect(res.success).toBe(false);
    });
  });

  describe('updateProspectDetailsAction', () => {
    it('returns error if id is missing', async () => {
      const res = await updateProspectDetailsAction('', { adminNotes: 'Hello' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/manquant/i);
    });

    it('updates admin notes and mentor captain details', async () => {
      vi.spyOn(trialDb, 'updateTrialRequest').mockResolvedValue(true);
      const res = await updateProspectDetailsAction('tr-123', {
        adminNotes: 'Vu avec Marc V.',
        mentorCaptainId: 'captain-1',
        mentorCaptainName: 'Marc V.',
      });

      expect(res.success).toBe(true);
      expect(trialDb.updateTrialRequest).toHaveBeenCalledWith('tr-123', {
        adminNotes: 'Vu avec Marc V.',
        mentorCaptainId: 'captain-1',
        mentorCaptainName: 'Marc V.',
      });
    });

    it('returns error if update fails', async () => {
      vi.spyOn(trialDb, 'updateTrialRequest').mockResolvedValue(false);
      const res = await updateProspectDetailsAction('tr-123', { adminNotes: 'Test' });
      expect(res.success).toBe(false);
    });
  });

  describe('convertProspectToMemberAction', () => {
    it('returns error if id is missing', async () => {
      const res = await convertProspectToMemberAction('');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/manquant/i);
    });

    it('converts prospect to official member', async () => {
      vi.spyOn(trialDb, 'convertTrialRequestToMember').mockResolvedValue({
        success: true,
        memberId: 'member-999',
      });

      const res = await convertProspectToMemberAction('tr-123');
      expect(res.success).toBe(true);
      expect(res.memberId).toBe('member-999');
      expect(trialDb.convertTrialRequestToMember).toHaveBeenCalledWith('tr-123', undefined);
    });

    it('handles failure during conversion', async () => {
      vi.spyOn(trialDb, 'convertTrialRequestToMember').mockResolvedValue({
        success: false,
        error: 'Échec de base de données',
      });

      const res = await convertProspectToMemberAction('tr-123');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Échec de base de données');
    });
  });

  describe('deleteProspectAction', () => {
    it('returns error if id is missing', async () => {
      const res = await deleteProspectAction('');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/manquant/i);
    });

    it('deletes prospect and revalidates cache', async () => {
      vi.spyOn(trialDb, 'deleteTrialRequest').mockResolvedValue(true);
      const res = await deleteProspectAction('tr-123');
      expect(res.success).toBe(true);
      expect(trialDb.deleteTrialRequest).toHaveBeenCalledWith('tr-123');
    });

    it('handles failure when DB delete returns false', async () => {
      vi.spyOn(trialDb, 'deleteTrialRequest').mockResolvedValue(false);
      const res = await deleteProspectAction('tr-123');
      expect(res.success).toBe(false);
    });
  });
});
