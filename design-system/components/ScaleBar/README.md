# ScaleBar

Graphic scale of the sheet: alternating ink and paper kilometre segments with 0 and the total distance under it, usually paired with the north arrow.

- **Source:** `app/components/carte/ScaleBar.tsx` (`ScaleBar`, `NorthArrow`). The north arrow is also an asset: `assets/Logos/north-arrow.svg`.
- **Props:** `km` (segments, default 5), `widthClassName` (must equal `km` kilometres at the sheet's print scale: `calc(var(--sheet) * km / 32)`, the sheet spans 32 km), `label`, `className`.
- **Rules:** the bar is true to scale, never decorative: keep its width tied to `--sheet`. Labels are 10px narrow `tabular-nums`. The segment ink is `strip` (ink by day, snow-2 by night).
