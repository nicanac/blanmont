# Craft floor

Load this after the direction is settled, and build without announcing the checklist. A pinned brief or the committed visual world overrides anything here except a line marked as a ban; your own habit does not. When the design hook is active it already enforces the mechanical checks below as you edit: act on its findings instead of re-auditing each rule.

## Verify

Each of these is a check on the built result, not an intention. Run them together in each batched look at the render (on the web, one `.claude/skills/impeccable/scripts/impeccable shot <page or url>`), not as separate screenshot trips; the checks share one render.

- **Contrast:** body and placeholder text ≥4.5:1, large text ≥3:1. On colored surfaces tint secondary text from that hue or the foreground; never gray.
- **Depth:** shadows carry an offset and a soft blur. A zero-offset colored halo is decoration.
- **Spacing:** tight groups, generous separation, more space above a heading than below it. Read the computed values.
- **Type:** body measure 65–75ch, display max 6rem, tracking floor -0.04em, balanced headings, obvious scale and weight steps. Run the real copy at every breakpoint and fix what overflows.
- **Motion:** one authored moment, not scattered effects and not one identical entrance on every section. Exponential ease-out from an already-visible default. Reach past transform and opacity: blur, backdrop-filter, clip-path, mask, and shadow belong to the palette when they stay smooth.
- **States:** hover, disabled, loading, error, empty. Plus real content, working controls, responsive composition, keyboard focus.
- **Browser surfaces:** the parts you did not draw still carry the design. Text selection, the caret, custom scrollbars, focus rings, underline offset, and the numerals in tabular data all ship with browser defaults that belong to no design system. Theme them from the palette. This is the cheapest signal that a page was built rather than assembled, and the one models skip most reliably.
- **Copy:** the product's own language. Controls name their action; errors name the problem and the recovery.
- **Coverage:** every brief requirement present and findable within seconds.

## Refuse

These are the category's defaults, not bans: the brief's own words can earn any of them. Reaching for one when the axis is free means you were not deciding; recognizing that means rewriting the element, not softening it.

Page scaffolds:

- Same-size cards of icon plus heading plus text as the page structure. Cards are the lazy container; nested cards are always wrong.
- The hero-metric template: big number, small label, supporting stats, accent.
- A kicker or eyebrow above a heading. This one is a ban, not a default: no brief earns it back. The heading carries its own weight; delete the label and let the heading speak.
- Section numbers (01 / 02 / 03) unless the sequence itself carries information the reader needs.
- A modal for a task that needs neither interruption nor protected focus.

Surface habits:

- Gradient text. Emphasis comes from weight or size.
- Glass and blur as decoration rather than as a specific effect.
- A bar down one side of a rounded box (a one-sided border, inset shadow or pseudo-element), any colour or state. Use a full border, a tint, or a leading icon or label.
- Hard offset shadows (`box-shadow: 4px 4px 0`) outside a world that is actually neobrutalist. The zero-blur block shadow is a costume, not a depth system; a world that did not choose it never earns it as a default.
- Sparklines, progress rings, and soft-shadowed rounded rectangles standing in for content.
- Monospace as a costume for "technical" rather than for code, data, or measurement.
- A system display face (Impact, Arial Black, the platform sans) as the display voice of an own-world page. Source and self-host a face whose character matches the approved lettering (Google: `.claude/skills/impeccable/scripts/impeccable font-fetch <Family>`); the closest installed font is a failure, not a fallback.
- Unicode glyphs or emoji standing in for an icon system. Icons are drawn, from a real library or authored SVG, in one consistent stroke and weight.
- Geometric masks standing in for organic contours. A circle, polygon, or radial-gradient cutout approximating a photographic subject's edge is the cheap version of the effect and reads worse than omitting it. Derive an alpha matte from the actual image, or produce a cut-out asset.
- Light or dark picked by category. Pick it from the use scene: who, where, under what ambient light.

<!-- Blanmont project block: re-apply after every `npx impeccable update` (tests/design-system-integrity.test.ts checks it). -->
Project non-negotiable refusals ("La Feuille de Blanmont — Carte IGN"; sources `app/globals.css` → `design-system/tokens.json` → `design-system/README.md`):

- Card, container, button and input radii outside crisp 2px–6px (`rounded-sm` to `rounded-2xl`, standard 3px `rounded-md`): the surfaces are printed map sheets. Full pill radii (`rounded-full`) only for status chips, filter pills and tags, never buttons or cards. Declare elevation once: a 1px `rule` frame at rest, a shadow only on raised paper (menus, drawers, dialogs, the cartouche over its map band).
- Generic SaaS dashboards, glassmorphism, blur halos, purple/indigo themes. Surfaces are flat day map paper (`#fbfbf8`) or night sheet (`#0d1013`), bounded by 1px hairlines (`border-line` / `border-night-line`).
- A day class without its night pair, or a pair that names a token that does not exist (`dark:text-snow-1`): elements keep their day colour by night.
- Poppins, Inter, Roboto or any second face. Archivo with width-driven hierarchy (`font-wide` display, `font-semiwide` headlines, `font-narrow` labels, badges, buttons).
- Non-tabular cycling figures. Every metric (km, m D+, km/h, splits) uses `tabular-nums`, its unit and French number format ("84,5 km").
- Non-cartouche heroes on public pages. Open them with `SheetHeader` (`app/components/carte/SheetHeader.tsx`), coordinates `50°37′23″ N · 4°38′32″ E`, key facts in the legend rather than metric tiles.
- Small text in `brand-vif`, `ambre`, `brand-soft` on paper, `bistre` or `vert` on `bois`: use `brand-strong`, `ambre-ink`, `bistre-ink`, `vert-strong`.
- English user-facing copy. Every user-facing string is idiomatic French, verb first on actions, no exclamation marks or emoji.

The floor holds the mechanics; it never picks the direction. With every check green, spend the page on the committed world, and when torn between refined and committed, commit.
