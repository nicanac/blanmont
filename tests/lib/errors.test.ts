import { describe, it, expect } from 'vitest';
import {
  AuthenticationError,
  ValidationError,
  DatabaseError,
  NotFoundError,
} from '@/app/lib/errors';

describe('domain errors', () => {
  it('instantiates AuthenticationError with default and custom message', () => {
    const defaultErr = new AuthenticationError();
    expect(defaultErr).toBeInstanceOf(Error);
    expect(defaultErr.name).toBe('AuthenticationError');
    expect(defaultErr.message).toBe('Authentication failed');

    const customErr = new AuthenticationError('Invalid credentials provided');
    expect(customErr.message).toBe('Invalid credentials provided');
  });

  it('instantiates ValidationError with default and custom message', () => {
    const defaultErr = new ValidationError();
    expect(defaultErr).toBeInstanceOf(Error);
    expect(defaultErr.name).toBe('ValidationError');
    expect(defaultErr.message).toBe('Validation failed');

    const customErr = new ValidationError('Name field is required');
    expect(customErr.message).toBe('Name field is required');
  });

  it('instantiates DatabaseError with default and custom message', () => {
    const defaultErr = new DatabaseError();
    expect(defaultErr).toBeInstanceOf(Error);
    expect(defaultErr.name).toBe('DatabaseError');
    expect(defaultErr.message).toBe('Database operation failed');

    const customErr = new DatabaseError('Failed to write to Firebase RTDB');
    expect(customErr.message).toBe('Failed to write to Firebase RTDB');
  });

  it('instantiates NotFoundError with default and custom message', () => {
    const defaultErr = new NotFoundError();
    expect(defaultErr).toBeInstanceOf(Error);
    expect(defaultErr.name).toBe('NotFoundError');
    expect(defaultErr.message).toBe('Resource not found');

    const customErr = new NotFoundError('Trace with id 123 not found');
    expect(customErr.message).toBe('Trace with id 123 not found');
  });
});
