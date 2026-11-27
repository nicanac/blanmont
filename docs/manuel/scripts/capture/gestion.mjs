/**
 * Captures for chapters 14 to 17 (Membres, Candidatures, Équipements, Commandes et banque).
 * Run from the repo root:  node docs/manuel/scripts/capture/gestion.mjs [membres|candidatures|equipements|commandes]
 *
 * Things it changes in the demo database and puts back before exiting (emulator REST):
 *  - candidatures: converts a trial request into a member, then deletes that member and restores the request;
 *  - commandes: imports a small CODA file, then restores the order and deletes the bank lines it created.
 * It never saves the club bank account.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, close, newPage, go, mark, unmark, shot, USERS } from '../lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '../../screens');
const TMP = (process.env.MANUEL_TMP ?? '/tmp/manuel') + '/gestion';
const DB = process.env.MANUEL_DB ?? 'http://127.0.0.1:9000';
const NS = 'demo-blanmont';
const out = (f) => path.join(OUT, f);
const wanted = process.argv.slice(2);
const want = (k) => wanted.length === 0 || wanted.includes(k);

// Extra demo logins (people of the seed)
USERS.claire = { id: 'm-claire', email: 'claire.dubois@exemple.be', verifiedEmail: 'claire.dubois@exemple.be', name: 'Claire Dubois', role: ['Member'], isAdmin: false };

const rest = async (method, p, body) => {
  const r = await fetch(`${DB}/${p}.json?ns=${NS}`, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  return r.json();
};

/** Make equipment pictures visible: the demo database points at files the repo does not ship. */
async function stubEquipmentImages(page) {
  const img = fs.readFileSync(path.resolve(here, '../../../../public/images/IMG_8019.JPG'));
  await page.route(/_next\/image.*equipment/, (r) => r.fulfill({ status: 200, contentType: 'image/jpeg', body: img }));
  await page.route('**/images/equipment/**', (r) => r.fulfill({ status: 200, contentType: 'image/jpeg', body: img }));
}
const clipFrom = async (page, top, bottom, pad = 8, left = 24) => {
  const t = await top.first().boundingBox();
  const b = await bottom.first().boundingBox();
  const sy = await page.evaluate(() => window.scrollY);
  const x = Math.max(0, t.x - left);
  return { x, y: t.y + sy - pad, width: Math.min(1280, Math.max(t.x + t.width, b.x + b.width) + 16) - x, height: b.y + b.height - t.y + pad * 2 };
};
const tableClip = async (page, scroller, lastRow) => {
  const sc = await scroller.boundingBox();
  const lr = await lastRow.boundingBox();
  const sy = 0;
  return { x: Math.max(0, sc.x - 24), y: sc.y + sy - 24, width: sc.width + 48, height: lr.y + lr.height - sc.y + 48 };
};
const clipIn = async (page, container, top, bottom, pad = 16) => {
  const c = await container.boundingBox();
  const t = await top.first().boundingBox();
  const b = await bottom.first().boundingBox();
  const sy = await page.evaluate(() => window.scrollY);
  return { x: Math.max(0, c.x - pad), y: t.y + sy - pad, width: c.width + pad * 2, height: b.y + b.height - t.y + pad * 2 };
};
/** Viewport clip without fullPage (a full-page capture resets the table's own horizontal scroll). */
const rawShot = (page, file, clip) => page.screenshot({ path: file, type: 'jpeg', quality: 86, animations: 'disabled', clip });
const waitLoaded = async (page) => { await page.waitForTimeout(800); };

await launch();

