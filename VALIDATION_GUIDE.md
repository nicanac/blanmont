# Input Validation Implementation Guide

## Overview

This project now implements comprehensive input validation using [Zod](https://zod.dev/) across all server actions, API routes, and data mutations. This significantly reduces the risk of invalid data entering the system.

## Implementation

### Core Validation Library

All validation schemas are centralized in `app/lib/validation.ts`. This file exports:

- **Validation Schemas**: Zod schemas for all input types
- **Type Definitions**: TypeScript types inferred from schemas
- **Helper Functions**: Utilities for safe validation and error handling

### Key Features

#### 1. Centralized Schemas

All validation logic is defined in one place, making it easy to maintain and update:

```typescript
export const CreateTraceSchema = z.object({
  name: z.string().min(1).max(100),
  distance: z.number().positive().max(1000),
  elevation: z.number().nonnegative().max(10000).optional(),
  // ... more fields
});
```

#### 2. Type Safety

TypeScript types are automatically inferred from schemas:

```typescript
export type CreateTraceInput = z.infer<typeof CreateTraceSchema>;
```

#### 3. Structured Error Handling

The `safeValidate()` helper provides consistent error formatting:

```typescript
const validation = safeValidate(CreateTraceSchema, inputData);

if (!validation.success) {
  // validation.errors contains array of { field, message }
  return { error: validation.errors.map(e => e.message).join(', ') };
}

// validation.data is now type-safe and validated
const { name, distance } = validation.data;
```

#### 4. FormData Validation

Special helper for validating HTML form submissions:

```typescript
export async function myAction(formData: FormData) {
  const validation = validateFormData(formData, MySchema);
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors[0].message}`);
  }
  // Use validation.data
}
```

## Validated Areas

### ✅ Server Actions (`app/actions.ts`)

- `uploadMapPreview()` - Map preview uploads
- `generateMapPreview()` - Auto-generate map previews
- `createRideAction()` - Create Saturday rides
- `submitVoteAction()` - Submit votes
- `loginAction()` - User authentication
- `updateProfilePhotoAction()` - Profile photo updates

### ✅ Strava Import (`app/import/strava/actions.ts`)

- `fetchStravaActivityAction()` - Fetch Strava activities
- `importStravaTraceAction()` - Import traces from Strava
- `deleteTraceAction()` - Delete traces

### ✅ Garmin Import (`app/import/garmin/actions.ts`)

- `fetchGarminActivityAction()` - Fetch Garmin activities

### ✅ Admin API Routes

- `/api/admin/add-trace` - Add new traces
- `/api/admin/parse-gpx` - Parse GPX files
- `/api/admin/fetch-metadata` - Fetch metadata from URLs

### ✅ Notion Library Functions

- `createTrace()` - Create trace in Notion DB
- `submitFeedback()` - Submit user feedback

## Validation Rules

### Traces

- **Name**: Required, 1-100 characters
- **Distance**: Required, positive number, max 1000km
- **Elevation**: Optional, non-negative, max 10000m
- **URLs**: Must be valid URLs
- **Direction**: Enum of cardinal directions
- **Surface**: Enum (Road, Gravel, Mixed, MTB, Path)
- **Rating**: Enum (1-5 stars)
- **Photos**: Array of URLs, max 10
- **Polyline**: String, max 100,000 characters

### Saturday Rides

- **Date**: Required, YYYY-MM-DD format
- **Trace IDs**: Array of 1-10 valid IDs

### Feedback

- **Rating**: Integer, 1-5
- **Comment**: Required, 1-1000 characters
- **Trace ID & Member ID**: Required valid IDs

### User Authentication

- **Email**: Required, valid email format
- **Password**: Required, non-empty string

### File Uploads

- **Image files**: JPEG, PNG, WebP only
- **Max size**: 5MB

### URLs

- **Strava**: Must match pattern `https://www.strava.com/activities/[id]`
- **Garmin**: Must match pattern `https://connect.garmin.com/modern/activity/[id]`
- **Generic URLs**: Must be valid URL format

## Error Handling

### Client-Side

Validation errors are returned as structured objects:

```typescript
{
  success: false,
  errors: [
    { field: "distance", message: "Distance must be positive" },
    { field: "name", message: "Name is required" }
  ]
}
```

### Server-Side

Actions throw descriptive errors that can be caught and displayed:

```typescript
try {
  await createRideAction(date, traceIds);
} catch (error) {
  // Error message contains all validation failures
  console.error(error.message);
}
```

## Benefits

1. **Data Integrity**: Invalid data is rejected before reaching the database
2. **Type Safety**: TypeScript ensures correct types throughout the codebase
3. **Better UX**: Clear, structured error messages for users
4. **Maintainability**: Centralized validation logic is easy to update
5. **Security**: Protection against injection attacks and malformed data
6. **Documentation**: Schemas serve as living documentation of data requirements

## Best Practices

### When Adding New Actions

1. Define the schema in `app/lib/validation.ts`
2. Export the type using `z.infer<typeof Schema>`
3. Use `safeValidate()` or `validateFormData()` in your action
4. Return structured errors to the client
5. Use the validated data (type-safe!)

### Example Template

```typescript
// 1. Define schema in validation.ts
export const MyNewActionSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
});

export type MyNewActionInput = z.infer<typeof MyNewActionSchema>;

// 2. Use in server action
export async function myNewAction(input: unknown) {
  const validation = safeValidate(MyNewActionSchema, input);
  
  if (!validation.success) {
    return { 
      error: validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
    };
  }
  
  const { field1, field2 } = validation.data; // Type-safe!
  // ... implement logic
}
```

## Migration Notes

All existing actions have been updated to use Zod validation. Previous manual validation checks (like `if (!name || !date)`) have been replaced with schema validation.

## Testing Validation

You can test schemas directly:

```typescript
import { CreateTraceSchema } from '@/app/lib/validation';

const result = CreateTraceSchema.safeParse({
  name: "Test Route",
  distance: 50,
  elevation: 500,
});

if (!result.success) {
  console.log(result.error.issues);
}
```

## Further Reading

- [Zod Documentation](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TypeScript Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
