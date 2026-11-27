/**
 * Helpers for the manual's screenshots (scripts/capture.mjs): a signed session cookie, a browser
 * context per user, and numbered red markers drawn on the page before a capture.
 */
import crypto from 'node:crypto';
import { chromium } from 'playwright';

export const BASE = process.env.MANUEL_BASE_URL ?? 'http://localhost:3000';

const b64u = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Same format as app/lib/auth/session-token.ts (HMAC-SHA256 over the base64url payload). */
export function signSession(payload, secret = process.env.SESSION_SECRET) {
  if (!secret) throw new Error('SESSION_SECRET is required (same value as the dev server).');
  const now = Math.floor(Date.now() / 1000);
  const p = b64u(JSON.stringify({ ...payload, iat: now, exp: now + 14 * 86400 }));
  return `${p}.${b64u(crypto.createHmac('sha256', secret).update(p).digest())}`;
}

/** Fictitious people of seed/seed.json. The admin's email must be in OWNER_EMAILS for Paramètres. */
export const USERS = {
  admin: { id: 'm-nicolas', email: 'nicolas@exemple.be', verifiedEmail: 'nicolas@exemple.be', name: 'Nicolas Bruyère', role: ['Admin'], isAdmin: true },
  tresorier: { id: 'm-anne', email: 'anne.dumont@exemple.be', verifiedEmail: 'anne.dumont@exemple.be', name: 'Anne Dumont', role: ['Trésorier'], isAdmin: false },
  capitaine: { id: 'm-marc', email: 'marc.lambert@exemple.be', verifiedEmail: 'marc.lambert@exemple.be', name: 'Marc Lambert', role: ['Capitaine de Route'], isAdmin: false },
  secretaire: { id: 'm-sophie', email: 'sophie.martin@exemple.be', verifiedEmail: 'sophie.martin@exemple.be', name: 'Sophie Martin', role: ['Secrétaire'], isAdmin: false },
  membre: { id: 'm-julie', email: 'julie.renard@exemple.be', verifiedEmail: 'julie.renard@exemple.be', name: 'Julie Renard', role: ['Member'], isAdmin: false },
};

let browser;
export async function launch() {
  browser = await chromium.launch();
  return browser;
}
export async function close() {
  await browser?.close();
}

/**
 * New page for a user ('none' = visitor). bypassCSP: the app's CSP only allows https connections,
 * the local database emulator speaks http/ws.
 */
export async function newPage({ who = 'admin', width = 1280, height = 860, theme = 'light', scale = 1.25, mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    bypassCSP: true,
    locale: 'fr-BE',
    timezoneId: 'Europe/Brussels',
    isMobile: mobile,
    hasTouch: mobile,
    // Final state at once: counters (CountUp), the developing map and the wind field all skip
    // their animation under reduced motion, so a screenshot never catches a figure at 0.
    reducedMotion: 'reduce',
  });
  if (who !== 'none') {
    await ctx.addCookies([{ name: 'ccb_session', value: signSession(USERS[who]), url: BASE, httpOnly: true }]);
  }
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem('cc_blanmont_theme', t);
      localStorage.setItem('ccb_cookie_consent', JSON.stringify({ essential: true, analytics: false, timestamp: Date.now(), version: 1 }));
      localStorage.setItem('cc_admin_onboarding_dismissed_v1', 'true');
    } catch {}
  }, theme);
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  return page;
}

export async function go(page, path, { wait = 1200 } = {}) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 180000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(wait);
}

/** Draws numbered markers: [{ el: Locator, n: '1', side?: 'left'|'right'|'top' }]. */
export async function mark(page, marks) {
  for (const m of marks) {
    const box = await m.el.first().boundingBox().catch(() => null);
    if (!box) {
      console.warn('  marker target not found:', m.n, String(m.el));
      continue;
    }
    await page.evaluate(
      ({ box, n, side, pad }) => {
        const sx = window.scrollX;
        const sy = window.scrollY;
        const frame = document.createElement('div');
        frame.className = '__manuel-mark';
        Object.assign(frame.style, {
          position: 'absolute',
          left: `${box.x + sx - pad}px`,
          top: `${box.y + sy - pad}px`,
          width: `${box.width + pad * 2}px`,
          height: `${box.height + pad * 2}px`,
          border: '2.5px solid #d63535',
          borderRadius: '5px',
          zIndex: 2147483646,
          pointerEvents: 'none',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.85)',
        });
        const dot = document.createElement('div');
        dot.className = '__manuel-mark';
        dot.textContent = n;
        const size = 28;
        let left = box.x + sx - pad - size / 2 - 4;
        let top = box.y + sy - pad - size / 2 - 4;
        if (side === 'right') left = box.x + sx + box.width + pad - size / 2 + 4;
        if (side === 'inside') { left = box.x + sx - pad + 4; top = box.y + sy - pad + 4; }
        Object.assign(dot.style, {
          position: 'absolute',
          left: `${Math.max(2, left)}px`,
          top: `${Math.max(2, top)}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: '#d63535',
          color: '#fff',
          font: '800 16px/28px Archivo, sans-serif',
          fontStretch: '87.5%',
          textAlign: 'center',
          zIndex: 2147483647,
          pointerEvents: 'none',
          boxShadow: '0 0 0 2.5px #fff',
        });
        document.body.appendChild(frame);
        document.body.appendChild(dot);
      },
      { box, n: m.n, side: m.side ?? 'left', pad: m.pad ?? 4 }
    );
  }
}

export async function unmark(page) {
  await page.evaluate(() => document.querySelectorAll('.__manuel-mark').forEach((e) => e.remove()));
}

/**
 * Saves a JPEG. target: undefined = viewport, 'full' = full page, a Locator = that element,
 * or { x, y, width, height } = clip in page coordinates.
 */
export async function shot(page, file, target, { quality = 78, pad = 0 } = {}) {
  const opts = { path: file, type: 'jpeg', quality, animations: 'disabled' };
  if (target === 'full') return page.screenshot({ ...opts, fullPage: true });
  if (target && typeof target.screenshot === 'function') {
    if (!pad) return target.first().screenshot(opts);
    const b = await target.first().boundingBox();
    const sx = await page.evaluate(() => window.scrollX);
    const sy = await page.evaluate(() => window.scrollY);
    return page.screenshot({
      ...opts,
      fullPage: true,
      clip: { x: Math.max(0, b.x + sx - pad), y: Math.max(0, b.y + sy - pad), width: b.width + pad * 2, height: b.height + pad * 2 },
    });
  }
  if (target) return page.screenshot({ ...opts, fullPage: true, clip: target });
  return page.screenshot(opts);
}
