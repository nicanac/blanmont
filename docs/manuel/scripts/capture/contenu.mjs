/**
 * Captures for chapters 9 to 13 (blog, galleries, home banner, groups, home page).
 * Run from the repo root: node docs/manuel/scripts/capture/contenu.mjs [blog|galeries|banniere|groupes|accueil ...]
 * Creates one test article and one test album, and deletes them again (finally block).
 * Never saves the home banner nor the groups (the unsaved forms are photographed).
 */
import { launch, close, newPage, go, mark, unmark, shot, BASE } from '../lib.mjs';

const OUT = new URL('../../screens/', import.meta.url).pathname;
const f = (name) => OUT + name;
const only = process.argv.slice(2);
const want = (k) => only.length === 0 || only.includes(k);

const ARTICLE_TITLE = 'Sortie de test du manuel';
const ALBUM_TITLE = 'Album de test du manuel';

/** Scroll the whole page so lazy images load, then go back to the top. */
async function scrollAll(page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

/** Clip around several locators (page coordinates). */
async function unionClip(page, locs, { padX = 0, padY = 0 } = {}) {
  let x1 = 1e9, y1 = 1e9, x2 = 0, y2 = 0;
  const sy = await page.evaluate(() => window.scrollY);
  for (const l of locs) {
    const b = await l.first().boundingBox();
    if (!b) continue;
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y + sy);
    x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + sy + b.height);
  }
  return { x: Math.max(0, x1 - padX), y: Math.max(0, y1 - padY), width: x2 - x1 + padX * 2, height: y2 - y1 + padY * 2 };
}


/** Numbered dots centred above each target (for dense toolbars). */
async function markTop(page, items) {
  for (const { el, n } of items) {
    const b = await el.first().boundingBox();
    if (!b) continue;
    const sy = await page.evaluate(() => window.scrollY);
    await page.evaluate(({ x, y, n }) => {
      const d = document.createElement('div');
      d.className = '__manuel-mark';
      d.textContent = n;
      Object.assign(d.style, { position: 'absolute', left: x - 14 + 'px', top: y + 'px', width: '28px', height: '28px', borderRadius: '50%', background: '#d63535', color: '#fff', font: '800 15px/28px Archivo, sans-serif', textAlign: 'center', zIndex: 2147483647, boxShadow: '0 0 0 2.5px #fff', pointerEvents: 'none' });
      document.body.appendChild(d);
    }, { x: b.x + b.width / 2, y: b.y + sy + b.height + 3, n });
  }
}

async function waitFor(fn, ms, step = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await fn()) return Math.round((Date.now() - t0) / 1000);
    await new Promise((r) => setTimeout(r, step));
  }
  return -1;
}

await launch();
const created = { post: null, album: null };