// ═══════════════ 30 · Membres ═══════════════
if (want('membres')) {
  const page = await newPage({ who: 'admin', height: 1500 });
  await go(page, '/admin/members', { wait: 2000 });
  // List: toolbar, then the table (left part, then scrolled to the right)
  const search = page.getByLabel('Rechercher par nom, rôle ou email');
  const chips = page.getByRole('button', { name: /^Tous \(/ });
  const rows = page.locator('tbody tr');
  const scroller = (await page.evaluateHandle(() => {
    let e = document.querySelector('tbody tr');
    while (e) { if (e.scrollWidth > e.clientWidth + 5 && getComputedStyle(e).overflowX !== 'visible') return e; e = e.parentElement; }
    return null;
  })).asElement();
  await mark(page, [
    { el: search, n: '1' },
    { el: chips, n: '2' },
    { el: page.getByRole('button', { name: /Exporter CSV/i }), n: '3', side: 'right' },
    { el: page.getByRole('button', { name: /Importer CSV/i }), n: '4', side: 'right' },
  ]);
  await shot(page, out('30-liste-barre.jpg'), await clipFrom(page, search, page.getByRole('button', { name: /Importer CSV/i }), 34, 34));
  await unmark(page);
  await mark(page, [
    { el: rows.nth(0).locator('td').nth(0), n: '5' },
    { el: rows.nth(0).locator('td').nth(1), n: '6' },
    { el: rows.nth(0).locator('td').nth(2), n: '7' },
    { el: rows.nth(0).locator('td').nth(3), n: '8' },
  ]);
  await rawShot(page, out('30-liste-gauche.jpg'), await tableClip(page, scroller, rows.nth(3)));
  await unmark(page);
  await scroller.evaluate((el) => { el.style.scrollBehavior = 'auto'; el.scrollLeft = el.scrollWidth; });
  await page.waitForTimeout(900);
  console.log('scrollLeft', await scroller.evaluate((el) => el.scrollLeft));
  await mark(page, [
    { el: rows.nth(0).locator('td').nth(4), n: '9' },
    { el: rows.nth(0).locator('td').nth(5), n: '10' },
  ]);
  await rawShot(page, out('30-liste-droite.jpg'), await tableClip(page, scroller, rows.nth(3)));
  await unmark(page);

  // Filter chips and badges, zoomed on one row with several roles
  await page.getByRole('button', { name: /^Capitaines/ }).click();
  await page.waitForTimeout(500);
  await shot(page, out('30-filtre.jpg'), await clipFrom(page, search, page.locator('tbody tr').nth(1), 18, 30));
  await page.getByRole('button', { name: /^Tous \(/ }).click();

  // ICE dialog
  await go(page, '/admin/members', { wait: 1500 });
  await page.getByTitle("Afficher la fiche d'urgence ICE").first().click();
  await page.waitForTimeout(700);
  const iceRect = await (await page.getByText("Fiche d'Urgence Peloton (ICE)").first().elementHandle()).evaluate((h) => {
    let e = h;
    while (e.parentElement && e.getBoundingClientRect().width < 400) e = e.parentElement;
    const b = e.getBoundingClientRect();
    return { x: b.x - 8, y: b.y - 8, width: b.width + 16, height: b.height + 16 };
  });
  console.log('ice rect', JSON.stringify(iceRect));
  await rawShot(page, out('30-ice.jpg'), iceRect);
  await page.keyboard.press('Escape');

  // New member form (never saved)
  await go(page, '/admin/members/new', { wait: 1500 });
  await page.getByPlaceholder('ex: Lucien Szustak').fill('Lucien Szustak');
  await page.getByPlaceholder('membre@blanmont.be').fill('lucien.szustak@exemple.be');
  await page.getByPlaceholder('+32 470 12 34 56').fill('+32 470 12 34 56');
  await page.getByPlaceholder('ex: 12345678').fill('12345678');
  await page.getByPlaceholder(/Quelques mots/).fill('Aime les cols et les sorties du dimanche.');
  const form = page.locator('form').first();
  await mark(page, [
    { el: page.getByPlaceholder('ex: Lucien Szustak'), n: '1' },
    { el: page.getByPlaceholder('membre@blanmont.be'), n: '2' },
    { el: page.getByPlaceholder('+32 470 12 34 56'), n: '3' },
    { el: page.getByPlaceholder('https://...'), n: '4' },
    { el: page.getByPlaceholder('ex: 12345678'), n: '5' },
    { el: page.getByPlaceholder(/Quelques mots/), n: '6' },
  ]);
  await shot(page, out('30-nouveau-identite.jpg'), await clipFrom(page, page.getByText('Nom complet'), page.getByPlaceholder(/Quelques mots/), 14));
  await unmark(page);
  await page.getByRole('combobox').first().selectOption({ index: 1 });
  await page.locator('input[type="date"]').first().fill('2026-01-15');
  await page.getByPlaceholder(/FFBC-2026/).fill('FFBC-2026-8491');
  await page.getByPlaceholder('ex: Marie Dupont').fill('Marie Dupont');
  await page.getByPlaceholder('ex: +32 479 98 76 54').fill('+32 479 98 76 54');
  await page.getByPlaceholder(/Épouse/).fill('Épouse');
  const cot = page.getByText(/Statut Cotisation 2026/);
  await mark(page, [
    { el: page.getByText(/Statut Cotisation 2026/).locator('xpath=following::*[self::select][1]'), n: '7' },
    { el: page.locator('input[type="date"]').first(), n: '8' },
    { el: page.getByPlaceholder(/FFBC-2026/), n: '9' },
    { el: page.locator('div').filter({ has: page.getByPlaceholder('ex: Marie Dupont') }).last(), n: '10' },
    { el: page.getByText(/Groupe habituel d'allure/).locator('xpath=following::select[1]'), n: '11' },
  ]);
  await shot(page, out('30-nouveau-cotisation.jpg'), await clipFrom(page, page.getByText(/^Cotisation 2026, Licence/i), page.getByText(/Groupe habituel d'allure/).locator('xpath=following::select[1]'), 14));
  await unmark(page);
  await page.getByRole('button', { name: /Traceur/ }).first().click().catch(() => {});
  await page.waitForTimeout(400);
  const rolesTop = page.getByText(/Rôle\(s\) & Responsabilités au Club/);
  await mark(page, [
    { el: page.locator('div.grid').filter({ hasText: 'Capitaine de Route' }).filter({ hasText: 'Administrateur' }).last(), n: '12', pad: 6 },
    { el: page.locator('div').filter({ has: page.getByText(/Suggestions rapides/) }).filter({ has: page.getByText(/Spécialités/i) }).last(), n: '13', pad: 6 },
  ]);
  await shot(page, out('30-nouveau-roles.jpg'), await clipFrom(page, rolesTop, page.locator('div').filter({ has: page.getByText(/Suggestions rapides/) }).filter({ has: page.getByText(/Spécialités/i) }).last(), 40, 30));
  await unmark(page);
  await shot(page, out('30-nouveau-boutons.jpg'), await clipFrom(page, page.getByText('Annuler', { exact: true }).first(), page.getByText(/Créer le membre/).first(), 10));

  // Edit page: photo block
  await go(page, '/admin/members/m-julie/edit', { wait: 3000 });
  await mark(page, [
    { el: page.getByText(/Ouvrir l'atelier de cadrage/), n: '1' },
    { el: page.getByText(/Aperçu rendu/i).locator('xpath=following::div[1]'), n: '2' },
    { el: page.locator('input[type="file"]').first(), n: '3' },
    { el: page.getByPlaceholder(/URL manuelle/), n: '4' },
  ]);
  await shot(page, out('30-edit-photo.jpg'), await clipIn(page, page.locator('form').first(), page.getByText(/Photo de profil & Cadrage/i), page.getByText(/Strava Athlete ID/)));
  await unmark(page);

  // Reset password
  await go(page, '/admin/members/m-julie/reset-password', { wait: 1500 });
  await page.getByPlaceholder(/Minimum 6/).fill('Ete2026!');
  await mark(page, [
    { el: page.getByPlaceholder(/Minimum 6/), n: '1' },
    { el: page.getByRole('button', { name: 'Réinitialiser', exact: true }), n: '2' },
  ]);
  await shot(page, out('30-reset.jpg'), await clipIn(page, page.locator('form').first(), page.locator('form').first(), page.getByRole('button', { name: 'Réinitialiser', exact: true }), 24));
  await unmark(page);

  // Portraits & cadrage
  await go(page, '/admin/members/photos', { wait: 2000 });
  await page.getByRole('button', { name: /^Tous \(/ }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /Vue Liste/i }).click().catch(() => {});
  await page.waitForTimeout(600);
  const pSearch = page.getByPlaceholder(/Rechercher un membre/);
  await mark(page, [
    { el: pSearch, n: '1' },
    { el: page.getByRole('button', { name: /^Avec photo/ }), n: '2' },
    { el: page.getByRole('button', { name: /^Tous \(/ }), n: '3' },
    { el: page.getByRole('button', { name: /Vue Liste/i }), n: '4', side: 'right' },
    { el: page.getByRole('button', { name: /Téléverser/ }).first(), n: '5' },
    { el: page.getByRole('button', { name: /Sauver/i }).first(), n: '6' },
  ]);
  await shot(page, out('30-portraits.jpg'), await clipFrom(page, pSearch, page.getByRole('button', { name: /Sauver/i }).nth(2), 34, 34));
  await unmark(page);

  // CSV import dialog with a preview (nothing is confirmed)
  await go(page, '/admin/members', { wait: 1500 });
  await page.getByRole('button', { name: /Importer CSV/i }).click();
  await page.waitForTimeout(500);
  const csv = ['ID;Nom;Email;Téléphone;Groupe;Cotisation 2026',
    'm-julie;Julie Renard;julie.renard@exemple.be;+32 476 16 38 36;B;paid',
    ';Lucien Szustak;lucien.szustak@exemple.be;+32 470 12 34 56;B;pending',
    'm-inconnu;Personne Inconnue;;;C;paid',
    'm-claire;Claire Dubois;paul.hermans@exemple.be;;BC;paid',
    'm-thomas;Thomas Leclercq;thomas.leclercq@exemple.be;+32 477 99 99 99;A;paid'].join('\r\n');
  fs.mkdirSync(TMP, { recursive: true });
  fs.writeFileSync(path.join(TMP, 'membres-demo.csv'), csv, 'utf8');
  await page.locator('input[type="file"]').setInputFiles(path.join(TMP, 'membres-demo.csv'));
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const d = document.querySelector('[aria-labelledby="members-csv-title"]');
    const c = [...d.querySelectorAll('div')].find((x) => { const b = x.getBoundingClientRect(); return b.width > 400 && b.width < 900 && b.height > 300; });
    const b = (c ?? d).getBoundingClientRect();
    return { x: b.x - 10, y: b.y - 10, width: b.width + 20, height: b.height + 20 };
  });
  await rawShot(page, out('30-import.jpg'), r);
  await page.keyboard.press('Escape');

  // Public side: /members (visitor), and the member's phone screens
  const v = await newPage({ who: 'none' });
  await go(v, '/members', { wait: 2500 });
  await shot(v, out('30-site-membres.jpg'), { x: 0, y: 0, width: 1280, height: 860 });
  const ph = await newPage({ who: 'membre', width: 390, height: 844, mobile: true, scale: 2 });
  // /profile bounces to /login when opened cold (client-side check): reach it from the pass page instead
  await go(ph, '/profile/pass', { wait: 3000 });
  await ph.getByRole('link', { name: /Mon profil/i }).first().click();
  await ph.waitForTimeout(3500);
  const profH = await ph.evaluate(() => document.documentElement.scrollHeight);
  console.log('profile height', profH, ph.url());
  await shot(ph, out('30-profil-tel.jpg'), { x: 0, y: 60, width: 390, height: 1150 });
  await shot(ph, out('30-profil-tel-2.jpg'), { x: 0, y: 1150, width: 390, height: 940 });
  await go(ph, '/profile/pass', { wait: 2500 });
  await shot(ph, out('30-pass-tel.jpg'), { x: 0, y: 100, width: 390, height: 1100 });
  await shot(ph, out('30-pass-tel-2.jpg'), { x: 0, y: 1620, width: 390, height: 780 });
  const lg = await newPage({ who: 'none', width: 390, height: 844, mobile: true, scale: 2 });
  await go(lg, '/login', { wait: 2000 });
  await lg.getByRole('button', { name: /1ère Connexion/ }).click().catch(() => {});
  await lg.waitForTimeout(500);
  await shot(lg, out('30-activation-tel.jpg'));
}


// ═══════════════ 31 · Candidatures ═══════════════
if (want('candidatures')) {
  // Public form
  const v = await newPage({ who: 'none', height: 1000 });
  await go(v, '/rejoindre', { wait: 2500 });
  const formHead = v.getByText(/Réservez votre première sortie d'essai gratuite/);
  await v.getByText('Confirmer ma demande').first().scrollIntoViewIfNeeded();
  await v.evaluate(() => window.scrollTo(0, 0));
  const fh = await formHead.first().boundingBox();
  await shot(v, out('31-rejoindre-form.jpg'), await clipFrom(v, formHead, v.getByRole('button', { name: /Confirmer ma demande/ }), 20, 40));
  const tel = await newPage({ who: 'none', width: 390, height: 844, mobile: true, scale: 2 });
  await go(tel, '/rejoindre', { wait: 2500 });
  const fy = (await tel.getByText(/Réservez votre première sortie/).first().boundingBox()).y + (await tel.evaluate(() => window.scrollY));
  console.log('rejoindre phone form at', fy);
  await shot(tel, out('31-rejoindre-tel.jpg'), { x: 0, y: fy - 20, width: 390, height: 1150 });
  await shot(tel, out('31-rejoindre-tel-2.jpg'), { x: 0, y: fy + 1130, width: 390, height: 560 });

  const page = await newPage({ who: 'admin', height: 1500 });
  // Dashboard alert
  await go(page, '/admin', { wait: 3000 });
  const alert = page.locator('section[aria-labelledby="pending-trials-heading"]');
  if (await alert.count()) await shot(page, out('31-tableau-de-bord.jpg'), alert, { pad: 10 });

  await go(page, '/admin/prospects', { wait: 2500 });
  await mark(page, [
    { el: page.getByText('Formulaire public').first(), n: '1' },
    { el: page.getByRole('button', { name: /Exporter CSV/i }), n: '2' },
    { el: page.getByText('Action requise').first().locator('xpath=ancestor::div[3]'), n: '3', pad: 2 },
    { el: page.getByRole('button', { name: /^Tous\s*\d/ }).first(), n: '4' },
    { el: page.getByPlaceholder(/Rechercher par nom, email/), n: '5' },
    { el: page.getByLabel('Filtrer par groupe de vitesse'), n: '6' },
    { el: page.getByLabel('Filtrer par type de vélo'), n: '7' },
  ]);
  await shot(page, out('31-onglets.jpg'), await clipFrom(page, page.getByRole('heading', { level: 1 }).first(), page.getByLabel('Filtrer par type de vélo'), 40, 72));
  await unmark(page);
  await shot(page, out('31-tableau.jpg'), await clipFrom(page, page.locator('thead').first(), page.locator('tbody tr').nth(4), 14, 20));

  // The sheet of a candidate (never saved here)
  const modalBox = async () => page.evaluate(() => {
    const d = document.querySelector('[aria-labelledby="prospect-modal-title"]');
    const c = [...d.querySelectorAll('div')].find((x) => { const b = x.getBoundingClientRect(); return b.width > 500 && b.width < 1000 && b.height > 300; });
    const b = (c ?? d).getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  const SPLIT = 480;
  await page.locator('tbody tr').first().click();
  await page.waitForTimeout(900);
  let mb = await modalBox();
  await mark(page, [
    { el: page.getByText('Message WhatsApp Pré-rempli', { exact: false }).first(), n: '1' },
    { el: page.getByRole('link', { name: /\+32 478 11 22 33/ }).first(), n: '2' },
    { el: page.getByRole('link', { name: /antoine.lemaire@exemple.be/ }).first(), n: '3' },
  ]);
  await rawShot(page, out('31-fiche-1.jpg'), { x: mb.x - 12, y: mb.y - 6, width: mb.width + 24, height: SPLIT });
  await unmark(page);
  await mark(page, [
    { el: page.getByRole('button', { name: /^Contacté/ }).first(), n: '4' },
    { el: page.locator('select').filter({ hasText: /Aucun capitaine/ }).first(), n: '5' },
    { el: page.getByRole('button', { name: /Enregistrer Capitaine/ }), n: '6' },
    { el: page.locator('textarea').last(), n: '7' },
    { el: page.getByRole('button', { name: /Convertir en Membre Club/ }), n: '8' },
    { el: page.getByRole('button', { name: /Supprimer cette fiche/ }), n: '9' },
    { el: page.getByRole('button', { name: /Sans suite/ }).last(), n: '10' },
  ]);
  await rawShot(page, out('31-fiche-2.jpg'), { x: mb.x - 12, y: mb.y + SPLIT, width: mb.width + 24, height: mb.height - SPLIT + 12 });
  await unmark(page);

  // Convert Antoine into a member, show the result, then put everything back
  const orig = await rest('GET', 'trial-requests/trial_1');
  const before = Object.keys((await rest('GET', 'members')) ?? {});
  try {
    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Convertir en Membre Club/ }).click();
    await page.waitForTimeout(2500);
    mb = await modalBox().catch(() => null);
    if (mb) await rawShot(page, out('31-converti.jpg'), { x: mb.x - 12, y: mb.y + SPLIT, width: mb.width + 24, height: mb.height - SPLIT + 12 });
    await go(page, '/admin/members', { wait: 2000 });
    await page.getByLabel('Rechercher par nom, rôle ou email').fill('Lemaire');
    await page.waitForTimeout(700);
    const head = page.getByLabel('Rechercher par nom, rôle ou email');
    await shot(page, out('31-converti-membre.jpg'), await clipFrom(page, head, page.locator('tbody tr').first(), 30, 30));
  } finally {
    await rest('PUT', 'trial-requests/trial_1', orig);
    const after = (await rest('GET', 'members')) ?? {};
    for (const k of Object.keys(after)) if (!before.includes(k)) { await rest('DELETE', `members/${k}`); console.log('removed demo member', k); }
  }
}

// ═══════════════ 32 · Équipements ═══════════════
if (want('equipements')) {
  const page = await newPage({ who: 'admin', height: 1500 });
  await stubEquipmentImages(page);
  await go(page, '/admin/equipements', { wait: 3500 });
  const eSearch = page.getByPlaceholder('Rechercher un équipement...');
  const eRows = page.locator('tbody tr');
  await mark(page, [
    { el: eSearch, n: '1' },
    { el: page.getByRole('button', { name: 'Maillot', exact: true }), n: '2' },
    { el: page.getByText('Total Articles').locator('xpath=ancestor::div[1]'), n: '3', pad: 2 },
  ]);
  await shot(page, out('32-liste-haut.jpg'), await clipFrom(page, eSearch, page.getByText('Valeur Stock').locator('xpath=ancestor::div[1]'), 30, 30));
  await unmark(page);
  await mark(page, [
    { el: eRows.nth(0).locator('td').nth(0), n: '4' },
    { el: eRows.nth(0).locator('td').nth(3), n: '5' },
    { el: eRows.nth(0).locator('td').nth(4), n: '6' },
    { el: eRows.nth(0).locator('td').nth(5), n: '7' },
  ]);
  await shot(page, out('32-liste-tableau.jpg'), await clipFrom(page, page.locator('thead').first(), eRows.nth(2), 14, 30));
  await unmark(page);
  await shot(page, out('32-liste-epuise.jpg'), await clipFrom(page, eRows.nth(5), eRows.nth(5), 10, 20));

  await go(page, '/admin/equipements/MaiCXPRO', { wait: 3500 });
  await shot(page, out('32-detail.jpg'), await clipFrom(page, page.getByText(/Détails de l.équipement/), page.getByText('Stock par taille').first().locator('xpath=ancestor::div[2]'), 30, 80));

  await go(page, '/admin/equipements/MaiCXPRO/edit', { wait: 4500 });
  await mark(page, [
    { el: page.getByText('Image du produit').locator('xpath=following::div[1]'), n: '1' },
    { el: page.getByText('Nom du produit'), n: '2' },
    { el: page.getByText(/^Catégorie/), n: '3' },
    { el: page.getByText(/^Prix/), n: '4' },
    { el: page.getByText('Code produit'), n: '5' },
    { el: page.getByText('Référence GOBIK'), n: '6' },
    { el: page.getByText('Description', { exact: true }), n: '7' },
    { el: page.getByText('Disponibilité', { exact: true }).locator('xpath=ancestor::div[2]'), n: '8', pad: 2 },
  ]);
  await shot(page, out('32-edit-infos.jpg'), await clipFrom(page, page.getByText('Image du produit'), page.getByText('Disponibilité', { exact: true }).locator('xpath=ancestor::div[2]'), 30, 40));
  await unmark(page);
  await mark(page, [
    { el: page.getByText('Tailles disponibles').locator('xpath=following::div[1]'), n: '9' },
    { el: page.getByText('Stock par taille').locator('xpath=following::div[1]'), n: '10' },
    { el: page.getByRole('button', { name: 'Enregistrer' }), n: '11' },
    { el: page.getByText('Annuler', { exact: true }).last(), n: '12' },
  ]);
  await shot(page, out('32-edit-stock.jpg'), await clipFrom(page, page.getByText('Tailles et Stock'), page.getByRole('button', { name: 'Enregistrer' }), 30, 40));
  await unmark(page);

  // Public shop and checkout
  const v = await newPage({ who: 'none', height: 1500 });
  await go(v, '/le-club/equipement', { wait: 3500 });
  await v.getByText('Commande groupée ouverte').first().waitFor({ timeout: 20000 });
  await mark(v, [
    { el: v.locator('aside[aria-label="Commande groupée ouverte"]'), n: '1', pad: 2 },
    { el: v.locator('section[aria-labelledby="order-howto-title"]'), n: '2', pad: 2 },
  ]);
  await shot(v, out('32-boutique-haut.jpg'), await clipFrom(v, v.locator('aside[aria-label="Commande groupée ouverte"]'), v.locator('section[aria-labelledby="order-howto-title"]'), 30, 40));
  await unmark(v);
  const barY = (await v.getByText(/Catégories/i).first().boundingBox()).y + (await v.evaluate(() => window.scrollY));
  await shot(v, out('32-boutique-produits.jpg'), { x: 0, y: barY - 24, width: 1280, height: 860 });
  const ph = await newPage({ who: 'membre', width: 390, height: 844, mobile: true, scale: 2 });
  await go(ph, '/checkout', { wait: 4000 });
  const Y = async (loc) => (await loc.first().boundingBox()).y + (await ph.evaluate(() => window.scrollY));
  const y1 = await Y(ph.getByRole('heading', { name: "Sélection de l'article" }));
  const y3 = await Y(ph.getByRole('heading', { name: 'Votre commande' }));
  const y4 = await Y(ph.getByRole('button', { name: /Commander et payer/ }));
  console.log('checkout', y1, y3, y4);
  await shot(ph, out('32-checkout-tel-1.jpg'), { x: 0, y: y1 - 24, width: 390, height: 950 });
  await shot(ph, out('32-checkout-tel-2.jpg'), { x: 0, y: y3 - 300, width: 390, height: y4 - y3 + 300 + 60 });
}

// ═══════════════ 33 · Commandes, commandes groupées et banque ═══════════════
if (want('commandes')) {
  const page = await newPage({ who: 'admin', height: 1500 });
  const cardOf = (name) => page.locator('ul > li').filter({ hasText: name }).first();

  // Orders list
  await go(page, '/admin/commandes', { wait: 3000 });
  await mark(page, [
    { el: page.getByRole('link', { name: /Commandes groupées/i }), n: '1' },
    { el: page.getByRole('link', { name: /^Banque/i }), n: '2' },
    { el: page.getByRole('button', { name: /Exporter CSV/i }).or(page.getByRole('link', { name: /Exporter CSV/i })).first(), n: '3' },
    { el: page.getByRole('group', { name: 'Filtrer par statut' }), n: '4' },
  ]);
  await shot(page, out('33-liste-entete.jpg'), await clipFrom(page, page.getByRole('heading', { level: 1 }).first(), page.getByRole('group', { name: 'Filtrer par statut' }), 40, 110));
  await unmark(page);
  const tho = cardOf('Thomas Leclercq');
  await mark(page, [
    { el: tho.getByText('En attente de paiement').first(), n: '5' },
    { el: tho.getByText('Commande groupée').first(), n: '6' },
    { el: tho.getByText(/\+\+\+/).first(), n: '7' },
    { el: tho.getByRole('button', { name: /Marquer payé/ }), n: '8' },
    { el: tho.getByRole('button', { name: /^Annuler/ }), n: '9' },
    { el: tho.getByRole('button', { name: /Supprimer la commande/ }), n: '10' },
  ]);
  await shot(page, out('33-commande-attente.jpg'), tho, { pad: 24 });
  await unmark(page);
  const jul = cardOf('Julie Renard');
  await mark(page, [
    { el: jul.getByRole('button', { name: /^Remis/ }), n: '11' },
    { el: jul.getByRole('button', { name: /^Annuler/ }), n: '12' },
  ]);
  await shot(page, out('33-commande-payee.jpg'), jul, { pad: 24 });
  await unmark(page);

  // Cash payment by hand on Vincent's stock order (then restored)
  const ordersBefore = (await rest('GET', 'equipment-orders')) ?? {};
  const vKey = Object.keys(ordersBefore).find((k) => ordersBefore[k].memberName === 'Vincent Lambotte');
  const vOrig = ordersBefore[vKey];
  try {
    await cardOf('Vincent Lambotte').getByRole('button', { name: /Marquer payé/ }).click();
    await page.waitForTimeout(2500);
    await shot(page, out('33-commande-payee-main.jpg'), cardOf('Vincent Lambotte'), { pad: 24 });
    await cardOf('Vincent Lambotte').getByRole('button', { name: /^Remis/ }).click();
    await page.waitForTimeout(2500);
    await shot(page, out('33-commande-remise.jpg'), cardOf('Vincent Lambotte'), { pad: 24 });
  } finally {
    await rest('PUT', `equipment-orders/${vKey}`, vOrig);
  }
  // Cancel confirmation text (accepted? no: dismissed)
  page.once('dialog', async (d) => { console.log('confirm:', d.message()); await d.dismiss(); });
  await go(page, '/admin/commandes', { wait: 2500 });
  await cardOf('Julie Renard').getByRole('button', { name: /^Annuler/ }).click();
  await page.waitForTimeout(500);

  // Group orders: list + form
  await go(page, '/admin/commandes/campagnes', { wait: 3000 });
  await shot(page, out('33-campagnes-liste.jpg'), await clipFrom(page, page.getByRole('heading', { level: 1 }).first(), page.getByText('Vestes d’hiver 2026').first().locator('xpath=ancestor::li[1]'), 40, 72));
  await page.getByPlaceholder(/Commande groupée printemps 2027/).fill('Maillots été 2027');
  await page.locator('input[type="datetime-local"]').fill('2027-03-20T19:00');
  await page.getByText('Maillot Manche courte CX PRO Homme').last().click();
  await page.getByText('Cuissard court Homme').last().click();
  await page.getByText(/Unités supplémentaires/).first().click();
  await page.waitForTimeout(400);
  const formEl = page.getByText('Nouvelle commande groupée').first();
  await mark(page, [
    { el: page.getByPlaceholder(/Commande groupée printemps 2027/), n: '1' },
    { el: page.locator('input[type="datetime-local"]'), n: '2' },
    { el: page.getByText('Articles de la commande').locator('xpath=following::div[1]'), n: '3', pad: 6 },
    { el: page.getByText(/Unités supplémentaires/).first(), n: '4' },
    { el: page.getByRole('button', { name: /Créer la commande groupée/ }), n: '5' },
  ]);
  await shot(page, out('33-campagne-formulaire.jpg'), await clipFrom(page, formEl, page.getByRole('button', { name: /Créer la commande groupée/ }), 30, 40));
  await unmark(page);

  // Group order detail (open) and distribution (received)
  await go(page, '/admin/commandes/campagnes/campaign_2026_maillots', { wait: 3500 });
  await mark(page, [
    { el: page.locator('section[aria-labelledby="stepper-title"]'), n: '1', pad: 2 },
    { el: page.getByRole('button', { name: /Clôturer la commande/ }), n: '2' },
  ]);
  await shot(page, out('33-campagne-etapes.jpg'), await clipFrom(page, page.getByRole('heading', { level: 1 }).first(), page.locator('section[role="status"]'), 14, 110));
  await unmark(page);
  await mark(page, [
    { el: page.locator('section[role="status"]'), n: '3', pad: 2 },
    { el: page.getByRole('button', { name: /Exporter CSV/ }), n: '4' },
    { el: page.locator('section[aria-labelledby="matrix-title"] table'), n: '5', pad: 2 },
  ]);
  await shot(page, out('33-campagne-matrice.jpg'), await clipFrom(page, page.locator('section[role="status"]'), page.locator('section[aria-labelledby="matrix-title"] table'), 30, 40));
  await unmark(page);
  await go(page, '/admin/commandes/campagnes/campaign_2026_vestes', { wait: 3500 });
  await mark(page, [
    { el: page.locator('section[aria-labelledby="handover-title"]'), n: '1', pad: 2 },
    { el: page.getByRole('button', { name: /comme remise/ }).first(), n: '2' },
  ]);
  await shot(page, out('33-campagne-distribution.jpg'), await clipFrom(page, page.locator('section[aria-labelledby="stepper-title"]'), page.locator('section[aria-labelledby="handover-title"]'), 30, 40));
  await unmark(page);

  // ── Bank page ──
  const ogm = (ref) => ref;
  await go(page, '/admin/commandes/banque', { wait: 4000 });
  const importCard = page.getByText('Importer un extrait CODA').first();
  await mark(page, [
    { el: page.locator('input[type="file"]'), n: '1' },
    { el: page.getByRole('button', { name: 'Importer', exact: true }), n: '2' },
    { el: page.locator('section[aria-labelledby="unmatched-title"] li').first().locator('select'), n: '3' },
    { el: page.locator('section[aria-labelledby="unmatched-title"] li').first().getByRole('button', { name: /Associer/ }), n: '4' },
    { el: page.locator('section[aria-labelledby="unmatched-title"] li').first().getByRole('button', { name: /Ignorer/ }), n: '5' },
  ]);
  await shot(page, out('33-banque-import.jpg'), await clipFrom(page, importCard, page.locator('section[aria-labelledby="unmatched-title"] li').last(), 30, 40));
  await unmark(page);
  // Pending orders, to pick one by hand (nothing is assigned)
  await page.locator('section[aria-labelledby="unmatched-title"] li').first().locator('select').selectOption({ index: 1 });
  await page.waitForTimeout(300);
  await shot(page, out('33-banque-associer.jpg'), page.locator('section[aria-labelledby="unmatched-title"] li').first(), { pad: 16 });
  await page.getByText(/Derniers paiements rapprochés/).first().click();
  await page.waitForTimeout(400);
  await shot(page, out('33-banque-rapproches.jpg'), page.locator('details').first(), { pad: 14 });
  // Club account card (never saved)
  const acc = page.getByText(/Paiements — compte du club/).first();
  await mark(page, [
    { el: page.getByLabel('Bénéficiaire'), n: '1' },
    { el: page.getByLabel('IBAN'), n: '2' },
    { el: page.getByLabel(/BIC/), n: '3' },
    { el: page.getByRole('button', { name: 'Enregistrer', exact: true }), n: '4' },
    { el: page.getByText(/Test de 1,00/).locator('xpath=ancestor::div[1]'), n: '5', pad: 2 },
  ]);
  const accClip = await clipFrom(page, acc, page.getByRole('button', { name: 'Enregistrer', exact: true }), 30, 40);
  accClip.width = 1268 - accClip.x;
  await shot(page, out('33-banque-compte.jpg'), accClip);
  await unmark(page);

  // ── CODA import: build a small valid file from the orders in the database, import it, put everything back ──
  const orders = (await rest('GET', 'equipment-orders')) ?? {};
  const byName = (n) => Object.values(orders).find((o) => o.memberName === n);
  const bankBefore = Object.keys((await rest('GET', 'bank-transactions')) ?? {});
  const ordersSnapshot = JSON.parse(JSON.stringify(orders));
  // A well-formed structured communication that belongs to no order: base 1 + 9 digits, check = base mod 97 (0 becomes 97)
  const unknownOgm = '1000009990' + String(Number(BigInt('1000009990') % 97n) || 97).padStart(2, '0');
  const rec = (f) => { const c = Array(128).fill(' '); for (const [pos, t] of Object.entries(f)) [...t].forEach((ch, i) => (c[pos - 1 + i] = ch)); return c.join(''); };
  const mv = ({ seq, ref, cents, date, ogm: o, text = '', iban, name }) => [
    rec({ 1: '21', 3: seq, 7: '0000', 11: ref, 32: '0', 33: String(cents * 10).padStart(15, '0'), 48: date, 62: o ? '1' : '0', 63: o ? '101' + o : text }),
    rec({ 1: '23', 3: seq, 11: iban, 45: 'EUR', 48: name }),
  ];
  const d = new Date(); const ddmmyy = String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0') + String(d.getFullYear()).slice(2);
  const lines = [
    rec({ 1: '0', 2: '0000', 6: ddmmyy, 12: '539', 15: '05', 25: 'CLUB CYCLO BLANMONT', 128: '2' }),
    rec({ 1: '1', 2: '0', 3: 'BE68539007547034', 43: '0', 44: '000000000500000', 59: ddmmyy, 128: '1' }),
    ...mv({ seq: '0001', ref: '0001BE0001', cents: 8300, date: ddmmyy, ogm: byName('Thomas Leclercq').paymentReference, iban: 'BE71096123456769', name: 'THOMAS LECLERCQ' }),
    ...mv({ seq: '0002', ref: '0002BE0002', cents: 8000, date: ddmmyy, ogm: byName('Vincent Lambotte').paymentReference, iban: 'BE62510007547061', name: 'VINCENT LAMBOTTE' }),
    ...mv({ seq: '0003', ref: '0003BE0003', cents: 4500, date: ddmmyy, text: 'COTISATION 2026 PAUL', iban: 'BE43068999999501', name: 'PAUL WOUTERS' }),
    ...mv({ seq: '0004', ref: '0004BE0004', cents: 10500, date: ddmmyy, ogm: unknownOgm, iban: 'BE12345678901234', name: 'ANNE MARTIN' }),
    ...mv({ seq: '0005', ref: '0005BE0005', cents: 17800, date: ddmmyy, ogm: byName('Julie Renard').paymentReference, iban: 'BE91123456789012', name: 'JULIE RENARD' }),
    rec({ 1: '8', 2: '001', 6: 'BE68539007547034', 42: 'EUR', 43: '0', 44: '000000000500000', 59: ddmmyy, 128: '0' }),
    rec({ 1: '9' }),
  ];
  const codaPath = path.join(TMP, 'extrait-demo.cod');
  fs.writeFileSync(codaPath, lines.join('\r\n') + '\r\n', 'latin1');
  try {
    await page.locator('input[type="file"]').setInputFiles(codaPath);
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Importer', exact: true }).click();
    await page.waitForTimeout(3500);
    await shot(page, out('33-banque-resume.jpg'), await clipFrom(page, page.getByText('Importer un extrait CODA').first(), page.locator('section[aria-labelledby="unmatched-title"] li').last(), 30, 40));
    await shot(page, out('33-banque-raisons.jpg'), page.locator('section[aria-labelledby="unmatched-title"]'), { pad: 16 });
    // The matched order, in the orders list
    await go(page, '/admin/commandes', { wait: 3000 });
    await shot(page, out('33-commande-rapprochee.jpg'), page.locator('ul > li').filter({ hasText: 'Thomas Leclercq' }).first(), { pad: 24 });
  } finally {
    for (const [k, o] of Object.entries(ordersSnapshot)) await rest('PUT', `equipment-orders/${k}`, o);
    const afterBank = (await rest('GET', 'bank-transactions')) ?? {};
    for (const k of Object.keys(afterBank)) if (!bankBefore.includes(k)) await rest('DELETE', `bank-transactions/${k}`);
    console.log('restored orders and bank lines');
  }

  // ── Member side: Claire has an order waiting for payment ──
  const mp = await newPage({ who: 'claire', width: 390, height: 844, mobile: true, scale: 2 });
  await go(mp, '/profile/commandes', { wait: 3500 });
  console.log('commandes url', mp.url());
  const mh = await mp.evaluate(() => document.documentElement.scrollHeight);
  console.log('member orders height', mh);
  const li0 = mp.locator('main li, ol ~ *').first();
  const cardLi = mp.locator('li').filter({ has: mp.getByText('Payer', { exact: true }) }).first();
  await shot(mp, out('33-membre-commandes-tel.jpg'), { x: 0, y: 60, width: 390, height: 1150 });
  await mp.getByText('Payer', { exact: true }).first().click();
  await mp.waitForTimeout(2000);
  await mp.evaluate(() => window.scrollTo(0, 0));
  await mp.waitForTimeout(500);
  const cb = await cardLi.boundingBox();
  const sy = 0;
  console.log('payment card li', JSON.stringify(cb), sy);
  await shot(mp, out('33-membre-paiement-tel.jpg'), { x: 0, y: cb.y + sy - 16, width: 390, height: Math.min(cb.height + 32, 1250) });
  USERS.nathalie = { id: 'm-nathalie', email: 'nathalie.pirson@exemple.be', verifiedEmail: 'nathalie.pirson@exemple.be', name: 'Nathalie Pirson', role: ['Member'], isAdmin: false };
  const mj = await newPage({ who: 'nathalie', width: 390, height: 844, mobile: true, scale: 2 });
  await go(mj, '/profile/commandes', { wait: 3500 });
  const lj = mj.locator('li').filter({ hasText: 'Veste Homme' }).first();
  await shot(mj, out('33-membre-dates-tel.jpg'), lj, { pad: 12 });
}

await close();
