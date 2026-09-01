---
name: "CC Saint-Martin Blanmont"
description: "Design system for the CC Saint-Martin Blanmont cycling platform — Editorial Peloton world"
colors:
  primary: "#e03e3e"
  primary-hover: "#c93434"
  primary-light: "#fdecec"
  primary-selection: "#e03e3e"
  primary-dark: "#991b1b"
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
  ondark-subtle: "#7d8493"
  accent-green: "#10b981"
  accent-amber: "#f59e0b"
  accent-blue: "#3b82f6"
typography:
  display-cover:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
    textTransform: "uppercase"
  display:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
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
    textTransform: "uppercase"
  data:
    fontFamily: "Poppins, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    fontVariantNumeric: "tabular-nums"
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
    textTransform: "uppercase"
    letterSpacing: "0.06em"
    fontWeight: 600
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-dark-outline:
    backgroundColor: "transparent"
    borderColor: "rgba(255,255,255,0.25)"
    textColor: "{colors.ondark-text}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  card-paper:
    backgroundColor: "{colors.paper-card}"
    borderColor: "{colors.paper-border}"
    rounded: "{rounded.lg}"
  card-dark:
    backgroundColor: "{colors.ink-panel}"
    borderColor: "{colors.ink-border}"
    rounded: "{rounded.lg}"
---

## Overview

The CC Saint-Martin Blanmont visual system is the **Editorial Peloton**: a cycling-magazine cover brought to the web. Warm paper grounds, deep ink covers, oversized uppercase Poppins headlines with tight tracking, aggressive brand-red accents, hard-cropped photography, hairline rules, and asymmetric 12-column bento grids. The interface reads like the season preview issue of a great road-cycling magazine — and works like the club's operating hub.

## Colors

- **Brand Red** (`#e03e3e`): the club color. Calls-to-action, live states, key metrics, active navigation. Used at full strength, never as a pastel wash on large areas.
- **Paper** (`#faf8f5`) & **Paper Dim** (`#f2efe9`): warm editorial grounds for reading surfaces. **Paper Card** (`#ffffff`) for raised content on paper.
- **Ink** (`#101216`) & **Ink Deep** (`#0a0c10`): cover pages, hero bands, the site header and footer. Dark is the editorial cover, paper is the spread.
- **Ink Panel** (`#161922`) with **Ink Border** (`#262b38`): raised surfaces on dark grounds — tonal steps, not shadows.
- **Hairlines**: `#e4e0d8` on paper, `#262b38` on ink. Structure comes from 1px rules, not from shadows or stacked cards.
- **Text**: `#101216` headings and `#3a3f4a` body on paper; `#f5f6f8` headings and `#a7adbb` body on ink. Muted text on paper never goes lighter than `#5c6370` (WCAG AA).
- **Functional accents only**: Emerald (`#10b981`) success/easy, Amber (`#f59e0b`) warning/moderate, Sky (`#3b82f6`) GPX/navigation. Never decorative.

## Typography

- **Font Family**: Google Font `Poppins` (`var(--font-poppins)`) everywhere, system sans fallbacks.
- **Cover Display**: `font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[clamp(2.75rem,8vw,5.75rem)]` — the magazine cover headline. One per surface, never two competing.
- **Display**: `font-bold tracking-[-0.025em] leading-[1.02] text-[clamp(2rem,4.5vw,3.25rem)]` for section headlines on paper.
- **Headline**: `font-bold tracking-[-0.015em] leading-[1.1] text-[clamp(1.5rem,3vw,2.25rem)]` for sub-sections and dark panels.
- **Title**: `font-semibold text-lg leading-snug` for cards and list items.
- **Body**: `text-base text-[#3a3f4a] leading-relaxed max-w-[65ch]` on paper; `text-[#a7adbb]` on ink.
- **Label**: `text-[0.8125rem] font-semibold uppercase tracking-[0.08em]` — reserved for chips, badges, and status pills. **Never as an eyebrow above a heading.**
- **Data**: `font-bold tabular-nums` for every cycling metric (km, m D+, km/h, dates, times). Numbers are the sport — set them like they matter.

