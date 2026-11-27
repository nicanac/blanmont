/**
 * Captures for chapters 40-43 (Statistiques, Retours visuels, Journal d'activité, Paramètres).
 * Run from the repo root: node docs/manuel/scripts/capture/suivi.mjs [stats|retours|journal|parametres]
 * Nothing is saved in the shared database: GitHub data and settings are faked with page.route().
 */
import fs from 'node:fs';
import path from 'node:path';
import { launch, close, newPage, go, mark, unmark, shot, signSession, BASE } from '../lib.mjs';

const OUT = path.resolve(import.meta.dirname, '../../screens');
const SCRATCH = (process.env.MANUEL_TMP ?? '/tmp/manuel') + '/suivi';
fs.mkdirSync(SCRATCH, { recursive: true });
const f = (n) => path.join(OUT, n);
const only = process.argv[2];

/** Box of a locator in page coordinates (the pages are not scrolled when this is called). */
async function box(page, loc) {
  const b = await loc.first().boundingBox();
  const sy = await page.evaluate(() => window.scrollY);
  return { x: b.x, y: b.y + sy, width: b.width, height: b.height };
}
/** Clip from the top of `from` (minus padTop) to the top of `to` (minus padBottom), content column only. */
async function band(page, from, to, { padTop = 14, padBottom = 18, x = 270, width = 980 } = {}) {
  const a = await box(page, from);
  const b = await box(page, to);
  return { x, y: a.y - padTop, width, height: b.y - padBottom - (a.y - padTop) };
}
/** Viewport-coordinates clip (for fixed dialogs). */
const vshot = (page, file, clip) => page.screenshot({ path: file, type: 'jpeg', quality: 86, clip, animations: 'disabled' });
/** Like mark(), but inside the open modal <dialog> (the browser's top layer hides anything outside it). */
async function markDlg(page, marks) {
  for (const m of marks) {
    const b = await m.el.first().boundingBox().catch(() => null);
    if (!b) { console.warn('  marker target not found:', m.n, String(m.el)); continue; }
    await page.evaluate(({ b, n, side, pad }) => {
      const host = document.querySelector('dialog[open]') ?? document.body;
      const frame = document.createElement('div');
      frame.className = '__manuel-mark';
      Object.assign(frame.style, { position: 'fixed', left: `${b.x - pad}px`, top: `${b.y - pad}px`, width: `${b.width + pad * 2}px`, height: `${b.height + pad * 2}px`, border: '2.5px solid #d63535', borderRadius: '5px', zIndex: 2147483646, pointerEvents: 'none', boxShadow: '0 0 0 2px rgba(255,255,255,0.85)' });
      const dot = document.createElement('div');
      dot.className = '__manuel-mark';
      dot.textContent = n;
      let left = b.x - pad - 18; let top = b.y - pad - 18;
      if (side === 'right') left = b.x + b.width + pad - 10;
      if (side === 'inside') { left = b.x - pad + 4; top = b.y - pad + 4; }
      Object.assign(dot.style, { position: 'fixed', left: `${Math.max(2, left)}px`, top: `${Math.max(2, top)}px`, width: '28px', height: '28px', borderRadius: '50%', background: '#d63535', color: '#fff', font: '800 16px/28px Archivo, sans-serif', textAlign: 'center', zIndex: 2147483647, pointerEvents: 'none', boxShadow: '0 0 0 2.5px #fff' });
      host.appendChild(frame); host.appendChild(dot);
    }, { b, n: m.n, side: m.side ?? 'left', pad: m.pad ?? 4 });
  }
}
const waitIdle = (page, ms = 1200) => page.waitForTimeout(ms);

