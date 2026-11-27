# Blanmont Carte IGN

The design system of the CC Saint-Martin Blanmont cycling club platform. The site is printed like a topographic sheet of the club's own territory: a 32 km square centred on the Place de la Féchère in Blanmont (50°37′23″ N · 4°38′32″ E), with its 5 m contours, the Dyle, the railway and the woods of the Bois de Buis. Map paper, black Archivo lettering, and the map's spot inks. Not a SaaS dashboard.

This folder is the portable, tool-agnostic copy of the system. Anyone building UI for this repository reads this README first, then `tokens.json`, then the component card it needs.

## Sources of truth

| Order | File | Holds |
|---|---|---|
| 1 | `app/globals.css` | The live tokens (`@theme`), dark-mode map inks, sheet utilities, `.prose`. Code wins any disagreement. |
| 2 | `design-system/tokens.json` | The same tokens as data, plus role tokens (`surface`, `text`, `rule`…) that encode the app's day/night pairings. A test fails if a colour here drifts from `globals.css`. |
| 3 | `design-system/README.md` and `components/*/README.md` | This brand book and the usage rules per component. |
| 4 | `DESIGN.md`, `.impeccable/design.json` | The narrative and the impeccable skill's sidecar. Same system, older wording. |

## Voice and content

- All user-facing copy is French, written for club members: "Parcours", "Sortie du samedi", "Dénivelé", "Télécharger le GPX", "S'inscrire". Code, commits and comments are English.
- Verbs first on actions. Plain, sporty, precise: name the place, the distance, the time. No exclamation marks, no emoji, no marketing superlatives.
- Numbers follow French typography: decimal comma, non-breaking space before units and before `:` `;` `!` `?`: "84,5 km", "720 m D+", "26,0 km/h", "08:30".
- Empty and error states say what happened and the next step: "Aucune sortie prévue cette semaine. Proposez un parcours."
- Dates are parsed in Europe/Brussels, never naive UTC (ride dates shift by a day otherwise).

## Colour

Two grounds and a set of spot inks, each with a geographic meaning.

