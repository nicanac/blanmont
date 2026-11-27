/**
 * Captures for chapters 10 to 14 (Rituels & Sorties): sondage, calendrier, traces, pointage, carré vert.
 * Run from the repo root: node docs/manuel/scripts/capture/rituels.mjs   (ONLY=10,12 to run some parts)
 * Everything created here is deleted at the end; the attendance of the 28 Nov ride is restored.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { launch, close, newPage, go, mark, unmark, shot } from '../lib.mjs';

const OUT = path.resolve('docs/manuel/screens');
const SCRATCH = (process.env.MANUEL_TMP ?? '/tmp/manuel') + '/rituels';
const DB = `http://127.0.0.1:9000`; // database emulator (REST), only to restore my own test data
const NS = 'demo-blanmont';
const only = (process.env.ONLY ?? '10,11,12,13,14,P').split(',');
const f = (n) => path.join(OUT, n);
// copied under a plain name: the browser driver drops uploads whose file name has an accent
fs.mkdirSync(SCRATCH, { recursive: true });
fs.copyFileSync(path.resolve('public/2026-Calendrier Vélo CC Saint-Martin Blanmont.pdf'), path.join(SCRATCH, 'calendrier.pdf'));
const PDF = path.join(SCRATCH, 'calendrier.pdf');

// ---- helpers ---------------------------------------------------------------
/** Page-coordinate clip that contains all the locators (+ padding). */
/** Sticky bars and fixed bottom bars would land in the middle of a full-page crop: flatten them. */
async function flat(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'sticky') el.style.position = 'static';
      else if (cs.position === 'fixed' && el.getBoundingClientRect().bottom >= innerHeight - 4 && el.getBoundingClientRect().height < 200) el.style.display = 'none';
    }
  });
}
async function region(page, locs, pad = 10, opts = {}) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  const sx = await page.evaluate(() => window.scrollX);
  const sy = await page.evaluate(() => window.scrollY);
  let x1 = 1e9, y1 = 1e9, x2 = 0, y2 = 0;
  for (const l of locs) {
    const b = await l.first().boundingBox();
    if (!b) throw new Error('region: not found ' + String(l));
    x1 = Math.min(x1, b.x + sx); y1 = Math.min(y1, b.y + sy);
    x2 = Math.max(x2, b.x + sx + b.width); y2 = Math.max(y2, b.y + sy + b.height);
  }
  y1 = Math.max(0, y1 - pad);
  if (opts.tight) return { x: Math.max(0, x1 - pad), y: y1, width: x2 + pad - x1 + pad, height: y2 + pad - (y1 + 0) };
  if (opts.full) return { x: 0, y: y1, width: page.viewportSize().width, height: y2 + pad - y1 };
  if (page.url().includes('/admin') || page.url().includes('/import/')) {
    // admin screens: always the full width of the content area, so nothing is cut at the sides
    const m = page.locator('main.flex-1').first();
    const mb = (await m.count()) ? await m.boundingBox() : null;
    if (mb) return { x: Math.max(0, mb.x + sx - 6), y: y1, width: mb.width + 12, height: y2 + pad - y1 };
  }
  x1 = Math.max(0, x1 - pad - 14);
  return { x: x1, y: y1, width: x2 + pad + 6 - x1, height: y2 + pad - y1 };
}
const waitIdle = (page, ms = 1200) => page.waitForTimeout(ms);
async function dbGet(p) { return (await fetch(`${DB}/${p}.json?ns=${NS}&auth=owner`)).json(); }
async function dbPut(p, v) {
  const r = await fetch(`${DB}/${p}.json?ns=${NS}&auth=owner`, { method: v === null ? 'DELETE' : 'PUT', body: JSON.stringify(v) });
  if (!r.ok) throw new Error('db put ' + p);
}

