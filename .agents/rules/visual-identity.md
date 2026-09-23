# Visual Identity Invariants — La Feuille de Blanmont (Carte IGN)

Every AI agent working on the CC Saint-Martin Blanmont repository must strictly adhere to the following visual identity guidelines:

## 1. Specification Reference
- Primary source of truth: `DESIGN.md` (root) and `.impeccable/design.json`.
- Creative North Star: **"La Feuille de Blanmont — Carte IGN"** (topographic sheet of the club's territory around Place de la Féchère).

## 2. Mandatory Rules

### Grounds
- Day Sheet: `bg-paper` (`#fbfbf8`), recessed `bg-paper-2` (`#f0f1eb`).
- Nocturnal Sheet: `bg-night` (`#0d1013`), raised `bg-night-2` (`#151a1f`).
- Hairline Dividers: `border-line` (`#dcddd4`), nocturnal `border-night-line` (`#28303a`).

### Spot Inks
- Route Red: `brand` (`#d63535`), map roads `brand-vif` (`#e03e3e`), hover `brand-strong` (`#b82b2b`).
- Relief Bistre: `bistre` (`#b0703b`) — for topographic contours & gravel surfaces.
- Hydro Blue: `hydro` (`#1f6fbf`) — for waterways, wind vectors, GPX lines.
- Woodland Green: `vert` (`#2e7d45`), woodland wash `bois` (`#dcebcf`) — for Carré Vert assiduité.
- Amber: `ambre` (`#e8962a`) — for warnings, secondary roads.

### Typography
- Sole font family: Google variable font `Archivo` (`var(--font-archivo)`).
- Hierarchy carries through **font width**:
  - Display: `font-wide font-extrabold uppercase`
  - Headlines: `font-semiwide font-extrabold uppercase`
  - Route titles: `font-bold`
  - Labels & tags: `font-narrow font-bold uppercase tracking-[0.08em]`
  - Cycling telemetry: `tabular-nums font-bold` for distance, elevation, and speed.
- PROHIBITION: Never use Poppins, Inter, or arbitrary fonts.

### Signatures & Components
- Page headers: `<SheetHeader />` (`app/components/carte/SheetHeader.tsx`).
- Benchmark: `<GeodeticMark />` (`50°37′23″ N · 4°38′32″ E`).
- Corners: Crisp 2px–6px radii (`rounded-sm` to `rounded-2xl`). Full pills (`rounded-full`) reserved strictly for status chips and tags.
- Precision: 1px neatlines, corner ticks (`corner-ticks`), flat-by-default surfaces. Zero glassmorphism, zero artificial blur halos.