- **Grounds.** Day sheet `paper` (#fbfbf8) with `paper-2` recessed; night sheet `night` (#0d1013) with `night-2` raised and `night-3` recessed. Never mid-tone greys, never a third ground.
- **Role tokens.** Write UI against `surface`, `surface-raised`, `surface-recessed`, `rule`, `rule-strong`, `text`, `text-body`, `text-muted`, `text-accent`. Each flips between the day and night sheet. In the Next.js app the same thing is written as a Tailwind pair: `bg-paper dark:bg-night`, `border-line dark:border-night-line`, `text-ink-3 dark:text-snow-3`.
- **Route red** `brand` (#d63535) is the club colour, for the primary action, the active tab, live dots, the focus ring, the caret and selection. Hover `brand-strong`. `brand-vif` (#e03e3e) prints the roads and the Heart Line mark (large shapes only). `brand-soft` is red lettering on night. Red is never a broad background wash.
- **Map inks.** `bistre` relief, contours, gravel and elevation; `hydro` water, wind, GPX tracks, weather; `vert` Carré Vert, attendance, validated rides (tint `bois` / `vert-tint`); `ambre` warnings, detours, secondary roads. Each has an `-ink` or `-strong` step for small text on paper.
- **Map layers** (`map-*`) are the only tokens with their own night values in code: the territory reprints in darker inks by night.
- **Contrast.** `text` 17:1, `text-body` 10:1, `text-muted` 6:1 on paper; on night 17:1, 12:1, 7.5:1. Flagged pairs: `brand` on `paper-2` 4.18:1, `brand-vif` on paper 4.1:1, `vert` on `bois` 4.07:1, white on `bistre` 4.0:1 (all below 4.5:1 for small text: use `brand-strong`, `vert-strong`, or large text). `ambre`, `brand-soft` and `snow-*` never as text on paper.

## Typography

One family, Archivo (Google Fonts, variable `wdth` 62–125 and `wght` 100–900), loaded in the app with `next/font` as `--font-archivo`. Hierarchy comes from the **width axis**, not from tracking or extra families.

- `stretch-wide` (125%): display and cartouche titles, the wordmark. Uppercase, weight 800, leading 0.92–0.94.
- `stretch-semiwide` (112.5%): section headlines, legend values, map labels, article headings.
- normal width: titles (700) and body (400, 1.6, 65–75ch).
- `stretch-narrow` (87.5%): labels, badges, buttons, table headers. Uppercase, 700, tracking 0.07–0.12em.
- Every metric is `tabular-nums` with its unit. Tailwind: `font-wide`, `font-semiwide`, `font-narrow`, `font-condensed`, `tabular-nums`.
- No eyebrow label above a headline. No Poppins, Inter or any second face.

## Layout

- Container `max-w-7xl` (1280px), gutters 16 / 24 / 32px at mobile / `sm` / `lg`. 4px spacing base (`space-1` … `space-16`).
- Every public page opens with the `SheetHeader` cartouche. Key facts live in its legend.
- Compose like a map sheet: a 12-column grid with varied spans, map previews and tabular blocks. Never rows of identical cards.

## Framing, shape and depth

- Frames are printed, not shadowed: 1px `rule` hairlines, the `neatline` (cartouche, heroes), `corner-ticks` (callouts, empty states), the graduated `scale-strip`, the 2 km `map-grid`. One framing device per box.
- Corners `radius-sm` to `radius-2xl` (2–6px), `radius-md` (3px) for buttons, inputs, cards. `radius-full` only for status chips and pills.
- Flat at rest. Shadows only on raised paper: `shadow-md` the cartouche over its map band, `shadow-lg` menus, `shadow-xl` drawers, `shadow-2xl` dialogs. No glassmorphism, blur halos or gradient text.

## Motion

- `ease-plot` for plotting (the sheet develops outward from the Place de la Féchère in 2.4s, routes draw, the wind rose turns); `ease-stamp` for markers and badges stamping in (550ms); 150ms colour transitions on controls; buttons press 1px down.
- Everything stops under `prefers-reduced-motion`, including the canvas wind field.

## Iconography and assets

- **Logos** (`assets/Logos`): the Heart Line mark in three variants (`pulse-heart` default, `ecg`, `contour`), always `brand-vif`; the geodetic point (△ with a centre dot) marking the club's fixed point; the north arrow. In the app they are React components (`HeartLineMark`, `GeodeticMark`, `NorthArrow`) drawn in `currentColor`.
- **Carte** (`assets/Carte`): the ten territory layers (woods, lakes, relief, index contours, water, four road classes, rail), each a 3200×3200 SVG mask tinted by its `map-*` token. Repository copy: `public/carte/`, generated by `scripts/generate-territory-map.mjs`.
- UI icons are Heroicons outline (24px, 1.5 stroke) plus the custom `CyclingIcons`; they take `currentColor`.

## Components

| Component | Group | Use |
|---|---|---|
| `SheetHeader` | Carte | The page cartouche. Mandatory for public page headers. |
| `SheetPrimitives` | Carte | neatline, corner-ticks, scale-strip, map-grid. |
| `ScaleBar` | Carte | True-to-scale km bar and north arrow. |
| `Button` | Actions | One `primary` per view; outline, secondary, ghost, link. |
| `Badge` | Status | Status chips and filter pills, the only pill shape. |
| `Input` | Forms | White field, `rule` border, brand focus ring. |
| `EmptyState` | Feedback | Corner-ticked absence with advice and actions. |
| `Wordmark` | Brand | Heart Line + BLANMONT. |
| `Prose` | Content | "Carnet de route" article typography. |

In the app, import the React components from `app/components`. Outside it (emails, static pages, prototypes, another framework), load the tokens as CSS custom properties plus `components/bundle.css` and use the `.bl-*` classes shown in each `preview.html`.

## Using this system

1. Read this README, then `tokens.json` for exact values, then `components/<Name>/README.md` for the component you touch.
2. In the app write Tailwind v4 utilities that exist in `app/globals.css` (`bg-paper`, `text-ink-3`, `font-narrow`, `neatline`…). Never hard-coded hex values, never inline styles.
3. Pair day and night classes the way the role tokens do (`surface` = `bg-paper dark:bg-night`). Only tokens that exist: there is no `snow-1`.
4. Run `npm test`: `tests/design-system-package.test.ts` checks this folder against `globals.css`.

## Not synced

- **Fonts:** Archivo is served by Google Fonts / `next/font`; no font files are kept here. The five `.woff2` files in `public/fonts` are unidentified build subsets and were left out.
- **Components:** static renditions (HTML + `bundle.css`), hand-written from the source files named in each card. The React components were not bundled (`Button` needs `class-variance-authority`, `SheetHeader` needs the territory map and Next.js).
- **Left out:** `TerritoryMap`, `WindField`, `WindRose`, `WeatherGlyph`, `RoadSwatch`, `GeodeticMark` as a component (its mark is an asset), `Navbar`, `Footer`, `NextRideCard`, `GpxStatsDisplay`, `Tooltip`, `Spinner`, `MapPreview`, parallax helpers.
- **Drift found between docs and code (code kept):** `DESIGN.md` gives `font-narrow` as 85% (code 87.5%); its shadow names (`sheet-hover`, `dropdown-float`, `modal-overlay`) and `ease-carto` do not exist in code (`shadow-2xs`…`shadow-2xl`, `ease-plot`, `ease-stamp` do); it omits `bistre-soft`, `bistre-ink`, `hydro-soft`, `hydro-tint`, `vert-strong`, `vert-vif`, `vert-tint`, `ambre-ink`, `jaune`.
- **Bugs found in code:** `dark:text-snow-1` appears in 18 files but no `snow-1` token exists, so those elements keep their day colour by night. `tailwind.config.ts` still declares Poppins and an old `brand.primary`; it is not loaded by Tailwind v4 (`globals.css` has no `@config`) and can be deleted.
