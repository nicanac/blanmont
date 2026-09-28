## 2026-09-09 - Added ARIA attributes to icon buttons and map toggles
**Learning:** Found several icon-only buttons (like TrashIcon for deletion) lacking `aria-label` and `title` attributes, which makes them inaccessible to screen readers. Also noticed an expandable map section where the toggle button lacked `aria-expanded` state.
**Action:** When adding or reviewing interactive elements, always ensure icon-only buttons have descriptive `aria-label`s and `title`s. For collapsible/expandable sections, always bind `aria-expanded` to the state variable driving the visibility of the content to keep assistive tech in sync.
## 2025-01-20 - Missing Tooltips and Aria Labels on Custom Icons
**Learning:** Found that custom icon buttons, especially those using Heroicons directly like `XMarkIcon` or theme toggle icons, frequently lack `title` attributes (for hover tooltips) or `aria-label`s, which can cause accessibility issues for screen readers.
**Action:** When working on UI enhancements, check if icon-only interactive elements possess `aria-label` and `title` attributes.
