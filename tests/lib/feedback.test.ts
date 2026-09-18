import { describe, it, expect } from 'vitest';
import { SubmitFeedbackSchema, safeValidate } from '@/app/lib/validation';
import {
  getFeedbackForTrace,
  submitFeedback,
  deleteFeedback,
  getAllFeedback,
} from '@/app/lib/firebase/feedback';

describe('Trace Feedback System', () => {
  describe('SubmitFeedbackSchema validation', () => {
    it('validates a correct feedback submission', () => {
      const valid = {
        traceId: 'trace-123',
        memberId: 'member-456',
        rating: 5,
        comment: 'Superbe parcours avec un très bon revêtement !',
      };

      const result = safeValidate(SubmitFeedbackSchema, valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(5);
        expect(result.data.traceId).toBe('trace-123');
      }
    });

    it('rejects feedback with rating below 1 or above 5', () => {
      const tooLow = {
        traceId: 'trace-123',
        memberId: 'member-456',
        rating: 0,
        comment: 'Bof',
      };
      const tooHigh = {
        traceId: 'trace-123',
        memberId: 'member-456',
        rating: 6,
        comment: 'Trop bien',
      };

      expect(safeValidate(SubmitFeedbackSchema, tooLow).success).toBe(false);
      expect(safeValidate(SubmitFeedbackSchema, tooHigh).success).toBe(false);
    });

    it('rejects feedback with missing or empty comment', () => {
      const empty = {
        traceId: 'trace-123',
        memberId: 'member-456',
        rating: 4,
        comment: '',
      };

      const result = safeValidate(SubmitFeedbackSchema, empty);
      expect(result.success).toBe(false);
    });

    it('rejects feedback with comment exceeding 1000 characters', () => {
      const tooLong = {
        traceId: 'trace-123',
        memberId: 'member-456',
        rating: 4,
        comment: 'a'.repeat(1001),
      };

      const result = safeValidate(SubmitFeedbackSchema, tooLong).success;
      expect(result).toBe(false);
    });
  });

  describe('Feedback data operations', () => {
    it('handles getFeedbackForTrace gracefully without throwing in mock mode', async () => {
      const list = await getFeedbackForTrace('trace-non-existent');
      expect(Array.isArray(list)).toBe(true);
    });

    it('handles getAllFeedback gracefully without throwing in mock mode', async () => {
      const list = await getAllFeedback();
      expect(Array.isArray(list)).toBe(true);
    });

    it('handles submitFeedback validation and execution in mock mode', async () => {
      await expect(
        submitFeedback('trace-1', 'member-1', 5, 'Parcours parfait')
      ).resolves.not.toThrow();
    });

    it('rejects submitFeedback when validation fails', async () => {
      await expect(
        submitFeedback('', '', 0, '')
      ).rejects.toThrow('Validation failed');
    });

    it('handles deleteFeedback gracefully in mock mode', async () => {
      const res = await deleteFeedback('feedback-123');
      expect(res.success).toBe(true);
    });
  });
});
