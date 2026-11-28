/**
 * Delivery-size renditions of Cloudinary photos (#260).
 *
 * Member photos are stored once at full quality (up to 1600 px) and rendered with
 * `next/image` `unoptimized`, so each place asks Cloudinary for the width it shows:
 * a 36 px avatar no longer downloads the portrait printed on /members.
 *
 * Client-safe: no Cloudinary SDK here (`./cloudinary` is server-only).
 */

/** `https://res.cloudinary.com/<cloud>/image/upload/` + `v<version>/<public id>`, nothing in between. */
const PLAIN_UPLOAD_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

/** Widths, in px, of the renditions the site asks for (device pixels, up to 3× screens). */
export const PHOTO_WIDTH = {
  /** 36–44 px avatars (poll participants, admin tables, comments). */
  avatar: 128,
  /** 112–128 px member pass portrait. */
  pass: 384,
  /** /members card and /profile portrait: ~440 CSS px wide on a 2.6× phone. */
  portrait: 1200,
} as const;

/**
 * The URL of a Cloudinary upload resized to at most `width` px wide (never upscaled),
 * in the browser's best format (WebP/AVIF) at Cloudinary's "good" automatic quality.
 * Any other URL (another host, a URL that already carries a transformation, a data/blob
 * URL, a local path) is returned unchanged.
 */
export function cloudinaryRendition(url: string, width: number): string {
  const match = PLAIN_UPLOAD_URL.exec(url.trim());
  if (!match || !Number.isFinite(width) || width < 1) return url;
  return `${match[1]}c_limit,w_${Math.round(width)},f_auto,q_auto:good/${match[2]}`;
}
