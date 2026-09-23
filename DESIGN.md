---
name: CC Saint-Martin Blanmont
description: "Système de design pour la plateforme cycliste du CC Saint-Martin Blanmont — La Feuille de Blanmont (Carte IGN)"
colors:
  paper: "#fbfbf8"
  paper-2: "#f0f1eb"
  line: "#dcddd4"
  line-strong: "#b8baaf"
  ink: "#16181b"
  ink-2: "#3c4047"
  ink-3: "#5c6069"
  brand: "#d63535"
  brand-strong: "#b82b2b"
  brand-vif: "#e03e3e"
  brand-tint: "#fdeceb"
  brand-soft: "#ff7b72"
  night: "#0d1013"
  night-2: "#151a1f"
  night-3: "#1c2228"
  night-line: "#28303a"
  night-line-strong: "#3a4450"
  snow: "#eef1f4"
  snow-2: "#c9cfd6"
  snow-3: "#9aa3ad"
  bistre: "#b0703b"
  hydro: "#1f6fbf"
  bois: "#dcebcf"
  vert: "#2e7d45"
  ambre: "#e8962a"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
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
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand-strong}"
  button-secondary:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Design System: La Feuille de Blanmont

## Overview

**Creative North Star: "La Feuille de Blanmont — Carte IGN"**

The CC Saint-Martin Blanmont interface is printed like a **topographic sheet** of the club's real territory around the Place de la Féchère (5m contours, Dyle rivers, railway, secondary roads, Bois de Buis). The website is not a generic SaaS dashboard, but a tactile, cartographic document of Flemish & Walloon Brabant cycling routes.

The light sheet rests on creamy topographic map paper (`#fbfbf8`) with black Archivo lettering and official map spot inks (route red, relief bistre, hydro blue, woodland green, and amber). The night sheet inverts onto deep nocturnal inks (`#0d1013`) with crisp snow lettering (`#eef1f4`). Structure is established through precision neatlines (`border-line` / `border-night-line`), corner ticks, geodetic marks, and printed cartouches.

### Key Characteristics:
- **Topographic Sheet Cartouche:** Every major page opens on a band of the club's territory with a printed cartouche header (`SheetHeader`), coordinates, and key facts legend.
- **Archivo Superfamily Hierarchy:** Variable font `Archivo` carrying hierarchy through **font width** (`font-wide`, `font-semiwide`, `font-narrow`, `font-condensed`) rather than oversized tracked type.
- **Spot Inks:** Map colors are semantic spot inks:
  - Route Red (`--color-brand` / `#d63535`, `#e03e3e`): asphalt roads, peloton status, primary actions.
  - Relief Bistre (`--color-bistre` / `#b0703b`): contours, elevation, gravel terrain.
  - Hydro Blue (`--color-hydro` / `#1f6fbf`): rivers, water points, GPX tracks, wind vectors.
  - Woodland Green (`--color-vert` / `#2e7d45`): Carré Vert assiduité, forested routes.
  - Amber (`--color-ambre` / `#e8962a`): warning states, secondary roads.
- **Flat-by-Default & Hairline Precision:** 1px hairline rules (`border-line` / `border-night-line`), crisp 2–6px sheet corners, corner ticks (`corner-ticks`), and zero artificial blur/shadow unless elevated (menus, dialogs).
- **Geodetic Point & Telemetry:** Departure point at Place de la Féchère (`50°37′23″ N · 4°38′32″ E`) printed with the geodetic mark (`GeodeticMark`), tabular figures (`tabular-nums`) for all metrics (km, m D+, km/h, stopwatch splits).

## Colors

The palette is composed strictly of physical cartographic spot inks and survey sheet grounds.

### Primary (Club Route Red)
- **Route Red** (`#d63535`): Primary brand action color, calibrated for WCAG AA contrast against paper.
- **Route Red Strong** (`#b82b2b`): Hover and pressed state for primary action buttons.
- **Map Route Red Vif** (`#e03e3e`): Arterial road tracks on maps, live activity indicators.
- **Brand Tint** (`#fdeceb`): Subtle crimson wash for active pill chips and callouts.
- **Brand Soft** (`#ff7b72`): Crimson highlight on nocturnal dark sheets.

