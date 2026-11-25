# Button

Rectangular action with crisp 3px corners and narrow uppercase lettering; route red (`primary`) marks the one action a view is for.

- **Source:** `app/components/ui/Button.tsx` (`cva` variants). Use the component in the app; `.bl-btn` classes in `components/bundle.css` reproduce it outside Next.js.
- **Variants:** `default` → `.bl-btn--primary` (brand fill, `on-brand` text, hover `brand-strong`), `outline` (1px ink border, fills ink on hover), `secondary` (solid ink; snow on night), `ghost` (transparent, `surface-recessed` on hover), `destructive` (`brand-strong`, hover ink), `link` (sentence case, `text-accent`). Admin screens add `admin-primary`, `admin-secondary`, `admin-danger`.
- **Sizes:** `sm` 36px, `default` 40px (44px touch height below `sm`), `lg` 48px, `icon` 36×36.
- **Props:** `variant`, `size`, `isLoading` (shows `Spinner`, disables), `leftIcon` / `rightIcon` (16px icon components), plus native button attributes.
- **Rules:** one primary per view. Verb first, French, uppercase is applied by the style: write "Télécharger le GPX", not "TÉLÉCHARGER". Never `radius-full` on a button. Pressed state moves 1px down; focus is the global 2px `focus-ring` outline.
