'use client';

import { getFirebaseAuth, sendPasswordResetEmail } from '@/app/lib/firebase/client';

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/user-not-found'
    ) {
      return;
    }
    throw error;
  }
}