try {
  // ───────────────────────── 20 · BLOG ─────────────────────────
  if (want('blog')) {
    const page = await newPage({ who: 'admin', width: 1440, height: 900, scale: 1.25 });
    await go(page, '/admin/blog', { wait: 2000 });
    // 20-liste: header buttons + table
    await mark(page, [
      { el: page.getByRole('link', { name: /Nouvel Article/i }), n: '1' },
      { el: page.getByRole('button', { name: /Tutoriel/i }), n: '2' },
      { el: page.locator('thead th', { hasText: /^Statut$/ }), n: '3' },
      { el: page.locator('tbody tr').first().locator('td').last(), n: '4', side: 'right' },
    ]);
    const hdrBtns = page.getByRole('button', { name: /Tutoriel/i });
    const clip = await unionClip(page, [hdrBtns, page.locator('#blog-table-section')], { padX: 28, padY: 18 });
    await shot(page, f('20-liste.jpg'), clip);
    await unmark(page);

    // Create the test article through the form
    await go(page, '/admin/blog/new', { wait: 2000 });
    await page.getByLabel(/Titre de l.Article/i).fill(ARTICLE_TITLE);
    await page.getByLabel(/Catégorie/i).selectOption('Récits de sortie');
    await page.getByLabel(/Extrait/i).fill("Un exemple d'article pour montrer ce que voit le visiteur sur le site.");
    await page.getByPlaceholder(/Ou collez directement/i).fill('/images/IMG_7627.JPG');
    await page.waitForTimeout(800);
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.getByRole('button', { name: 'Format Titre H2' }).click();
    await page.keyboard.type('Le départ de Blanmont');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Format Paragraphe' }).click();
    await page.keyboard.type('Une trentaine de cyclistes au rendez-vous, trois groupes et une pause café à mi-parcours.');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Liste à puces' }).click();
    await page.keyboard.type('Départ à 13h00 place de Blanmont');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Retour vers 16h30');
    await page.waitForTimeout(500);

    // 20-formulaire: whole form with markers
    await page.evaluate(() => window.scrollTo(0, 0));
    const form = page.locator('form').first();
    await mark(page, [
      { el: page.getByLabel(/Titre de l.Article/i), n: '1', side: 'right' },
      { el: page.getByLabel(/Catégorie/i), n: '2', side: 'right' },
      { el: page.getByLabel(/Extrait/i), n: '3', side: 'right' },
      { el: page.getByPlaceholder(/Ou collez directement/i), n: '4', side: 'right' },
      { el: editor, n: '5', side: 'right' },
      { el: page.locator('#isPublished'), n: '6' },
      { el: page.getByRole('button', { name: /Créer et Enregistrer/i }), n: '7' },
    ]);
    await shot(page, f('20-formulaire.jpg'), form, { pad: 22 });
    await unmark(page);

    // 20-barre: the toolbar
    const tb = [
      ['Mettre en gras', '1'], ['Mettre en italique', '2'], ['Souligner le texte', '3'], ['Format Titre H2', '4'],
      ['Format Sous-titre H3', '5'], ['Format Paragraphe', '6'], ['Insérer une citation', '7'], ['Liste à puces', '8'],
      ['Liste numérotée', '9'], ['Insérer un lien', '10'], ['Insérer une image Cloudinary', '11'],
      ['Insérer une ligne de séparation', '12'], ['Annuler la dernière action', '13'], ['Rétablir la dernière action', '14'],
    ];
    await markTop(page, tb.map(([name, n]) => ({ el: page.getByRole('button', { name }), n })));
    const clipTb = await unionClip(page, [page.getByRole('button', { name: 'Mettre en gras' }), page.getByRole('button', { name: 'Insérer une image Cloudinary' }), page.getByRole('button', { name: 'Rétablir la dernière action' })], { padX: 30, padY: 4 });
    clipTb.y -= 4; clipTb.height += 38;
    clipTb.x = (await editor.boundingBox()).x - 4; clipTb.width = (await editor.boundingBox()).width + 8;
    await shot(page, f('20-barre.jpg'), clipTb);
    await unmark(page);

    // 20-image: the image window
    await page.getByRole('button', { name: 'Insérer une image Cloudinary' }).click();
    await page.waitForTimeout(600);
    const dlg = page.getByRole('dialog').first().locator(':scope > div').first();
    await shot(page, f('20-image-televerser.jpg'), dlg, { pad: 6 });
    await page.getByRole('button', { name: /Coller une URL/i }).click();
    await page.waitForTimeout(400);
    await shot(page, f('20-image-url.jpg'), dlg, { pad: 6 });
    await page.getByRole('button', { name: /^Annuler$/ }).last().click();
    await page.waitForTimeout(400);

    // Submit and capture the new id
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/admin/blog') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /Créer et Enregistrer/i }).click(),
    ]);
    const pj = await resp.json();
    created.post = typeof pj.id === 'object' ? pj.id.id : pj.id;
    console.log('article id', created.post);
    await page.waitForURL('**/admin/blog', { timeout: 20000 }).catch(() => {});
    const t0 = Date.now();

    // Public result: poll until the cached lists show the article
    const vis = await newPage({ who: 'none', width: 1280, height: 900, scale: 1.25 });
    const dBlog = await waitFor(async () => {
      await vis.goto(BASE + '/blog', { waitUntil: 'networkidle' }).catch(() => {});
      return (await vis.getByText(ARTICLE_TITLE).count()) > 0;
    }, 150000, 6000);
    console.log('blog list shows article after (s since submit)', Math.round((Date.now() - t0) / 1000), dBlog);
    await go(vis, '/blog', { wait: 1500 });
    await scrollAll(vis);
    const card = vis.locator('article, a').filter({ hasText: ARTICLE_TITLE }).first();
    await shot(vis, f('20-site-blog-liste.jpg'), { x: 0, y: 0, width: 1280, height: 1000 });
    await shot(vis, f('20-site-blog-carte.jpg'), card, { pad: 14 });

    const slug = 'sortie-de-test-du-manuel';
    await go(vis, '/blog/' + slug, { wait: 1500 });
    await shot(vis, f('20-site-article.jpg'), { x: 0, y: 0, width: 1280, height: 1100 });

    // Home "Carnet de route"
    await waitFor(async () => {
      await vis.goto(BASE + '/', { waitUntil: 'networkidle' }).catch(() => {});
      return (await vis.getByText(ARTICLE_TITLE).count()) > 0;
    }, 90000, 6000);
    await scrollAll(vis);
    const carnet = vis.locator('section[aria-labelledby="carnet-title"]');
    await carnet.scrollIntoViewIfNeeded();
    await vis.waitForTimeout(800);
    await vis.evaluate(() => window.scrollTo(0, 0));
    await shot(vis, f('20-site-accueil-carnet.jpg'), await unionClip(vis, [carnet]));

    // Admin list with the new article
    await go(page, '/admin/blog', { wait: 2000 });
    const newRow = page.locator('tbody tr', { hasText: ARTICLE_TITLE });
    if (await newRow.count()) {
      await mark(page, [{ el: newRow.locator('td').nth(4), n: '1' }]);
      await shot(page, f('20-liste-apres.jpg'), await unionClip(page, [page.locator('thead'), newRow, page.locator('tbody tr').nth(1)], { padX: 24, padY: 14 }));
      await unmark(page);
    }

    // Edit page
    await go(page, `/admin/blog/${created.post}/edit`, { wait: 1500 });
    await page.waitForFunction(() => document.querySelector('input[placeholder="Titre de l\'article"]')?.value, null, { timeout: 15000 }).catch(() => console.log('edit form empty'));
    await page.waitForTimeout(600);
    await mark(page, [
      { el: page.locator('#title, input[placeholder="Titre de l\'article"]').first(), n: '1', side: 'right' },
      { el: page.getByLabel(/Publié/), n: '2' },
      { el: page.getByRole('button', { name: /^Enregistrer$/ }), n: '3' },
    ]);
    await shot(page, f('20-modifier.jpg'), page.locator('form').first(), { pad: 22 });
    await unmark(page);

    // Delete: confirm step then delete
    await go(page, '/admin/blog', { wait: 2000 });
    const row = page.locator('tbody tr', { hasText: ARTICLE_TITLE });
    if ((await row.count()) === 0) {
      console.log('test article not yet in admin list (cache), deleting through the API');
    } else {
      await row.getByRole('button', { name: /Supprimer l.article/i }).click();
      await page.waitForTimeout(500);
      await mark(page, [
        { el: row.getByRole('button', { name: /^Oui$/ }), n: '1' },
        { el: row.getByRole('button', { name: /^Non$/ }), n: '2', side: 'right' },
      ]);
      const cl = await unionClip(page, [row], { padX: 30, padY: 12 });
      await shot(page, f('20-supprimer.jpg'), cl);
      await unmark(page);
      await row.getByRole('button', { name: /^Oui$/ }).click();
      await page.waitForTimeout(2500);
      created.post = null;
    }
    if (created.post) {
      const r = await page.request.delete(`${BASE}/api/admin/blog/${created.post}`);
      console.log('api delete', r.status());
      created.post = null;
    }
    await page.context().close();
    await vis.context().close();
  }

  // ───────────────────────── 21 · GALERIES ─────────────────────────
  if (want('galeries')) {
    const page = await newPage({ who: 'admin', width: 1280, height: 900, scale: 1.4 });
    await go(page, '/admin/galerie', { wait: 2500 });
    await mark(page, [
      { el: page.getByRole('button', { name: /Nouvel Album/i }), n: '1' },
      { el: page.getByPlaceholder(/Rechercher par titre/i), n: '2', side: 'inside' },
      { el: page.locator('select').first(), n: '3' },
      { el: page.locator('tbody tr').first().locator('td').nth(4), n: '4' },
      { el: page.locator('tbody tr').first().locator('td').last(), n: '5', side: 'right' },
    ]);
    const cl = await unionClip(page, [page.getByRole('button', { name: /Nouvel Album/i }), page.locator('table')], { padX: 26, padY: 18 });
    await shot(page, f('21-liste.jpg'), cl);
    await unmark(page);

    await page.getByRole('button', { name: /Nouvel Album/i }).click();
    await page.waitForTimeout(700);
    await page.locator('#galerie-album-title').fill(ALBUM_TITLE);
    await page.locator('#galerie-album-category').selectOption({ index: 0 });
    await page.locator('#galerie-album-cover').fill('/images/IMG_5777.JPG');
    await page.locator('#galerie-album-external-url').fill('https://photos.app.goo.gl/exemple');
    await page.locator('#galerie-album-photo-count').fill('24');
    await page.locator('#galerie-album-featured').check();
    await page.locator('#galerie-album-is-public').check();
    await page.locator('#galerie-album-description').fill('Quelques phrases pour situer le contexte, la météo, le parcours.');
    const dlg = page.getByRole('dialog').first().locator(':scope > div').first();
    await mark(page, [
      { el: page.locator('#galerie-album-title'), n: '1', side: 'right' },
      { el: page.locator('#galerie-album-year'), n: '2', side: 'right' },
      { el: page.locator('#galerie-album-category'), n: '3', side: 'right' },
      { el: page.locator('#galerie-album-cover'), n: '4', side: 'right' },
      { el: page.locator('#galerie-album-external-url'), n: '5', side: 'right' },
      { el: page.locator('#galerie-album-photo-count'), n: '6', side: 'right' },
      { el: page.locator('#galerie-album-featured'), n: '7' },
      { el: page.locator('#galerie-album-is-public'), n: '8' },
      { el: page.locator('#galerie-album-description'), n: '9', side: 'right' },
      { el: page.getByRole('button', { name: /Créer l.album/i }), n: '10' },
    ]);
    await shot(page, f('21-formulaire.jpg'), dlg, { pad: 20 });
    await unmark(page);

    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/admin/galerie') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /Créer l.album/i }).click(),
    ]);
    const j = await resp.json();
    created.album = j.album?.id ?? j.id;
    console.log('album id', created.album);
    await page.waitForTimeout(2500);
    const arow = page.locator('tbody tr', { hasText: ALBUM_TITLE });
    await shot(page, f('21-liste-nouveau.jpg'), await unionClip(page, [page.locator('thead'), arow], { padX: 20, padY: 12 }));

    // Public: member and visitor
    for (const [who, tag] of [['membre', 'membre'], ['none', 'visiteur']]) {
      const p = await newPage({ who, width: 1280, height: 900, scale: 1.4 });
      await go(p, '/galerie', { wait: 2000 });
      await scrollAll(p);
      const cards = p.locator('article');
      await shot(p, f(`21-site-cartes-${tag}.jpg`), await unionClip(p, [cards.nth(0), cards.nth(2)], { padX: 8, padY: 8 }));
      if (tag === 'visiteur') {
        const banner = p.getByText(/Archives photographiques réservées aux membres/i).first();
        await shot(p, f('21-site-bandeau-visiteur.jpg'), await unionClip(p, [banner.locator('xpath=ancestor::div[3]')], { padX: 8, padY: 8 }));
        // members-only album opened by a visitor
        await p.getByRole('button', { name: /Accès membre/i }).first().click().catch(() => {});
        await p.waitForTimeout(900);
        const pd = p.getByRole('dialog').first();
        if (await pd.count()) await shot(p, f('21-site-fenetre-visiteur.jpg'), pd.locator(':scope > div').first(), { pad: 6 });
      } else {
        await cards.nth(0).getByRole('button', { name: /Explorer/ }).click().catch(() => {});
        await p.waitForTimeout(1200);
        const pd = p.getByRole('dialog').first();
        if (await pd.count()) await shot(p, f('21-site-fenetre-membre.jpg'), pd.locator(':scope > div').first(), { pad: 6 });
      }
      await p.context().close();
    }

    // Home block
    const h = await newPage({ who: 'none', width: 1280, height: 900, scale: 1.25 });
    await go(h, '/', { wait: 2000 });
    await scrollAll(h);
    const planches = h.locator('section[aria-labelledby="planches-title"]');
    await planches.scrollIntoViewIfNeeded();
    await h.waitForTimeout(800);
    await h.evaluate(() => window.scrollTo(0, 0));
    await shot(h, f('21-site-accueil.jpg'), await unionClip(h, [planches]));
    await h.context().close();

    // Delete the test album (browser confirmation box)
    page.once('dialog', (d) => d.accept());
    await arow.getByRole('button', { name: /Supprimer l.album/i }).click();
    await page.waitForTimeout(2500);
    created.album = null;
    await page.context().close();
  }

  // ───────────────────────── 22 · BANNIÈRE ─────────────────────────
  if (want('banniere')) {
    const page = await newPage({ who: 'admin', width: 1280, height: 900, scale: 1.4 });
    const top = () => page.evaluate(() => window.scrollTo(0, 0));
    await go(page, '/admin/hero', { wait: 3500 });
    await page.waitForSelector('text=Photos du Slider', { timeout: 20000 });
    const X = { x: 280, width: 970 };
    const clipY = async (a, b, padTop = 20, padBottom = 24) => {
      const c = await unionClip(page, [a, b]);
      return { ...X, y: c.y - padTop, height: c.height + padTop + padBottom };
    };
    // header buttons
    await top();
    await mark(page, [
      { el: page.getByRole('button', { name: /Enregistré/ }), n: '1' },
      { el: page.getByRole('button', { name: /Tutoriel/ }), n: '2' },
      { el: page.getByRole('button', { name: /Rétablir défaut/ }), n: '3' },
    ]);
    await shot(page, f('22-entete.jpg'), await unionClip(page, [page.getByRole('button', { name: /Enregistré/ }), page.getByRole('button', { name: /Rétablir défaut/ })], { padX: 40, padY: 30 }));
    await unmark(page);

    // Live preview: title + black frame
    const apercu = page.getByText(/Aperçu en direct/i).first();
    const lastCard = page.getByText('GR1 à GR4 & VTT').first();
    await mark(page, [
      { el: page.getByText('Peloton CC Saint-Martin · Blanmont').first(), n: '1', side: 'right', pad: 2 },
      { el: page.getByAltText('Le peloton au départ de Blanmont').first(), n: '2', side: 'right', pad: 0 },
      { el: page.getByText('Rassemblement', { exact: true }).first(), n: '3', side: 'left', pad: 8 },
    ]);
    await shot(page, f('22-apercu.jpg'), await clipY(apercu, lastCard, 24, 40));
    await unmark(page);

    // Slider card
    const secTitle = page.getByText('Photos du Slider & Cadrage Panoramique').first();
    const badgeInput = page.locator('input[placeholder*="Peloton CC Saint-Martin"]').first();
    const rows = page.getByRole('button', { name: /Ajuster cadrage/i });
    const chooseBtn = page.getByText(/Choisir une image/i).first();
    await mark(page, [
      { el: badgeInput, n: '1', side: 'right' },
      { el: page.locator('input[placeholder*="Texte descriptif"]').first(), n: '2', side: 'right' },
      { el: rows.first(), n: '3', side: 'left' },
      { el: page.getByRole('button', { name: /Monter/i }).nth(1), n: '4' },
      { el: page.getByRole('button', { name: /Supprimer cette photo/i }).first(), n: '5' },
      { el: chooseBtn, n: '6', side: 'left', pad: 2 },
      { el: page.getByPlaceholder(/https:\/\/mon-image/i), n: '7', side: 'left', pad: 2 },
      { el: page.getByRole('button', { name: /Ajouter cette URL/i }), n: '8', side: 'left', pad: 2 },
    ]);
    await shot(page, f('22-slider.jpg'), await clipY(secTitle, page.getByRole('button', { name: /Ajouter cette URL/i }), 30, 30));
    await unmark(page);

    // Cropping panel: "Ajuster cadrage" on the first photo
    await rows.first().click();
    await page.waitForTimeout(700);
    await top();
    const cropOpen = page.getByRole('button', { name: /Ouvrir l.outil de recadrage/i });
    await mark(page, [
      { el: page.getByRole('button', { name: /Haut \(/i }), n: '1', side: 'left', pad: 2 },
      { el: page.getByRole('button', { name: /Centre \(/i }), n: '2', side: 'left', pad: 2 },
      { el: page.getByRole('button', { name: /Bas \(/i }), n: '3', side: 'left', pad: 2 },
      { el: page.locator('input[type="range"]').first(), n: '4', side: 'left', pad: 2 },
      { el: cropOpen, n: '5', side: 'left', pad: 2 },
    ]);
    await shot(page, f('22-cadrage.jpg'), await clipY(rows.first(), page.locator('input[type="range"]').first(), 30, 50));
    await unmark(page);
    await cropOpen.click().catch(() => {});
    await page.waitForTimeout(1200);
    const cropDlg = page.getByRole('dialog').first();
    if (await cropDlg.count()) {
      await shot(page, f('22-recadrage.jpg'), cropDlg.locator(':scope > div').first(), { pad: 6 });
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: /^Annuler$/ }).first().click({ timeout: 2000 }).catch(() => {});
    } else console.log('crop dialog not shown');
    await page.waitForTimeout(500);
    await top();

    // 4 cards
    const cardsTitle = page.getByText("Informations sous l'image (4 Blocs Télémétriques)").first();
    const labelFields = page.getByText(/Titre \/ Libellé/i);
    const valueFields = page.getByText(/Valeur Principale/i);
    const detailFields = page.getByText(/Détail additionnel/i);
    await mark(page, [
      { el: page.getByText(/Bloc #1/i).first(), n: '1', side: 'left', pad: 6 },
      { el: page.getByText(/^Icône$/i).first(), n: '2', side: 'right', pad: 2 },
      { el: labelFields.first(), n: '3', side: 'right', pad: 2 },
      { el: valueFields.first(), n: '4', side: 'right', pad: 2 },
      { el: detailFields.first(), n: '5', side: 'right', pad: 2 },
    ]);
    await shot(page, f('22-cartes.jpg'), await clipY(cardsTitle, page.getByText(/^Bloc #4/i), 20, 330));
    await unmark(page);
    await page.context().close();

    // Public result: strip under the cover, and the slideshow
    const h = await newPage({ who: 'none', width: 1280, height: 900, scale: 1.4 });
    await go(h, '/', { wait: 2500 });
    await scrollAll(h);
    const cover = h.locator('section[aria-labelledby="depart-title"]');
    const slider = h.locator('section[aria-labelledby="diaporama-title"]');
    const cb = await cover.boundingBox();
    const cells = ['Rassemblement', 'Samedi', 'Dimanche', 'Allures'].map((t) => cover.getByText(t, { exact: true }).last());
    await mark(h, cells.map((el, i) => ({ el, n: String(i + 1), side: 'left', pad: 9 })));
    await shot(h, f('22-site-bande.jpg'), { x: 0, y: cb.y + cb.height - 110, width: 1280, height: 118 });
    await unmark(h);
    await mark(h, [{ el: h.getByText('Peloton CC Saint-Martin · Blanmont').first(), n: '1', side: 'right', pad: 2 }]);
    await shot(h, f('22-site-diaporama.jpg'), slider, { pad: 10 });
    await unmark(h);
    await h.context().close();
  }

  // ───────────────────────── 23 · GROUPES ─────────────────────────
  if (want('groupes')) {
    const page = await newPage({ who: 'admin', width: 1280, height: 900, scale: 1.4 });
    await go(page, '/admin/groupes', { wait: 3000 });
    await page.waitForSelector('text=Légende des groupes', { timeout: 20000 });
    const legend = page.locator('section, div').filter({ has: page.getByText('Légende des groupes') }).last();
    const rowsG = page.locator('input[placeholder="GR1"]');
    await mark(page, [
      { el: page.getByRole('button', { name: /^Monter GR2/ }), n: '1' },
      { el: page.getByText(/^Code$/).nth(1), n: '2', side: 'right', pad: 2 },
      { el: rowsG.nth(1), n: '3', side: 'right' },
      { el: page.getByText(/fiches/).nth(1), n: '4', side: 'inside', pad: 2 },
      { el: page.getByRole('button', { name: /Retirer le groupe B/ }), n: '5' },
      { el: page.getByPlaceholder('D'), n: '6' },
      { el: page.getByRole('button', { name: /Ajouter le groupe/ }), n: '7' },
      { el: page.getByText(/Aperçu des étiquettes/i), n: '8', pad: 2 },
      { el: page.getByRole('button', { name: /Enregistrer les groupes/ }), n: '9' },
    ]);
    const legendTitle = page.getByText('Légende des groupes').first();
    await shot(page, f('23-ecran.jpg'), await unionClip(page, [legendTitle, page.getByRole('button', { name: /Enregistrer les groupes/ })], { padX: 28, padY: 20 }));
    await unmark(page);
    await page.context().close();

    // The "Proposition de regroupement" block shows only while the settings still use the old codes.
    // We answer the page's own read request with the old situation (nothing is saved, writes are blocked).
    const p2 = await newPage({ who: 'admin', width: 1280, height: 900, scale: 1.4 });
    await p2.route('**/api/admin/group-settings', async (route) => {
      if (route.request().method() !== 'GET') return route.abort();
      const u = (code, count) => [code, { code, count }];
      await route.fulfill({
        json: {
          settings: { groups: [{ code: 'A', label: 'A' }, { code: 'B', label: 'B' }, { code: 'C', label: 'C' }, { code: 'VTT', label: 'VTT' }], updatedAt: '2026-01-10T10:00:00.000Z' },
          usage: Object.fromEntries([u('A', 7), u('A-', 5), u('B', 12), u('BC', 8), u('C', 10), u('VTT', 6)]),
        },
      });
    });
    await go(p2, '/admin/groupes', { wait: 3000 });
    await p2.waitForSelector('text=Proposition de regroupement', { timeout: 20000 });
    const propTitle = p2.getByText('Proposition de regroupement').first();
    const applyBtn = p2.getByRole('button', { name: /Appliquer la proposition/ });
    await mark(p2, [{ el: applyBtn, n: '1' }]);
    await shot(p2, f('23-proposition.jpg'), await unionClip(p2, [propTitle, applyBtn], { padX: 28, padY: 24 }));
    await unmark(p2);
    await applyBtn.click();
    await p2.waitForTimeout(800);
    const legT = p2.getByText('Légende des groupes').first();
    await mark(p2, [
      { el: p2.locator('input[placeholder="GR1"]').first(), n: '1' },
      { el: p2.getByText(/Aperçu des étiquettes/i), n: '2', pad: 2 },
      { el: p2.getByRole('button', { name: /Enregistrer les groupes/ }), n: '3' },
    ]);
    await shot(p2, f('23-apres-proposition.jpg'), await unionClip(p2, [legT, p2.getByRole('button', { name: /Enregistrer les groupes/ })], { padX: 28, padY: 20 }));
    await unmark(p2);
    await p2.context().close();
  }

  // ───────────────────────── 24 · ACCUEIL ─────────────────────────
  if (want('accueil')) {
    const h = await newPage({ who: 'membre', width: 1280, height: 900, scale: 1.25 });
    await go(h, '/', { wait: 2500 });
    await scrollAll(h);
    const S = (id) => h.locator(`section[aria-labelledby="${id}"]`);
    const blocks = [
      ['1', S('depart-title')], ['2', S('diaporama-title')], ['3', S('groupes-title')], ['4', S('saison-title')],
      ['5', S('weekend-title')], ['6', S('carre-vert-title')], ['7', S('planches-title')], ['8', S('carnet-title')], ['9', S('rejoindre-title')],
    ];
    for (const [n, l] of blocks) console.log('block', n, JSON.stringify(await l.boundingBox().then((b) => b && [Math.round(b.y), Math.round(b.height)])));
    const groups = [
      ['24-accueil-1.jpg', ['1', '2']], ['24-accueil-2.jpg', ['3']], ['24-accueil-3.jpg', ['4', '5']], ['24-accueil-4.jpg', ['6', '7']], ['24-accueil-5.jpg', ['8', '9']],
    ];
    for (const [file, ns] of groups) {
      const locs = blocks.filter(([n]) => ns.includes(n));
      await mark(h, locs.map(([n, l]) => ({ el: l, n, side: 'inside', pad: -2 })));
      await shot(h, f(file), await unionClip(h, locs.map(([, l]) => l)));
      await unmark(h);
    }
    // Phone view of the top of the home page
    const m = await newPage({ who: 'none', width: 390, height: 844, mobile: true, scale: 2 });
    await go(m, '/', { wait: 2500 });
    await scrollAll(m);
    await shot(m, f('24-accueil-mobile.jpg'), { x: 0, y: 0, width: 390, height: 1100 });
    await m.context().close();

    // Other public pages: top of each page
    const v = await newPage({ who: 'none', width: 1280, height: 900, scale: 1.25 });
    for (const [p, file, h2] of [['/le-club', '24-le-club.jpg', 1000], ['/securite', '24-securite.jpg', 1000], ['/rejoindre', '24-rejoindre.jpg', 1000], ['/confidentialite', '24-confidentialite.jpg', 1000]]) {
      await go(v, p, { wait: 2000 });
      await scrollAll(v);
      await shot(v, f(file), { x: 0, y: 0, width: 1280, height: h2 });
    }
    await v.context().close();
    await h.context().close();
  }
} finally {
  // Safety net: remove test records if a step failed half-way.
  try {
    const page = await newPage({ who: 'admin', scale: 1 });
    await go(page, '/admin', { wait: 300 });
    if (created.post) console.log('cleanup post', (await page.request.delete(`${BASE}/api/admin/blog/${created.post}`)).status());
    if (created.album) console.log('cleanup album', (await page.request.delete(`${BASE}/api/admin/galerie?id=${created.album}`)).status());
  } catch (e) { console.log('cleanup failed', e.message); }
  await close();
}
