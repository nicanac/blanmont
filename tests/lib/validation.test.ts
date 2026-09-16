import { describe, it, expect } from 'vitest';
import {
  CreateTraceSchema,
  UpdateTraceSchema,
  CreateRideSchema,
  SubmitVoteSchema,
  SubmitFeedbackSchema,
  LoginSchema,
  AccountActivationSchema,
  validateImageFile,
  UploadMapPreviewSchema,
  GenerateMapPreviewSchema,
  FetchStravaActivitySchema,
  FetchGarminActivitySchema,
  ImportStravaTraceSchema,
  AddTraceApiSchema,
  ParseGpxApiSchema,
  safeValidate,
  validateFormData,
} from '@/app/lib/validation';

describe('validation schemas & helpers', () => {
  describe('safeValidate helper', () => {
    it('returns structured success with parsed data', () => {
      const result = safeValidate(LoginSchema, {
        email: 'member@blanmont.be',
        password: 'securepassword123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('member@blanmont.be');
        expect(result.data.password).toBe('securepassword123');
      }
    });

    it('returns mapped errors on failure', () => {
      const result = safeValidate(LoginSchema, {
        email: 'not-an-email',
        password: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
        const emailErr = result.errors.find((e) => e.field === 'email');
        const passErr = result.errors.find((e) => e.field === 'password');
        expect(emailErr).toBeDefined();
        expect(passErr).toBeDefined();
      }
    });
  });

  describe('CreateTraceSchema & UpdateTraceSchema', () => {
    it('validates a valid trace input', () => {
      const validTrace = {
        name: 'Tour de l’Orne',
        distance: 65.5,
        elevation: 450,
        mapUrl: 'https://komoot.com/tour/12345',
        surface: 'Road' as const,
        direction: 'South' as const,
      };

      const result = safeValidate(CreateTraceSchema, validTrace);
      expect(result.success).toBe(true);
    });

    it('rejects invalid trace distance or negative elevation', () => {
      const invalidTrace = {
        name: 'Negative Elevation',
        distance: -10,
        elevation: -50,
      };

      const result = safeValidate(CreateTraceSchema, invalidTrace);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === 'distance')).toBe(true);
        expect(result.errors.some((e) => e.field === 'elevation')).toBe(true);
      }
    });

    it('requires id in UpdateTraceSchema', () => {
      const withoutId = {
        name: 'Updated Name',
      };
      const result = safeValidate(UpdateTraceSchema, withoutId);
      expect(result.success).toBe(false);

      const withId = {
        id: 'trace-123',
        name: 'Updated Name',
      };
      const validResult = safeValidate(UpdateTraceSchema, withId);
      expect(validResult.success).toBe(true);
    });
  });

  describe('CreateRideSchema & SubmitVoteSchema', () => {
    it('validates Saturday ride date and candidate traces', () => {
      const validRide = {
        date: '2026-03-21',
        traceIds: ['trace-1', 'trace-2'],
      };
      expect(safeValidate(CreateRideSchema, validRide).success).toBe(true);

      const invalidDate = {
        date: '21/03/2026', // must be YYYY-MM-DD
        traceIds: ['trace-1'],
      };
      expect(safeValidate(CreateRideSchema, invalidDate).success).toBe(false);

      const emptyTraces = {
        date: '2026-03-21',
        traceIds: [],
      };
      expect(safeValidate(CreateRideSchema, emptyTraces).success).toBe(false);
    });

    it('validates vote submission fields', () => {
      const validVote = {
        rideId: 'ride-2026-03-21',
        memberId: 'member-42',
        traceId: 'trace-1',
      };
      expect(safeValidate(SubmitVoteSchema, validVote).success).toBe(true);

      const missingFields = {
        rideId: 'ride-2026-03-21',
      };
      expect(safeValidate(SubmitVoteSchema, missingFields).success).toBe(false);
    });
  });

  describe('SubmitFeedbackSchema', () => {
    it('enforces rating between 1 and 5', () => {
      const validFeedback = {
        traceId: 'trace-1',
        rating: 4,
        comment: 'Très belle sortie !',
      };
      expect(safeValidate(SubmitFeedbackSchema, validFeedback).success).toBe(true);

      const invalidRatingZero = {
        ...validFeedback,
        rating: 0,
      };
      expect(safeValidate(SubmitFeedbackSchema, invalidRatingZero).success).toBe(false);

      const invalidRatingSix = {
        ...validFeedback,
        rating: 6,
      };
      expect(safeValidate(SubmitFeedbackSchema, invalidRatingSix).success).toBe(false);
    });
  });

  describe('AccountActivationSchema', () => {
    it('validates email addresses', () => {
      expect(safeValidate(AccountActivationSchema, { email: 'cyclist@blanmont.be' }).success).toBe(true);
      expect(safeValidate(AccountActivationSchema, { email: 'invalid-email' }).success).toBe(false);
    });
  });

  describe('validateFormData helper', () => {
    it('extracts and validates FormData entries including array notation', () => {
      const formData = new FormData();
      formData.append('date', '2026-04-18');
      formData.append('traceIds[]', 'trace-a');
      formData.append('traceIds[]', 'trace-b');

      const result = validateFormData(formData, CreateRideSchema);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBe('2026-04-18');
        expect(result.data.traceIds).toEqual(['trace-a', 'trace-b']);
      }
    });
  });

  describe('validateImageFile helper', () => {
    it('accepts valid JPEG, PNG, and WebP files under 5MB', () => {
      const validJpg = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      const validPng = new File(['dummy'], 'photo.png', { type: 'image/png' });
      const validWebp = new File(['dummy'], 'photo.webp', { type: 'image/webp' });

      expect(validateImageFile(validJpg).success).toBe(true);
      expect(validateImageFile(validPng).success).toBe(true);
      expect(validateImageFile(validWebp).success).toBe(true);
    });

    it('rejects disallowed image formats (e.g. GIF, PDF)', () => {
      const gif = new File(['dummy'], 'anim.gif', { type: 'image/gif' });
      const pdf = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });

      expect(validateImageFile(gif).success).toBe(false);
      expect(validateImageFile(pdf).success).toBe(false);
    });

    it('rejects files larger than 5MB', () => {
      // Mock large file > 5MB
      const largeFile = {
        size: 6 * 1024 * 1024,
        type: 'image/jpeg',
      } as unknown as File;

      const result = validateImageFile(largeFile);
      expect(result.success).toBe(false);
    });
  });

  describe('Map Preview Schemas', () => {
    it('validates UploadMapPreviewSchema with valid URL', () => {
      expect(
        safeValidate(UploadMapPreviewSchema, {
          traceId: 'trace-1',
          imageUrl: 'https://example.com/map.jpg',
        }).success
      ).toBe(true);

      expect(
        safeValidate(UploadMapPreviewSchema, {
          traceId: 'trace-1',
          imageUrl: 'not-a-url',
        }).success
      ).toBe(false);
    });

    it('validates GenerateMapPreviewSchema requires traceId', () => {
      expect(safeValidate(GenerateMapPreviewSchema, { traceId: 'tr-1' }).success).toBe(true);
      expect(safeValidate(GenerateMapPreviewSchema, { traceId: '' }).success).toBe(false);
    });
  });

  describe('Import Activity Schemas (Strava & Garmin)', () => {
    it('validates FetchStravaActivitySchema regex', () => {
      expect(
        safeValidate(FetchStravaActivitySchema, {
          url: 'https://www.strava.com/activities/1234567890',
        }).success
      ).toBe(true);

      expect(
        safeValidate(FetchStravaActivitySchema, {
          url: 'https://other-site.com/activity/123',
        }).success
      ).toBe(false);
    });

    it('validates FetchGarminActivitySchema regex', () => {
      expect(
        safeValidate(FetchGarminActivitySchema, {
          url: 'https://connect.garmin.com/modern/activity/987654321',
        }).success
      ).toBe(true);

      expect(
        safeValidate(FetchGarminActivitySchema, {
          url: 'https://connect.garmin.com/wrong/path',
        }).success
      ).toBe(false);
    });

    it('validates ImportStravaTraceSchema with activity object', () => {
      const validPayload = {
        activity: {
          id: 12345,
          name: 'Morning Ride',
          distance: 65400,
          total_elevation_gain: 450,
        },
        overrides: {
          name: 'Sortie du Samedi',
          surface: 'Road',
        },
      };
      expect(safeValidate(ImportStravaTraceSchema, validPayload).success).toBe(true);
    });
  });

  describe('Admin API Schemas', () => {
    it('validates AddTraceApiSchema fields', () => {
      const validTrace = {
        name: 'Grand Tour',
        date: '2026-05-15',
        distance: 80,
        elevation: 600,
        status: 'Done' as const,
      };
      expect(safeValidate(AddTraceApiSchema, validTrace).success).toBe(true);

      const invalidDate = {
        ...validTrace,
        date: '15/05/2026',
      };
      expect(safeValidate(AddTraceApiSchema, invalidDate).success).toBe(false);
    });

    it('validates ParseGpxApiSchema requires a valid URL', () => {
      expect(safeValidate(ParseGpxApiSchema, { url: 'https://example.com/route.gpx' }).success).toBe(true);
      expect(safeValidate(ParseGpxApiSchema, { url: 'bad-url' }).success).toBe(false);
    });
  });
});

