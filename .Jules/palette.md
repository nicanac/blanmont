## 2026-09-09 - Added ARIA attributes to icon buttons and map toggles
**Learning:** Found several icon-only buttons (like TrashIcon for deletion) lacking `aria-label` and `title` attributes, which makes them inaccessible to screen readers. Also noticed an expandable map section where the toggle button lacked `aria-expanded` state.
**Action:** When adding or reviewing interactive elements, always ensure icon-only buttons have descriptive `aria-label`s and `title`s. For collapsible/expandable sections, always bind `aria-expanded` to the state variable driving the visibility of the content to keep assistive tech in sync.

## 2026-09-09 - Add ARIA tab roles to custom tab bars
**Learning:** Custom tab implementations using state and conditionally rendered divs lack built-in accessibility. Screen readers cannot announce the number of tabs or the active tab without explicit ARIA roles.
**Action:** When building custom tab interfaces, always use `role="tablist"` on the container, `role="tab"`, `aria-selected`, and `aria-controls` on the buttons, and `role="tabpanel"` and `aria-labelledby` on the content panels.
