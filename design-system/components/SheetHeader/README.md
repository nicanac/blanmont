# SheetHeader

The page cartouche: every public page opens on a band of the club's real territory with its title block printed over it, like the title panel of a topographic sheet.

- **Source:** `app/components/carte/SheetHeader.tsx` (uses `TerritoryMap`, `neatline`, `map-grid`). Mandatory for page headers on the public site; never a generic hero.
- **Anatomy:** map band (128px, 160px from `sm`) with the territory layers and the 2 km grid → neatline panel pulled 56/80px up over the band with `shadow-md` → title (`display` style, `stretch-wide`, uppercase, max 20ch) → optional description (62ch, `text-body`), children (chips, selectors) and actions → legend column (`lg`: 4 of 12 columns) of term / value / hint rows → sheet margin line "Feuille · <sheet>" with the coordinates of the focus point.
- **Props:** `title`, `sheet` (required), `description`, `legend: {term, value, hint?}[]`, `actions`, `focus: {x, y}` (sheet %, Blanmont = 50/50), `tone: paper | vert | rouge | nuit`, `size: md | lg`, `children`, `className`.
- **Tones:** `paper` (default, `surface-raised`), `vert` (Carré Vert pages), `rouge` (club moments, sparingly), `nuit` (ink panel). White text on vert 5.1:1, on brand 4.75:1.
- **Rules:** key facts go in the legend, not as oversized metric tiles. Legend values use `tabular-nums` and French units ("84,5 km", "720 m D+"). No eyebrow above the title. The coordinates default to the Place de la Féchère, 50°37′23″ N · 4°38′32″ E.
