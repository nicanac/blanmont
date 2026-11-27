/**
 * Captures for chapters 02 (Se connecter), 03 (Le tour du back-office) and 04 (Qui peut faire quoi).
 * Run from the repo root, with the env of the dev server:  node docs/manuel/scripts/capture/bases.mjs
 * Nothing is saved: forms are only filled in, and the Accès & Rôles matrix is ticked but never saved.
 */
import { launch, close, newPage as newPageBase, go, mark, unmark, shot, USERS } from '../lib.mjs';

/** Same as lib's newPage, with a short timeout so a missing element is reported fast. */
async function newPage(opts) {
  const p = await newPageBase(opts);
  p.setDefaultTimeout(8000);
  return p;
}

const OUT = new URL('../../screens/', import.meta.url).pathname;
const f = (n) => OUT + n;
const only = process.argv[2];
/** The fictitious members have no photo: hide the broken avatar image of the account menu. */
const hideAvatar = (page, who) => page.addStyleTag({ content: `img[alt*="${USERS[who].name.split(' ')[0]}"] { display: none !important; }` });

/** Clip around the login card: from the title to the "Retour" link. */
async function cardClip(page) {
  const h = await page.getByRole('heading', { name: /Espace Peloton|Lien expir|Activer ou/i }).first().boundingBox();
  const back = await page.getByText(/Retour à/).last().boundingBox();
  const sy = await page.evaluate(() => window.scrollY);
  const top = h.y + sy - 70;
  return { x: 340, y: Math.max(0, top), width: 600, height: back.y + sy + back.height + 24 - top };
}

async function connexion() {
  // --- login page, both tabs
  let page = await newPage({ who: 'none', height: 900 });
  await go(page, '/login');
  await page.getByLabel('Adresse Email').fill('marie.dupont@exemple.be');
  await page.getByLabel('Mot de passe').fill('motdepasse');
  await page.getByLabel('Mot de passe').blur();
  await mark(page, [
    { el: page.getByLabel('Adresse Email'), n: '2', side: 'inside' },
    { el: page.getByLabel('Mot de passe'), n: '3', side: 'inside' },
    { el: page.getByRole('button', { name: 'Se connecter' }).first(), n: '4', side: 'inside' },
    { el: page.getByText('Oublié ?'), n: '5', side: 'right', pad: 2 },
    { el: page.getByRole('button', { name: '1ère Connexion' }).first(), n: '6', side: 'right', pad: 3 },
  ]);
  await shot(page, f('02-login-connexion.jpg'), await cardClip(page));
  await unmark(page);
  await page.getByRole('button', { name: '1ère Connexion' }).first().click();
  await page.waitForTimeout(600);
  await page.getByLabel('Adresse Email du Membre').fill('marie.dupont@exemple.be');
  await mark(page, [
    { el: page.getByRole('button', { name: '1ère Connexion' }).first(), n: '2', side: 'right', pad: 3 },
    { el: page.getByLabel('Adresse Email du Membre'), n: '3', side: 'inside' },
    { el: page.getByRole('button', { name: 'Recevoir le lien par email' }), n: '4', side: 'inside' },
  ]);
  await shot(page, f('02-login-activation.jpg'), await cardClip(page));
  await page.context().close();

  // --- forgot password page
  page = await newPage({ who: 'none', height: 800 });
  await go(page, '/login/forgot-password');
  await shot(page, f('02-forgot.jpg'), await cardClip(page));
  await page.context().close();

  // --- email link page, expired state (no code)
  page = await newPage({ who: 'none', height: 800 });
  await go(page, '/auth/action', { wait: 3000 });
  await shot(page, f('02-lien-expire.jpg'), await cardClip(page));
  await page.context().close();

  // --- phone login
  page = await newPage({ who: 'none', width: 390, height: 844, mobile: true, scale: 2 });
  await go(page, '/login');
  await shot(page, f('02-login-phone.jpg'), { x: 0, y: 90, width: 390, height: 540 });
  await page.context().close();

  // --- account menu, admin vs treasurer, desktop
  for (const who of ['admin', 'tresorier']) {
    page = await newPage({ who, width: 1280, height: 700 });
    await go(page, '/', { wait: 3500 });
    await hideAvatar(page, who);
    const btn = page.getByRole('button', { name: /Mon Compte/ }).first();
    await btn.click();
    await page.getByText('Connecté en tant que').locator('visible=true').first().waitFor();
    await page.waitForTimeout(500);
    const entry = (n) => page.locator('a:visible, button:visible').filter({ hasText: new RegExp('^\\s*' + n) }).last();
    await mark(page, [
      { el: btn, n: '1', side: 'left' },
      { el: entry('Retours'), n: '2', side: 'right', pad: 3 },
      ...(who === 'admin' ? [{ el: entry('Admin\\s*Administration du site'), n: '3', side: 'right', pad: 3 }] : []),
      { el: entry('Se déconnecter'), n: who === 'admin' ? '4' : '3', side: 'right', pad: 3 },
    ]);
    // viewport clip, not full page: a full-page capture resizes the window and closes the popover
    await page.screenshot({ path: f(`02-menu-${who}.jpg`), type: 'jpeg', quality: 86, clip: { x: 700, y: 0, width: 580, height: who === 'admin' ? 560 : 470 } });
    await page.context().close();
  }
  // --- account menu on the phone (admin and treasurer)
  for (const who of ['admin', 'tresorier']) {
    page = await newPage({ who, width: 390, height: 844, mobile: true, scale: 2 });
    await go(page, '/', { wait: 3500 });
    await hideAvatar(page, who);
    await page.getByRole('button', { name: /Ouvrir le menu principal/ }).click();
    await page.waitForTimeout(900);
    const box = await page.getByText('Connecté en tant que').locator('visible=true').first().boundingBox();
    const sy = await page.evaluate(() => window.scrollY);
    await shot(page, f(`02-phone-menu-${who}.jpg`), { x: 0, y: box.y + sy - 40, width: 390, height: who === 'admin' ? 340 : 280 });
    await page.context().close();
  }
}

