## 2026-09-09 - Added ARIA attributes to icon buttons and map toggles
**Learning:** Found several icon-only buttons (like TrashIcon for deletion) lacking `aria-label` and `title` attributes, which makes them inaccessible to screen readers. Also noticed an expandable map section where the toggle button lacked `aria-expanded` state.
**Action:** When adding or reviewing interactive elements, always ensure icon-only buttons have descriptive `aria-label`s and `title`s. For collapsible/expandable sections, always bind `aria-expanded` to the state variable driving the visibility of the content to keep assistive tech in sync.
## 2024-05-18 - [Add aria labels to delete buttons]
**Learning:** Found several admin components using icon-only buttons for delete actions without aria labels, creating an accessibility issue for screen readers.
**Action:** Always add aria-labels to icon-only buttons.
