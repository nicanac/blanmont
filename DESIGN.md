---
name: CC Saint-Martin Blanmont
description: "Système de design pour la plateforme cycliste du CC Saint-Martin Blanmont — La Feuille de Blanmont (Carte IGN)"
colors:
  brand: "#d63535"
  brand-strong: "#b82b2b"
  brand-vif: "#e03e3e"
  brand-tint: "#fdeceb"
  brand-soft: "#ff7b72"
  bistre: "#b0703b"
  bistre-soft: "#ddb088"
  bistre-ink: "#8a5226"
  hydro: "#1f6fbf"
  hydro-soft: "#9cc6ec"
  hydro-tint: "#e7f0f9"
  vert: "#2e7d45"
  vert-strong: "#1f6434"
  vert-vif: "#3fa35e"
  vert-tint: "#e4f1e6"
  bois: "#dcebcf"
  ambre: "#e8962a"
  ambre-ink: "#9a560a"
  jaune: "#f2cd48"
  paper: "#fbfbf8"
  paper-2: "#f0f1eb"
  white: "#ffffff"
  line: "#dcddd4"
  line-strong: "#b8baaf"
  ink: "#16181b"
  ink-2: "#3c4047"
  ink-3: "#5c6069"
  night: "#0d1013"
  night-2: "#151a1f"
  night-3: "#1c2228"
  night-line: "#28303a"
  night-line-strong: "#3a4450"
  snow: "#eef1f4"
  snow-2: "#c9cfd6"
  snow-3: "#9aa3ad"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.8vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 112.5"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 87.5"
  button:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.07em"
    fontVariation: "'wdth' 87.5"
  telemetry:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 112.5"
  prose-body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.72
rounded:
  xs: "1px"
  sm: "2px"
  md: "3px"
  lg: "4px"
  xl: "5px"
  "2xl": "6px"
  "3xl": "8px"
  full: "9999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
  space-12: "48px"
  space-16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.brand-strong}"
  button-outline:
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.ink-2}"
  button-ghost-hover:
    backgroundColor: "{colors.paper-2}"
  badge-brand:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-success:
    backgroundColor: "{colors.vert-tint}"
    textColor: "{colors.vert-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-paper:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  pill-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "44px"
  pill-inactive:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "24px"
  sheet-header-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    padding: "40px"
  empty-state:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    padding: "48px"
---

# Design System: La Feuille de Blanmont

## Overview

**Creative North Star: "La Feuille de Blanmont — Carte IGN"**

The CC Saint-Martin Blanmont platform is printed like a topographic sheet of the club's own territory: a 32 km square centred on the Place de la Féchère in Blanmont (50°37′23″ N · 4°38′32″ E), with its 5 m contours, the Dyle, the railway and the woods of the Bois de Buis. Map paper, black Archivo lettering and the map's spot inks, each ink with a geographic meaning. It is a club document members read before and after a ride, not a SaaS dashboard.

