## 2026-09-09 - Added ARIA attributes to icon buttons and map toggles
**Learning:** Found several icon-only buttons (like TrashIcon for deletion) lacking `aria-label` and `title` attributes, which makes them inaccessible to screen readers. Also noticed an expandable map section where the toggle button lacked `aria-expanded` state.
**Action:** When adding or reviewing interactive elements, always ensure icon-only buttons have descriptive `aria-label`s and `title`s. For collapsible/expandable sections, always bind `aria-expanded` to the state variable driving the visibility of the content to keep assistive tech in sync.
## 2025-02-23 - ARIA Label missing on Admin Layout XMarkIcon Button
**Learning:** Found an icon-only button (XMarkIcon) for closing the mobile sidebar in the `AdminLayout` without an `aria-label` attribute. This makes the button completely inaccessible for screen readers as they won't announce what the button does.
**Action:** When adding or reviewing icon-only buttons, especially those that trigger layout changes (e.g. closing/opening sidebars), ensure they always have descriptive `aria-label`s.
