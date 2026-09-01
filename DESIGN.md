---
name: "CC Saint-Martin Blanmont"
description: "Design system for the CC Saint-Martin Blanmont cycling platform"
colors:
  primary: "#e03e3e"
  primary-hover: "#c93434"
  primary-light: "#fef2f2"
  primary-selection: "#fee2e2"
  primary-dark: "#991b1b"
  neutral-bg: "#ffffff"
  neutral-surface: "#f8fafc"
  neutral-card: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-text: "#0f172a"
  neutral-muted: "#64748b"
  neutral-subtle: "#94a3b8"
  neutral-scrollbar: "#cbd5e1"
  neutral-dark: "#020617"
  accent-green: "#10b981"
  accent-amber: "#f59e0b"
  accent-blue: "#3b82f6"
typography:
  display:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  data:
    fontFamily: "Poppins, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    fontVariantNumeric: "tabular-nums"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "24px"
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
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

## Overview

The CC Saint-Martin Blanmont visual system ("Ciseco / Eco Sporting") blends crisp athletic modernity with high legibility. Designed for both quick outdoor mobile access and rich desktop route inspection, the interface prioritizes clear elevation/distance data metrics, bold red accents, and high-contrast typography.

## Colors

- **Primary Brand Red** (`#e03e3e`): Core brand identity, primary call-to-actions, active navigation highlights, and key route metrics.
- **Primary Hover** (`#c93434`) & **Primary Light Tint** (`#fef2f2`): Interactive states and subtle badge backgrounds.
- **Neutral Dark / Text** (`#0f172a` / `#020617`): Deep slate for maximum legibility on white surfaces.
- **Neutral Surface & Cards** (`#ffffff` / `#f8fafc`): Pure white base with soft slate-50 tinted surface panels.
- **Neutral Borders** (`#e2e8f0` / `slate-200`): Subtle 1px dividing lines separating card content and sections.
- **Accents**:
  - Emerald Green (`#10b981`): Easy routes, in-stock status, voting success states.
  - Amber Gold (`#f59e0b`): Moderate difficulty, ratings, warnings.
  - Sky Blue (`#3b82f6`): GPX tracks, water stops, navigation markers.

## Typography

- **Font Family**: Google Font `Poppins` (`var(--font-poppins)`), backed by clean system sans-serif fallbacks.
- **Hierarchy**:
  - `Display / Hero`: Bold hero headers (`font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 leading-tight text-balance`).
  - `Headline`: Section titles (`font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 text-balance`).
  - `Title`: Card headings, modal titles (`font-bold text-base sm:text-lg text-slate-900 leading-snug`).
  - `Subtitle / Lead`: Section introduction (`font-normal text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl`).
  - `Body`: Informative paragraphs and descriptions (`font-normal text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl`).
  - `Label / Badge`: Route stats, tags, chip filters (`font-semibold text-xs uppercase tracking-wider`).
  - `Data / Metric`: Numeric cycling stats, distance, elevation, dates, times (`font-bold text-slate-900 tabular-nums`).

## Layout

- **Container**: Max width container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
- **Grids**:
  - Route Catalog & Cards: Responsive 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop) with `gap-6` or `gap-8`.
  - Bento Layout: Asymmetric cards for club presentation and feature showcases (`grid-cols-1 md:grid-cols-3`).
  - Mobile Bottom Sticky Actions: Optimized thumb-zone buttons for voting and downloading GPX files.

## Elevation & Depth

- **Flat / Low-Elevation Philosophy**: Clean modern surfaces relying primarily on 1px subtle borders (`border border-slate-200/80`) and soft backdrop blurs (`backdrop-blur-md`).
- **Interactive Shadows**:
  - Card Default: `shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`.
  - Modal / Drawer: `shadow-2xl` with dark tinted backdrop overlay (`bg-slate-950/40`).

## Shapes

- **Rounded Corners**:
  - Buttons and Chips: Full pill radius (`rounded-full`).
  - Cards, Containers, and Modals: Smooth large radii (`rounded-2xl` or `rounded-3xl`).
  - Inputs and Selects: Soft medium radius (`rounded-xl`).
- **Visual Overlays**: Frosted glass stat overlays on route photo headers (`bg-white/80 backdrop-blur-md rounded-xl p-3`).

## Components

- **Buttons**:
  - Primary: `bg-[#e03e3e] hover:bg-[#c93434] text-white font-medium rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-colors`.
  - Secondary / Outline: `bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-full px-6 py-3 transition-colors`.
- **TraceCard**: Route presentation card featuring hero route image, difficulty color badge, overlay rating, distance/elevation pill chips, and hover effects.
- **FilterPanel**: Sliding drawer for multi-attribute filtering with range sliders, direction selector pills, and clear all reset.
- **CalendarView**: Month-by-month interactive calendar grid with color-coded day badges and event inspection modals.
- **SaturdayRideView**: Interactive voting component with candidate cards, member tally progress bars, and instant optimistic feedback.

## Do's and Don'ts

### Do's
- **DO** write all user-facing copy in idiomatic French (e.g. "Parcours", "Sorties", "Membres", "Dénivelé", "Télécharger GPX").
- **DO** use Poppins (`var(--font-poppins)`) and Tailwind utility classes across all new UI components.
- **DO** present cycling metrics (distance in `km`, elevation in `m D+`) prominently on route cards and previews.
- **DO** design mobile-first with touch-friendly targets (minimum 44px height).

### Don'ts
- **DON'T** use raw English terms in member UI (use "Sortie du Samedi" instead of "Saturday Ride", "Parcours" instead of "Traces").
- **DON'T** introduce heavy, dark gradients or dense Material UI defaults.
- **DON'T** parse dates with naive UTC `new Date("YYYY-MM-DD")` which causes date shifts in different timezones.
- **DON'T** render Leaflet maps without dynamic client-side loading (`ssr: false`).