### Secondary (Map Spot Inks)
- **Relief Bistre** (`#b0703b`): Topographic contour lines, elevation gradients, gravel surfaces.
- **Hydro Blue** (`#1f6fbf`): Waterways, wind vectors, live weather streams, GPX route lines.
- **Woodland Green** (`#2e7d45`): Carré Vert challenge, attendance badges, validated ride states.
- **Bois de Buis** (`#dcebcf`): Woodland coverage area tint on vector map layers.
- **Amber Caution** (`#e8962a`): Secondary road classes, warnings, temporary route detours.

### Neutral (Day Paper & Lettering)
- **Map Paper** (`#fbfbf8`): Base map paper ground for day sheets.
- **Recessed Paper** (`#f0f1eb`): Recessed survey ground, chip backgrounds, tabular cells.
- **Hairline Neatline** (`#dcddd4`): 1px structural dividing lines on day paper.
- **Line Strong** (`#b8baaf`): High-contrast dividing borders between sections.
- **Ink Black** (`#16181b`): Primary printed black typography.
- **Ink Body** (`#3c4047`): Body text and readable descriptions.
- **Ink Muted** (`#5c6069`): Secondary metadata, captions, coordinates.

### Neutral (Night Sheet & Snow)
- **Night Ground** (`#0d1013`): Base nocturnal survey ground.
- **Night Panel** (`#151a1f`): Raised nocturnal card panel.
- **Night Surface** (`#1c2228`): Secondary nocturnal surface.
- **Night Line** (`#28303a`): 1px structural dividing lines on dark grounds.
- **Night Line Strong** (`#3a4450`): High-contrast nocturnal border.
- **Snow Lettering** (`#eef1f4`): Primary display and heading typography on dark grounds.
- **Snow Body** (`#c9cfd6`): Secondary readable copy on dark grounds.
- **Snow Muted** (`#9aa3ad`): Muted labels and coordinates on dark grounds.

### Named Rules
**The Map Spot Ink Rule.** Colors represent physical geography and cycling telemetry (Route Red, Relief Bistre, Hydro Blue, Woodland Green, Amber). Never introduce decorative gradients, arbitrary pastels, or SaaS purples.
**The Ground Contrast Rule.** Surfaces are strictly authentic map paper (`#fbfbf8`) or nocturnal sheet (`#0d1013`), divided by 1px neatlines. Muddy mid-tone grays are prohibited.
**The Full-Strength Brand Accent Rule.** Brand red (`#d63535`) is reserved strictly for action triggers, active tabs, live dots, and primary CTAs. It must never be diluted into broad pastel background washes.

## Typography

**Display Font:** Archivo (`var(--font-archivo)`), Google variable font with `wdth` axis (62% to 125%)
**Body Font:** Archivo (`var(--font-archivo)`)
**Label / Mono Font:** Archivo (`var(--font-archivo)`) with `font-narrow` (`wdth: 85%`) and `tabular-nums`

**Character:** Technical, utilitarian, and athletic. Archivo spans from ultra-condensed technical cartographic labels to commanding wide display headings without introducing conflicting font families.

### Hierarchy
- **Display** (`font-extrabold font-wide`, `clamp(2.5rem, 7vw, 5rem)`, `leading-[0.92]`, `letter-spacing: -0.02em`, uppercase): Cartouche sheet titles, primary page heroes.
- **Headline** (`font-extrabold font-semiwide`, `clamp(1.5rem, 3vw, 2.25rem)`, `leading-[1.05]`, `letter-spacing: -0.01em`, uppercase): Major section titles, bento cell headings.
- **Title** (`font-bold`, `1.125rem`, `leading-snug`): Route names, drawer titles, modal dialogs.
- **Body** (`font-normal`, `1rem`, `leading-relaxed`): Route descriptions, article copy, regulations. Max line length 65–75ch.
- **Label / Micro-badge** (`font-bold font-narrow`, `0.75rem`, `leading-tight`, `letter-spacing: 0.08em`, uppercase): Cartouche coordinates, status tags, table column headers.
- **Telemetry & Data** (`font-bold tabular-nums`): All cycling metrics (distance in `km`, elevation in `m D+`, speed in `km/h`, stopwatch splits).

