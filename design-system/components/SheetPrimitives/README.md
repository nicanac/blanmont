# SheetPrimitives

The four printed-sheet utilities every surface is framed with: `neatline`, `corner-ticks`, `scale-strip` and `map-grid`.

- **Source:** `app/globals.css` (`@utility neatline`, `corner-ticks`, `scale-strip`, `map-grid`, `map-label`). In the app write the Tailwind utility (`className="neatline"`); elsewhere use `.bl-neatline`, `.bl-corner-ticks`, `.bl-scale-strip`, `.bl-map-grid`, `.bl-map-label`.
- **neatline:** 1px frame plus a graduated band (32px ink segments between two fine rules) inside the top and bottom edges. Set `--nl` for another ink (white at 85% on vert and rouge panels). Reserved for the cartouche and hero frames.
- **corner-ticks:** 10px registration ticks at the four corners in `--tick`. For callouts and empty states.
- **scale-strip:** alternating `strip` segments, `--seg` long (24px default). Used under the masthead as the scroll-progress scale.
- **map-grid:** the kilometric grid in `map-grid` ink; `--grid` is one 2 km cell (`--sheet / 16`).
- **Rules:** these replace shadows and gradients as the way to frame. One framing device per container: never neatline and corner ticks on the same box.