/** Viewport capture (no full page: a full-page capture resizes the window and closes popovers). */
const vshot = (page, file, clip) => page.screenshot({ path: file, type: 'jpeg', quality: 86, ...(clip ? { clip } : {}) });
const up = (loc, xp = 'ancestor::section[1]') => loc.locator('xpath=' + xp).first();
/** Box of the white panel of a modal: climb from its title until the box is wide, but narrower than the screen. */
async function panelClip(dlg) {
  const r = await dlg.getByRole('heading').first().evaluate((h) => {
    let e = h;
    while (e.parentElement && (e.getBoundingClientRect().width < 800 || e.getBoundingClientRect().height < 400)) e = e.parentElement;
    const b = e.getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  return { x: r.x - 6, y: r.y - 6, width: r.width + 12, height: r.height + 12 };
}
const SCRATCH = (process.env.MANUEL_TMP ?? '/tmp/manuel') + '/bases/';
(await import('node:fs')).mkdirSync(SCRATCH, { recursive: true });

async function tour() {
  // --- sidebar, full height
  let page = await newPage({ who: 'admin', width: 1280, height: 1180 });
  await go(page, '/admin', { wait: 3000 });
  const aside = page.locator('aside').first();
  const grp = (t) => aside.getByText(t, { exact: true }).first();
  await mark(page, [
    { el: grp("Vue d'ensemble"), n: '1', side: 'right', pad: 2 },
    { el: grp('Rituels & Sorties'), n: '2', side: 'right', pad: 2 },
    { el: grp('Contenu & Médias'), n: '3', side: 'right', pad: 2 },
    { el: grp('Gestion du Club'), n: '4', side: 'right', pad: 2 },
    { el: grp('Configuration'), n: '5', side: 'right', pad: 2 },
    { el: aside.getByText('Guide & Raccourcis').first(), n: '6', side: 'right', pad: 2 },
    { el: aside.getByText('Retour au site public').first(), n: '7', side: 'right', pad: 2 },
  ]);
  await vshot(page, f('03-sidebar.jpg'), { x: 0, y: 0, width: 280, height: 1180 });
  await unmark(page);

  // --- sidebar folded (Ctrl+B)
  await page.getByTitle(/Replier la barre latérale/).first().click();
  await page.waitForTimeout(700);
  await vshot(page, f('03-sidebar-replie.jpg'), { x: 0, y: 0, width: 110, height: 330 });
  await page.getByTitle(/Déplier la barre latérale/).first().click();
  await page.waitForTimeout(500);
  await page.context().close();

  // --- top bar with markers, then the "Nouveau" menu, the palette, the help window
  page = await newPage({ who: 'admin', width: 1280, height: 800 });
  await go(page, '/admin', { wait: 3000 });
  const top = page.locator('header.sticky').first();
  await mark(page, [
    { el: page.getByTitle(/barre latérale/).first(), n: '1', side: 'left', pad: 2 },
    { el: top.locator('nav').first(), n: '2', side: 'left', pad: 3 },
    { el: top.getByRole('button', { name: /Rechercher/ }), n: '3', side: 'left', pad: 2 },
    { el: top.getByRole('button', { name: /Nouveau/ }), n: '4', side: 'left', pad: 2 },
    { el: top.getByRole('button', { name: /Guide & Raccourcis/ }), n: '5', side: 'left', pad: 2 },
    { el: top.getByRole('link', { name: /Voir le site/ }), n: '6', side: 'left', pad: 2 },
    { el: top.getByText('Nicolas', { exact: false }).first().locator('xpath=..'), n: '7', side: 'left', pad: 3 },
  ]);
  await vshot(page, f('03-topbar-gauche.jpg'), { x: 256, y: 0, width: 694, height: 66 });
  await vshot(page, f('03-topbar-droite.jpg'), { x: 950, y: 0, width: 330, height: 66 });
  await unmark(page);
  await top.getByRole('button', { name: /Nouveau/ }).click();
  await page.waitForTimeout(600);
  await vshot(page, f('03-nouveau.jpg'), { x: 600, y: 0, width: 680, height: 380 });
  await page.keyboard.press('Escape');
  await page.mouse.click(700, 500);

  await page.keyboard.press('Control+k');
  await page.waitForTimeout(600);
  await page.keyboard.type('sond', { delay: 60 });
  await page.waitForTimeout(600);
  await vshot(page, f('03-palette.jpg'), { x: 250, y: 40, width: 780, height: 560 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  await top.getByRole('button', { name: /Guide & Raccourcis/ }).click();
  await page.waitForTimeout(800);
  const dlg = page.getByRole('dialog').first();
  const tabs = [['Rythme Hebdo', '03-aide-rythme'], ['Rôles & Droits', '03-aide-roles'], ['Raccourcis & Outils', '03-aide-raccourcis'], ['Guide Démarrage', '03-aide-demarrage']];
  for (const [name, file] of tabs) {
    await dlg.getByRole('tab', { name }).or(dlg.getByRole('button', { name })).first().click();
    await page.waitForTimeout(500);
    await vshot(page, f(file + '.jpg'), await panelClip(dlg));
  }
  await page.context().close();

  // --- a page tutorial and its guided tour (dashboard guide, then step 3 of the tour)
  page = await newPage({ who: 'admin', width: 1280, height: 860 });
  await go(page, '/admin', { wait: 3000 });
  await page.evaluate(() => { localStorage.removeItem('cc_admin_onboarding_dismissed_v1'); window.dispatchEvent(new Event('cc_admin_reset_onboarding')); });
  await page.waitForTimeout(800);
  await page.getByText('Guide du QG').first().click();
  await page.waitForTimeout(800);
  const tdlg = page.getByRole('dialog').first();
  await vshot(page, f('03-tutoriel.jpg'), await panelClip(tdlg));
  await tdlg.getByRole('button', { name: /Lancer la visite/ }).click();
  await page.waitForTimeout(1200);
  for (let i = 0; i < 2; i++) { await page.getByRole('button', { name: /Suivant/ }).click(); await page.waitForTimeout(700); }
  await vshot(page, f('03-visite.jpg'));
  await page.context().close();

  // --- dashboard, block by block
  page = await newPage({ who: 'admin', width: 1280, height: 1000 });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await go(page, '/admin', { wait: 3500 });
  await page.evaluate(() => { localStorage.removeItem('cc_admin_onboarding_dismissed_v1'); window.dispatchEvent(new Event('cc_admin_reset_onboarding')); });
  await page.waitForTimeout(900);
  await shot(page, f('03-dashboard.jpg'), { x: 256, y: 0, width: 1024, height: 2300 });

  const cart = page.locator('header.relative.border-b').first();
  await mark(page, [
    { el: cart.getByText('Membres inscrits').first(), n: '1', side: 'left' },
    { el: cart.getByText('Sondage Hebdo').first(), n: '2', side: 'left' },
    { el: cart.getByText('Sorties (7j)').first(), n: '3', side: 'left' },
    { el: cart.getByText(/Sorties d.essai/).first(), n: '4', side: 'left' },
    { el: cart.getByText('Guide du QG'), n: '5', side: 'left' },
    { el: cart.getByRole('link', { name: /Nouveau Sondage/ }), n: '6', side: 'left' },
    { el: cart.getByRole('link', { name: /Nouvelle Sortie/ }), n: '7', side: 'left' },
    { el: cart.getByRole('link', { name: /Nouvel Article/ }), n: '8', side: 'left' },
  ]);
  await shot(page, f('03-dash-cartouche.jpg'), cart, { pad: 6 });
  await unmark(page);

  const check = up(page.locator('#onboarding-guide-heading'));
  await mark(page, [
    { el: check.getByText('Progression globale').first(), n: '1', side: 'left' },
    { el: check.getByRole('button', { name: /Réduire/ }), n: '2', side: 'left' },
    { el: check.getByRole('button', { name: /Masquer le guide/ }), n: '3', side: 'right' },
    { el: check.getByText('Planifier les Sorties au Calendrier').first(), n: '4', side: 'left' },
    { el: check.getByRole('link', { name: /Gérer les sorties/ }), n: '5', side: 'left' },
  ]);
  await shot(page, f('03-dash-guide.jpg'), check, { pad: 14 });
  await unmark(page);

  const cmd = up(page.locator('#peloton-command-heading'));
  await mark(page, [
    { el: cmd.getByRole('button', { name: /Copier Briefing/ }), n: '1', side: 'left' },
    { el: cmd.getByText('Lieu de départ').first().locator('xpath=ancestor::div[2]'), n: '2', side: 'left' },
    { el: cmd.getByText(/Composition des Groupes/).first(), n: '3', side: 'left' },
    { el: cmd.getByText(/Gérer les réponses/).first(), n: '4', side: 'left' },
  ]);
  await shot(page, f('03-dash-poste.jpg'), cmd, { pad: 14 });
  await unmark(page);

  // briefing: click, show the button state and read what was copied
  await cmd.getByRole('button', { name: /Copier Briefing/ }).click();
  await page.waitForTimeout(500);
  const copied = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => 'ERR ' + e);
  (await import('node:fs')).writeFileSync(SCRATCH + 'briefing.txt', copied);
  console.log('briefing copied:\n' + copied);
  const cb = await cmd.boundingBox();
  const csy = await page.evaluate(() => scrollY);
  await shot(page, f('03-dash-copie.jpg'), { x: cb.x, y: cb.y + csy, width: cb.width, height: 150 });

  const trials = up(page.locator('#pending-trials-heading'));
  await mark(page, [
    { el: trials.getByRole('link', { name: /Gérer les candidatures/ }), n: '1', side: 'left' },
  ]);
  await shot(page, f('03-dash-candidatures.jpg'), trials, { pad: 14 });
  await unmark(page);
  const posts = up(page.locator('#recent-posts-heading'));
  await shot(page, f('03-dash-articles.jpg'), { x: 270, y: (await posts.boundingBox()).y + (await page.evaluate(() => scrollY)) - 10, width: 780, height: 330 });
  await shot(page, f('03-dash-rituels.jpg'), up(page.locator('#quick-ops-heading')), { pad: 14 });
  await page.context().close();

  // --- simplified dashboards of delegated roles + the "page not open to your role" banner
  for (const who of ['tresorier', 'capitaine']) {
    page = await newPage({ who, width: 1280, height: 800 });
    await go(page, '/admin', { wait: 3000 });
    await vshot(page, f(`03-delegue-${who}.jpg`), { x: 0, y: 0, width: 1280, height: 580 });
    await page.context().close();
  }
  page = await newPage({ who: 'tresorier', width: 1280, height: 800 });
  await go(page, '/admin?acces=refuse', { wait: 3000 });
  await vshot(page, f('03-acces-refuse.jpg'), { x: 0, y: 0, width: 1280, height: 580 });
  await page.context().close();
}
async function roles() {
  // --- Accès & Rôles: one box ticked, NOT saved (nothing is written to the club's settings)
  let page = await newPage({ who: 'admin', width: 1280, height: 1100 });
  await go(page, '/admin/acces', { wait: 3500 });
  await page.getByLabel('Trésorier — Statistiques').check();
  await page.waitForTimeout(500);
  const table = page.locator('table').first();
  const enreg = page.getByRole('button', { name: 'Enregistrer' });
  await mark(page, [
    { el: page.getByText('accès total').first().locator('xpath=..'), n: '1', side: 'left', pad: 2 },
    { el: page.getByRole('columnheader', { name: /Trésorier/ }), n: '2', side: 'left', pad: 2 },
    { el: page.getByLabel('Trésorier — Statistiques'), n: '3', side: 'left', pad: 4 },
    { el: page.getByRole('button', { name: /Rétablir les valeurs suggérées/ }), n: '4', side: 'left', pad: 3 },
    { el: enreg, n: '5', side: 'left', pad: 3 },
  ]);
  const tb = await table.boundingBox();
  const eb = await enreg.boundingBox();
  const sy = await page.evaluate(() => scrollY);
  await shot(page, f('04-matrice.jpg'), { x: tb.x - 14, y: tb.y + sy - 14, width: tb.width + 28, height: eb.y + sy + eb.height - tb.y - sy + 34 });
  await page.context().close();

  // --- the dashboard as an administrator and as a treasurer see it (menu on the left)
  for (const who of ['admin', 'tresorier']) {
    page = await newPage({ who, width: 1280, height: 1180 });
    await go(page, '/admin', { wait: 3000 });
    await vshot(page, f(`04-comparaison-${who}.jpg`), { x: 0, y: 0, width: 1280, height: who === 'admin' ? 780 : 480 });
    await page.context().close();
  }
}

// Runs last so that every const above is initialised.
await launch();
try {
  const steps = { connexion, tour, roles };
  for (const [k, fn] of Object.entries(steps)) if (!only || only === k) { console.log('== ' + k); await fn(); }
} finally {
  await close();
}