### Named Rules
**The Width-Over-Tracking Rule.** Express typographic hierarchy through Archivo's variable font width (`font-wide` for display, `font-semiwide` for headlines, `font-narrow` for labels) rather than artificially stretched letter-spacing.
**The Tabular Metric Rule.** Every cycling metric (km, m D+, km/h, time splits) must use `tabular-nums` with explicit units.
**The No-Eyebrow Rule.** Never place an ornamental uppercase kicker or eyebrow label directly above a major headline. Let the scale, weight, and negative space of the headline establish dominance.

## Layout

The layout uses a 12-column asymmetric spatial grid enclosed within 1px continuous neatline borders (`border-line` on day paper, `border-night-line` on night sheets).

- **Container Widths:** Default responsive container max-width `max-w-7xl` with 16px (mobile), 24px (tablet), and 32px (desktop) gutter margins.
- **Rhythm & Spacing:** Strict 4px base increment (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Cartouche Banners:** Top-level sections and pages anchor on a full-width cartouche banner (`SheetHeader`) providing territory context and metadata.

### Named Rules
**The Cartouche Sheet Rule.** Every major section or page opens with a cartouche neatline banner (`SheetHeader`) stating coordinates and territory facts.
**The Asymmetric Spread Rule.** Never compose pages from monotonous rows of identical cards; vary cell spans, topographic previews, and tabular blocks to construct an authentic cartographic sheet.

## Elevation & Depth

The system is flat-by-default, honoring authentic printed topographic sheets. Surfaces rest flat against the ground paper or night sheet.

Depth is conveyed through:
1. 1px precision neatline rules (`border-line` / `border-night-line`).
2. Tonal stepping (`bg-paper-2` recessed behind `bg-paper`; `bg-night-2` elevated on `bg-night`).
3. Corner ticks (`corner-ticks`) framing key sheet containers.

### Shadow Vocabulary
- **Sheet Hover** (`0 2px 8px -1px rgba(22, 24, 27, 0.08)`): Micro-elevation on interactive card hover states.
- **Dropdown Float** (`0 10px 25px -5px rgba(22, 24, 27, 0.14)`): Floating navigation menus, popovers, and quick-filter trays.
- **Modal Overlay** (`0 25px 50px -12px rgba(13, 16, 19, 0.45)`): Elevated modal dialogs and mobile navigation drawers.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces rest completely flat against their ground; elevation occurs solely in response to interactive states (hover, focus, modal dialog).
**The Neatline Depth Rule.** A 1px crisp neatline rule conveys precision boundaries faster and cleaner than a soft blur.

## Shapes

Form language is characterized by crisp rectilinear sheet corners, sharp neatlines, and survey geometry.

- **Corner Radii:** Crisp 2px–6px radii (`rounded-sm`: 2px, `rounded-md`: 3px, `rounded-lg`: 4px, `rounded-xl`: 5px, `rounded-2xl`: 6px).
- **Status Pills:** Full pill radius (`rounded-full`: 9999px) reserved strictly for status chips, difficulty pills, and live tags.
- **Hairlines:** Continuous 1px neatline rules on all cards and containers.
- **Corner Ticks:** 4px survey tick marks (`corner-ticks`) at card corners.

### Named Rules
**The Sheet Corner Rule.** Interactive containers and cards use crisp 3px–6px radii reminiscent of printed card sheets; full pill radii are reserved strictly for status chips and badges.
**The Corner Tick Rule.** Hero containers and callout boxes use subtle corner tick marks (`corner-ticks`) evoking survey sheet framing.

## Components

### Buttons
- **Shape:** Crisp 3px radius (`rounded-md`), `active:translate-y-px`.
- **Primary:** Background `--color-brand` (`#d63535`), text `--color-paper` (`#fbfbf8`), padding `12px 24px`, `font-narrow font-bold uppercase tracking-[0.07em]`. Hover: `--color-brand-strong` (`#b82b2b`).
- **Secondary (Paper):** Background `--color-paper-2` (`#f0f1eb`), text `--color-ink` (`#16181b`), border `1px solid --color-line` (`#dcddd4`). Hover: background `--color-line`.
- **Night:** Background `--color-night-2` (`#151a1f`), text `--color-snow` (`#eef1f4`), border `1px solid --color-night-line` (`#28303a`). Hover: background `--color-night-3`.

### Chips & Badges
- **Style:** Spot ink fills with matching border and high-contrast lettering. Full pill radius (`rounded-full`).
- **Variants:**
  - Live Dot: `--color-brand-tint` (`#fdeceb`) background with pulsing Route Red dot.
  - Carré Vert: `--color-bois` (`#dcebcf`) background with `--color-vert` (`#2e7d45`) text.
  - Telemetry: `--color-paper-2` with tabular numerals.

### Cards / Containers
- **Corner Style:** Crisp 3px–6px radius (`rounded-md` / `rounded-2xl`).
- **Background:** `--color-paper` (`#fbfbf8`) on day sheets; `--color-night-2` (`#151a1f`) on dark sheets.
- **Border:** 1px hairline rule (`--color-line` or `--color-night-line`).
- **Internal Padding:** `16px` to `24px`.

### Inputs / Fields
- **Style:** Background `#ffffff` / `--color-paper`, border `1px solid --color-line` (`#dcddd4`), radius 3px (`rounded-md`), caret `--color-brand` (`#d63535`).
- **Focus:** Border `--color-brand`, 1px solid ring.

### Navigation
- **Style:** Topographic header with geodetic mark, club wordmark, navigation links in Archivo narrow, theme toggle (Day Paper / Night Sheet).

### Signature Components
- **`SheetHeader` (`app/components/carte/SheetHeader.tsx`):**
  Topographic cartouche for pages. Displays the sheet name, coordinates, interactive map slice, title, and key facts legend. Replaces generic page heroes.
- **`TerritoryMap` (`app/components/carte/TerritoryMap.tsx`):**
  Vector map layer preview rendering the club territory SVG masks (roads, rail, relief contours, hydrography).
- **`Wordmark` (`app/components/brand/Wordmark.tsx`):**
  Club wordmark combining the geodetic benchmark mark (`GeodeticMark`) with expanded Archivo capitals.
- **`ScaleBar` (`app/components/carte/ScaleBar.tsx`):**
  Topographic scale bar and cardinal north arrow.
- **`WindField` & `WindRose` (`app/components/carte/WindField.tsx`, `WindRose.tsx`):**
  Real-time wind vector flow matching live Open-Meteo telemetry for departure point.
- **`EmptyState` (`app/components/ui/EmptyState.tsx`):**
  Neatline-bordered state container with corner ticks (`corner-ticks`) and contextual advice.

## Do's and Don'ts

### Do:
- **Do** write all user-facing copy in idiomatic French ("Parcours", "Sortie du Samedi", "Dénivelé", "Télécharger GPX").
- **Do** use semantic Tailwind tokens (`bg-paper`, `text-ink`, `border-line`, `bg-night`, `text-snow`, `bg-brand`).
- **Do** use `SheetHeader` for page headers across the public site.
- **Do** format cycling metrics with `tabular-nums` and appropriate French non-breaking spacing (`85 km`, `720 m D+`).
- **Do** respect `prefers-reduced-motion` for all map animations and canvas wind fields.
- **Do** use 1px hairlines and corner ticks to frame cartographic surfaces.

### Don't:
- **Don't** use hardcoded hex utilities (`#101216`, `#faf8f5`, `#0a0c10`) — always use semantic theme tokens.
- **Don't** use decorative glassmorphism, blur halos, or gratuitous gradients. Surfaces are flat paper or night sheets.
- **Don't** use Poppins or arbitrary Google fonts — Archivo is the superfamily.
- **Don't** use naive UTC date parsing that causes date shifts across timezones.
- **Don't** use full pill radii on buttons; reserve pills strictly for status indicators.
