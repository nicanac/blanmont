import { describe, it, expect } from 'vitest';
import { SubmitEventReviewSchema, safeValidate } from '@/app/lib/validation';
import {
  getEventReviews,
  getAllEventReviews,
  submitEventReview,
  deleteEventReview,
} from '@/app/lib/firebase/event-reviews';

describe('Event Reviews System', () => {
  describe('SubmitEventReviewSchema validation', () => {
    it('validates a complete and correct event review', () => {
      const validReview = {
        eventId: 'event-jemeppe-2026',
        rating: 5,
        comment: 'Excellente sortie club, peloton très soudé et tracé magnifique !',
        effort: 'soutenu',
        pace: 'parfait',
        roadCondition: 'impeccable',
        weatherEncountered: 'soleil',
        stravaActivityUrl: 'https://www.strava.com/activities/1234567890',
      };

      const result = safeValidate(SubmitEventReviewSchema, validReview);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(5);
        expect(result.data.effort).toBe('soutenu');
        expect(result.data.pace).toBe('parfait');
      }
    });

    it('rejects review when rating is out of bounds', () => {
      const invalidRating = {
        eventId: 'event-1',
        rating: 6,
        comment: 'Top',
      };

      const result = safeValidate(SubmitEventReviewSchema, invalidRating);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === 'rating')).toBe(true);
      }
    });

    it('rejects review when comment is empty', () => {
      const emptyComment = {
        eventId: 'event-1',
        rating: 4,
        comment: '',
      };

      const result = safeValidate(SubmitEventReviewSchema, emptyComment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === 'comment')).toBe(true);
      }
    });

    it('rejects review with invalid Strava URL', () => {
      const invalidUrl = {
        eventId: 'event-1',
        rating: 4,
        comment: 'Super sortie',
        stravaActivityUrl: 'not-a-valid-url',
      };

      const result = safeValidate(SubmitEventReviewSchema, invalidUrl);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === 'stravaActivityUrl')).toBe(true);
      }
    });
  });

  describe('Event Reviews data operations (mock mode)', () => {
    const testEventId = 'test-event-sortie-2026';
    const testMemberId = 'member-test-42';

    it('submits, fetches and deletes a debrief review', async () => {
      // 1. Submit review
      const submitResult = await submitEventReview({
        eventId: testEventId,
        memberId: testMemberId,
        memberName: 'Julien Cycliste',
        memberGroup: 'Groupe A',
        rating: 5,
        comment: 'Rythme soutenu sur les bosses mais très belle cohésion.',
        effort: 'intense',
        pace: 'parfait',
        roadCondition: 'bonne',
        weatherEncountered: 'ideal',
      });

      expect(submitResult.success).toBe(true);
      expect(submitResult.review).toBeDefined();
      expect(submitResult.review?.memberName).toBe('Julien Cycliste');

      // 2. Fetch reviews for event
      const reviews = await getEventReviews(testEventId);
      expect(reviews.length).toBeGreaterThanOrEqual(1);
      const found = reviews.find((r) => r.memberId === testMemberId);
      expect(found).toBeDefined();
      expect(found?.rating).toBe(5);
      expect(found?.effort).toBe('intense');

      // 3. Fetch all reviews map
      const allReviews = await getAllEventReviews();
      expect(allReviews[testEventId]).toBeDefined();

      // 4. Delete review
      const deleteResult = await deleteEventReview(testEventId, testMemberId);
      expect(deleteResult.success).toBe(true);

      const afterDelete = await getEventReviews(testEventId);
      expect(afterDelete.find((r) => r.memberId === testMemberId)).toBeUndefined();
    });
  });
});
