# EmptyState

A framed absence: corner ticks on a hairline box, a square icon frame, an uppercase semiwide title, one sentence of advice and at most two actions.

- **Source:** `app/components/ui/EmptyState.tsx`.
- **Props:** `icon` (component, 28px), `title`, `description`, `primaryAction` and `secondaryAction` (`{label, href?, onClick?, icon?}`), `tip` (a hint line with a light-bulb icon), `className`.
- **Rules:** say what is missing and the next step in French ("Aucune sortie prévue cette semaine. Proposez un parcours."), never a bare "Aucune donnée". Corner ticks use `tick` (ink by day, snow-3 by night). Primary action is a brand button; the second is outline.