// ───────────────────────────── Chapter 18 · Statistiques ─────────────────────────────
async function stats() {
  const page = await newPage({ who: 'admin' });
  await go(page, '/admin/statistics', { wait: 2500 });
  // The page opens on the latest year found in the data (2027 here: the calendar reaches into next year).
  await page.locator('select').first().selectOption('2026');
  await waitIdle(page);
  const tab = (n) => page.getByRole('button', { name: new RegExp('^' + n + '\\. ') });
  const nav = page.locator('nav[aria-label="Sous-navigation analytique"]');

  // Fig 18.1 · season bar + exports + tabs
  const sel = page.locator('select').first();
  const bar = await band(page, sel, nav, { padTop: 40, padBottom: -125 });
  await mark(page, [
    { el: sel, n: '1' },
    { el: page.getByRole('button', { name: /CSV Carré Vert/i }), n: '2', side: 'inside' },
    { el: page.getByRole('button', { name: /CSV Bilan AG/i }), n: '3', side: 'right' },
    { el: nav, n: '4', pad: 6 },
  ]);
  await shot(page, f('40-barre.jpg'), bar);
  await unmark(page);

  // Tab 1
  await tab(1).click(); await waitIdle(page);
  let k = await box(page, page.getByText('Kilomètres-Peloton', { exact: true }));
  let h = await box(page, page.getByText('Intensité Mensuelle du Peloton'));
  await shot(page, f('40-onglet1-chiffres.jpg'), { x: 270, y: k.y - 70, width: 980, height: 190 });
  await shot(page, f('40-onglet1-courbe.jpg'), { x: 270, y: k.y + 135, width: 980, height: h.y - k.y - 135 - 35 });
  await shot(page, f('40-onglet1-mois.jpg'), { x: 270, y: h.y - 30, width: 980, height: 520 });

  // Tab 2
  await tab(2).click(); await waitIdle(page);
  const p = await box(page, page.getByText("Paliers d'Honneur du Carré Vert"));
  const d = await box(page, page.getByText("Distribution de l'Assiduité"));
  await shot(page, f('40-onglet2-paliers.jpg'), { x: 270, y: p.y - 30, width: 980, height: d.y - p.y - 10 });
  const t = await box(page, page.getByText(/Classement Officiel du Carré Vert/));
  await shot(page, f('40-onglet2-classement.jpg'), { x: 270, y: t.y - 30, width: 980, height: 400 });

  // Tab 3
  await tab(3).click(); await waitIdle(page);
  const c3 = await box(page, page.getByText('Catalogue des Traces', { exact: true }));
  const top5 = await box(page, page.getByText('Top 5 des Tracés les Mieux Notés'));
  await shot(page, f('40-onglet3-traces.jpg'), { x: 270, y: c3.y - 30, width: 980, height: 170 });

  // Tab 4
  await tab(4).click(); await waitIdle(page);
  const g = await box(page, page.getByText("Répartition de l'Affluence par Groupe"));
  const dm = await box(page, page.getByText('Démocratie des Sorties du Samedi'));
  await shot(page, f('40-onglet4-groupes.jpg'), { x: 270, y: g.y - 30, width: 980, height: dm.y - g.y - 12 });
  const sante = await box(page, page.getByText('Santé Administrative & Adhésions'));
  await shot(page, f('40-onglet4-adhesions.jpg'), { x: 270, y: dm.y - 30, width: 980, height: sante.y - dm.y + 250 });

  // Tab 5
  await tab(5).click(); await waitIdle(page);
  const doc = await box(page, page.getByText('Synthèse de l’Assemblée Générale').or(page.getByText("Synthèse de l'Assemblée Générale")));
  const rap = await box(page, page.getByText('1. Activité Sportive & Kilométrage du Peloton'));
  await mark(page, [
    { el: page.getByRole('button', { name: /Export Bilan AG/i }), n: '1' },
    { el: page.getByRole('button', { name: /Export Carré Vert/i }), n: '2', side: 'inside' },
    { el: page.getByRole('button', { name: /Imprimer/i }), n: '3', side: 'right' },
  ]);
  await shot(page, f('40-onglet5-ag.jpg'), { x: 270, y: doc.y - 40, width: 980, height: rap.y - doc.y + 200 });
  await unmark(page);

  // Download check of the two CSV files (file names only; the files stay in the scratch folder).
  for (const [label, name] of [[/CSV Carré Vert/i, 'carre-vert'], [/CSV Bilan AG/i, 'bilan']]) {
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: label }).first().click()]);
    console.log('  CSV', name, '→', dl.suggestedFilename());
    await dl.saveAs(path.join(SCRATCH, dl.suggestedFilename()));
  }
  await page.context().close();
}

