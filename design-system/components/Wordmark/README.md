# Wordmark

The club signature: the Heart Line mark in map-road red beside BLANMONT in wide extra-bold capitals, with a two-line narrow subline.

- **Source:** `app/components/brand/Wordmark.tsx` and `HeartLineMark.tsx`. The marks are also assets in `assets/Logos/`.
- **Props:** `size: md | lg`, `withSubline` (shown from `md` 768px), `onDark` (forces snow lettering), `variant` of the mark: `pulse-heart` (default), `ecg`, `contour`.
- **Rules:** the mark is always `brand-vif` (#e03e3e); the name is `text` (ink / snow). Never recolour the name red, never set it in another face or width, never add an outline or shadow. The link's accessible name is "CC Saint-Martin Blanmont — accueil". On hover the mark lifts 2px with `ease-stamp`.
