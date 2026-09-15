## YYYY-MM-DD - [A11y/UX Segmented Tabs]
**Learning:** Segmented mode switchers, even when visually distinct, are essentially tab interfaces. In `app/login/page.tsx`, the segmented control was missing structural ARIA attributes and focus indicators, making it hard for keyboard and screen reader users to interact with.
**Action:** When implementing segmented controls or similar mode-switchers, always include `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` for accessibility, and `focus-visible` classes to guarantee visual feedback during keyboard navigation.
