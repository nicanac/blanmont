---
name: CC Saint-Martin Blanmont
description: "Design system for the CC Saint-Martin Blanmont cycling platform — Editorial Peloton world"
colors:
  primary: "#e03e3e"
  primary-hover: "#c93434"
  primary-light: "#fdecec"
  paper: "#faf8f5"
  paper-dim: "#f2efe9"
  paper-card: "#ffffff"
  paper-border: "#e4e0d8"
  ink: "#101216"
  ink-deep: "#0a0c10"
  ink-panel: "#161922"
  ink-border: "#262b38"
  ink-body: "#3a3f4a"
  ink-muted: "#5c6370"
  ondark-text: "#f5f6f8"
  ondark-muted: "#a7adbb"
  accent-green: "#10b981"
  accent-amber: "#f59e0b"
  accent-blue: "#3b82f6"
typography:
  display:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "10px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-dark-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ondark-text}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-paper-outline:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card-paper:
    backgroundColor: "{colors.paper-card}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-dark:
    backgroundColor: "{colors.ink-panel}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: CC Saint-Martin Blanmont

## Overview

**Creative North Star: "The Editorial Peloton"**

The CC Saint-Martin Blanmont visual system is the **Editorial Peloton**: a cycling-magazine cover brought to the web. Warm paper grounds, deep ink covers, oversized uppercase Poppins headlines with tight tracking, aggressive brand-red accents, hard-cropped photography, hairline rules, and asymmetric 12-column bento grids. The interface reads like the season preview issue of a premier road-cycling publication and functions seamlessly as the club's digital operating hub.

Surfaces establish rhythm through clear contrast: page covers, site mastheads, and footers adopt deep ink tones, while content spreads and reading surfaces dwell on warm paper grounds. Structure is achieved through 1px hairlines and calibrated whitespace rather than stacked cards and drop shadows. Numbers are treated as sacred artifacts of the sport: tabular numerals, sharp units, and prominent visual weight.

**Key Characteristics:**
- **Editorial Cover Feel:** High-contrast pairing of deep ink (`#101216`) covers and warm paper (`#faf8f5`) spreads.
- **Single Dominant Display:** One commanding clamped uppercase Poppins headline per surface.
- **Full-Strength Accent:** Brand red (`#e03e3e`) reserved strictly for action, live telemetry, and hover highlights.
- **Hairline Precision:** 1px hairline borders (`#e4e0d8` / `#262b38`) define structural boundaries without visual bloat.
- **Sporting Telemetry:** Tabular figures (`tabular-nums`) with dedicated unit hierarchy for kilometers, elevation, and pacing.
- **Mobile Thumb Ergonomics:** Minimum 44px touch targets across interactive controls and quick-action toolbars.

## Colors

The palette pairs warm tactile editorial paper grounds with deep cover inks and aggressive, full-strength crimson sporting accents.

### Primary
- **Brand Crimson Red** (`#e03e3e`): Primary brand color. Used for key calls-to-action, live status indicators, GPX actions, and active navigation indicators.
- **Deep Crimson Hover** (`#c93434`): Interactive hover and pressed state for primary actions.
- **Crimson Tint** (`#fdecec`): Rare, ultra-subtle highlight wash for active selection tags.

### Neutral
- **Warm Editorial Paper** (`#faf8f5`): Base background ground for reading spreads, articles, and member dashboard surfaces.
- **Paper Dim** (`#f2efe9`): Recessed paper background for secondary containers, image placeholders, and subtle contrast zones.
- **Paper Card** (`#ffffff`): Crisp raised surface on paper backgrounds for route cards, bento blocks, and modals.
- **Paper Hairline Rule** (`#e4e0d8`): 1px structural dividing lines across all paper surfaces.
- **Editorial Ink Black** (`#101216`): Primary typography color on paper surfaces and base masthead tone.
- **Deep Cover Onyx** (`#0a0c10`): Inverted background ground for hero cover sections and night spreads.
- **Ink Panel Charcoal** (`#161922`): Elevated surface on dark grounds for cards and drawer menus.
- **Ink Hairline Slate** (`#262b38`): 1px structural dividing lines across all ink surfaces.
- **Ink Body Text Slate** (`#3a3f4a`): Legible, high-contrast paragraph body text on paper grounds.
- **Muted Text Grey** (`#5c6370`): Secondary metadata, unit labels, and captions meeting WCAG AA contrast.
- **On-Dark Headline White** (`#f5f6f8`): High-contrast title and display typography on dark ink covers.
- **On-Dark Muted Slate** (`#a7adbb`): Descriptive copy and secondary info on dark ink covers.