// ───────────────────────────── Chapter 19 · Retours visuels ─────────────────────────────
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const IMG = (n) => `https://raw.githubusercontent.com/nicanac/blanmont/feedback-assets/docs/reviews/assets/${n}.jpg`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const base = (o) => ({ expected: undefined, pageUrl: 'https://www.ccblanmont.be' + o.routePath, viewport: '1440×900 @2x', captureMode: 'native_tab', userAgent: UA, consoleErrors: [], issueUrl: 'https://github.com/nicanac/blanmont/issues/' + o.number, commentsCount: 0, votes: 0, voted: false, updatedAt: o.createdAt, ...o });
const REPORTS = [
  base({ number: 142, id: 'REV-k3m9x', title: 'Le bouton Voter ne répond pas sur téléphone', status: 'open', category: 'bug', priority: 'critical', author: 'Julie', comment: 'Sur mon téléphone, le bouton « Je participe » ne fait rien quand j’appuie dessus.', expected: 'Mon vote devrait être enregistré et un message de confirmation devrait apparaître.', routePath: '/sondage', createdAt: ago(3), commentsCount: 2, votes: 3, voted: false, imageUrl: IMG('REV-k3m9x'), consoleErrors: ['TypeError: Cannot read properties of undefined'] }),
  base({ number: 141, id: 'REV-p7q2d', title: 'Le texte du calendrier est trop petit', status: 'open', category: 'ui', priority: 'important', author: 'Marc', comment: 'Les distances sont écrites très petit. Difficile à lire pour les anciens.', expected: 'Une police plus grande.', routePath: '/calendrier', createdAt: ago(20), commentsCount: 1, votes: 5, voted: true, imageUrl: IMG('REV-p7q2d') }),
  base({ number: 140, id: 'REV-h4w8c', title: 'Afficher la météo sur la page d’une sortie', status: 'open', category: 'feature', priority: 'suggestion', author: 'Sophie', comment: 'Ce serait pratique de voir la météo prévue du samedi à côté du lieu de départ.', routePath: '/calendrier', createdAt: ago(52), votes: 2, imageUrl: IMG('REV-h4w8c'), captureMode: 'dom_snapshot' }),
  base({ number: 139, id: 'REV-t6n1b', title: 'Faute dans le titre de la page Rejoindre', status: 'open', category: 'copy', priority: 'important', author: 'Visiteur', comment: 'Il manque un accent dans le titre.', routePath: '/rejoindre', createdAt: ago(100), imageUrl: IMG('REV-t6n1b') }),
  base({ number: 138, id: 'REV-z2v5f', title: 'Logo flou sur la page d’accueil', status: 'resolved', category: 'ui', priority: 'important', author: 'Anne', comment: 'Le logo en haut à gauche est flou sur mon grand écran.', routePath: '/', createdAt: ago(24 * 9), commentsCount: 1, votes: 1, imageUrl: IMG('REV-z2v5f') }),
  base({ number: 137, id: 'REV-e9r3j', title: 'Ajouter un mode sombre dans l’administration', status: 'dismissed', category: 'feature', priority: 'suggestion', author: 'Éric', comment: 'Un mode sombre pour le back-office, svp.', routePath: '/admin', createdAt: ago(24 * 14), commentsCount: 1, captureMode: 'none', imageUrl: undefined }),
];
const COMMENTS = {
  142: [
    { id: 1, author: 'Nicolas (Admin)', text: 'Merci Julie. Je regarde cela ce soir.', createdAt: ago(2), viaApp: true },
    { id: 2, author: 'Julie', text: 'Je confirme : même problème sur l’iPhone de mon mari.', createdAt: ago(1), viaApp: false },
  ],
};

