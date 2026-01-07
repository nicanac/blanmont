import { z } from 'zod';

// === Common validators ===

const notionIdSchema = z.string().min(1, 'ID is required');

const urlSchema = z.string().url('Must be a valid URL').optional().or(z.literal(''));

const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

const emailSchema = z.string().email('Must be a valid email address');

const phoneSchema = z.string().regex(
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  'Must be a valid phone number'
).optional();

// === Trace validation ===

export const CreateTraceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  distance: z.number().positive('Distance must be positive').max(1000, 'Distance must be less than 1000km'),
  elevation: z.number().nonnegative('Elevation cannot be negative').max(10000, 'Elevation must be less than 10000m').optional(),
  mapUrl: urlSchema,
  gpxUrl: urlSchema,
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  direction: z.enum(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']).optional(),
  surface: z.enum(['Road', 'Gravel', 'Mixed', 'MTB', 'Path']).optional(),
  rating: z.enum(['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']).optional(),
  photos: z.array(urlSchema).max(10, 'Maximum 10 photos allowed').optional(),
  polyline: z.string().max(100000, 'Polyline too long').optional(),
  start: z.string().max(100).optional(),
  end: z.string().max(100).optional(),
});

export type CreateTraceInput = z.infer<typeof CreateTraceSchema>;

export const UpdateTraceSchema = CreateTraceSchema.partial().extend({
  id: notionIdSchema,
});

export type UpdateTraceInput = z.infer<typeof UpdateTraceSchema>;

// === Saturday Ride validation ===

export const CreateRideSchema = z.object({
  date: dateSchema,
  traceIds: z.array(notionIdSchema).min(1, 'At least one trace is required').max(10, 'Maximum 10 traces allowed'),
});

export type CreateRideInput = z.infer<typeof CreateRideSchema>;

export const SubmitVoteSchema = z.object({
  rideId: notionIdSchema,
  memberId: notionIdSchema,
  traceId: notionIdSchema,
});

export type SubmitVoteInput = z.infer<typeof SubmitVoteSchema>;

// === Feedback validation ===

export const SubmitFeedbackSchema = z.object({
  traceId: notionIdSchema,
  memberId: notionIdSchema.optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment must be less than 1000 characters'),
  feedbackId: notionIdSchema.optional(),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

// === Member/Auth validation ===

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const UpdateMemberPhotoSchema = z.object({
  memberId: notionIdSchema,
  photoUrl: z.string().min(1, 'Photo URL is required'),
});

export type UpdateMemberPhotoInput = z.infer<typeof UpdateMemberPhotoSchema>;

// === Map Preview validation ===

export const UploadMapPreviewSchema = z.object({
  traceId: notionIdSchema,
  imageUrl: z.string().url('Must be a valid image URL'),
});

export type UploadMapPreviewInput = z.infer<typeof UploadMapPreviewSchema>;

export const GenerateMapPreviewSchema = z.object({
  traceId: notionIdSchema,
});

export type GenerateMapPreviewInput = z.infer<typeof GenerateMapPreviewSchema>;

// === Strava Import validation ===

export const FetchStravaActivitySchema = z.object({
  url: z.string().regex(
    /^https:\/\/www\.strava\.com\/activities\/\d+/,
    'Must be a valid Strava activity URL'
  ),
});

export type FetchStravaActivityInput = z.infer<typeof FetchStravaActivitySchema>;

export const ImportStravaTraceSchema = z.object({
  activity: z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    distance: z.number(),
    total_elevation_gain: z.number().optional(),
    description: z.string().optional(),
    mapUrl: z.string().optional(),
    map: z.object({
      summary_polyline: z.string().optional(),
    }).optional(),
  }),
  overrides: z.object({
    name: z.string().optional(),
    direction: z.string().optional(),
    surface: z.string().optional(),
    rating: z.string().optional(),
  }).optional(),
});

export type ImportStravaTraceInput = z.infer<typeof ImportStravaTraceSchema>;

// === Garmin Import validation ===

export const FetchGarminActivitySchema = z.object({
  url: z.string().regex(
    /^https:\/\/connect\.garmin\.com\/modern\/activity\/\d+/,
    'Must be a valid Garmin activity URL'
  ),
});

export type FetchGarminActivityInput = z.infer<typeof FetchGarminActivitySchema>;

// === Admin API validation ===

export const AddTraceApiSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: dateSchema,
  distance: z.number().positive().optional(),
  elevation: z.number().nonnegative().optional(),
  direction: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  komootLink: urlSchema,
  gpxLink: urlSchema,
  photoLink: urlSchema,
  roadQuality: z.string().optional(),
  rating: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Archive']).optional(),
  note: z.string().max(2000).optional(),
  gpxContent: z.string().optional(),
});

export type AddTraceApiInput = z.infer<typeof AddTraceApiSchema>;

export const ParseGpxApiSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

export type ParseGpxApiInput = z.infer<typeof ParseGpxApiSchema>;

export const FetchMetadataApiSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

export type FetchMetadataApiInput = z.infer<typeof FetchMetadataApiSchema>;

// === File upload validation ===

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const validateImageFile = (file: File) => {
  const schema = z.object({
    size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 5MB'),
    type: z.string().refine(
      (val) => ACCEPTED_IMAGE_TYPES.includes(val),
      { message: 'Only JPEG, PNG, and WebP images are allowed' }
    ),
  });

  return schema.safeParse({ size: file.size, type: file.type });
};

// === Utility function for safe parsing with error formatting ===

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Array<{ field: string; message: string }> };

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map(err => ({
    field: err.path.join('.') || 'root',
    message: err.message,
  }));
  
  return { success: false, errors };
}

/**
 * Parses and validates FormData with a given schema
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const data: Record<string, any> = {};
  
  formData.forEach((value, key) => {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!data[arrayKey]) {
        data[arrayKey] = [];
      }
      data[arrayKey].push(value);
    } else {
      data[key] = value;
    }
  });
  
  return safeValidate(schema, data);
}