### Functional Accents
- **Peloton Emerald** (`#10b981`): Success states, easy route difficulty, and asphalt/road terrain indicators.
- **Peloton Amber** (`#f59e0b`): Warning states, moderate route difficulty, and gravel/cobblestone indicators.
- **Peloton Sky Blue** (`#3b82f6`): GPX downloads, navigation cues, and weather info badges.

### Named Rules
**The Full-Strength Red Rule.** Brand red (`#e03e3e`) is deployed strictly at full strength on calls-to-action, interactive hover triggers, and live status dots. It must never be diluted into broad pastel background washes.

**The Paper & Ink Contrast Rule.** Never mix muddy mid-tone grays. A surface is either crisp ink or warm editorial paper. Hairlines define the boundary.

## Typography

**Display Font:** Poppins (with `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif` fallbacks)  
**Body Font:** Poppins (with system sans fallbacks)  
**Data Font:** Poppins with `tabular-nums`  

**Character:** Bold, architectural, and geometric. Uppercase display titles convey the visceral momentum of a cycling peloton, while cleanly tracked body type ensures fatigue-free reading of route reports.

### Hierarchy
- **Display** (800 weight, `clamp(2.75rem, 8vw, 5.75rem)`, 0.98 line-height, `-0.03em` tracking): The magazine cover headline. Uppercase, single occurrence per surface, positioned above the fold.
- **Headline** (700 weight, `clamp(1.5rem, 3vw, 2.25rem)`, 1.1 line-height, `-0.015em` tracking): Major section divides, bento headings, and dark panel titles.
- **Title** (600 weight, `1.25rem` [20px], 1.25 line-height): Route names, card headers, dialog titles, and list item headers.
- **Body** (400 weight, `1rem` [16px], 1.6 line-height, max-w `65ch`): Continuous editorial copy, trace descriptions, news articles, and onboarding copy.
- **Label** (600 weight, `0.8125rem` [13px], 1.3 line-height, `0.08em` tracking): Status badges, difficulty chips, and table headers. Uppercase by convention.
- **Data** (700 weight, `1rem`–`1.5rem`, `tabular-nums`): Every cycling metric (distance, elevation gain, average speed, date, rank).

### Named Rules
**The One Cover Headline Rule.** Every primary surface features exactly one oversized, tightly-tracked cover display headline. Competing display headlines on the same viewport are prohibited.

**The Tabular Metric Rule.** All cycling metrics (`km`, `m D+`, `km/h`, time splits) must use `tabular-nums`. Numbers represent the sport — align them like stopwatch splits.

**The No-Eyebrow Rule.** Never place an uppercase kicker or eyebrow label directly above a major headline. Let the scale, weight, and negative space of the headline establish dominance.

## Layout

The spatial model relies on a structured 12-column bento system contained within `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

- **Asymmetric Bento Rhythm:** Grid divisions favor editorial asymmetry (7/5, 8/4, 5/7 splits). Cells vary in tone (paper vs. ink) to prevent repetitive card grids.
- **Hairline Partitioning:** Major sections are separated by 1px rules and generous padding (`py-16 sm:py-24`), avoiding alternating zebra stripes.
- **Cover Hero Transition:** Page tops open with high-contrast ink covers that transition into paper spreads below. On mobile viewports, hero covers collapse into compact header bands.
- **Motion Grammar:** Single authored entrance moment per surface — masked line reveals on display headlines with fast exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`). Hover states execute briskly in 150–200ms. All motion instantly collapses under `@media (prefers-reduced-motion: reduce)`.
- **Mobile Ergonomics:** Essential actions (GPX download, vote, attendance RSVP) remain within thumb reach with minimum 44px touch targets.

### Named Rules
**The Asymmetric Spread Rule.** Never compose a dashboard or landing page from identical, cookie-cutter cards. Vary cell span, height, and surface tone to construct an editorial narrative.

## Elevation & Depth

The CC Saint-Martin Blanmont system is **hairline-first and flat-by-default**. Depth is achieved through tonal contrast and 1px borders rather than diffuse drop shadows.

- **Tonal Stepping:** Surfaces step up through tone: paper (`#faf8f5`) to white card (`#ffffff`); deep ink (`#0a0c10`) to panel charcoal (`#161922`).
- **Shadow Restraint:** Shadows are strictly reserved for elevated overlays (floating dropdowns, modal sheets, sticky bottom action bars).
- **No Decorative Glass:** Blur effects (`backdrop-blur`) are permitted only where readable content genuinely scrolls beneath (such as the sticky masthead).

### Shadow Vocabulary
- **Subtle Lift** (`box-shadow: 0 2px 8px -1px rgba(16, 18, 22, 0.06)`): Micro-elevation on card hover states.
- **Dropdown Float** (`box-shadow: 0 10px 25px -5px rgba(16, 18, 22, 0.12)`): Floating navigation menus and popover filters.
- **Modal Depth** (`box-shadow: 0 25px 50px -12px rgba(10, 12, 16, 0.35)`): Modal dialogs and mobile navigation drawers.