// Same rules as app/admin/events/import/actions.ts (parsePdfText), used only to feed the preview screenshot.
const MONTHS = { janvier: '01', février: '02', mars: '03', avril: '04', mai: '05', juin: '06', juillet: '07', août: '08', septembre: '09', octobre: '10', novembre: '11', décembre: '12' };
function parsePdfText(text) {
  const events = [];
  const dateRegex = /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s*(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(20\d{2})(.*)$/i;
  let n = 1;
  for (const line of text.split('\n')) {
    const m = line.trim().match(dateRegex);
    if (!m) continue;
    const isoDate = `${m[4]}-${MONTHS[m[3].toLowerCase()]}-${m[2].padStart(2, '0')}`;
    const work = m[5].trim().replace(/\s+/g, ' ');
    let location = '', distances = '', departure = '', address = '';
    const dm = work.match(/(\d{2,3}(?:-\d{2,3})+)/);
    const di = dm ? work.indexOf(dm[1]) : -1;
    if (dm) distances = dm[1];
    if (di > 0) {
      const prefix = work.substring(0, di);
      if (prefix.startsWith('Club')) { location = 'Blanmont'; const plain = prefix.replace(/^Club/, '').trim(); if (plain) location = plain; } else location = prefix.trim();
      const suffix = work.substring(di + distances.length);
      const tm = suffix.match(/(\d{1,2}h(?:\d{2})?)/);
      if (tm) { departure = tm[1]; address = suffix.substring(suffix.indexOf(departure) + departure.length).trim(); if (address.startsWith('FECHERE')) address = 'Place de Féchère'; } else address = suffix.trim();
    } else location = work;
    events.push({ id: `temp-${n++}`, isoDate, location: location || 'Blanmont', distances: distances || '70-90', departure: departure || '8h30', address: address || 'Place de Blanmont', remarks: '', alternative: '', group: 'Blanmont', gpxUrl: '' });
  }
  return events;
}
const goA = async (page, p, o) => { await go(page, p, o); if (page === admin) await flat(page); };
const main = (page) => page.locator('main.flex-1').first();

// leftovers of an interrupted run
const evs = (await dbGet('calendar-events')) ?? {};
for (const [k, v] of Object.entries(evs)) if (v?.isoDate === '2026-12-13') await dbPut(`calendar-events/${k}`, null);

await launch();
const admin = await newPage({ who: 'admin' });
admin.on('dialog', (d) => d.accept());

// =============================================================================
// 10 · SONDAGE
// =============================================================================
if (only.includes('10')) {
  // -- list ------------------------------------------------------------------
  await goA(admin, '/admin/sondages', { wait: 2500 });
  const title = admin.getByRole('heading', { level: 1 }).first();
  await mark(admin, [
    { el: admin.getByRole('link', { name: /Nouveau Sondage/ }).or(admin.getByRole('button', { name: /Nouveau Sondage/ })).first(), n: '1' },
    { el: admin.getByRole('button', { name: /Générer pour ce weekend/ }), n: '2' },
    { el: admin.getByRole('button', { name: /Tutoriel & Guide/ }).first(), n: '3' },
    { el: admin.getByText(/^Sondage en cours$/i).first().locator('xpath=ancestor::div[1]'), n: '4' },
    { el: admin.getByLabel('Modifier le statut du sondage').first(), n: '5' },
    { el: admin.getByRole('link', { name: /Réponses/ }).first(), n: '6' },
    { el: admin.getByTitle('Modifier les paramètres').first(), n: '7' },
  ]);
  const histo = admin.getByText(/^Historique des sondages$/i).first().locator('xpath=ancestor::div[3]');
  await shot(admin, f('10-liste.jpg'), await region(admin, [admin.getByText(/Rituel hebdomadaire/i).first(), histo], 16));
  await unmark(admin);

  // -- new form --------------------------------------------------------------
  await goA(admin, '/admin/sondages/new', { wait: 2500 });
  await admin.getByRole('button', { name: /Utiliser les infos de la sortie du samedi/ }).click();
  await waitIdle(admin, 5500);
  const card = admin.getByText('Sortie du Samedi & Distances au Calendrier').first();
  await mark(admin, [
    { el: admin.getByRole('button', { name: /Utiliser les infos|Infos du samedi/ }).first(), n: '1' },
    { el: admin.locator('input[type=date]').first(), n: '2' },
    { el: admin.locator('select').first(), n: '3' },
    { el: admin.getByText(/^Titre du sondage/).first().locator('xpath=following::input[1]'), n: '4' },
    { el: admin.getByText(/Description \/ Consignes/).first().locator('xpath=following::textarea[1]'), n: '5' },
  ]);
  await shot(admin, f('10-nouveau-haut.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByText(/Description \/ Consignes/).first().locator('xpath=following::textarea[1]')], 16));
  await unmark(admin);
  await admin.getByRole('button', { name: /Ajouter une question/ }).click();
  await waitIdle(admin, 600);
  await admin.getByRole('button', { name: /\+ Ajouter une option/ }).first().click().catch(() => {});
  await waitIdle(admin, 400);
  const qHead = admin.getByText(/Questions QCM personnalisées/i).first();
  await mark(admin, [
    { el: admin.getByRole('button', { name: /Ajouter une question/ }), n: '6' },
    { el: admin.getByText(/Question #1/).first(), n: '7' },
    { el: admin.getByText(/Options de réponse/).first(), n: '8' },
    { el: admin.getByText(/Autoriser plusieurs choix/).first(), n: '9' },
    { el: admin.getByRole('button', { name: /Créer et publier le sondage/ }), n: '10', side: 'right' },
  ]);
  await shot(admin, f('10-nouveau-bas.jpg'), await region(admin, [qHead, admin.getByRole('button', { name: /Créer et publier/ })], 20));
  await unmark(admin);

  // -- detail ----------------------------------------------------------------
  await goA(admin, '/admin/sondages/poll_20261128', { wait: 2500 });
  // capture the WhatsApp text through a fake clipboard
  await admin.evaluate(() => {
    window.__copied = '';
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t) => { window.__copied = t; } }, configurable: true });
  });
  const wa = admin.getByRole('button', { name: /Copier le texte WhatsApp/ });
  // small crop of the five counters (used next to the same figures on the public page)
  await shot(admin, f('10-compteurs.jpg'), await region(admin, [admin.getByText(/Total Présents/i).first().locator('xpath=ancestor::div[2]')], 6, { tight: true }));
  await mark(admin, [
    { el: admin.getByRole('button', { name: /Vue publique|Vue publique/ }).first().or(admin.getByRole('link', { name: /Vue publique/ })).first(), n: '1' },
    { el: admin.getByRole('link', { name: /Modifier/ }).first().or(admin.getByRole('button', { name: /^Modifier/ })).first(), n: '2' },
    { el: admin.getByRole('button', { name: /^Supprimer/ }).first(), n: '3' },
    { el: admin.getByText(/Total Présents/i).first().locator('xpath=ancestor::div[1]'), n: '4' },
    { el: admin.getByText(/Répartition par groupe/i).first().locator('xpath=ancestor::div[1]'), n: '5' },
    { el: wa, n: '6' },
  ]);
  await shot(admin, f('10-detail-haut.jpg'), await region(admin, [admin.getByText(/Weekend du 2026-11-28/).first(), admin.getByText(/Récapitulatif WhatsApp/).first().locator('xpath=ancestor::div[2]'), admin.getByText(/Pause café/i).first().locator('xpath=ancestor::div[2]')], 16));
  await unmark(admin);
  await wa.click();
  await waitIdle(admin, 600);
  fs.writeFileSync(path.join(SCRATCH, 'whatsapp.txt'), await admin.evaluate(() => window.__copied));
  await shot(admin, f('10-whatsapp-bouton.jpg'), await region(admin, [admin.getByText(/Récapitulatif WhatsApp/).first().locator('xpath=ancestor::div[2]')], 8));
  const tbl = admin.getByText(/Toutes les réponses/).first().locator('xpath=ancestor::div[2]');
  const rows = admin.locator('table tbody tr');
  await mark(admin, [
    { el: admin.locator('table thead tr').first(), n: '1', side: 'inside' },
    { el: rows.nth(0).locator('td').nth(3), n: '2', side: 'inside' },
    { el: rows.nth(0).locator('td').last(), n: '3', side: 'inside' },
  ]);
  await shot(admin, f('10-detail-table.jpg'), await region(admin, [tbl.locator('table thead'), rows.nth(5)], 12));
  await unmark(admin);

  // -- edit ------------------------------------------------------------------
  await goA(admin, '/admin/sondages/poll_20261128/edit', { wait: 2500 });
  await mark(admin, [
    { el: admin.locator('input[type=date]').first(), n: '1' },
    { el: admin.locator('select').first(), n: '2' },
    { el: admin.getByText(/^Titre du sondage/).first().locator('xpath=following::input[1]'), n: '3' },
    { el: admin.getByText(/Description \/ Consignes/).first().locator('xpath=following::textarea[1]'), n: '4' },
    { el: admin.getByRole('button', { name: /Recharger depuis la sortie/ }), n: '5' },
  ]);
  await shot(admin, f('10-edit.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByText(/Description \/ Consignes/).first().locator('xpath=following::textarea[1]')], 20));
  await unmark(admin);

  // -- member side, phone ---------------------------------------------------
  const ph = await newPage({ who: 'membre', width: 390, height: 844, mobile: true, scale: 2 });
  await go(ph, '/sondage', { wait: 3000 });
  // untick then tick again: shows the "saved" line, and leaves the answer as it was
  await ph.getByText('Dimanche matin', { exact: false }).first().click();
  await waitIdle(ph, 1800);
  await ph.getByText('Dimanche matin', { exact: false }).first().click();
  await waitIdle(ph, 2200);
  await mark(ph, [
    { el: ph.getByText('Quand roulez-vous ?').first(), n: '1' },
    { el: ph.getByText(/enregistré/).first(), n: '2' },
    { el: ph.getByText('Avec quel groupe ?').first(), n: '3' },
    { el: ph.getByText('Ajouter une remarque').first(), n: '4' },
  ]);
  const top = await region(ph, [ph.getByRole('heading', { level: 1 }), ph.getByText('Ajouter une remarque').first()], 6);
  await shot(ph, f('10-m-sondage.jpg'), { x: 0, y: top.y - 4, width: 390, height: top.height + 8 });
  await unmark(ph);
  await shot(ph, f('10-m-tally.jpg'), await region(ph, [ph.getByText('Départ à 8h30').nth(1).locator('xpath=ancestor::div[1]'), ph.getByText('Groupe VTT').first().locator('xpath=ancestor::div[1]')], 24).then((r) => ({ x: 0, y: r.y, width: 390, height: r.height + 20 })));
  await shot(ph, f('10-m-participants.jpg'), await region(ph, [ph.getByText(/Liste des participants/i).first(), ph.getByText('Claire Dubois').first().locator('xpath=ancestor::div[2]')], 10).then((r) => ({ x: 0, y: r.y, width: 390, height: r.height + 80 })));
  await go(ph, '/saturday-ride', { wait: 3500 });
  await shot(ph, f('10-m-ride.jpg'), { x: 0, y: 60, width: 390, height: 1000 });
  const vph = await newPage({ who: 'none', width: 390, height: 844, mobile: true, scale: 2 });
  await go(vph, '/sondage', { wait: 3000 });
  await mark(vph, [{ el: vph.getByText(/Se connecter pour répondre/).first(), n: '1' }]);
  const vr = await region(vph, [vph.getByRole('heading', { level: 1 }), vph.getByText(/Se connecter pour répondre/).first()], 10);
  await shot(vph, f('10-m-visiteur.jpg'), { x: 0, y: vr.y, width: 390, height: vr.height + 30 });

  // -- home tally ------------------------------------------------------------
  const home = await newPage({ who: 'none' });
  await go(home, '/', { wait: 3500 });
  const board = home.getByText(/Qui roule ce week-end/).first();
  await board.scrollIntoViewIfNeeded();
  await waitIdle(home, 800);
  const bx = await region(home, [board.locator('xpath=ancestor::section[1]')], 0).catch(() => null);
  if (bx) await shot(home, f('10-home-board.jpg'), bx);
  await go(home, '/sondage', { wait: 3000 });
}

// =============================================================================
// 11 · CALENDRIER
// =============================================================================
if (only.includes('11')) {
  await goA(admin, '/admin/events', { wait: 2500 });
  const first = admin.getByRole('link', { name: /Modifier/ }).first().or(admin.getByRole('button', { name: /^Modifier/ }).first());
  await mark(admin, [
    { el: admin.getByRole('link', { name: /Importer PDF/ }).or(admin.getByRole('button', { name: /Importer PDF/ })).first(), n: '1' },
    { el: admin.getByRole('link', { name: /Nouvelle Sortie/ }).or(admin.getByRole('button', { name: /Nouvelle Sortie/ })).first(), n: '2' },
    { el: first.first(), n: '3' },
    { el: admin.getByTitle('Supprimer la sortie').first(), n: '4' },
  ]);
  const rows = admin.getByText(/Prochaines Sorties Programmées/i).first().locator('xpath=ancestor::div[3]');
  await shot(admin, f('11-liste.jpg'), await region(admin, [admin.getByText(/Planning officiel/i).first(), admin.getByText('Samedi 12 décembre 2026').first().locator('xpath=ancestor::div[3]')], 16));
  await unmark(admin);
  await shot(admin, f('11-passees.jpg'), await region(admin, [admin.getByText(/Dernières Sorties Passées/i).first().locator('xpath=ancestor::div[2]')], 6));

  // form, filled with examples (not saved)
  await goA(admin, '/admin/events/new', { wait: 2500 });
  const val = async (label, v) => { const l = admin.getByLabel(label).first(); await l.fill(v); };
  await admin.locator('input[type=date]').first().fill('2026-12-13');
  await admin.getByPlaceholder('Blanmont').first().fill('Walhain');
  await admin.getByPlaceholder('09:00').fill('13h00');
  await admin.getByPlaceholder('70/90/110 km').fill('70-90');
  await admin.getByPlaceholder('Place de Blanmont, 1315 Incourt').fill('Place de Walhain');
  await admin.getByPlaceholder('Sortie VTT/Gravel si pluie').fill('Parcours court de 55 km en cas de pluie');
  await admin.getByPlaceholder('Informations supplémentaires...').fill('Prévoir un éclairage arrière.');
  await admin.locator('input[type=url]').first().fill('https://www.komoot.com/fr-fr/tour/1234567');
  await mark(admin, [
    { el: admin.locator('input[type=date]').first(), n: '1' },
    { el: admin.getByPlaceholder('Blanmont').first(), n: '2' },
    { el: admin.getByPlaceholder('09:00'), n: '3' },
    { el: admin.getByPlaceholder('70/90/110 km'), n: '4' },
    { el: admin.getByPlaceholder('Place de Blanmont, 1315 Incourt'), n: '5' },
    { el: admin.getByPlaceholder('Sortie VTT/Gravel si pluie'), n: '6' },
    { el: admin.getByPlaceholder('Informations supplémentaires...'), n: '7' },
    { el: admin.locator('input[type=url]').first(), n: '8' },
    { el: admin.locator('select').first(), n: '9' },
    { el: admin.getByRole('button', { name: /Créer l'événement/ }), n: '10', side: 'right' },
  ]);
  await shot(admin, f('11-nouveau.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByRole('button', { name: /Créer l'événement/ })], 20));
  await unmark(admin);
  // really create it (to show edit + delete), removed at the end of this block
  await admin.getByRole('button', { name: /Créer l'événement/ }).click();
  await waitIdle(admin, 3500);
  await goA(admin, '/admin/events', { wait: 2000 });
  const testRow = admin.locator('xpath=//*[text()="Dimanche 13 décembre 2026"]/ancestor::div[.//a[contains(.,"Modifier")] or .//button[contains(.,"Modifier")]][1]');
  await shot(admin, f('11-liste-nouvelle.jpg'), await region(admin, [testRow], 10));
  const evs2 = (await dbGet('calendar-events')) ?? {};
  const testKey = Object.keys(evs2).find((k) => evs2[k]?.isoDate === '2026-12-13');
  await goA(admin, `/admin/events/${testKey}/edit`, { wait: 2500 });
  await mark(admin, [
    { el: admin.locator('input[type=date]').first(), n: '1' },
    { el: admin.getByRole('button', { name: /^Enregistrer/ }), n: '2', side: 'right' },
  ]);
  await shot(admin, f('11-modifier.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByRole('button', { name: /^Enregistrer/ })], 20));
  await unmark(admin);
  // delete with confirmation shown
  await goA(admin, '/admin/events', { wait: 2000 });
  const trash = testRow.getByTitle('Supprimer la sortie');
  await trash.click();
  await waitIdle(admin, 500);
  await mark(admin, [{ el: testRow.getByRole('button', { name: 'Oui' }), n: '1' }, { el: testRow.getByRole('button', { name: 'Non' }), n: '2' }]);
  await shot(admin, f('11-suppression.jpg'), await region(admin, [testRow], 14));
  await unmark(admin);
  await testRow.getByRole('button', { name: 'Oui' }).click();
  await waitIdle(admin, 2500);

  // PDF import: step 1 and step 2 (never confirmed)
  await goA(admin, '/admin/events/import', { wait: 2500 });
  await mark(admin, [{ el: admin.getByText('Choisir le calendrier PDF').first().locator('xpath=ancestor::label[1]'), n: '1' }]);
  await shot(admin, f('11-import-1.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByText('Choisir le calendrier PDF').first().locator('xpath=ancestor::div[2]')], 20));
  await unmark(admin);
  // In this local copy the PDF reader of the app fails ("DOMMatrix is not defined"); the preview step is
  // fed with the same extraction rules applied to the club's real file, by answering that one request.
  await admin.route('**/admin/events/import', async (route) => {
    const req = route.request();
    if (req.method() !== 'POST' || !(req.headers()['content-type'] ?? '').startsWith('multipart/form-data')) return route.continue();
    const result = { success: true, message: 'ok', events: parsePdfText(execFileSync('pdftotext', ['-layout', PDF, '-'], { encoding: 'utf8' })) };
    await route.fulfill({ status: 200, contentType: 'text/x-component', body: `0:{"a":"$@1","f":"","q":"","i":false}\n1:${JSON.stringify(result)}\n` });
  });
  await admin.locator('input[type=file]').setInputFiles(PDF);
  await admin.getByText(/sorties extraites/).first().waitFor({ timeout: 60000 });
  await waitIdle(admin, 1000);
  fs.writeFileSync(path.join(SCRATCH, 'import-summary.txt'), (await admin.getByText(/sorties extraites/).first().innerText()) + '\n' + (await admin.getByText(/sélectionnées pour l'import/).first().innerText()));
  // the fixed bar at the bottom of the screen (kept as it is on screen)
  await admin.evaluate(() => window.scrollTo(0, 400));
  await waitIdle(admin, 500);
  const bar = admin.getByRole('button', { name: /Valider et importer/ });
  await mark(admin, [
    { el: bar, n: '1', side: 'right' },
    { el: admin.getByRole('button', { name: /^Annuler$/ }).first(), n: '2' },
  ]);
  await shot(admin, f('11-import-barre.jpg'), await region(admin, [bar.locator('xpath=ancestor::div[3]')], 6));
  await unmark(admin);
  await admin.evaluate(() => window.scrollTo(0, 0));
  await flat(admin);
  await mark(admin, [
    { el: admin.getByRole('button', { name: /Tout cocher/ }), n: '1' },
    { el: admin.getByRole('button', { name: /Tout décocher/ }), n: '2' },
    { el: admin.getByRole('button', { name: /Ajouter une ligne/ }), n: '3' },
    { el: admin.getByRole('button', { name: /Recharger un PDF/ }), n: '4' },
  ]);
  await shot(admin, f('11-import-2.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.locator('table tbody tr').nth(3)], 16));
  await unmark(admin);

  // public calendar
  const vis = await newPage({ who: 'none' });
  await go(vis, '/calendrier', { wait: 3500 });
  await mark(vis, [
    { el: vis.getByRole('button', { name: /S'abonner au calendrier/ }), n: '1' },
    { el: vis.getByRole('button', { name: /Agenda/ }).first(), n: '2' },
    { el: vis.getByPlaceholder(/Rechercher destination/), n: '3' },
    { el: vis.getByText('Filtrer :').first(), n: '4' },
    { el: vis.getByText('Prochaine sortie').nth(1), n: '5' },
  ]);
  await shot(vis, f('11-public.jpg'), await region(vis, [vis.getByRole('heading', { level: 1 }), vis.getByText('Sortie terminée').first().locator('xpath=ancestor::div[4]')], 12));
  await unmark(vis);
  await vis.getByRole('button', { name: /S'abonner au calendrier/ }).click();
  await waitIdle(vis, 900);
  await shot(vis, f('11-abonnement.jpg'), { x: 370, y: 112, width: 540, height: 640 });
  await vis.keyboard.press('Escape');
  await go(vis, '/calendrier', { wait: 2500 });
  await vis.getByPlaceholder(/Rechercher destination/).fill('walhain');
  await waitIdle(vis, 1200);
  await shot(vis, f('11-recherche.jpg'), await region(vis, [vis.getByPlaceholder(/Rechercher destination/), vis.getByText('Place de Walhain').first()], 50, { full: true }));
  const hv = await newPage({ who: 'none' });
  await go(hv, '/', { wait: 3500 });
  const next = hv.getByText(/^Samedi 28 novembre$/i).first();
  await next.scrollIntoViewIfNeeded().catch(() => {});
  await waitIdle(hv, 800);
  await shot(hv, f('11-home-prochaine.jpg'), await region(hv, [next, hv.getByText('Rejoindre le club').first()], 26, { full: false }));
}

// =============================================================================
// 12 · TRACES
// =============================================================================
if (only.includes('12')) {
  await goA(admin, '/admin/traces', { wait: 2500 });
  await mark(admin, [
    { el: admin.getByRole('link', { name: /Catalogue public/ }).first(), n: '1' },
    { el: admin.getByText('Ajouter une Trace Manuellement').first().locator('xpath=ancestor::a[1]'), n: '2' },
    { el: admin.getByText('Importer un fichier GPX').first().locator('xpath=ancestor::a[1]'), n: '3' },
    { el: admin.getByText('Importer depuis Strava').first().locator('xpath=ancestor::a[1]'), n: '4' },
  ]);
  await shot(admin, f('12-hub.jpg'), await region(admin, [admin.getByText(/Gestion des Parcours/i).first(), admin.getByText('Comment fonctionnent les traces pour le club ?').first().locator('xpath=ancestor::div[2]')], 20));
  await unmark(admin);

  // manual form, filled, then submitted: fails
  await goA(admin, '/admin/add-trace', { wait: 2500 });
  await admin.locator('input[type=text]').first().fill('Boucle de Walhain');
  await admin.locator('input[type=date]').first().fill('2026-11-20');
  await admin.getByPlaceholder('Ville').nth(0).fill('Blanmont');
  await admin.getByPlaceholder('Ville').nth(1).fill('Blanmont');
  const nums = admin.locator('input[type=number]');
  if (await nums.count()) { await nums.nth(0).fill('55.5'); await nums.nth(1).fill('420'); }
  await admin.getByPlaceholder('https://www.komoot.fr/tour/...').fill('https://www.komoot.fr/tour/1234567');
  await mark(admin, [
    { el: admin.locator('input[type=text]').first(), n: '1' },
    { el: admin.locator('input[type=date]').first(), n: '2' },
    { el: admin.locator('input[type=file]').first().locator('xpath=ancestor::div[2]'), n: '3' },
    { el: admin.locator('select').nth(1), n: '4' },
    { el: nums.nth(0), n: '5' },
    { el: admin.locator('select').nth(2), n: '6' },
    { el: admin.getByPlaceholder('https://www.komoot.fr/tour/...'), n: '7' },
    { el: admin.getByRole('button', { name: 'Ajouter le Parcours' }), n: '8', side: 'right' },
  ]);
  await shot(admin, f('12-ajout-haut.jpg'), await region(admin, [admin.getByText('Détails du Parcours').first(), nums.nth(1)], 16));
  await shot(admin, f('12-ajout-bas.jpg'), await region(admin, [admin.getByText('Évaluation').first(), admin.getByRole('button', { name: 'Ajouter le Parcours' })], 16));
  await unmark(admin);
  await admin.getByRole('button', { name: 'Ajouter le Parcours' }).click();
  await waitIdle(admin, 3500);
  const err = admin.getByText(/Validation failed/).first();
  fs.writeFileSync(path.join(SCRATCH, 'addtrace-error.txt'), String(await err.count()));
  await shot(admin, f('12-ajout-erreur.jpg'), await region(admin, [err.locator('xpath=ancestor::div[1]'), admin.getByRole('button', { name: 'Ajouter le Parcours' })], 14).catch(() => undefined));

  // GPX import (works once Strava is connected: simulated with a placeholder cookie)
  // A small loop around Blanmont (about 12 km), written here so the script needs no file of its own.
  const gpx = path.join(SCRATCH, 'demo.gpx');
  const pts = Array.from({ length: 41 }, (_, i) => {
    const a = (i / 40) * 2 * Math.PI;
    const lat = 50.6231 + 0.018 * Math.sin(a);
    const lon = 4.6422 + 0.028 * (1 - Math.cos(a));
    const ele = 100 + 22 * Math.sin(a * 2) + 10 * Math.sin(a);
    return `<trkpt lat="${lat.toFixed(5)}" lon="${lon.toFixed(5)}"><ele>${ele.toFixed(1)}</ele></trkpt>`;
  }).join('');
  fs.writeFileSync(gpx, `<?xml version="1.0"?><gpx version="1.1" creator="manuel" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Boucle de démonstration</name><trkseg>${pts}</trkseg></trk></gpx>`);
  await admin.context().addCookies([{ name: 'strava_access_token', value: 'demo', url: 'http://localhost:3000' }]);
  await goA(admin, '/import/garmin', { wait: 3000 });
  await shot(admin, f('12-import-1.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.locator('input[type=file]').first().locator('xpath=ancestor::div[3]')], 20).catch(() => undefined));
  await admin.locator('input[type=file]').first().setInputFiles(gpx);
  await waitIdle(admin, 3500);
  await admin.locator('input[type=text]').first().fill('Boucle de démonstration');
  await mark(admin, [
    { el: admin.getByText(/^Distance:/).first(), n: '1' },
    { el: admin.getByText('Nom du Parcours').first(), n: '2' },
    { el: admin.getByText(/Difficulté/).first(), n: '3' },
    { el: admin.getByText('Direction').first(), n: '4' },
    { el: admin.getByText('Type de vélo').first(), n: '5' },
    { el: admin.getByRole('button', { name: /Créer le parcours/ }), n: '6', side: 'right' },
  ]);
  await shot(admin, f('12-import-2.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByRole('button', { name: /Créer le parcours/ })], 20));
  await unmark(admin);
  await admin.getByRole('button', { name: /Créer le parcours/ }).click();
  await admin.getByText(/imported successfully/).first().waitFor({ timeout: 20000 });
  await waitIdle(admin, 800);
  await shot(admin, f('12-import-ok.jpg'), await region(admin, [admin.getByText(/imported successfully/).first(), admin.getByRole('link', { name: /Modifier/ }).first(), admin.getByRole('button', { name: /Supprimer/ }).first()], 16));
  await admin.getByRole('link', { name: /Modifier/ }).first().click();
  await admin.waitForURL(/\/edit/, { timeout: 20000 });
  await waitIdle(admin, 2500);
  const editUrl = admin.url();
  await mark(admin, [
    { el: admin.getByText('Nom du parcours').first(), n: '1' },
    { el: admin.getByText(/^Distance \(km\)/).first(), n: '2' },
    { el: admin.getByText('Direction').first(), n: '3' },
    { el: admin.getByText('Type de vélo').first(), n: '4' },
    { el: admin.getByText(/^Note$/).first(), n: '5' },
    { el: admin.getByText(/Lien Komoot/).first(), n: '6' },
    { el: admin.getByRole('button', { name: 'Enregistrer' }), n: '7', side: 'right' },
    { el: admin.getByRole('button', { name: /Supprimer/ }).first(), n: '8' },
  ]);
  await shot(admin, f('12-edit.jpg'), await region(admin, [admin.getByRole('heading', { level: 1 }), admin.getByRole('button', { name: 'Enregistrer' })], 20));
  await unmark(admin);
  await admin.getByRole('button', { name: /Supprimer/ }).first().click();
  await waitIdle(admin, 700);
  await shot(admin, f('12-suppression.jpg'), admin.getByText('Cette action est irréversible.').first().locator('xpath=ancestor::div[.//button[contains(.,"Annuler")]][1]'));
  await admin.getByRole('button', { name: 'Supprimer' }).last().click();
  await waitIdle(admin, 3000);
  await admin.context().clearCookies({ name: 'strava_access_token' });
  fs.writeFileSync(path.join(SCRATCH, 'edit-url.txt'), editUrl);

  // public
  const vis = await newPage({ who: 'none' });
  await go(vis, '/traces', { wait: 3500 });
  await mark(vis, [
    { el: vis.getByText(/parcours disponibles/).first(), n: '1' },
    { el: vis.getByText('Trier').first(), n: '2' },
    { el: vis.getByText('Distance').first(), n: '3' },
    { el: vis.getByText('Télécharger GPX').first(), n: '4' },
  ]);
  await shot(vis, f('12-public.jpg'), await region(vis, [vis.getByRole('heading', { level: 1 }), vis.getByText('Boucle de l’Orne et de la...').first().locator('xpath=ancestor::div[4]')], 12).catch(() => ({ x: 0, y: 60, width: 1280, height: 1200 })));
  await unmark(vis);
  await go(vis, '/traces/trace_01', { wait: 3500 });
  await shot(vis, f('12-detail.jpg'), { x: 0, y: 60, width: 1280, height: 1240 });
  const adm = vis.getByText(/Outils Administrateur/i).first();
  if (await adm.count()) {
    await adm.scrollIntoViewIfNeeded();
    await waitIdle(vis, 500);
    await shot(vis, f('12-outils-admin.jpg'), await region(vis, [adm.locator('xpath=ancestor::div[2]')], 12));
  }
}

// =============================================================================
// 13 · POINTAGE EXPRESS (phone)
// =============================================================================
const KEY = 'event_20261128';
let saved = null;
if (only.includes('13')) {
  saved = { att: await dbGet(`attendance/${KEY}`), lb: await dbGet('leaderboard/m-anne'), lb2: await dbGet('leaderboard/m-claire') };
  fs.writeFileSync(path.join(SCRATCH, 'pointage-backup.json'), JSON.stringify(saved));
  try {
    const pe = await newPage({ who: 'admin', width: 390, height: 844, mobile: true, scale: 2 });
    await go(pe, '/admin/pointage-express', { wait: 3500 });
    await shot(pe, f('13-m-haut.jpg'));
    // mark two people
    const row = (n) => pe.getByText(n, { exact: true }).first().locator('xpath=ancestor::div[contains(@class,"flex")][1]');
    await pe.getByText('Anne Dumont', { exact: true }).first().click();
    await waitIdle(pe, 900);
    await pe.getByText('Claire Dubois', { exact: true }).first().click();
    await waitIdle(pe, 900);
    await shot(pe, f('13-m-toast.jpg'));
    await waitIdle(pe, 1800);
    await pe.evaluate(() => window.scrollTo(0, 0));
    const present = pe.getByText(/^Présents$/i).first();
    await mark(pe, [
      { el: pe.getByRole('combobox').first(), n: '1' },
      { el: pe.getByText(/Présents/i).first().locator('xpath=ancestor::div[1]'), n: '2' },
      { el: pe.getByPlaceholder(/Rechercher un coureur/), n: '3' },
      { el: pe.getByText('Anne Dumont', { exact: true }).first().locator('xpath=ancestor::div[1]'), n: '4' },
    ]);
    await shot(pe, f('13-m-liste.jpg'), await region(pe, [pe.getByRole('combobox').first(), pe.getByText('Bruno Gérard', { exact: true }).first().locator('xpath=ancestor::div[1]')], 10).then((r) => ({ x: 0, y: r.y, width: 390, height: r.height })));
    await unmark(pe);
    // ICE card
    await pe.getByTitle(/Fiche urgence ICE/).first().click();
    await waitIdle(pe, 800);
    await shot(pe, f('13-m-ice.jpg'));
    await pe.getByRole('button', { name: /Fermer/ }).first().click();
    await waitIdle(pe, 500);
    // undo
    await pe.getByText('Claire Dubois', { exact: true }).first().click();
    await waitIdle(pe, 900);
    await shot(pe, f('13-m-annule.jpg'));
    await waitIdle(pe, 1500);
    // search + filter state
    await pe.getByPlaceholder(/Rechercher un coureur/).fill('Dubois');
    await waitIdle(pe, 600);
    await shot(pe, f('13-m-recherche.jpg'));
    await pe.getByPlaceholder(/Rechercher un coureur/).fill('');
    // Carré vert effect: admin panel for that ride
    await goA(admin, '/admin/carre-vert', { wait: 2500 });
    await flat(admin);
    await admin.getByRole('button', { name: /^À venir$/ }).click();
    await waitIdle(admin, 500);
    await admin.getByText(/sam\. 28 nov\./).first().click();
    await waitIdle(admin, 1800);
    const rc = await region(admin, [admin.getByPlaceholder(/Rechercher un membre/), admin.getByText('Claire Dubois').first()], 14, { tight: true });
    await shot(admin, f('13-carre-vert-effet.jpg'), rc);
  } finally {
    // remove my marks: put the data back as it was
    await dbPut(`attendance/${KEY}`, saved.att);
    await dbPut('leaderboard/m-anne', saved.lb);
    await dbPut('leaderboard/m-claire', saved.lb2);
  }
}

// =============================================================================
// 14 · CARRÉ VERT
// =============================================================================
if (only.includes('14')) {
  await goA(admin, '/admin/carre-vert', { wait: 3000 });
  await mark(admin, [
    { el: admin.getByRole('button', { name: /Synchroniser Google Sheet/ }), n: '1' },
    { el: admin.getByRole('button', { name: /Guide & Règles/ }), n: '2' },
    { el: admin.getByRole('link', { name: /Pointage Express Mobile/ }).first(), n: '3' },
    { el: admin.getByRole('button', { name: /^Passés$/ }), n: '4' },
    { el: admin.getByPlaceholder(/Rechercher un lieu/), n: '5' },
  ]);
  await shot(admin, f('14-panneau.jpg'), await region(admin, [admin.getByText(/Challenge d'Assiduité/i).first(), admin.getByText(/sam\. 24 oct\./).first()], 16));
  await unmark(admin);
  await admin.getByText(/sam\. 21 nov\./).first().click();
  await waitIdle(admin, 1800);
  const panel = admin.getByPlaceholder(/Rechercher un membre/).locator('xpath=ancestor::div[3]');
  await mark(admin, [
    { el: admin.getByPlaceholder(/Rechercher un membre/), n: '1' },
    { el: admin.getByRole('button', { name: /^Tous \(/ }).first(), n: '2' },
  ]);
  await shot(admin, f('14-evenement.jpg'), await region(admin, [admin.getByPlaceholder(/Rechercher un membre/), admin.getByText('Anne Dumont').first()], 16).then((r) => ({ ...r, y: Math.max(0, r.y - 190), height: r.height + 190 })));
  await unmark(admin);
  // sync button: click it where the sheet is not configured (nothing is changed)
  await admin.getByRole('button', { name: /Synchroniser Google Sheet/ }).click();
  await waitIdle(admin, 2500);
  const toasts = await admin.locator('[data-sonner-toast]').allInnerTexts();
  fs.writeFileSync(path.join(SCRATCH, 'sync-toast.txt'), toasts.join('\n'));
  await shot(admin, f('14-synchro.jpg'), { x: 560, y: 0, width: 720, height: 100 });
  // leaderboard: member vs visitor
  const mem = await newPage({ who: 'membre' });
  await go(mem, '/leaderboard', { wait: 3500 });
  await shot(mem, f('14-classement-membre.jpg'), await region(mem, [mem.getByText('Rang', { exact: true }).first(), mem.getByText('Laurence Thiry').first()], 14, { full: true }));
  await mem.getByText(/Hall of Fame/).first().click();
  await waitIdle(mem, 2000);
  await shot(mem, f('14-hall.jpg'), { x: 0, y: 60, width: 1280, height: 1100 });
  const vis = await newPage({ who: 'none' });
  await go(vis, '/leaderboard', { wait: 3500 });
  const vcl = await region(vis, [vis.getByText(/Espace Membres/).first(), vis.getByRole('link', { name: /Se connecter avec mon compte membre/ }).or(vis.getByRole('button', { name: /Se connecter avec mon compte membre/ })).first()], 24, { full: true });
  await shot(vis, f('14-classement-visiteur.jpg'), { ...vcl, y: Math.max(0, vcl.y - 80), height: vcl.height + 80 });
  // home band
  const hm = await newPage({ who: 'membre' });
  await go(hm, '/', { wait: 3500 });
  const band = hm.getByText(/Le Carré Vert 2026/).first();
  if (await band.count()) { await band.scrollIntoViewIfNeeded(); await waitIdle(hm, 600); await shot(hm, f('14-home-bande.jpg'), await region(hm, [band.locator('xpath=ancestor::section[1]')], 0).catch(() => undefined)); }
}

// =============================================================================
// P · narrow captures used in the back-office <-> site pairs
// =============================================================================
if (only.includes('P')) {
  const nar = await newPage({ who: 'admin', width: 620, height: 900, scale: 2 });
  await go(nar, '/admin/events', { wait: 2500 });
  await flat(nar);
  const row = nar.locator('xpath=//*[text()="Samedi 28 novembre 2026"]/ancestor::div[.//a[contains(.,"Modifier")] or .//button[contains(.,"Modifier")]][1]');
  await shot(nar, f('11-pair-bo.jpg'), await region(nar, [row], 8));
  const phc = await newPage({ who: 'none', width: 390, height: 844, mobile: true, scale: 2 });
  await go(phc, '/calendrier', { wait: 3500 });
  await shot(phc, f('11-pair-site.jpg'), await region(phc, [phc.getByText('Prochaine sortie').nth(1), phc.getByText(/Raccourci/).first()], 18, { full: true }));

  await go(nar, '/admin/sondages/poll_20261128', { wait: 2500 });
  await flat(nar);
  await shot(nar, f('10-compteurs.jpg'), await region(nar, [nar.getByText(/Total Présents/i).first().locator('xpath=ancestor::div[2]')], 4));

  await go(nar, '/admin/carre-vert', { wait: 3000 });
  await flat(nar);
  await nar.getByText(/sam\. 21 nov\./).first().click();
  await waitIdle(nar, 1800);
  const pc = await region(nar, [nar.getByPlaceholder(/Rechercher un membre/), nar.getByText('Anne Dumont').first()], 10);
  await shot(nar, f('14-pair-bo.jpg'), { ...pc, y: Math.max(0, pc.y - 150), height: pc.height + 150 });
  const lm = await newPage({ who: 'membre', width: 390, height: 844, mobile: true, scale: 2 });
  await go(lm, '/leaderboard', { wait: 3500 });
  await lm.getByText('Pierre Gilson').first().scrollIntoViewIfNeeded().catch(() => {});
  await waitIdle(lm, 600);
  await shot(lm, f('14-pair-site.jpg'), await region(lm, [lm.getByText('Pierre Gilson').first(), lm.getByText('Hélène Masson').first()], 70, { full: true }));
}

await close();
console.log('done');
