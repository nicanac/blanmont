import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  normalizeFeedbackSettings,
  isAudienceAllowed,
  DEFAULT_FEEDBACK_SETTINGS,
} from '@/app/lib/feedback/settings';

describe('visual feedback settings', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('fails closed on garbage input', () => {
    expect(normalizeFeedbackSettings(null)).toEqual(DEFAULT_FEEDBACK_SETTINGS);
    expect(normalizeFeedbackSettings({ enabled: 'yes', audience: 'root' })).toMatchObject({
      enabled: false,
      audience: 'admins',
    });
  });

  it('keeps valid values', () => {
    expect(normalizeFeedbackSettings({ enabled: true, audience: 'members', updatedBy: 'u1' })).toMatchObject({
      enabled: true,
      audience: 'members',
      updatedBy: 'u1',
    });
  });

  it('applies the audience rule', () => {
    const admin = { isAdmin: true };
    const member = { isAdmin: false };
    expect(isAudienceAllowed({ enabled: false, audience: 'everyone' }, admin)).toBe(false);
    expect(isAudienceAllowed({ enabled: true, audience: 'admins' }, admin)).toBe(true);
    expect(isAudienceAllowed({ enabled: true, audience: 'admins' }, member)).toBe(false);
    expect(isAudienceAllowed({ enabled: true, audience: 'members' }, member)).toBe(true);
    expect(isAudienceAllowed({ enabled: true, audience: 'members' }, null)).toBe(false);
    expect(isAudienceAllowed({ enabled: true, audience: 'everyone' }, null)).toBe(true);
  });

  it('is overridden by the env kill-switch', () => {
    vi.stubEnv('NEXT_PUBLIC_FEEDBACK_ENABLED', 'false');
    expect(isAudienceAllowed({ enabled: true, audience: 'everyone' }, { isAdmin: true })).toBe(false);
  });
});