### Named Rules
**The Flat-By-Default Rule.** All surfaces rest flat against their background. Shadows appear solely in response to elevation states (hover, focus, modal overlay).

**The Hairline Depth Rule.** A 1px border (`#e4e0d8` or `#262b38`) conveys precision boundaries faster and cleaner than a soft blur.

## Shapes

- **Editorial Sharp Geometry:** Form controls, inputs, and buttons use a crisp 6px radius (`rounded-md`). Content cards use a restrained 10px radius (`rounded-lg`).
- **Pills as Status Objects:** Full circular pills (`rounded-full`) are strictly reserved for live badges, difficulty chips, and avatar rings. Buttons never use full pill geometry.
- **Hard Photographic Crops:** Route photography and hero imagery fill their containers edge-to-edge (`object-cover`) with tight, intentional cropping.

### Named Rules
**The Status Pill Rule.** Pill radii (`rounded-full`) are reserved for status chips and tags. Buttons remain crisp (`rounded-md`, 6px) to maintain editorial structure.

**The Hard-Crop Rule.** Photography must feel like an intentional editorial photo desk crop: edge-to-edge, rectilinear, and framed boldly.

## Components

### Buttons
- **Primary Action:** Solid crimson background (`#e03e3e`, hover `#c93434`), white bold uppercase text, 6px radius (`rounded-md`), padding `14px 28px`.
- **Dark Outline:** Transparent background, `1px solid rgba(255, 255, 255, 0.25)`, on-dark text (`#f5f6f8`), hover background `rgba(255, 255, 255, 0.05)`.
- **Paper Outline:** White background (`#ffffff`), `1px solid #e4e0d8`, dark text (`#101216`), hover background `#f2efe9`.

### Chips & Badges
- **Style:** Pill shape (`rounded-full`), uppercase micro-typography (`0.75rem`), 1px subtle border.
- **Variants:** Emerald (`bg-emerald-50 text-emerald-800 border-emerald-200`), Amber (`bg-amber-50 text-amber-800 border-amber-200`), Default Paper (`bg-[#f2efe9] text-[#3a3f4a] border-[#e4e0d8]`).

### Cards & Containers
- **TraceCard:** Rectilinear photo header (aspect 4/3 or 16/9), overlay rating chip, hairline divider, bold tabular metrics (`km` and `m D+`), crimson hover title.
- **Paper Card:** White ground (`#ffffff`), 1px hairline border (`#e4e0d8`), 10px corner radius (`rounded-lg`), internal padding `20px`–`24px`.
- **Dark Panel:** Charcoal ground (`#161922`), 1px hairline border (`#262b38`), 10px corner radius (`rounded-lg`).

### Stat Strip
- Horizontal cycling metrics row divided by vertical 1px hairlines. High-contrast bold tabular figures above, uppercase muted tracking label below.

### Inputs & Fields
- Pure white ground, 1px hairline border (`#e4e0d8`), 6px radius (`rounded-md`), brand red caret (`caret-[#e03e3e]`), and 2px crimson outline ring on `:focus-visible`.

### Navigation
- Sticky masthead framed in deep ink (`#101216`), subtle bottom hairline (`#262b38`), high-contrast navigation links, and prominent crimson CTA.

## Do's and Don'ts

### Do:
- **Do** write all user-facing copy in idiomatic French (e.g. "Parcours", "Sorties", "Membres", "Dénivelé", "Télécharger GPX").
- **Do** use Poppins (`var(--font-poppins)`) and Tailwind utility classes across all UI elements.
- **Do** present cycling metrics (distance in `km`, elevation in `m D+`) prominently with `tabular-nums`.
- **Do** design mobile-first with touch-friendly interactive targets (minimum 44px height).
- **Do** let typography scale and whitespace structure pages instead of adding ornamental containers.
- **Do** use 1px hairlines and tonal stepping to create visual hierarchy.

### Don't:
- **Don't** place a kicker or eyebrow label above a headline — the headline speaks for itself.
- **Don't** use decorative glassmorphism, gradient text, or colored drop-shadow halos.
- **Don't** build pages as monotonous rows of identical cards; vary cell span, tone, and rhythm.
- **Don't** use raw English terms in member interfaces (use "Sortie du Samedi" instead of "Saturday Ride", "Parcours" instead of "Traces").
- **Don't** use full pill radii (`rounded-full`) on buttons; reserve pills strictly for status indicators.
- **Don't** parse dates with naive UTC `new Date("YYYY-MM-DD")` which causes date shifts across timezones.
- **Don't** render Leaflet maps without dynamic client-side loading (`ssr: false`).
