# Badge

Full-pill status chip in narrow uppercase lettering; the only element allowed `radius-full`.

- **Source:** `app/components/ui/Badge.tsx`. Classes `.bl-badge--<variant>` in `bundle.css`.
- **Variants:** `brand` / `danger` (brand-tint ground, brand-strong text), `brand-solid`, `neutral` (ink), `paper` (`surface-recessed` + `rule`), `success` (vert-tint, vert-strong; Carré Vert, validated rides), `warning` (amber wash, ambre-ink), `outline`, and the filter pair `pill-active` / `pill-inactive`.
- **Sizes:** `sm` (11px), `md` (12px, default), `lg` (44px touch target for filters).
- **Props:** `variant`, `size`, `icon` + `iconPosition`, `interactive`.
- **Rules:** state is carried by the variant and the words, never by colour alone. Amber is never text on paper (2.3:1): the warning badge uses `ambre-ink`. Metrics inside a badge get `tabular-nums`.
