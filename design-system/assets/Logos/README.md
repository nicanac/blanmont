# Logos

The club's marks, exported from the React components as single-ink SVGs.

- `heart-line-pulse.svg`: the Heart Line mark, default variant (`pulse-heart`): a heart contour crossed by a cardiac pulse. Ink `brand-vif` #e03e3e, 2px round stroke on a 24px grid.
- `heart-line-ecg.svg`: pulse line only (`ecg`).
- `heart-line-contour.svg`: heart contour only (`contour`).
- `heart-line-app-icon.svg`: the app icon master. The Heart Line redrawn as one constructed stroke (stub, heart contour, pulse across the shoulders, stub) on map paper with a hairline neatline and corner ticks. Generated with the favicon, apple-touch and manifest icons by `scripts/build-app-icons.mjs`; edit the geometry there, never the PNGs.
- `geodetic-mark.svg`: the geodetic point, △ in ink with a paper centre dot: the Place de la Féchère, where every ride starts.
- `north-arrow.svg`: the sheet's north arrow, ink with a paper half.

Source components: `app/components/brand/HeartLineMark.tsx`, `app/components/carte/GeodeticMark.tsx`, `app/components/carte/ScaleBar.tsx` (`NorthArrow`). In the app they draw in `currentColor`; these files fix the day inks. On the night sheet use the components, or swap #16181b for #eef1f4 and #fbfbf8 for #0d1013.