async function fakeFeedback(page, { reports = REPORTS, config = true, pages } = {}) {
  await page.route('**/api/feedback/config', (r) => r.fulfill({ json: { allowed: config } }));
  await page.route('**/api/feedback/reports', (r) => r.fulfill({ json: { reports, repo: 'nicanac/blanmont' } }));
  await page.route(/\/api\/feedback\/reports\/\d+$/, (r) => {
    const n = Number(r.request().url().split('/').pop());
    const report = reports.find((x) => x.number === n);
    return r.fulfill({ json: { report, comments: COMMENTS[n] ?? [] } });
  });
  // Report pictures: real screenshots of the public site, taken beforehand.
  await page.route('https://raw.githubusercontent.com/**', (r) => {
    const id = r.request().url().split('/').pop().replace('.jpg', '');
    const file = path.join(SCRATCH, 'img-' + id + '.jpg');
    return fs.existsSync(file) ? r.fulfill({ contentType: 'image/jpeg', body: fs.readFileSync(file) }) : r.abort();
  });
}

async function pictures() {
  const jobs = { 'REV-k3m9x': '/sondage', 'REV-p7q2d': '/calendrier', 'REV-h4w8c': '/calendrier', 'REV-t6n1b': '/rejoindre', 'REV-z2v5f': '/' };
  const page = await newPage({ who: 'none', width: 1280, height: 760, scale: 1 });
  for (const [id, route] of Object.entries(jobs)) {
    await go(page, route, { wait: 1500 });
    await page.screenshot({ path: path.join(SCRATCH, 'img-' + id + '.jpg'), type: 'jpeg', quality: 80 });
  }
  await page.context().close();
}

