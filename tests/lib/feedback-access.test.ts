import { describe, it, expect } from 'vitest';
import { isFeedbackReviewer, reviewerRoleLabel } from '@/app/lib/feedback/access';

describe('feedback reviewer access', () => {
  it('lets admins and club officers in', () => {
    expect(isFeedbackReviewer({ isAdmin: true, role: [] })).toBe(true);
    expect(isFeedbackReviewer({ role: ['Président'] })).toBe(true);
    expect(isFeedbackReviewer({ role: ['Trésorier'] })).toBe(true);
    expect(isFeedbackReviewer({ role: ['Secrétaire'] })).toBe(true);
    expect(isFeedbackReviewer({ role: ['Capitaine de Route'] })).toBe(true);
    expect(isFeedbackReviewer({ role: ['Member', 'capitaine'] })).toBe(true);
  });

  it('keeps plain members and anonymous visitors out', () => {
    expect(isFeedbackReviewer({ role: ['Member'] })).toBe(false);
    expect(isFeedbackReviewer({ role: 'Membre' })).toBe(false);
    expect(isFeedbackReviewer({ role: [] })).toBe(false);
    expect(isFeedbackReviewer(null)).toBe(false);
  });

  it('labels the acting role', () => {
    expect(reviewerRoleLabel({ role: ['Member', 'Trésorier'] })).toBe('Trésorier');
    expect(reviewerRoleLabel({ role: ['Président'], isAdmin: true })).toBe('Président');
    expect(reviewerRoleLabel({ role: ['Member'], isAdmin: true })).toBe('Admin');
  });
});