## Layout

- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Editorial Grid**: 12 columns, asymmetric splits (7/5, 8/4, 5/7). Bento cells vary in span and tone (paper vs ink), never a uniform row of identical cards.
- **Hairline Structure**: sections separate with 1px rules and generous whitespace (`py-16 sm:py-24`), not with alternating gray bands everywhere.
- **Cover Hero**: page tops are ink covers — oversized headline, hard-cropped photography, red accents — collapsing gracefully to a compact band on mobile.
- **Mobile Thumb Zone**: primary actions stay reachable; minimum 44px touch targets.

## Elevation & Depth

- **Hairline-first**: depth comes from 1px borders and tonal steps (paper → white card; ink-deep → ink-panel).
- **Shadows are rare and soft**: only for floating UI (dropdowns, modals, sticky bars) — `shadow-xl` max, always with offset and blur, never colored halos.
- **No decorative glass**: `backdrop-blur` only where content genuinely scrolls beneath (sticky header).

## Shapes

- **Editorial sharp**: inputs and buttons `rounded-md` (6px), cards `rounded-lg` (10px), photos `rounded-sm` (4px) or full-bleed.
- **Pills are status objects**: `rounded-full` only for live indicators, status chips, and avatar rings — never the default button shape.
- **Hard crops**: photography fills its frame edge to edge (object-cover), cropped boldly like a magazine photo desk.

## Components

- **Button Primary**: `bg-[#e03e3e] hover:bg-[#c93434] text-white font-semibold uppercase tracking-[0.06em] text-[0.8125rem] rounded-md px-7 py-3.5 transition-colors`.
- **Button Dark Outline** (on ink): `border border-white/25 text-[#f5f6f8] hover:border-white/50 hover:bg-white/5 rounded-md px-7 py-3.5`.
- **Button Paper Outline** (on paper): `border border-[#e4e0d8] bg-white hover:border-[#101216]/30 text-[#101216] rounded-md px-6 py-3`.
- **Stat Strip**: horizontal metrics separated by hairlines, tabular-nums, label below in muted — replaces the big-number-small-label hero metric.
- **TraceCard**: hard-cropped photo, difficulty chip, distance/elevation stat row over hairline, red hover underline on title.
- **Header/Footer**: always ink — the magazine's masthead and colophon frame every page.
- **CalendarView / SaturdayRideView**: paper surfaces with ink tables and red live states.

## Motion

- **One authored moment per surface**: the home cover's masked headline reveal. Everything else is quiet, fast (`150–300ms`), exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`), transform/opacity only.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` strips all entrance animation to instant.

## Do's and Don'ts

### Do's
- **DO** write all user-facing copy in idiomatic French (e.g. "Parcours", "Sorties", "Membres", "Dénivelé", "Télécharger GPX").
- **DO** use Poppins (`var(--font-poppins)`) and Tailwind utility classes across all new UI components.
- **DO** present cycling metrics (distance in `km`, elevation in `m D+`) prominently with `tabular-nums`.
- **DO** design mobile-first with touch-friendly targets (minimum 44px height).
- **DO** let headings carry the page — size, weight, and whitespace do the work.

### Don'ts
- **DON'T** put a kicker/eyebrow label above a heading — the heading speaks for itself.
- **DON'T** use gradient text, decorative glassmorphism, or colored drop-shadow halos.
- **DON'T** build pages as rows of identical icon-plus-text cards; vary span, tone, and rhythm.
- **DON'T** use raw English terms in member UI (use "Sortie du Samedi" instead of "Saturday Ride", "Parcours" instead of "Traces").
- **DON'T** parse dates with naive UTC `new Date("YYYY-MM-DD")` which causes date shifts in different timezones.
- **DON'T** render Leaflet maps without dynamic client-side loading (`ssr: false`).
