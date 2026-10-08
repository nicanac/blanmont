# Taste and direction

## Direction

### home

- **Goal:** Résoudre les collisions responsive et défauts visuels sur mobile (≤ 390px) identifiés dans l'Issue #155 (débordement du libellé "VTT" dans GroupRoads, double bordure de séparation dans PhotoPlates, étirement plein écran du ThemeToggle dans le Footer) et parfaire le rythme mobile.
- **Direction:** Same look, just cleaner — préserver rigoureusement l'univers graphique "La Feuille de Blanmont — Carte IGN" tout en nettoyant les maladresses d'agencement sur petits écrans.
- **Keep:** Système de design Carte IGN (tokens paper/night, bistre/vert/hydro/ambre, typographie Archivo display/narrow, filets continus 1px hairlines, cartouches IGN, contenus et textes actuels).
- **Avoid:** Esthétique générique SaaS, dégradés, ombres portées floues, suppression de données ou altération des présentations desktop (1440px).
- **Users:** Cyclistes du club et visiteurs découvrant le peloton sur smartphone (375px–390px) et ordinateur de bureau (1440px).
- **Reference:** Spécifications de la feuille IGN dans `DESIGN.md` et `.impeccable/design.json`.

## Taste rules

| id | Rule |
|---|---|
| T1 | **Stay in the visual world.** Tokens, fonts, radii and shared components stay unless Direction names them. Refinement, not redesign. |
| T2 | **The primary task leads.** The first thing the eye lands on is what the visitor came for: the key figure, the main action, the content. |
| T3 | **One color per meaning, from tokens.** Two shades for one meaning is a bug, and so is a raw value next to a token. Color marks meaning, not decoration. |
| T4 | **One spacing scale, one type scale.** Every gap and size comes from the repo's scale. Related things sit closer than unrelated things. |
| T5 | **Aligned edges.** Content reads along a left edge. Labels, figures and actions line up across rows and sections. |
| T6 | **Both themes are real.** Dark mode gets the same hierarchy and contrast as light. Nothing disappears, glows or turns muddy. |
| T7 | **Both widths are real.** At 390 nothing clips, scrolls sideways or shrinks below a 24px tap target. Tables scroll or collapse inside themselves. |
| T8 | **Cut before you add.** Remove duplicate actions, redundant copy and decorative chrome before adding a section, a color or an animation. |
| T9 | **Honest copy.** Labels say what things do. Errors say what failed and how to fix it. Claims match the product. |
| T10 | **Reuse, then extend.** Use the repo's shared components and extend them by prop. A one-off copy is a problem even when it looks good. |

## Slop tells

Check every screenshot for these. Each hit is a problem citing the tell and the rule it breaks.

- **S1** A grid of equal tiles, each with an icon on top, a bold title and two lines of filler. (T2, T8)
- **S2** Gradient text, glow, shimmer or pulse rings used as decoration. (T3)
- **S3** Icon-in-a-tile section headers, or emoji as icons. (T8)
- **S4** Pastel washes, tinted banners and badges on everything. (T3, T8)
- **S5** Everything centered, with no edge to read along. (T5)
- **S6** Decorative backgrounds (blobs, mesh gradients) competing with the task. (T2)
- **S7** Fake-precise stats or unverifiable claims. (T9)
- **S8** Oversized padding and type on a working app page. (T4)
- **S9** Repeated chrome: two headers, a card inside a card, two CTAs saying the same thing. (T8)
- **S10** Dark mode as inverted light mode: pure-black surfaces, unreadable gray text, colors that lose meaning. (T6)
