import { describe, it, expect } from 'vitest';
import { cloudinaryRendition, PHOTO_WIDTH } from '@/app/lib/cloudinary-url';

const PROFILE =
  'https://res.cloudinary.com/dizy3s5zh/image/upload/v1795693458/profiles/profile-member_2ce9555c.jpg';

describe('cloudinaryRendition (#260)', () => {
  it('asks Cloudinary for a limited-width, auto-format rendition of an upload', () => {
    expect(cloudinaryRendition(PROFILE, 1200)).toBe(
      'https://res.cloudinary.com/dizy3s5zh/image/upload/c_limit,w_1200,f_auto,q_auto:good/v1795693458/profiles/profile-member_2ce9555c.jpg'
    );
  });

  it('keeps nested folders and rounds the width', () => {
    const url =
      'https://res.cloudinary.com/demo/image/upload/v1789371588/members/member_x/member-x-1789371587666.jpg';
    expect(cloudinaryRendition(url, 127.6)).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_limit,w_128,f_auto,q_auto:good/v1789371588/members/member_x/member-x-1789371587666.jpg'
    );
  });

  it('trims whitespace around a stored URL before rewriting it', () => {
    expect(cloudinaryRendition(`  ${PROFILE} `, 128)).toContain('/upload/c_limit,w_128,');
  });

  it('leaves every other URL unchanged', () => {
    const untouched = [
      // Already transformed: never stack a second transformation.
      'https://res.cloudinary.com/demo/image/upload/w_256,h_256,c_fill/v1/profiles/a.jpg',
      // No version segment: the first path part could be a transformation.
      'https://res.cloudinary.com/demo/image/upload/profiles/a.jpg',
      // Not an image upload, not Cloudinary, not https, not a remote URL.
      'https://res.cloudinary.com/demo/video/upload/v1/clip.mp4',
      'http://res.cloudinary.com/demo/image/upload/v1/a.jpg',
      'https://lh3.googleusercontent.com/pw/abc=w600',
      'https://cloudinary.com/profiles/avatar.jpg',
      '/images/default-avatar.png',
      'data:image/jpeg;base64,AAAA',
      'blob:https://blanmont.be/1234',
      '',
    ];
    for (const url of untouched) expect(cloudinaryRendition(url, 128)).toBe(url);
  });

  it('ignores an unusable width', () => {
    expect(cloudinaryRendition(PROFILE, 0)).toBe(PROFILE);
    expect(cloudinaryRendition(PROFILE, Number.NaN)).toBe(PROFILE);
  });

  it('sizes each use for up to 3× screens', () => {
    // 36–44 px avatars, 128 px pass portrait, ~440 CSS px card on a 2.6× phone.
    expect(PHOTO_WIDTH.avatar).toBeGreaterThanOrEqual(44 * 2.5);
    expect(PHOTO_WIDTH.pass).toBeGreaterThanOrEqual(128 * 3);
    expect(PHOTO_WIDTH.portrait).toBeGreaterThanOrEqual(443 * 2.625);
  });
});