async function retours() {
  await pictures();

  // ── User side: the "Donner un avis" button (member), tool switched on by a faked answer ──
  let page = await newPage({ who: 'membre', width: 1280, height: 1250 });
  await fakeFeedback(page);
  await page.route('**/api/feedback', (r) => (r.request().method() === 'POST' ? r.fulfill({ status: 201, json: { number: 143 } }) : r.continue()));
  await go(page, '/calendrier', { wait: 2000 });
  const btn = page.getByRole('button', { name: 'Donner un avis' });
  await btn.waitFor({ timeout: 20000 });
  const vh = 1250;
  await mark(page, [{ el: btn, n: '1', side: 'right' }]);
  await shot(page, f('41-bouton.jpg'), { x: 0, y: vh - 230, width: 760, height: 230 });
  await unmark(page);
  await btn.click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor({ timeout: 40000 });
  await waitIdle(page, 2500);
  // An arrow drawn on the capture, then the fields filled in (nothing is sent).
  const canvas = page.getByRole('img', { name: /Capture de la page à annoter/ });
  const cb = await canvas.boundingBox();
  await page.mouse.move(cb.x + cb.width * 0.36, cb.y + cb.height * 0.47);
  await page.mouse.down();
  await page.mouse.move(cb.x + cb.width * 0.22, cb.y + cb.height * 0.385, { steps: 12 });
  await page.mouse.up();
  await page.getByLabel(/^Titre/).fill('Le bouton S’abonner ne répond pas');
  await page.getByLabel(/Que se passe-t-il/).fill('Quand j’appuie sur « S’abonner au calendrier », rien ne se passe.');
  await page.getByLabel(/Comportement attendu/).fill('Le calendrier devrait s’ajouter à mon agenda.');
  await waitIdle(page, 500);
  const scrollDialog = (where) => dlg.evaluate((el, w) => {
    const all = [el, ...el.querySelectorAll('*')];
    all.forEach((x) => { if (x.scrollHeight > x.clientHeight + 4 && getComputedStyle(x).overflowY !== 'visible') x.scrollTop = w === 'top' ? 0 : x.scrollHeight; });
  }, where);
  await scrollDialog('top');
  await waitIdle(page, 400);
  let db = await dlg.boundingBox();
  const tb = await page.getByRole('toolbar', { name: /Outils d.annotation/ }).boundingBox();
  await markDlg(page, [
    { el: page.getByRole('button', { name: 'Flèche' }), n: '1' },
    { el: page.getByRole('button', { name: /Annuler le dernier/ }), n: '2' },
    { el: page.getByRole('button', { name: /Tout effacer/ }), n: '3' },
  ]);
  await vshot(page, f('41-annotation.jpg'), { x: db.x, y: db.y, width: db.width, height: Math.min(db.height, tb.y + tb.height - db.y + 420) });
  await unmark(page);
  await page.getByRole('checkbox').check();
  await scrollDialog('bottom');
  await waitIdle(page, 400);
  db = await dlg.boundingBox();
  const titre = await page.getByLabel(/^Titre/).boundingBox();
  await markDlg(page, [
    { el: page.getByLabel(/^Titre/), n: '4' },
    { el: page.getByLabel(/Que se passe-t-il/), n: '5' },
    { el: page.getByLabel(/Comportement attendu/), n: '6' },
    { el: page.getByLabel(/^Type/), n: '7' },
    { el: page.getByLabel(/^Priorité/), n: '8' },
    { el: page.getByText(/publié sur GitHub dans un dépôt public/), n: '9' },
    { el: page.getByRole('button', { name: /^Envoyer/ }), n: '10' },
  ]);
  await vshot(page, f('41-champs.jpg'), { x: db.x, y: Math.max(db.y, titre.y - 50), width: db.width, height: db.y + db.height - Math.max(db.y, titre.y - 50) });
  await unmark(page);
  await page.context().close();

  // ── Officer side ──
  page = await newPage({ who: 'admin', width: 1280, height: 1000 });
  await fakeFeedback(page);
  await go(page, '/admin/retours', { wait: 2500 });
  await page.getByText('Le texte du calendrier est trop petit').first().waitFor();
  const tabs = page.getByRole('tab').or(page.getByRole('button', { name: /^(À traiter|Résolu|Écarté|Tous)/ }));
  const first = await box(page, page.getByRole('button', { name: /Actualiser/ }));
  const grid0 = await box(page, page.getByText('Le texte du calendrier est trop petit').first());
  await mark(page, [
    { el: page.getByRole('button', { name: /^À traiter/ }), n: '1' },
    { el: page.getByRole('button', { name: /Actualiser/ }), n: '2' },
    { el: page.getByPlaceholder(/Rechercher : titre/), n: '3' },
    { el: page.getByRole('combobox').nth(0), n: '4' },
    { el: page.getByRole('combobox').nth(1), n: '5' },
    { el: page.getByRole('combobox').nth(2), n: '6' },
  ]);
  await shot(page, f('41-tableau.jpg'), { x: 270, y: first.y - 60, width: 980, height: 720 });
  await unmark(page);
  await page.getByText('Le bouton Voter ne répond pas sur téléphone').first().click();
  const rd = page.getByRole('dialog');
  await rd.waitFor();
  await page.getByText('Aucune réponse pour l’instant.').or(page.getByText('Merci Julie')).first().waitFor();
  await page.getByText('Détails techniques').first().click();
  await page.getByLabel(/Votre réponse/).fill('Merci Julie, c’est corrigé dans la prochaine version.');
  await waitIdle(page, 1200);
  await markDlg(page, [
    { el: page.getByRole('button', { name: /Retour précédent/ }), n: '1' },
    { el: page.getByText('Ouvrir en taille réelle'), n: '2' },
    { el: page.getByText('Détails techniques').first(), n: '3' },
    { el: page.getByText('Ce qui ne va pas'), n: '4' },
    { el: page.getByText('Échanges'), n: '5' },
    { el: page.getByLabel(/Votre réponse/), n: '6' },
    { el: page.getByRole('button', { name: /Marquer résolu/ }), n: '7' },
    { el: page.getByRole('button', { name: /^Écarter/ }), n: '8', side: 'right' },
    { el: page.getByRole('button', { name: /Répondre seulement/ }), n: '9' },
    { el: page.getByRole('button', { name: /\+1/ }), n: '10', side: 'right' },
  ]);
  const rb = await rd.boundingBox();
  await vshot(page, f('41-fiche.jpg'), rb);
  await unmark(page);
  await page.keyboard.press('Escape');
  // A resolved report offers "Rouvrir".
  await page.getByRole('button', { name: /^Résolu/ }).click();
  await page.getByText('Logo flou sur la page d’accueil').first().click();
  await rd.waitFor();
  await waitIdle(page, 1200);
  const rb2 = await rd.boundingBox();
  await markDlg(page, [{ el: page.getByRole('button', { name: /Rouvrir/ }), n: '1' }]);
  await vshot(page, f('41-rouvrir.jpg'), { x: rb2.x + rb2.width * 0.55, y: rb2.y + rb2.height - 290, width: rb2.width * 0.45, height: 290 });
  await unmark(page);
  await page.context().close();

  // ── /retours (public address) for a captain, and for a plain member ──
  page = await newPage({ who: 'capitaine', width: 1280, height: 760 });
  await fakeFeedback(page, { config: false });
  await go(page, '/retours', { wait: 2500 });
  await page.getByText('Le texte du calendrier est trop petit').first().waitFor();
  await shot(page, f('41-public.jpg'), { x: 0, y: 70, width: 1280, height: 690 });
  await page.context().close();
  page = await newPage({ who: 'membre', width: 1280, height: 760 });
  await fakeFeedback(page);
  await go(page, '/retours', { wait: 2500 });
  await shot(page, f('41-reserve.jpg'), { x: 240, y: 120, width: 800, height: 260 });
  await page.context().close();
}

