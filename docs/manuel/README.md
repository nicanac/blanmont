# Manuel du back-office (PDF)

User manual of the back-office for club officers (admin, trésorier, secrétaire, capitaines de route), written in French for non-technical and older readers. Output: `Manuel-back-office-Blanmont.pdf`. Style: the Carte IGN design system (`design-system/README.md`), printed on A4.

## Regenerate

Screenshots come from a local copy of the app running on the Firebase Realtime Database emulator with fictitious data (`scripts/seed.mjs`). Nothing touches the real database.

```bash
# 1. Emulator (Java required) with open rules, in a scratch folder
#    firebase.json: {"database":{"rules":"rules.json"},"emulators":{"database":{"port":9000},"auth":{"port":9099}}}
#    rules.json:    {"rules":{".read":true,".write":true}}
npx firebase-tools emulators:start --only database,auth --project demo-blanmont

# 2. App against the emulator (env values are local placeholders, not secrets)
export NEXT_PUBLIC_FIREBASE_API_KEY=demo-key NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-blanmont \
  NEXT_PUBLIC_FIREBASE_DATABASE_URL="http://127.0.0.1:9000?ns=demo-blanmont" \
  FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000 GCLOUD_PROJECT=demo-blanmont \
  SESSION_SECRET=manuel-demo-session-secret-0123456789abcdef OWNER_EMAILS=nicolas@exemple.be
npm run dev

# 3. Data, screenshots, PDF
node docs/manuel/scripts/seed.mjs
node docs/manuel/scripts/capture.mjs            # all chapters, or: node docs/manuel/scripts/capture/<group>.mjs
python3 docs/manuel/scripts/optimize-screens.py # shrink the new screenshots (Pillow)
node docs/manuel/scripts/render.mjs             # needs poppler-utils (pdftotext, pdfinfo)
node docs/manuel/scripts/render.mjs --only 10,11 --out /tmp/check.pdf   # a few chapters only
```

Logins are not typed: `scripts/lib.mjs` signs a `ccb_session` cookie with the same `SESSION_SECRET` (users in `USERS`). The cookie banner is pre-accepted and animations are off (reduced motion), so counters show their final value. Capture scripts write their scratch files under `$MANUEL_TMP` (default `/tmp/manuel`). Some of them change demo records to show a result and put them back at the end; re-run `seed.mjs` if a run is interrupted.

`render.mjs` also turns every map frame into a JPEG before printing (the ten SVG layers weigh ~0.8 MB per opener as vectors) and moves any opener text that does not fit on the opener page to the next page. Screenshots are kept at most 1300 px wide (phone shots 560 px), JPEG quality ~72: the PDF stays under 25 MB so it can be e-mailed.

## Layout of the folder

| Path | What |
|---|---|
| `src/template.html` | Page skeleton + the script that prints the territory map in `[data-carte]` frames |
| `src/manuel.css` | Print stylesheet (tokens copied from `app/globals.css`) |
| `src/parts/NN-name.html` | One file per chapter, assembled in file-name order |
| `screens/NN-name.jpg` | Screenshots, prefixed with the chapter file number |
| `scripts/seed.mjs`, `scripts/lib.mjs`, `scripts/capture/*.mjs` | Fictitious data, capture helpers, one capture script per chapter group |
| `fonts/` | Archivo, SIL OFL 1.1 (`OFL.txt`): static instances (`static/`, 4 widths × 5 weights + italic) cut from the Google Fonts variable font with fontTools `varLib.instancer`, so Chromium embeds real TrueType subsets instead of Type 3 glyphs |

## Writing rules

- French, "vous", short sentences, one action per numbered step. Name what the reader sees on screen, exactly as the app writes it, inside `<span class="ui">…</span>` (buttons, tabs, menu entries) or `<span class="field">…</span>` (form fields).
- No technical words: no RTDB, API, cache, cookie, server, token in the reader's text. Say "le site", "la base du club", "jusqu'à une minute plus tard".
- Every procedure ends with a **Résultat sur le site** box: what changes for members or visitors, where, and when.
- French typography: non-breaking space before `: ; ? !` and units (`&nbsp;`), decimal comma, no exclamation marks, no emoji.
- The code is the truth. When the app does something surprising (a button that does nothing, a delay), say it plainly in a **Attention** box.

## Components

```html
<!-- One <article> per chapter: its data-chapter is printed in the running header of its pages. -->
<article class="chapter" data-chapter="4 · Le sondage du week-end">

<!-- Chapter opener: a page of its own (map band, cartouche, a short introduction). -->
<section class="opener" id="ch-sondage">
  <div class="opener-band"><div class="carte-frame" data-carte="480" data-fx="52" data-fy="48" data-labels="1"></div></div>
  <div class="opener-cartouche neatline">
    <div class="main">
      <div class="opener-kicker"><span class="label">Chapitre 4 · Rituels &amp; Sorties</span><span class="chip red">Chaque semaine</span></div>
      <h1 class="opener-title" data-chapter="4 · Le sondage du week-end">Le sondage du week-end</h1>
      <p class="opener-desc">One or two sentences: what this screen is for.</p>
    </div>
    <div class="legend"><dl class="legend-rows">
      <div><dt>Où</dt><dd>Sondages Weekend<small>menu de gauche · Rituels &amp; Sorties</small></dd></div>
      <div><dt>Qui</dt><dd>Administrateurs<small>et capitaines de route</small></dd></div>
      <div><dt>Résultat visible</dt><dd>Page Sondage<small>et page d'accueil</small></dd></div>
    </dl></div>
  </div>
  <div class="opener-meta"><span>Feuille · Sondages</span><span>50°37′23″ N · 4°38′32″ E</span></div>
  <div class="opener-body"> …introduction + « Dans ce chapitre » list: must fit on the opener page… </div>
</section>
<!-- The rest of the chapter follows here and starts on a new page. -->

<h2 id="t-creer-sondage"><span class="num">4.2</span>Créer un sondage à la main</h2>
<h3>Subsection</h3>

<ol class="steps">
  <li>Cliquez sur <span class="ui">Sondages Weekend</span> dans le menu de gauche.<span class="sub">Optional detail line.</span></li>
</ol>

<div class="box result"><div class="box-title">Résultat sur le site</div><p>…</p></div>
<div class="box warn"><div class="box-title">Attention</div><p>…</p></div>
<div class="box tip"><div class="box-title">Bon à savoir</div><p>…</p></div>
<div class="box danger"><div class="box-title">Action définitive</div><p>…</p></div>

<figure>
  <div class="frame"><img src="../screens/04-liste.jpg" alt="…"></div>
  <figcaption><span class="fig">Fig. 4.1</span><span>Caption. The red numbers match the steps.</span></figcaption>
</figure>
<!-- figure.narrow-fig = 72 % width; figure.phone = phone screenshot, 62 mm wide -->

<div class="pair">  <!-- back-office change → result on the site -->
  <div><div class="pair-head bo"><span class="dot"></span>Dans le back-office</div><figure>…</figure></div>
  <div><div class="pair-head site"><span class="dot"></span>Sur le site</div><figure>…</figure></div>
</div>

<!-- Page number of an anchor (filled in by render.mjs): -->
voir page <span data-page-of="ch-membres"></span>

</article>
```

Ids: chapters `ch-<slug>`, procedures `t-<slug>` (used by the "Je veux…" index at the front).
