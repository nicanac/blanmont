# Input

Text field on white with a 1px `rule` border, 3px corners and a route-red caret; focus turns the border and a 1px ring `brand`.

- **Source:** no shared component yet: the same class string repeats across `app/` forms (`rounded-md border border-line bg-white … focus:border-brand focus:ring-1 focus:ring-brand`). Admin filters use a recessed variant (`rounded-sm bg-paper-2 dark:bg-night`).
- **Classes:** `.bl-field` wraps `.bl-label` (narrow uppercase, `text-muted`), `.bl-input` and `.bl-help`. `.bl-input--recessed` for filter bars.
- **Rules:** every field has a visible French label, not a placeholder alone. Placeholder text uses `text-muted` (6.1:1). The `rule` border alone is 1.3:1 on paper: the white fill against `surface` and the label carry the affordance; focus adds the brand ring.