// ───────────────────────────── Chapter 20 · Journal d'activité ─────────────────────────────
async function journal() {
  const page = await newPage({ who: 'admin', width: 1280, height: 900 });
  await go(page, '/admin/logs', { wait: 3500 });
  const tabBtn = (re) => page.getByRole('button', { name: re }).first();

  // Fig 20.1 · header: legend + three buttons
  const guide = page.getByRole('button', { name: /Guide du Journal/i });
  const exp = page.getByRole('button', { name: /Exporter CSV/i });
  const purge = page.getByRole('button', { name: /Purger/i });
  const g = await box(page, guide);
  await mark(page, [{ el: guide, n: '1' }, { el: exp, n: '2' }, { el: purge, n: '3' }]);
  await shot(page, f('42-entete.jpg'), { x: 270, y: 90, width: 980, height: g.y + g.height + 30 - 90 });
  await unmark(page);

  // Fig 20.2 · triage tab: tabs, queue filters, search, drop-downs, first rows
  const tabs = tabBtn(/Tri & Modération/);
  const t0 = await box(page, tabs);
  const firstRow = await box(page, page.getByText('Connexion réussie : Anne Dumont').first());
  await mark(page, [
    { el: tabs, n: '1' },
    { el: page.getByRole('button', { name: /^Tous\s*\d+/ }).first(), n: '2' },
    { el: page.getByText(/Flux Direct/).first(), n: '3' },
    { el: page.getByPlaceholder(/Rechercher par titre, action/), n: '4' },
    { el: page.getByRole('button', { name: '24h' }), n: '5' },
    { el: page.getByRole('combobox').nth(0), n: '6' },
    { el: page.getByRole('combobox').nth(1), n: '7' },
    { el: page.getByRole('combobox').nth(2), n: '8' },
  ]);
  await shot(page, f('42-tri.jpg'), { x: 270, y: t0.y - 30, width: 980, height: firstRow.y - t0.y + 20 });
  await unmark(page);

  // Fig 20.3 · the table and the two buttons of a row
  const th = await box(page, page.getByText('Horodatage', { exact: true }).first());
  const row = page.locator('tbody tr').first();
  await mark(page, [
    { el: page.locator('thead input[type=checkbox]').first(), n: '1' },
    { el: row.getByText('À examiner', { exact: true }), n: '2' },
    { el: row.getByRole('button', { name: /Marquer comme examiné/ }), n: '3' },
    { el: row.getByRole('button', { name: /Signaler pour enquête/ }), n: '4', side: 'right' },
  ]);
  await shot(page, f('42-tableau.jpg'), { x: 270, y: th.y - 30, width: 980, height: 420 });
  await unmark(page);

  // Fig 20.4 · detail window (nothing is saved)
  await page.getByText('Accès refusé à une API d’administration').first().click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  await waitIdle(page, 800);
  await page.getByPlaceholder(/Remarques éventuelles/).fill('Tentative isolée, aucune suite à donner.');
  await mark(page, [
    { el: page.getByRole('button', { name: /^À examiner$/ }).last(), n: '1' },
    { el: page.getByRole('button', { name: /^Examiné$/ }), n: '2' },
    { el: page.getByRole('button', { name: /Signalé pour enquête/ }).last(), n: '3' },
    { el: page.getByPlaceholder(/Remarques éventuelles/), n: '4' },
    { el: page.getByRole('button', { name: /Enregistrer la modération/ }), n: '5' },
  ]);
  await vshot(page, f('42-detail.jpg'), { x: 290, y: 100, width: 700, height: 705 });
  await unmark(page);
  await page.keyboard.press('Escape');
  if (await dlg.isVisible().catch(() => false)) await page.getByRole('button', { name: /^Fermer/ }).first().click();

  // Fig 20.5 · bulk bar
  const cbs = page.locator('tbody input[type=checkbox]');
  for (let i = 0; i < 3; i++) await cbs.nth(i).check();
  await waitIdle(page, 600);
  const bulk = page.getByText(/événement\(s\) sélectionné\(s\)/).first();
  const bb = await box(page, bulk);
  await mark(page, [
    { el: page.getByRole('button', { name: /Marquer examinés/ }), n: '1' },
    { el: page.getByRole('button', { name: /^Signaler$/ }), n: '2' },
    { el: page.getByRole('button', { name: /Remettre en attente/ }), n: '3' },
    { el: page.getByRole('button', { name: /^Annuler$/ }), n: '4' },
  ]);
  await shot(page, f('42-selection.jpg'), { x: 270, y: bb.y - 30, width: 980, height: 260 });
  await unmark(page);
  for (let i = 0; i < 3; i++) await cbs.nth(i).uncheck();

  // Other tabs
  await tabBtn(/Analyse & Chronologie/).click(); await waitIdle(page, 1500);
  const a0 = await box(page, page.getByText('Fréquentation Quotidienne', { exact: false }).first());
  await shot(page, f('42-analyse.jpg'), { x: 270, y: a0.y - 40, width: 980, height: 760 });
  await tabBtn(/Parcours de Session/).click(); await waitIdle(page, 1500);
  const s0 = await box(page, page.getByPlaceholder(/Rechercher par internaute/));
  await shot(page, f('42-sessions.jpg'), { x: 270, y: s0.y - 40, width: 980, height: 700 });
  await tabBtn(/Rapports Comité/).click(); await waitIdle(page, 1500);
  const c0 = await box(page, page.getByRole('button', { name: /^7 jours/ }));
  await mark(page, [
    { el: page.getByRole('button', { name: /^7 jours/ }), n: '1' },
    { el: page.getByRole('button', { name: /Copier Markdown/ }), n: '2' },
    { el: page.getByRole('button', { name: /Bilan CSV/ }), n: '3' },
    { el: page.getByRole('button', { name: /^Imprimer/ }), n: '4' },
  ]);
  await shot(page, f('42-comite.jpg'), { x: 270, y: c0.y - 60, width: 980, height: 820 });
  await unmark(page);

  // Purge confirmation: opened, photographed, cancelled (never confirmed).
  await purge.click();
  await page.getByText('Confirmer la purge des logs').first().waitFor();
  await waitIdle(page, 600);
  const ph = await page.getByText('Confirmer la purge des logs').first().boundingBox();
  const pb = await page.getByRole('button', { name: /Confirmer la purge/ }).boundingBox();
  await mark(page, [{ el: page.getByRole('button', { name: /Confirmer la purge/ }), n: '1' }, { el: page.getByRole('button', { name: /^Annuler$/ }), n: '2' }]);
  await vshot(page, f('42-purge.jpg'), { x: ph.x - 60, y: ph.y - 50, width: Math.max(620, pb.x + pb.width - ph.x + 120), height: pb.y + pb.height - ph.y + 100 });
  await unmark(page);
  await page.getByRole('button', { name: /^Annuler$/ }).click();

  // CSV export: file name only, nothing written to the database.
  await tabBtn(/Tri & Modération/).click(); await waitIdle(page, 800);
  const [dl] = await Promise.all([page.waitForEvent('download'), exp.click()]);
  console.log('  CSV journal →', dl.suggestedFilename());
  const csvPath = path.join(SCRATCH, dl.suggestedFilename());
  await dl.saveAs(csvPath);
  console.log('  CSV first lines:\n' + fs.readFileSync(csvPath, 'utf8').split('\n').slice(0, 3).join('\n'));
  await page.context().close();
}

