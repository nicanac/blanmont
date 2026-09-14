## 2026-09-09 - Added ARIA attributes to icon buttons and map toggles
**Learning:** Found several icon-only buttons (like TrashIcon for deletion) lacking `aria-label` and `title` attributes, which makes them inaccessible to screen readers. Also noticed an expandable map section where the toggle button lacked `aria-expanded` state.
**Action:** When adding or reviewing interactive elements, always ensure icon-only buttons have descriptive `aria-label`s and `title`s. For collapsible/expandable sections, always bind `aria-expanded` to the state variable driving the visibility of the content to keep assistive tech in sync.
## 2026-09-14 - Added missing ARIA label to Gallery Modal Close Button
**Learning:** Icon-only close buttons in modals frequently lack accessible names, limiting their usability for screen reader users. The `GalleryView.tsx` had an `XMarkIcon` button for closing the preview without any textual description.
**Action:** Consistently ensure that all interactive icon-only elements feature an `aria-label` (e.g. `aria-label="Fermer l'aperçu de l'album"`) in French to align with project localization standards.