Two sheets carry the whole interface. The day sheet is map paper (#fbfbf8) with black lettering; the night sheet is a deep ink ground (#0d1013) with snow lettering, and the territory map reprints itself in darker inks by night. Structure comes from print devices, not from shadows: 1px hairlines, the neatline of the cartouche, registration corner ticks, the graduated scale strip and the 2 km kilometric grid. Hierarchy comes from Archivo's width axis rather than from extra faces or tracking.

Density follows the map: key facts sit in a legend beside the title, metrics are tabular and carry their units, and pages are composed like a map sheet with varied spans rather than rows of identical cards. All copy is French, plain and sporty: the place, the distance, the time.

**Key Characteristics:**
- Every public page opens with the `SheetHeader` cartouche over a band of the real territory, key facts in its legend.
- Two grounds only (day paper, night sheet) written as day/night role pairs; never a mid-tone grey or a third ground.
- Spot inks with a meaning: route red for the one action and live state, bistre for relief, hydro for water and wind, vert for Carré Vert and attendance, ambre for warnings.
- Archivo variable font, hierarchy on the width axis: wide (125%) display, semiwide (112.5%) headlines, narrow (87.5%) labels, badges and buttons.
- Printed frames (hairline, neatline, corner ticks, scale strip, map grid), crisp 2–6px corners, flat at rest.
- Every cycling metric in tabular figures with its unit, French number format ("84,5 km", "720 m D+", "26,0 km/h").

## Colors

Two grounds and a set of cartographic spot inks; the code writes them as day/night role pairs.

### Primary
- **Route Red** (brand): the club colour, calibrated for UI. The one primary action of a view, the active tab, live dots, the focus ring, the caret and text selection. White on it 4.75:1, on paper 4.58:1; only 4.18:1 on recessed paper, where red text uses Route Red Strong.
- **Route Red Strong** (brand-strong): hover and pressed state of the primary action, destructive buttons, red text on Crimson Wash (5.4:1), prose links.
- **Road Red Vif** (brand-vif): the map's road red and the Heart Line mark. Large shapes and strokes only (4.1:1 on paper is below AA for small text).
- **Crimson Wash** (brand-tint): ground of brand and danger badges and of the admin danger button. Text on it is Route Red Strong.
- **Night Red** (brand-soft): red lettering on the night sheet (7.6:1). Never on paper (2.4:1).

### Secondary
- **Relief Bistre** (bistre): contours, elevation profiles, gravel. Large text only on paper (3.9:1); **Bistre Ink** (bistre-ink, 6.1:1) for small lettering; **Light Bistre** (bistre-soft) for elevation fills.
- **Hydro Blue** (hydro): rivers, wind vectors, GPX tracks, weather (5.0:1 on paper). **Light Hydro** (hydro-soft) for water fills and charts; **Hydro Wash** (hydro-tint) behind weather and info callouts.
- **Woodland Green** (vert): Carré Vert, attendance, validated rides, the vert cartouche (white on it 5.1:1). **Deep Woodland** (vert-strong) for success text on **Woodland Wash** (vert-tint, 6.2:1); **Bright Woodland** (vert-vif) for success lettering on night; **Bois de Buis** (bois) for forest fills and the Carré Vert chip ground.
- **Amber** (ambre): warnings, detours, secondary roads. Never text on paper (2.3:1); fine as text on night (8.0:1). **Amber Ink** (ambre-ink, 5.5:1) carries warning lettering on paper.
- **Map Yellow** (jaune): sparing highlight on map layers only.

### Neutral
- **Map Paper** (paper): ground of every day sheet (`surface`).
- **Recessed Paper** (paper-2): chips, table cells, legends, ghost-button hover (`surface-recessed`).
- **Sheet White** (white): raised day panels, the cartouche panel, inputs, inactive pills (`surface-raised`), and lettering on red, green and blue fills (`on-brand`).
- **Hairline** (line): every 1px rule by day (`rule`). Decorative only: 1.3:1 on paper, never a control border on its own. **Strong Hairline** (line-strong) for card hover borders and section breaks (`rule-strong`).
- **Ink Black** (ink): headings and primary lettering, 17.2:1 (`text`). **Body Ink** (ink-2): running copy, 10.1:1 (`text-body`). **Muted Ink** (ink-3): captions, coordinates, legend terms, 6.1:1 (`text-muted`).
- **Night Sheet** (night): night ground. **Night Panel** (night-2): raised night panels and cards. **Night Recess** (night-3): recessed cells and inputs by night.
- **Night Hairline** (night-line) and **Night Strong Hairline** (night-line-strong): the night rules.
- **Snow** (snow, 16.8:1), **Snow Body** (snow-2, 12.2:1), **Snow Muted** (snow-3, 7.5:1): night lettering. There is no `snow-1`.

The territory layers (`map-paper`, `map-woods`, `map-contour`, `map-contour-index`, `map-water`, `map-lake`, the four `map-road-*` classes, `map-rail`, `map-grid`, `map-label`, `map-halo`, `map-wind`) are the only tokens with their own night values in code; they live in `app/globals.css` and `design-system/tokens.json` and tint the SVG masks of `public/carte/`.

### Named Rules
**The Role Pair Rule.** Every surface, rule and text colour is written as a day/night pair: `surface` = `bg-paper dark:bg-night`, `surface-raised` = `bg-white dark:bg-night-2`, `surface-recessed` = `bg-paper-2 dark:bg-night-3`, `rule` = `border-line dark:border-night-line`, `text` = `text-ink dark:text-snow`, `text-body` = `text-ink-2 dark:text-snow-2`, `text-muted` = `text-ink-3 dark:text-snow-3`, `text-accent` = `text-brand dark:text-brand-soft`. A day class without its night pair, or a pair naming a token that does not exist, is a bug.
**The Spot Ink Rule.** Each ink means one thing on the map and in the UI (red road and action, bistre relief, hydro water and weather, vert woods and attendance, ambre warning). No decorative gradients, pastels or SaaS blues and purples.
**The One Red Rule.** Route Red marks the one action a view is for and live state. It is never a broad background wash; washes use Crimson Wash behind red lettering.
**The Small Text Ink Rule.** Small text never uses Road Red Vif, Amber, Night Red on paper, or Relief Bistre on paper: use Route Red Strong, Amber Ink, Bistre Ink and Deep Woodland.

## Typography

**Display Font:** Archivo (`var(--font-archivo)`, variable `wdth` 62–125 and `wght` 100–900, loaded with next/font), with ui-sans-serif, system-ui fallback
**Body Font:** Archivo
**Label/Mono Font:** Archivo at narrow width with tabular figures; no monospace face

**Character:** One technical, athletic superfamily that runs from condensed map annotations to wide extra-bold cartouche titles. The width axis does the work other systems give to extra families or tracking.

### Hierarchy
- **Display** (800, clamp(2.1rem, 4.8vw, 4.25rem), line-height 0.94, wide 125%, uppercase): the cartouche title of `SheetHeader`, one per page, max 20ch; size lg goes to clamp(2.4rem, 6vw, 5.25rem).
- **Headline** (800, clamp(1.5rem, 3vw, 2.25rem), line-height 1.05, semiwide 112.5%, uppercase): section headlines. Nothing above them.
- **Title** (700, 1.125rem, line-height 1.3, normal width): route names, card, drawer and dialog titles.
- **Body** (400, 1rem, line-height 1.6): descriptions, regulations, form help, 65–75ch.
- **Label** (700, 0.75rem, letter-spacing 0.08em, narrow 87.5%, uppercase): badges, table headers, legend terms and the sheet margin (those two at 11px and 0.12em).
- **Button** (700, 0.8125rem, letter-spacing 0.07em, narrow, uppercase): button lettering; sm 0.75rem, lg 0.875rem.
- **Telemetry** (700, tabular figures, semiwide in legends): every metric with its unit and a non-breaking space before it.
- **Carnet de route** (`.prose`): body 1.0625rem / 1.72 in body ink, h1 clamp(2rem, 4.5vw, 2.75rem) and h2 clamp(1.45rem, 2.8vw, 1.9rem) semiwide, h2 with a hairline above.
- **Condensed** (75%): dense map annotations only.

### Named Rules
**The Width-Over-Tracking Rule.** Hierarchy is set with `font-wide`, `font-semiwide`, `font-narrow` and `font-condensed`, not with stretched letter-spacing or a second family.
**The Tabular Metric Rule.** Every cycling metric (km, m D+, km/h, splits, counts in legends) uses `tabular-nums`, its unit and French number format: decimal comma, non-breaking space before the unit ("84,5 km").
**The No-Eyebrow Rule.** No uppercase kicker or eyebrow above a headline. The sheet name belongs in the cartouche margin ("Feuille · Calendrier"), not above the title.

## Layout

The page is a map sheet. A `max-w-7xl` container (1280px) with gutters of 16px on phones, 24px from 640px and 32px from 1024px. Spacing runs on a 4px base: 4, 8, 12, 16, 24, 32, 40, 48 and 64px. Breakpoints are Tailwind's: 640px (tablet gutter, taller cartouche band), 768px (wordmark subline), 1024px (cartouche splits into an 8-column title block and a 4-column legend), 1280px (container width).

Every public page opens with the `SheetHeader` cartouche, its map band 128px tall (160px from 640px) and the panel pulled 56px (80px) over it. Below, compose on a 12-column grid with varied spans: a map preview beside a tabular block, a legend beside prose. Back-office pages keep the same tokens on a denser sidebar layout and do not need a cartouche.

**The Map Sheet Rule.** Never compose a page from rows of identical cards. Vary spans, pair a map with its table, and put the key facts in a legend.
**The Touch Target Rule.** Controls reach 44px on phones: buttons are 44px tall below 640px (40px above), filter pills use the lg size.

## Elevation & Depth

Flat at rest, like printed paper. Depth comes from the two grounds and their raised and recessed steps, from 1px hairlines and from the print frames. Shadows appear only where paper is physically raised above the sheet: the cartouche over its map band, menus, drawers and dialogs.

### Shadow Vocabulary
- **Hairline lift** (`box-shadow: 0 1px 0 rgba(22, 24, 27, 0.04)`, shadow-2xs) and **Field** (`0 1px 2px rgba(22, 24, 27, 0.06)`, shadow-xs): small inputs and fields.
- **Card hover** (`0 1px 3px rgba(22, 24, 27, 0.08)`, shadow-sm): optional lift of a clickable card on hover.
- **Cartouche** (`0 3px 8px -2px rgba(22, 24, 27, 0.12)`, shadow-md): the `SheetHeader` panel over the map band.
- **Menu** (`0 10px 24px -8px rgba(22, 24, 27, 0.18)`, shadow-lg): dropdowns, popovers, filter trays.
- **Drawer** (`0 18px 36px -14px rgba(22, 24, 27, 0.24)`, shadow-xl): drawers and the navbar mega-menu.
- **Dialog** (`0 28px 56px -20px rgba(13, 16, 19, 0.38)`, shadow-2xl): modal dialogs.

### Named Rules
**The Flat-At-Rest Rule.** A container declares its elevation once: a 1px `rule` frame at rest, or a shadow because it is raised. Never a wide soft shadow under a bordered card.
**The Printed Frame Rule.** Frames are printed: `neatline` for the cartouche and heroes, `corner-ticks` for callouts and empty states, `scale-strip` under the masthead, `map-grid` over map bands. One framing device per box. No glassmorphism, backdrop blur or glow.

## Shapes

Crisp printed corners. `rounded-sm` (2px) for small cells, icon frames and inline code; `rounded-md` (3px) for buttons, inputs and cards; `rounded-lg` to `rounded-2xl` (4–6px) for larger cards, panels and sheet containers; `rounded-3xl` (8px) is the maximum, for dialogs and drawers. `rounded-full` belongs to status chips, filter pills and tags only. Rules are 1px; the neatline adds a graduated band of 32px ink segments inside its top and bottom edges; corner ticks are 10px.

**The Sheet Corner Rule.** Buttons, inputs, cards and panels stay between 2px and 6px; a pill-shaped button or card is off-system.

## Components

### Buttons
Rectangular actions with narrow uppercase lettering; red marks the one action of a view (`app/components/ui/Button.tsx`, `cva`).
- **Shape:** crisp 3px corners (rounded-md); height 40px (44px below 640px), sm 36px, lg 48px, icon 36×36.
- **Primary (`default`):** Route Red fill, white lettering, a 2px inner bottom shade; hover Route Red Strong. One per view.
- **Outline:** 1px ink border and ink text, fills ink with white text on hover; by night snow-2 border, fills snow.
- **Secondary:** solid ink with white text (snow with night text by night), hover body ink.
- **Ghost:** transparent, recessed paper on hover. **Destructive:** Route Red Strong, hover ink. **Link:** sentence case, `text-accent`, underline on hover.
- **Admin:** `admin-primary` (red), `admin-secondary` (white with hairline), `admin-danger` (Crimson Wash, Route Red Strong text, red fill on hover).
- **States:** 150ms colour transitions, pressed 1px down, global focus ring 2px Route Red with 2px offset, disabled at 50% opacity; `isLoading` shows the spinner and disables.

### Chips
Full-pill status chips in narrow uppercase lettering, the only pill shape (`app/components/ui/Badge.tsx`).
- **Style:** 4px × 10px padding, 0.75rem (sm 11px), 1px border in the ink of the variant at 25–30%.
- **Variants:** `brand`/`danger` (Crimson Wash, Route Red Strong), `brand-solid`, `neutral` (ink), `paper` (recessed paper with hairline), `success` (Woodland Wash, Deep Woodland: Carré Vert, validated rides), `warning` (amber wash, Amber Ink), `outline`.
- **Filters:** `pill-active` (ink fill, white) and `pill-inactive` (white with hairline, ink border on hover), lg size 44px for touch.
- **State:** carried by the words and the variant, never by colour alone; metrics inside a chip are tabular.

### Cards / Containers
- **Corner Style:** 3px (rounded-md), up to 6px for large containers.
- **Background:** `surface-raised` (white by day, night panel by night) on the page ground; recessed cells use `surface-recessed`.
- **Shadow Strategy:** none at rest; shadow-sm only as a hover lift on clickable cards (see Elevation & Depth).
- **Border:** 1px `rule`; `rule-strong` on hover.
- **Internal Padding:** 16px minimum, 24px standard, 32–48px for empty states and cartouche panels.

### Inputs / Fields
- **Style:** white field (night recess by night), 1px `rule` border, 3px corners, 8px × 14px padding, 0.875rem text, Route Red caret, shadow-xs. Every field has a visible French label in label style above it.
- **Focus:** border and a 1px ring in Route Red.
- **Recessed variant:** filter bars use recessed paper (night ground by night) at 2px corners, no shadow.
- **Error / Disabled:** error text in Route Red Strong under the field; disabled at 50% opacity. There is no shared Input component yet: the class string repeats across forms.

### Navigation
- **Masthead** (`app/components/layout/Navbar.tsx`): sticky, 64px, `surface` with a bottom hairline, Wordmark at left, narrow uppercase section triggers opening a mega-menu on Sheet White with a scale strip and shadow-xl, theme toggle (Feuille de jour / Feuille de nuit), skip link to the content.
- **Mobile:** menu button opening a full-height drawer with the same groups; touch targets 44px.
- **Footer** (`Footer.tsx`): link columns built from the navbar menus (`footerNavigation`), next ride card, sheet-margin style bottom bar.
- **Back-office:** sidebar of the sections the user's role can open (`app/constants/admin-sections.ts`), command palette.

### SheetHeader (signature)
The page cartouche (`app/components/carte/SheetHeader.tsx`): map band of the territory with the 2 km grid, a neatline panel pulled over it (shadow-md), the display title (max 20ch), optional description (62ch), children and actions, a legend column of term / value / hint rows (4 of 12 columns from 1024px), and the sheet margin "Feuille · <sheet>" with the coordinates. Tones: `paper` (default), `vert` (Carré Vert pages), `rouge` (club moments, sparingly), `nuit` (ink panel). Props `title`, `sheet`, `description`, `legend`, `actions`, `focus`, `tone`, `size`, `legendFooter`.

### Sheet primitives (signature)
`neatline`, `corner-ticks`, `scale-strip`, `map-grid` and `map-label` utilities in `app/globals.css`, with their inks `--neat`, `--tick`, `--strip` (ink by day, snow-2/snow-3 by night). They replace shadows and gradients as the way to frame.

### ScaleBar, Wordmark, EmptyState, Prose (signature)
- **ScaleBar** (`app/components/carte/ScaleBar.tsx`): true-to-scale kilometre bar in alternating strip ink with 10px tabular labels, paired with the north arrow; its width is tied to `--sheet`.
- **Wordmark** (`app/components/brand/Wordmark.tsx`): the Heart Line mark in Road Red Vif (variants `pulse-heart`, `ecg`, `contour`) beside BLANMONT in wide extra-bold capitals; narrow subline from 768px; the mark lifts 2px on hover with `ease-stamp`.
- **EmptyState** (`app/components/ui/EmptyState.tsx`): corner-ticked hairline box, 56px square icon frame, semiwide uppercase title, one sentence saying what is missing and the next step, at most two actions (primary red, second outline).
- **Prose** (`.prose`): "Carnet de route" article typography with square red list markers, Route Red Strong links with a 40% red underline, ink-ruled blockquotes and a dashed scale-strip `hr`.
- **Map layers:** `TerritoryMap`, `WindField` (canvas wind particles), `WindRose`, `WeatherGlyph`, `RoadSwatch`, `GeodeticMark`: cartographic components drawn from the `map-*` tokens.

### Motion
`ease-plot` (cubic-bezier(0.22, 1, 0.36, 1)) for plotting: the sheet develops outward from the Place de la Féchère in 2.4s, routes draw, the wind rose turns. `ease-stamp` (cubic-bezier(0.2, 0.9, 0.3, 1)) for markers and badges stamping in over 550ms. Controls change colour in 150ms and buttons press 1px down. Everything stops under `prefers-reduced-motion`, the canvas wind field included.

## Do's and Don'ts

### Do:
- **Do** write every user-facing string in idiomatic French, verb first on actions ("Télécharger le GPX", "S'inscrire"), no exclamation marks, no emoji.
- **Do** write colours as role pairs that exist in `app/globals.css`: `bg-paper dark:bg-night`, `border-line dark:border-night-line`, `text-ink-3 dark:text-snow-3`.
- **Do** open every public page with `SheetHeader` and put its key facts in the legend.
- **Do** set every metric in `tabular-nums` with its unit and French number format ("84,5 km", "720 m D+", "26,0 km/h", "08:30").
- **Do** frame with 1px hairlines, the neatline or corner ticks, one device per box.
- **Do** keep one primary red button per view and make every control 44px tall on phones.
- **Do** say what happened and the next step in empty and error states ("Aucune sortie prévue cette semaine. Proposez un parcours.").
- **Do** parse dates in Europe/Brussels and stop every animation under `prefers-reduced-motion`.

### Don't:
- **Don't** hard-code hex values or inline styles in components; use the tokens of `app/globals.css`.
- **Don't** use a token that does not exist (`dark:text-snow-1`): the element keeps its day colour by night.
- **Don't** use glassmorphism, backdrop blur, blur halos, glows or gradient text; surfaces are flat paper or night sheet.
- **Don't** use Poppins, Inter, Roboto or any second face; Archivo is the only family.
- **Don't** round buttons, inputs or cards beyond 6px or into pills; `rounded-full` is for chips and pills only.
- **Don't** set small text in Road Red Vif, Amber, Night Red or Relief Bistre on paper; use Route Red Strong, Amber Ink, Bistre Ink, Deep Woodland.
- **Don't** spread Route Red as a background wash or add a second primary action.
- **Don't** place an eyebrow label above a headline or build a page from rows of identical cards or hero-metric tiles.