// ───────────────────────────── Chapter 21 · Paramètres ─────────────────────────────
async function parametres() {
  // Non-owner administrator: sees a message instead of the page.
  const { USERS } = await import('../lib.mjs');
  USERS.paul = { id: 'm-paul', email: 'paul.hermans@exemple.be', verifiedEmail: 'paul.hermans@exemple.be', name: 'Paul Hermans', role: ['Président'], isAdmin: true };
  let page = await newPage({ who: 'paul', width: 1280, height: 760 });
  await go(page, '/admin/settings', { wait: 2500 });
  await page.getByText('Réservé au propriétaire du site').first().waitFor();
  await shot(page, f('43-reserve.jpg'), { x: 256, y: 64, width: 1024, height: 420 });
  await page.context().close();

  // Owner
  page = await newPage({ who: 'admin', width: 1280, height: 900 });
  await go(page, '/admin/settings', { wait: 3000 });
  const th = await box(page, page.getByText('Apparence & Thème Visuel').first());
  const fb = await box(page, page.getByText('Retours & captures d’écran').or(page.getByText("Retours & captures d'écran")).first());
  await mark(page, [
    { el: page.getByText(/Mode Clair|Mode Sombre/).first(), n: '1', side: 'right' },
    { el: page.getByRole('button', { name: /Mode Clair/ }).last(), n: '2' },
    { el: page.getByRole('button', { name: /Mode Sombre/ }).last(), n: '3' },
    { el: page.getByRole('button', { name: /Automatique/ }), n: '4' },
  ]);
  await shot(page, f('43-theme.jpg'), { x: 270, y: th.y - 30, width: 980, height: fb.y - th.y - 10 });
  await unmark(page);

  // Real state of the demo database: tool off, audience administrators, no GitHub token.
  const fh = await box(page, page.getByText('Connexion GitHub').first());
  const info = await box(page, page.getByText('Informations du Club').first());
  await mark(page, [
    { el: page.getByLabel(/Activer les retours visuels/), n: '1', side: 'right' },
    { el: page.getByRole('radio', { name: /Administrateurs/ }), n: '2' },
    { el: page.getByRole('radio', { name: /Membres connectés/ }), n: '3' },
    { el: page.getByRole('radio', { name: /Tout le monde/ }), n: '4' },
    { el: page.getByLabel(/Jeton GitHub/), n: '5' },
    { el: page.getByRole('button', { name: /Tester et enregistrer/ }), n: '6', side: 'right' },
  ]);
  await shot(page, f('43-retours.jpg'), { x: 270, y: fb.y - 30, width: 980, height: info.y - fb.y - 10 });
  await unmark(page);

  const ci = await box(page, page.getByText('Informations du Club').first());
  const rg = await box(page, page.getByText('Réglementation Fédérale FFBC & Sécurité').first());
  await shot(page, f('43-infos.jpg'), { x: 270, y: ci.y - 30, width: 980, height: rg.y - ci.y - 5 });
  await page.context().close();

  // Same card with the tool switched on, a token stored and the audience "members" (faked answer; nothing is saved).
  page = await newPage({ who: 'admin', width: 1280, height: 900 });
  await page.route('**/api/admin/feedback-settings', (r) => r.request().method() === 'GET'
    ? r.fulfill({ json: { settings: { enabled: true, audience: 'members', updatedAt: ago(30), updatedBy: 'm-nicolas' }, token: { source: 'admin', last4: 'a9Fz', updatedAt: ago(30) }, repo: 'nicanac/blanmont', killed: false } })
    : r.abort());
  await go(page, '/admin/settings', { wait: 3000 });
  const fb2 = await box(page, page.getByText('Retours & captures d’écran').or(page.getByText("Retours & captures d'écran")).first());
  const info2 = await box(page, page.getByText('Informations du Club').first());
  await shot(page, f('43-retours-actif.jpg'), { x: 270, y: fb2.y - 30, width: 980, height: info2.y - fb2.y - 10 });
  await page.context().close();
}

const jobs = { stats, retours, journal, parametres };
await launch();
try {
  for (const [name, fn] of Object.entries(jobs)) {
    if (only && only !== name) continue;
    console.log('→', name);
    await fn();
  }
} finally {
  await close();
}
