/**
 * End-to-end check of every first-login path against the Firebase Auth + RTDB emulators
 * (never touches the real project). Run it after any change to login, activation or the
 * admin "Réinitialiser le mot de passe" page.
 *
 *   # 1. Emulators, in a scratch folder (Java required)
 *   #    firebase.json: {"database":{"rules":"rules.json"},"emulators":{"database":{"port":9000},"auth":{"port":9099},"ui":{"enabled":false}}}
 *   #    rules.json:    {"rules":{".read":false,".write":false}}   (deny-all, like production)
 *   npx firebase-tools emulators:start --only database,auth --project demo-blanmont
 *
 *   # 2. App against the emulators (placeholders, not secrets), production build
 *   export NEXT_PUBLIC_FIREBASE_API_KEY=demo-key NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-blanmont \
 *     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-blanmont.firebaseapp.com \
 *     NEXT_PUBLIC_FIREBASE_DATABASE_URL="http://127.0.0.1:9000?ns=demo-blanmont" \
 *     FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
 *     NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 GCLOUD_PROJECT=demo-blanmont \
 *     SESSION_SECRET=e2e-demo-session-secret-0123456789abcdef OWNER_EMAILS=owner@exemple.be
 *   npx next build && npx next start -p 3000
 *
 *   # 3. This script (wipes the emulators' data first)
 *   node scripts/e2e/first-login.emulator.mjs
 *
 * The browser bypasses the CSP only because the emulators speak http (production Firebase is https).
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE ?? 'http://localhost:3000';
const AUTH = 'http://127.0.0.1:9099';
const DB = 'http://127.0.0.1:9000';
const PROJECT = 'demo-blanmont';
const OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? `  (${extra})` : ''}`);
  if (!cond) failures++;
};

async function json(url, init) {
  const r = await fetch(url, init);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}
const dbPut = (path, value) => json(`${DB}/${path}.json?ns=${PROJECT}`, { method: 'PUT', headers: OWNER, body: JSON.stringify(value) });
const dbGet = (path) => json(`${DB}/${path}.json?ns=${PROJECT}`, { headers: OWNER });
const createAccount = (body) =>
  json(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: OWNER, body: JSON.stringify(body) });
const lookup = (email) =>
  json(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:lookup`, { method: 'POST', headers: OWNER, body: JSON.stringify({ email: [email] }) });
const publicSignUp = (email, password) =>
  json(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
async function lastOob(email) {
  const { oobCodes = [] } = await json(`${AUTH}/emulator/v1/projects/${PROJECT}/oobCodes`);
  return oobCodes.filter((c) => c.email === email && c.requestType === 'PASSWORD_RESET').at(-1);
}

// ---------- seed ----------
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
await dbPut('', null);
const seb = await createAccount({ email: 'seb@exemple.be', password: 'seb-admin-pass', emailVerified: true });
const evaOld = await createAccount({ email: 'eva.ancienne@exemple.be', password: 'eva-old-pass', emailVerified: true });
await dbPut('members', {
  'm-marc': { name: 'Marc Nouveau', email: 'marc.nouveau@exemple.be', role: ['Member'] },
  'm-paul': { name: 'Paul Sansmail', email: 'Paul@Exemple.be ', role: ['Member'] },
  'm-seb': { name: 'Seb Admin', email: 'seb@exemple.be', role: ['Admin'], authUid: seb.localId },
  'm-eva': { name: 'Eva Change', email: 'eva.nouvelle@exemple.be', role: ['Member'], authUid: evaOld.localId },
  'm-zoe': { name: 'Zoé Cible', email: 'zoe@exemple.be', role: ['Member'] },
});

const browser = await chromium.launch();
const newPage = async () => {
  // CSP allows only https: connections; the local emulator is http (production Firebase is https).
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 400, height: 900 }, bypassCSP: true });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('ccb_cookie_consent', JSON.stringify({ essential: true, analytics: false, timestamp: Date.now(), version: 1 }));
      localStorage.setItem('cc_admin_onboarding_dismissed_v1', 'true');
    } catch {}
  });
  return { ctx, page: await ctx.newPage() };
};
// Next's route announcer is an empty role=alert: wait for a message with text.
const alertText = (page) =>
  page.locator('[role="alert"], [role="status"]').filter({ hasText: /\S/ }).first().innerText({ timeout: 20000 });

async function requestLink(page, email) {
  await page.goto('/login?mode=activate');
  await page.fill('#activate-email', email);
  await page.getByRole('button', { name: /Recevoir le lien/i }).click();
  return alertText(page);
}
async function passwordLogin(page, email, password) {
  await page.goto('/login');
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.getByRole('button', { name: /Se connecter/i }).click();
  try {
    await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 });
    return { ok: true };
  } catch {
    return { ok: false, message: await alertText(page) };
  }
}
async function setPasswordFromLink(page, oobCode, password) {
  await page.goto(`/auth/action?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`);
  const inputs = page.locator('input[type="password"]');
  await inputs.first().waitFor({ timeout: 20000 });
  await inputs.nth(0).fill(password);
  await inputs.nth(1).fill(password);
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL((u) => u.pathname === '/', { timeout: 30000 });
}
const hasSession = async (ctx) => (await ctx.cookies()).some((c) => c.name === 'ccb_session');

// ---------- 1. First login by emailed link (member never logged in) ----------
{
  const { ctx, page } = await newPage();
  const msg = await requestLink(page, '  Marc.Nouveau@exemple.be ');
  check('1. first-login request is accepted', /spams/.test(msg), msg.slice(0, 80));
  const oob = await lastOob('marc.nouveau@exemple.be');
  check('1. Firebase sent the password email', Boolean(oob));
  check('1. the link comes back to the site login page', oob?.oobLink?.includes(encodeURIComponent(`${BASE}/login`)), oob?.oobLink?.slice(0, 160));
  const member = await dbGet('members/m-marc');
  check('1. account created and linked to the member', Boolean(member?.authUid));
  await setPasswordFromLink(page, oob.oobCode, 'Marc-velo-2026');
  check('1. choosing the password logs the member in', await hasSession(ctx));
  await ctx.close();

  const second = await newPage();
  const login = await passwordLogin(second.page, 'MARC.nouveau@exemple.be', 'Marc-velo-2026');
  check('1. later login with email + chosen password', login.ok, login.message);
  await second.ctx.close();
}

// ---------- 2. Wrong password: clear message, no "first visit" loop ----------
{
  const { ctx, page } = await newPage();
  const login = await passwordLogin(page, 'marc.nouveau@exemple.be', 'wrong-password');
  check('2. wrong password is refused', !login.ok);
  check('2. message says "incorrect", points to the link', /incorrect/i.test(login.message ?? '') && /1ère connexion/.test(login.message ?? ''), login.message);
  await ctx.close();
}

// ---------- 3. An admin sets the password of a member who never activated ----------
{
  const admin = await newPage();
  const login = await passwordLogin(admin.page, 'seb@exemple.be', 'seb-admin-pass');
  check('3. admin logs in', login.ok, login.message);
  await admin.page.goto('/admin/members/m-paul/reset-password');
  await admin.page.getByText('Identifiant de connexion').waitFor({ timeout: 20000 });
  const hint = await admin.page.getByText('Identifiant de connexion').innerText();
  check('3. form shows the login email', hint.includes('paul@exemple.be'), hint);
  await admin.page.fill('#password', 'Paul-temp-123');
  await admin.page.getByRole('button', { name: /Réinitialiser/ }).click();
  await admin.page.getByText('a été réinitialisé avec succès').waitFor({ timeout: 20000 });
  const done = await admin.page.locator('main, body').first().innerText();
  check('3. success tells the admin which email to give', done.includes('paul@exemple.be'));
  await admin.ctx.close();

  const member = await newPage();
  const paul = await passwordLogin(member.page, 'paul@exemple.be', 'Paul-temp-123');
  check('3. member logs in with the password the admin gave', paul.ok, paul.message);
  await member.ctx.close();
}

// ---------- 4. Directory email changed after the account was made ----------
{
  const { ctx, page } = await newPage();
  const msg = await requestLink(page, 'eva.nouvelle@exemple.be');
  check('4. request accepted', /spams/.test(msg), msg.slice(0, 80));
  const moved = await lookup('eva.nouvelle@exemple.be');
  check('4. the existing account moved to the new email', moved?.users?.[0]?.localId === evaOld.localId);
  const oob = await lastOob('eva.nouvelle@exemple.be');
  check('4. email sent to the new address', Boolean(oob));
  await setPasswordFromLink(page, oob.oobCode, 'Eva-nouveau-1');
  check('4. member logged in after choosing the password', await hasSession(ctx));
  await ctx.close();
}

// ---------- 5. Account self-made through the public API with a member's email ----------
{
  const self = await publicSignUp('zoe@exemple.be', 'intruder-pass');
  // Date it after the compatibility cutoff (2026-11-28 12:00 UTC), like any account created after the deploy.
  await json(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:update`, {
    method: 'POST', headers: OWNER, body: JSON.stringify({ localId: self.localId, createdAt: String(Date.parse('2026-12-01T10:00:00Z')) }),
  });
  const dated = await lookup('zoe@exemple.be');
  check('5. (setup) self-made account dated after the cutoff', dated?.users?.[0]?.createdAt === String(Date.parse('2026-12-01T10:00:00Z')), dated?.users?.[0]?.createdAt);
  const intruder = await newPage();
  const login = await passwordLogin(intruder.page, 'zoe@exemple.be', 'intruder-pass');
  check('5. a self-made account does not get the member session', !login.ok, login.message);
  check('5. ...and is told it is not linked', /relié à aucune fiche/.test(login.message ?? ''), login.message);
  await intruder.ctx.close();

  const { ctx, page } = await newPage();
  await requestLink(page, 'zoe@exemple.be');
  check('5. the self-made account is not linked by the request', !(await dbGet('members/m-zoe'))?.authUid);
  const oob = await lastOob('zoe@exemple.be');
  await setPasswordFromLink(page, oob.oobCode, 'Zoe-vraie-1');
  check('5. the real owner (emailed link) gets in and is linked', (await hasSession(ctx)) && Boolean((await dbGet('members/m-zoe'))?.authUid));
  await ctx.close();
  const again = await newPage();
  check('5. the intruder password no longer works', !(await passwordLogin(again.page, 'zoe@exemple.be', 'intruder-pass')).ok);
  await again.ctx.close();
}

// ---------- 6. Not a member: same answer, nothing sent ----------
{
  const { ctx, page } = await newPage();
  const msg = await requestLink(page, 'inconnu@exemple.be');
  check('6. same neutral answer', /spams/.test(msg));
  check('6. no account, no email', !(await lastOob('inconnu@exemple.be')) && !(await lookup('inconnu@exemple.be'))?.users);
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
process.exit(failures ? 1 : 0);
