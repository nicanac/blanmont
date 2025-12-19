# GitHub Copilot Instructions

## 1. Type Safety & TypeScript
- **Strict Interfaces**: Every component prop, API response, and data model **MUST** have a defined interface.
- **No `any`**: Explicitly forbid the use of `any`. Use `unknown` or specific generics if dynamic typing is truly needed.
- **Centralized Types**: Import shared interfaces (e.g., `Trace`, `Member`, `SaturdayRide`) from `@/app/types`. Do not redefine them inline.

## 2. Documentation Standards
- **JSDoc Required**: All exported functions, hooks, and components must have JSDoc comments explaining:
  - Purpose of the function.
  - `@param` descriptions.
  - `@returns` description.
- **Complex Logic**: Add inline comments explaining *why* complex logic exists (e.g., specific Notion API workarounds).

## 3. Next.js & React Best Practices
- **Server vs. Client**: default to **Server Components**. Add `'use client'` only when hook usage (state, effects) or event listeners are required.
- **Server Actions**: Use Server Actions (`'use server'`) for form submissions and mutations. Do not use API routes (`pages/api`) unless creating a public webhook.
- **Optimistic UI**: When implementing mutative actions (like Voting), implement `useOptimistic` or local state overrides to provide instant feedback.

## 4. Notion API Integration Rules
- **Access Pattern**: **NEVER** import `@notionhq/client` directly in UI components. ALL database interactions must live in `@/app/lib/notion.ts`.
- **Property Access**: Always safely access Notion properties (e.g., `page.properties.Name?.title?.[0]?.plain_text`). Use the existing helpers to map raw responses to domain objects.
- **Mock Mode**: Always consider `process.env.NOTION_TOKEN` might be missing. Ensure standard functions gracefully fallback or return mock data if `isMockMode` is true.
- **Status Properties**: Remember that Notion "Status" fields are objects: `{ status: { name: 'Value' } }`. They are distinct from "Select" fields.

## 5. Styling
- **CSS Modules**: Use `*.module.css` for component-level styling.
- **Variables**: Reuse global variables from `globals.css` (e.g., `--foreground`, `--accent`) to maintain design consistency.
- **Responsiveness**: Mobile-first media queries are preferred.

## 6. Testing & Debugging
- **Debug Scripts**: If you create a standalone debug script, place it in the `/debug-scripts/` folder with the prefix `debug-`. Do not put it in `app/`.

## 7. Version Control
- **Branch Naming**: When suggesting git commands or branch creations, ALWAYS follow the pattern `user_name/type/feature_explanation_name`.
  - Example: `nicolas_bruyere/feature/trace-filtering`
  - Valid types: `feature`, `fix`, `chore`, `refactor`, `docs`.
- **Commit Messages**: When generating commit messages, use the Semantic Commit pattern: `type(scope): subject`.
  - Example: `feature(trace): add filter by distance`
  - Keep the subject short and imperative (e.g., "add" not "added").

## 8. Continuous Documentation
- **Update Rule**: Whenever you modify code (new features, refactors, bug fixes), you **MUST** simultaneously update:
  1.  Relevant **JSDoc** comments.
  2.  `AI_CONTEXT.md` (if architectural or business logic changes).
  3.  This file (`.github/copilot-instructions.md`) if coding standards evolve.

# Material UI

This is the documentation for the Material UI package.
It contains comprehensive guides, components, and utilities for building user interfaces.

## Components

- [App Bar React component](https://mui.com/material-ui/react-app-bar.md): The App Bar displays information and actions relating to the current screen.
- [Backdrop React Component](https://mui.com/material-ui/react-backdrop.md): The Backdrop component narrows the user's focus to a particular element on the screen.
- [Bottom Navigation React component](https://mui.com/material-ui/react-bottom-navigation.md): The Bottom Navigation bar allows movement between primary destinations in an app.
- [Circular, Linear progress React components](https://mui.com/material-ui/react-progress.md): Progress indicators commonly known as spinners, express an unspecified wait time or display the length of a process.
- [CSS Baseline](https://mui.com/material-ui/react-css-baseline.md): The CssBaseline component helps to kickstart an elegant, consistent, and simple baseline to build upon.
- [Detect click outside React component](https://mui.com/material-ui/react-click-away-listener.md): The Click-Away Listener component detects when a click event happens outside of its child element.
- [How to customize](https://mui.com/material-ui/customization/how-to-customize.md): Learn how to customize Material UI components by taking advantage of different strategies for specific use cases.
- [Image List React component](https://mui.com/material-ui/react-image-list.md): The Image List displays a collection of images in an organized grid.
- [InitColorSchemeScript component](https://mui.com/material-ui/react-init-color-scheme-script.md): The InitColorSchemeScript component eliminates dark mode flickering in server-side-rendered applications.
- [Links](https://mui.com/material-ui/react-link.md): The Link component allows you to easily customize anchor elements with your theme colors and typography styles.
- [No SSR React component](https://mui.com/material-ui/react-no-ssr.md): The No-SSR component defers the rendering of children components from the server to the client.
- [Number field React component](https://mui.com/material-ui/react-number-field.md): A React component for capturing numeric input from users.
- [React Accordion component](https://mui.com/material-ui/react-accordion.md): The Accordion component lets users show and hide sections of related content on a page.
- [React Alert component](https://mui.com/material-ui/react-alert.md): Alerts display brief messages for the user without interrupting their use of the app.
- [React Autocomplete component](https://mui.com/material-ui/react-autocomplete.md): The autocomplete is a normal text input enhanced by a panel of suggested options.
- [React Avatar component](https://mui.com/material-ui/react-avatar.md): Avatars are found throughout material design with uses in everything from tables to dialog menus.
- [React Badge component](https://mui.com/material-ui/react-badge.md): Badge generates a small badge to the top-right of its child(ren).
- [React Box](https://mui.com/material-ui/react-box.md): The Box component is a generic, theme-aware container with access to CSS utilities from MUI System.
- [React Breadcrumbs component](https://mui.com/material-ui/react-breadcrumbs.md): A breadcrumbs is a list of links that help visualize a page's location within a site's hierarchical structure, it allows navigation up to any of the ancestors.
- [React Button component](https://mui.com/material-ui/react-button.md): Buttons allow users to take actions, and make choices, with a single tap.
- [React Button Group component](https://mui.com/material-ui/react-button-group.md): The ButtonGroup component can be used to group related buttons.
- [React Card component](https://mui.com/material-ui/react-card.md): Cards contain content and actions about a single subject.
- [React Checkbox component](https://mui.com/material-ui/react-checkbox.md): Checkboxes allow the user to select one or more items from a set.
- [React Chip component](https://mui.com/material-ui/react-chip.md): Chips are compact elements that represent an input, attribute, or action.
- [React Container component](https://mui.com/material-ui/react-container.md): The container centers your content horizontally. It's the most basic layout element.
- [React Dialog component](https://mui.com/material-ui/react-dialog.md): Dialogs inform users about a task and can contain critical information, require decisions, or involve multiple tasks.
- [React Divider component](https://mui.com/material-ui/react-divider.md): The Divider component provides a thin, unobtrusive line for grouping elements to reinforce visual hierarchy.
- [React Drawer component](https://mui.com/material-ui/react-drawer.md): The navigation drawers (or "sidebars") provide ergonomic access to destinations in a site or app functionality such as switching accounts.
- [React Floating Action Button (FAB) component](https://mui.com/material-ui/react-floating-action-button.md): A Floating Action Button (FAB) performs the primary, or most common, action on a screen.
- [React Grid component](https://mui.com/material-ui/react-grid.md): The responsive layout grid adapts to screen size and orientation, ensuring consistency across layouts.
- [React GridLegacy component](https://mui.com/material-ui/react-grid-legacy.md): The Material Design responsive layout grid adapts to screen size and orientation, ensuring consistency across layouts.
- [React Icon Component](https://mui.com/material-ui/icons.md): Guidance and suggestions for using icons with Material UI.
- [React List component](https://mui.com/material-ui/react-list.md): Lists are continuous, vertical indexes of text or images.
- [React Masonry component](https://mui.com/material-ui/react-masonry.md): Masonry lays out contents of varying dimensions as blocks of the same width and different height with configurable gaps.
- [React Menu component](https://mui.com/material-ui/react-menu.md): Menus display a list of choices on temporary surfaces.
- [React Modal component](https://mui.com/material-ui/react-modal.md): The modal component provides a solid foundation for creating dialogs, popovers, lightboxes, or whatever else.
- [React Pagination component](https://mui.com/material-ui/react-pagination.md): The Pagination component enables the user to select a specific page from a range of pages.
- [React Paper component](https://mui.com/material-ui/react-paper.md): The Paper component is a container for displaying content on an elevated surface.
- [React Popover component](https://mui.com/material-ui/react-popover.md): A Popover can be used to display some content on top of another.
- [React Popper component](https://mui.com/material-ui/react-popper.md): A Popper can be used to display some content on top of another. It's an alternative to react-popper.
- [React Portal component](https://mui.com/material-ui/react-portal.md): The Portal component lets you render its children into a DOM node that exists outside of the Portal's own DOM hierarchy.
- [React Radio Group component](https://mui.com/material-ui/react-radio-button.md): The Radio Group allows the user to select one option from a set.
- [React Rating component](https://mui.com/material-ui/react-rating.md): Ratings provide insight regarding others' opinions and experiences, and can allow the user to submit a rating of their own.
- [React Select component](https://mui.com/material-ui/react-select.md): Select components are used for collecting user provided information from a list of options.
- [React Skeleton component](https://mui.com/material-ui/react-skeleton.md): Display a placeholder preview of your content before the data gets loaded to reduce load-time frustration.
- [React Slider component](https://mui.com/material-ui/react-slider.md): Sliders allow users to make selections from a range of values.
- [React Snackbar component](https://mui.com/material-ui/react-snackbar.md): Snackbars (also known as toasts) are used for brief notifications of processes that have been or will be performed.
- [React Speed Dial component](https://mui.com/material-ui/react-speed-dial.md): When pressed, a floating action button can display three to six related actions in the form of a Speed Dial.
- [React Stack component](https://mui.com/material-ui/react-stack.md): Stack is a container component for arranging elements vertically or horizontally.
- [React Stepper component](https://mui.com/material-ui/react-stepper.md): Steppers convey progress through numbered steps. It provides a wizard-like workflow.
- [React Switch component](https://mui.com/material-ui/react-switch.md): Switches toggle the state of a single setting on or off.
- [React Table component](https://mui.com/material-ui/react-table.md): Tables display sets of data. They can be fully customized.
- [React Tabs component](https://mui.com/material-ui/react-tabs.md): Tabs make it easy to explore and switch between different views.
- [React Text Field component](https://mui.com/material-ui/react-text-field.md): Text Fields let users enter and edit text.
- [React Timeline component](https://mui.com/material-ui/react-timeline.md): The timeline displays a list of events in chronological order.
- [React Tooltip component](https://mui.com/material-ui/react-tooltip.md): Tooltips display informative text when users hover over, focus on, or tap an element.
- [React Transition component](https://mui.com/material-ui/transitions.md): Transitions help to make a UI expressive and easy to use.
- [React Typography component](https://mui.com/material-ui/react-typography.md): Use typography to present your design and content as clearly and efficiently as possible.
- [Textarea Autosize React component](https://mui.com/material-ui/react-textarea-autosize.md): The Textarea Autosize component automatically adjusts its height to match the length of the content within.
- [Toggle Button React component](https://mui.com/material-ui/react-toggle-button.md): A Toggle Button can be used to group related options.

## Design Resources

- [Material UI for Figma](https://mui.com/material-ui/design-resources/material-ui-for-figma.md): Enhance designer-developer collaboration between Material UI and Figma.
- [Material UI Sync plugin 🧪](https://mui.com/material-ui/design-resources/material-ui-sync.md): Sync is a Figma plugin that generates Material UI themes directly from design to code.

## Discover More

- [Showcase](https://mui.com/material-ui/discover-more/showcase.md): Check out these public apps using Material UI to get inspired for your next project.
- [Related projects](https://mui.com/material-ui/discover-more/related-projects.md): A carefully curated list of tools that expand or build on top of Material UI.
- [Roadmap](https://mui.com/material-ui/discover-more/roadmap.md): Keep up with ongoing projects and help shape the future of Material UI.
- [Sponsors and Backers](https://mui.com/material-ui/discover-more/backers.md): Support the development of the open-source projects of the MUI organization through crowdfunding.
- [Vision](https://mui.com/material-ui/discover-more/vision.md): Our vision is to provide an elegant React implementation of the Material Design guidelines that can be customized to fully match your brand.
- [Changelog](https://mui.com/material-ui/discover-more/changelog.md): Material UI follows Semantic Versioning 2.0.0.

## Material UI

- [Material UI components](https://mui.com/material-ui/all-components.md): Every Material UI component available so far.
- [Transfer list React component](https://mui.com/material-ui/react-transfer-list.md): A Transfer List (or "shuttle") enables the user to move one or more list items between lists.
- [Media queries in React for responsive design](https://mui.com/material-ui/react-use-media-query.md): This React hook listens for matches to a CSS media query. It allows the rendering of components based on whether the query matches or not.

## Getting Started

- [Installation](https://mui.com/material-ui/getting-started/installation.md): Install Material UI, the world's most popular React UI framework.
- [Usage](https://mui.com/material-ui/getting-started/usage.md): Learn the basics of working with Material UI components.
- [Model Context Protocol (MCP) for MUI](https://mui.com/material-ui/getting-started/mcp.md): Access the official Material UI docs and code examples in your AI client.
- [Example projects](https://mui.com/material-ui/getting-started/example-projects.md): A collection of examples and scaffolds integrating Material UI with popular libraries and frameworks.
- [New Free React Templates](https://mui.com/material-ui/getting-started/templates.md): Browse our collection of free React templates to get started building your app with Material UI, including a React dashboard, React marketing page, and more.
- [Learning resources](https://mui.com/material-ui/getting-started/learn.md): New to Material UI? Get up to speed quickly with our curated list of learning resources.
- [Design resources](https://mui.com/material-ui/getting-started/design-resources.md): Be more efficient designing and developing with the same library.
- [Frequently Asked Questions](https://mui.com/material-ui/getting-started/faq.md): Stuck on a particular problem? Check some of these common gotchas first in the FAQ.
- [Supported components](https://mui.com/material-ui/getting-started/supported-components.md): The following is a list of Material Design components & features.
- [Supported platforms](https://mui.com/material-ui/getting-started/supported-platforms.md): Learn about the platforms, from modern to old, that are supported by Material UI.
- [Support](https://mui.com/material-ui/getting-started/support.md): Learn how to get support for Material UI components, including feature requests, bug fixes, and technical support from the team.

## Customization

- [Overriding component structure](https://mui.com/material-ui/customization/overriding-component-structure.md): Learn how to override the default DOM structure of Material UI components.
- [Dark mode](https://mui.com/material-ui/customization/dark-mode.md): Material UI comes with two palette modes: light (the default) and dark.
- [Color](https://mui.com/material-ui/customization/color.md): Convey meaning through color. Out of the box you get access to all colors in the Material Design guidelines.
- [Right-to-left support](https://mui.com/material-ui/customization/right-to-left.md): Learn how to implement right-to-left (RTL) text with Material UI to support languages such as Arabic, Persian, and Hebrew.
- [Shadow DOM](https://mui.com/material-ui/customization/shadow-dom.md): The shadow DOM lets you encapsulate parts of an app to keep them separate from global styles that target the regular DOM tree.
- [Default theme viewer](https://mui.com/material-ui/customization/default-theme.md): This tree view allows you to explore how the theme object looks like with the default values.
- [Theming](https://mui.com/material-ui/customization/theming.md): Customize Material UI with your theme. You can change the colors, the typography and much more.
- [Creating themed components](https://mui.com/material-ui/customization/creating-themed-components.md): Learn how to create fully custom components that accept your app's theme.
- [Themed components](https://mui.com/material-ui/customization/theme-components.md): You can customize a component's styles, default props, and more by using its component key inside the theme.
- [Palette](https://mui.com/material-ui/customization/palette.md): The palette enables you to modify the color of the components to suit your brand.
- [Typography](https://mui.com/material-ui/customization/typography.md): The theme provides a set of type sizes that work well together, and also with the layout grid.
- [Spacing](https://mui.com/material-ui/customization/spacing.md): Use the theme.spacing() helper to create consistent spacing between the elements of your UI.
- [Shape](https://mui.com/material-ui/customization/shape.md): The shape is a design token that helps control the border radius of components.
- [Breakpoints](https://mui.com/material-ui/customization/breakpoints.md): API that enables the use of breakpoints in a wide variety of contexts.
- [Container queries](https://mui.com/material-ui/customization/container-queries.md): Material UI provides a utility function for creating CSS container queries based on theme breakpoints.
- [Density](https://mui.com/material-ui/customization/density.md): How to apply density to Material UI components.
- [z-index](https://mui.com/material-ui/customization/z-index.md): z-index is the CSS property that helps control layout by providing a third axis to arrange content.
- [Transitions](https://mui.com/material-ui/customization/transitions.md): These theme helpers allow you to create custom CSS transitions, you can customize the durations, easings and more.
- [CSS Layers](https://mui.com/material-ui/customization/css-layers.md): Learn how to generate Material UI styles with cascade layers.

## Guides

- [Building extensible themes](https://mui.com/material-ui/guides/building-extensible-themes.md): Learn how to build extensible themes with Material UI.
- [Minimizing bundle size](https://mui.com/material-ui/guides/minimizing-bundle-size.md): Learn how to reduce your bundle size and improve development performance by avoiding costly import patterns.
- [Server rendering](https://mui.com/material-ui/guides/server-rendering.md): The most common use case for server-side rendering is to handle the initial render when a user (or search engine crawler) first requests your app.
- [Responsive UI](https://mui.com/material-ui/guides/responsive-ui.md): Material Design layouts encourage consistency across platforms, environments, and screen sizes by using uniform elements and spacing.
- [Testing](https://mui.com/material-ui/guides/testing.md): Write tests to prevent regressions and write better code.
- [Localization](https://mui.com/material-ui/guides/localization.md): Localization (also referred to as "l10n") is the process of adapting a product or content to a specific locale or market.
- [API design approach](https://mui.com/material-ui/guides/api.md): We have learned a great deal regarding how Material UI is used, and the v1 rewrite allowed us to completely rethink the component API.
- [TypeScript](https://mui.com/material-ui/guides/typescript.md): You can add static typing to JavaScript to improve developer productivity and code quality thanks to TypeScript.
- [Composition](https://mui.com/material-ui/guides/composition.md): Material UI tries to make composition as easy as possible.
- [Content Security Policy (CSP)](https://mui.com/material-ui/guides/content-security-policy.md): This section covers the details of setting up a CSP.

## Integrations

- [Next.js integration](https://mui.com/material-ui/integrations/nextjs.md): Learn how to use Material UI with Next.js.
- [Routing libraries](https://mui.com/material-ui/integrations/routing.md): By default, the navigation is performed with a native &lt;a&gt; element. You can customize it, for instance, using Next.js's Link or react-router.
- [Using styled-components](https://mui.com/material-ui/integrations/styled-components.md): Learn how to use styled-components instead of Emotion with Material UI.
- [Style library interoperability](https://mui.com/material-ui/integrations/interoperability.md): While you can use the Emotion-based styling solution provided by Material UI, you can also use the one you already know, from plain CSS to styled-components.
- [Theme scoping](https://mui.com/material-ui/integrations/theme-scoping.md): Learn how to use multiple styling solutions in a single Material UI app.

## Migration

- [Upgrade to Grid v2](https://mui.com/material-ui/migration/upgrade-to-grid-v2.md): This guide explains how and why to migrate from the GridLegacy component to the Grid component.
- [Migration from @material-ui/pickers](https://mui.com/material-ui/migration/pickers-migration.md): <p class="description"><code>@material-ui/pickers</code> was moved to the <code>@mui/lab</code>.</p>
- [Upgrade to v7](https://mui.com/material-ui/migration/upgrade-to-v7.md): This guide explains how to upgrade from Material UI v6 to v7.
- [Upgrade to v6](https://mui.com/material-ui/migration/upgrade-to-v6.md): This guide explains why and how to upgrade from Material UI v5 to v6.
- [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis.md): Learn how to migrate away from recently deprecated APIs before they become breaking changes.
- [Migrating to v5: getting started](https://mui.com/material-ui/migration/migration-v4.md): This guide explains how and why to migrate from Material UI v4 to v5.
- [Migration from v3 to v4](https://mui.com/material-ui/migration/migration-v3.md): Yeah, v4 has been released!
- [Migration from v0.x to v1](https://mui.com/material-ui/migration/migration-v0x.md): Yeah, v1 has been released! Take advantage of 2 years worth of effort.

# MUI X Documentation

This documentation covers all MUI X packages including Data Grid, Date Pickers, Charts, Tree View, and other components.

---

## Date and Time Pickers

This is the documentation for the Date and Time Pickers package.
It contains comprehensive guides, components, and utilities for building user interfaces.

- [Quickstart](/x/react-date-pickers/quickstart.md): Install the MUI X Date and Time Pickers package and set up your date library to start building.
- [Base concepts](/x/react-date-pickers/base-concepts.md): The Date and Time Pickers expose a lot of components to fit your every need.

### Components

#### Date components

- [Date Picker](/x/react-date-pickers/date-picker.md): The Date Picker component lets users select a date.
- [Date Field](/x/react-date-pickers/date-field.md): The Date Field component lets users select a date with the keyboard.
- [Date Calendar](/x/react-date-pickers/date-calendar.md): The Date Calendar component lets users select a date without any input or popper / modal.

#### Time components

- [Time Picker](/x/react-date-pickers/time-picker.md): The Time Picker component lets the user select a time.
- [Time Field](/x/react-date-pickers/time-field.md): The Time Field component lets the user select a time with the keyboard.
- [Time Clock](/x/react-date-pickers/time-clock.md): The Time Clock component lets the user select a time without any input or popper / modal.
- [Digital Clock](/x/react-date-pickers/digital-clock.md): The Digital Clock lets the user select a time without any input or popper / modal.

#### Date Time components

- [Date Time Picker](/x/react-date-pickers/date-time-picker.md): The Date Time Picker component lets users select a date and time.
- [Date Time Field](/x/react-date-pickers/date-time-field.md): The Date Time Field component lets users select a date and a time with the keyboard.

#### Date Range components

- [Date Range Picker](/x/react-date-pickers/date-range-picker.md): The Date Range Picker lets the user select a range of dates.
- [Date Range Field](/x/react-date-pickers/date-range-field.md): The Date Range Field lets the user select a date range with the keyboard.
- [Date Range Calendar](/x/react-date-pickers/date-range-calendar.md): The Date Range Calendar lets the user select a range of dates without any input or popper / modal.

#### Time Range components

- [Time Range Picker](/x/react-date-pickers/time-range-picker.md): The Time Range Picker lets users select a range of time values. 🆕
- [Time Range Field](/x/react-date-pickers/time-range-field.md): The Time Range Field lets the user select a range of time with the keyboard.

#### Date Time Range components

- [Date Time Range Picker](/x/react-date-pickers/date-time-range-picker.md): The Date Time Range Picker lets the user select a range of dates with an explicit starting and ending time.
- [Date Time Range Field](/x/react-date-pickers/date-time-range-field.md): The Date Time Range Field lets the user select a range of dates with an explicit starting and ending time with the keyboard.

- [Field components](/x/react-date-pickers/fields.md): The field components let the user input date and time values with a keyboard and refined keyboard navigation.

### Main features

- [Validation](/x/react-date-pickers/validation.md): Add custom validation to user inputs.
- [Components lifecycle](/x/react-date-pickers/lifecycle.md): This page explains when the onChange, onAccept, and onClose callbacks are called.
- [Shortcuts](/x/react-date-pickers/shortcuts.md): The date picker lets you add custom shortcuts.
- [Accessibility](/x/react-date-pickers/accessibility.md): Learn how the Date and Time Pickers implement accessibility features and guidelines, including keyboard navigation that follows international standards.

### Localization

- [Translated components](/x/react-date-pickers/localization.md): Date and Time Pickers support translations between languages.
- [Date format and localization](/x/react-date-pickers/adapters-locale.md): Date and Time Pickers support formats from different locales.
- [UTC and timezones](/x/react-date-pickers/timezone.md): Date and Time Pickers support UTC and timezones.
- [Calendar systems](/x/react-date-pickers/calendar-systems.md): Use the Date and Time Pickers with non-Gregorian calendars.

### Customization

- [Custom subcomponents](/x/react-date-pickers/custom-components.md): Learn how to override parts of the Date and Time Pickers.
- [Custom layout](/x/react-date-pickers/custom-layout.md): The Date and Time Pickers let you reorganize the layout.
- [Custom field](/x/react-date-pickers/custom-field.md): The Date and Time Pickers let you customize the field by passing props or custom components.
- [Custom opening button](/x/react-date-pickers/custom-opening-button.md): The date picker lets you customize the button to open the views.
- [Customization playground](/x/react-date-pickers/playground.md): Use this playground to experiment with the props that affect the layout of the Date and Time Picker components.

### Resources

- [Index](/x/api/date-pickers.md): API documentation for Index
- [DateCalendar](/x/api/date-pickers/date-calendar.md): API documentation for DateCalendar
- [DateField](/x/api/date-pickers/date-field.md): API documentation for DateField
- [DatePicker](/x/api/date-pickers/date-picker.md): API documentation for DatePicker
- [DatePickerToolbar](/x/api/date-pickers/date-picker-toolbar.md): API documentation for DatePickerToolbar
- [DateRangeCalendar](/x/api/date-pickers/date-range-calendar.md): API documentation for DateRangeCalendar (pro)
- [DateRangePicker](/x/api/date-pickers/date-range-picker.md): API documentation for DateRangePicker (pro)
- [DateRangePickerDay](/x/api/date-pickers/date-range-picker-day.md): API documentation for DateRangePickerDay (pro)
- [DateRangePickerDay2](/x/api/date-pickers/date-range-picker-day-2.md): API documentation for DateRangePickerDay2 (pro)
- [DateRangePickerToolbar](/x/api/date-pickers/date-range-picker-toolbar.md): API documentation for DateRangePickerToolbar (pro)
- [DateTimeField](/x/api/date-pickers/date-time-field.md): API documentation for DateTimeField
- [DateTimePicker](/x/api/date-pickers/date-time-picker.md): API documentation for DateTimePicker
- [DateTimePickerTabs](/x/api/date-pickers/date-time-picker-tabs.md): API documentation for DateTimePickerTabs
- [DateTimePickerToolbar](/x/api/date-pickers/date-time-picker-toolbar.md): API documentation for DateTimePickerToolbar
- [DateTimeRangePicker](/x/api/date-pickers/date-time-range-picker.md): API documentation for DateTimeRangePicker (pro)
- [DateTimeRangePickerTabs](/x/api/date-pickers/date-time-range-picker-tabs.md): API documentation for DateTimeRangePickerTabs (pro)
- [DateTimeRangePickerToolbar](/x/api/date-pickers/date-time-range-picker-toolbar.md): API documentation for DateTimeRangePickerToolbar (pro)
- [DayCalendarSkeleton](/x/api/date-pickers/day-calendar-skeleton.md): API documentation for DayCalendarSkeleton
- [DesktopDatePicker](/x/api/date-pickers/desktop-date-picker.md): API documentation for DesktopDatePicker
- [DesktopDateRangePicker](/x/api/date-pickers/desktop-date-range-picker.md): API documentation for DesktopDateRangePicker (pro)
- [DesktopDateTimePicker](/x/api/date-pickers/desktop-date-time-picker.md): API documentation for DesktopDateTimePicker
- [DesktopDateTimeRangePicker](/x/api/date-pickers/desktop-date-time-range-picker.md): API documentation for DesktopDateTimeRangePicker (pro)
- [DesktopTimePicker](/x/api/date-pickers/desktop-time-picker.md): API documentation for DesktopTimePicker
- [DesktopTimeRangePicker](/x/api/date-pickers/desktop-time-range-picker.md): API documentation for DesktopTimeRangePicker (pro)
- [DigitalClock](/x/api/date-pickers/digital-clock.md): API documentation for DigitalClock
- [LocalizationProvider](/x/api/date-pickers/localization-provider.md): API documentation for LocalizationProvider
- [MobileDatePicker](/x/api/date-pickers/mobile-date-picker.md): API documentation for MobileDatePicker
- [MobileDateRangePicker](/x/api/date-pickers/mobile-date-range-picker.md): API documentation for MobileDateRangePicker (pro)
- [MobileDateTimePicker](/x/api/date-pickers/mobile-date-time-picker.md): API documentation for MobileDateTimePicker
- [MobileDateTimeRangePicker](/x/api/date-pickers/mobile-date-time-range-picker.md): API documentation for MobileDateTimeRangePicker (pro)
- [MobileTimePicker](/x/api/date-pickers/mobile-time-picker.md): API documentation for MobileTimePicker
- [MobileTimeRangePicker](/x/api/date-pickers/mobile-time-range-picker.md): API documentation for MobileTimeRangePicker (pro)
- [MonthCalendar](/x/api/date-pickers/month-calendar.md): API documentation for MonthCalendar
- [MultiInputDateRangeField](/x/api/date-pickers/multi-input-date-range-field.md): API documentation for MultiInputDateRangeField (pro)
- [MultiInputDateTimeRangeField](/x/api/date-pickers/multi-input-date-time-range-field.md): API documentation for MultiInputDateTimeRangeField (pro)
- [MultiInputTimeRangeField](/x/api/date-pickers/multi-input-time-range-field.md): API documentation for MultiInputTimeRangeField (pro)
- [MultiSectionDigitalClock](/x/api/date-pickers/multi-section-digital-clock.md): API documentation for MultiSectionDigitalClock
- [PickerDay2](/x/api/date-pickers/picker-day-2.md): API documentation for PickerDay2
- [PickersActionBar](/x/api/date-pickers/pickers-action-bar.md): API documentation for PickersActionBar
- [PickersCalendarHeader](/x/api/date-pickers/pickers-calendar-header.md): API documentation for PickersCalendarHeader
- [PickersDay](/x/api/date-pickers/pickers-day.md): API documentation for PickersDay
- [PickersLayout](/x/api/date-pickers/pickers-layout.md): API documentation for PickersLayout
- [PickersRangeCalendarHeader](/x/api/date-pickers/pickers-range-calendar-header.md): API documentation for PickersRangeCalendarHeader (pro)
- [PickersSectionList](/x/api/date-pickers/pickers-section-list.md): API documentation for PickersSectionList
- [PickersShortcuts](/x/api/date-pickers/pickers-shortcuts.md): API documentation for PickersShortcuts
- [PickersTextField](/x/api/date-pickers/pickers-text-field.md): API documentation for PickersTextField
- [SingleInputDateRangeField](/x/api/date-pickers/single-input-date-range-field.md): API documentation for SingleInputDateRangeField (pro)
- [SingleInputDateTimeRangeField](/x/api/date-pickers/single-input-date-time-range-field.md): API documentation for SingleInputDateTimeRangeField (pro)
- [SingleInputTimeRangeField](/x/api/date-pickers/single-input-time-range-field.md): API documentation for SingleInputTimeRangeField (pro)
- [StaticDatePicker](/x/api/date-pickers/static-date-picker.md): API documentation for StaticDatePicker
- [StaticDateRangePicker](/x/api/date-pickers/static-date-range-picker.md): API documentation for StaticDateRangePicker (pro)
- [StaticDateTimePicker](/x/api/date-pickers/static-date-time-picker.md): API documentation for StaticDateTimePicker
- [StaticTimePicker](/x/api/date-pickers/static-time-picker.md): API documentation for StaticTimePicker
- [TimeClock](/x/api/date-pickers/time-clock.md): API documentation for TimeClock
- [TimeField](/x/api/date-pickers/time-field.md): API documentation for TimeField
- [TimePicker](/x/api/date-pickers/time-picker.md): API documentation for TimePicker
- [TimePickerToolbar](/x/api/date-pickers/time-picker-toolbar.md): API documentation for TimePickerToolbar
- [TimeRangePicker](/x/api/date-pickers/time-range-picker.md): API documentation for TimeRangePicker (pro)
- [TimeRangePickerTabs](/x/api/date-pickers/time-range-picker-tabs.md): API documentation for TimeRangePickerTabs (pro)
- [TimeRangePickerToolbar](/x/api/date-pickers/time-range-picker-toolbar.md): API documentation for TimeRangePickerToolbar (pro)
- [YearCalendar](/x/api/date-pickers/year-calendar.md): API documentation for YearCalendar

---

## Charts

This is the documentation for the Charts package.
It contains comprehensive guides, components, and utilities for building user interfaces.

- [Quickstart](/x/react-charts/quickstart.md): Install the MUI X Charts package to start building React data visualization components.
- [Examples](/x/react-charts/examples.md): Browse through our collection of MUI X Chart demos.

### Components

#### Bars

- [Bars overview](/x/react-charts/bars.md): Bar charts express quantities through a bar's length, using a common baseline.
- [Demos](/x/react-charts/bar-demo.md): This page groups demos using bar charts.

#### Lines

- [Lines overview](/x/react-charts/lines.md): Line charts can express qualities about data, such as hierarchy, highlights, and comparisons.
- [Lines demo](/x/react-charts/line-demo.md): This page groups demos using line charts.
- [Area demo](/x/react-charts/areas-demo.md): This page groups demos using area charts.

#### Pie

- [Pie overview](/x/react-charts/pie.md): Pie charts express portions of a whole, using arcs or angles within a circle.
- [Demo](/x/react-charts/pie-demo.md): This page groups demos using pie charts.

#### Scatter

- [Scatter overview](/x/react-charts/scatter.md): Scatter charts express the relation between two variables, using points in a surface.
- [Demo](/x/react-charts/scatter-demo.md): This page groups demos using scatter charts.

- [Sparkline](/x/react-charts/sparkline.md): Sparkline chart can provide an overview of data trends.
- [Gauge](/x/react-charts/gauge.md): Gauge let the user evaluate metrics.
- [Radar](/x/react-charts/radar.md): Radar lets you compare multivariate data in a 2D chart.
- [Heatmap](/x/react-charts/heatmap.md): Heatmap charts visually represents data with color variations to highlight patterns and trends across two dimensions. (pro)

#### Funnel

- [Funnel overview](/x/react-charts/funnel.md): Funnel charts let you express quantity evolution along a process, such as audience engagement, population education levels, or yields of multiple processes.
- [Pyramid demo](/x/react-charts/pyramid.md): The pyramid chart is a variation of the funnel chart.

- [Sankey](/x/react-charts/sankey.md): Sankey charts are great for visualizing flows between different elements. (pro)

#### Main features

- [Animation](/x/react-charts/animation.md): Learn how to customize both CSS and JavaScript-based Chart animations.
- [Axis](/x/react-charts/axis.md): Define, format, and customize Chart axes.
- [Custom components](/x/react-charts/components.md): Create custom chart components using the provided hooks.
- [Composition](/x/react-charts/composition.md): Creating advanced custom charts.
- [Label](/x/react-charts/label.md): Label is the text reference of a series or data.
- [Legend](/x/react-charts/legend.md): Legend is the UI element mapping symbols and colors to the series' label.
- [Localization](/x/react-charts/localization.md): Localization (also referred to as "l10n") is the process of adapting a product or content to a specific locale or market.
- [Stacking](/x/react-charts/stacking.md): Stacking lets you display the decomposition of values.
- [Styling](/x/react-charts/styling.md): This page groups topics about charts customization.
- [Tooltip](/x/react-charts/tooltip.md): Tooltip provides extra data on charts item.
- [Highlighting](/x/react-charts/highlighting.md): Highlighting data offers quick visual feedback for chart users.
- [Brush](/x/react-charts/brush.md): The brush interaction allows users to select a region on the chart by clicking and dragging.
- [Zoom and pan](/x/react-charts/zoom-and-pan.md): Enables zooming and panning on specific charts or axis. (pro)
- [Export](/x/react-charts/export.md): Export charts as a PDF from the print dialog, or as an image. (pro)
- [Toolbar](/x/react-charts/toolbar.md): Charts can display a toolbar for easier access to certain functionality.
- [Content Security Policy](/x/react-charts/content-security-policy.md): This section covers the details of setting up a Content Security Policy.

#### Resources

- [AnimatedArea](/x/api/charts/animated-area.md): API documentation for AnimatedArea
- [AnimatedLine](/x/api/charts/animated-line.md): API documentation for AnimatedLine
- [AreaElement](/x/api/charts/area-element.md): API documentation for AreaElement
- [AreaPlot](/x/api/charts/area-plot.md): API documentation for AreaPlot
- [BarChart](/x/api/charts/bar-chart.md): API documentation for BarChart
- [BarChartPro](/x/api/charts/bar-chart-pro.md): API documentation for BarChartPro (pro)
- [BarElement](/x/api/charts/bar-element.md): API documentation for BarElement
- [BarLabel](/x/api/charts/bar-label.md): API documentation for BarLabel
- [BarPlot](/x/api/charts/bar-plot.md): API documentation for BarPlot
- [ChartContainer](/x/api/charts/chart-container.md): API documentation for ChartContainer
- [ChartContainerPro](/x/api/charts/chart-container-pro.md): API documentation for ChartContainerPro (pro)
- [ChartDataProvider](/x/api/charts/chart-data-provider.md): API documentation for ChartDataProvider
- [ChartDataProviderPro](/x/api/charts/chart-data-provider-pro.md): API documentation for ChartDataProviderPro (pro)
- [ChartsAxis](/x/api/charts/charts-axis.md): API documentation for ChartsAxis
- [ChartsAxisHighlight](/x/api/charts/charts-axis-highlight.md): API documentation for ChartsAxisHighlight
- [ChartsAxisTooltipContent](/x/api/charts/charts-axis-tooltip-content.md): API documentation for ChartsAxisTooltipContent
- [ChartsBrushOverlay](/x/api/charts/charts-brush-overlay.md): API documentation for ChartsBrushOverlay
- [ChartsClipPath](/x/api/charts/charts-clip-path.md): API documentation for ChartsClipPath
- [ChartsGrid](/x/api/charts/charts-grid.md): API documentation for ChartsGrid
- [ChartsItemTooltipContent](/x/api/charts/charts-item-tooltip-content.md): API documentation for ChartsItemTooltipContent
- [ChartsLegend](/x/api/charts/charts-legend.md): API documentation for ChartsLegend
- [ChartsLocalizationProvider](/x/api/charts/charts-localization-provider.md): API documentation for ChartsLocalizationProvider
- [ChartsReferenceLine](/x/api/charts/charts-reference-line.md): API documentation for ChartsReferenceLine
- [ChartsSurface](/x/api/charts/charts-surface.md): API documentation for ChartsSurface
- [ChartsText](/x/api/charts/charts-text.md): API documentation for ChartsText
- [ChartsToolbarImageExportTrigger](/x/api/charts/charts-toolbar-image-export-trigger.md): API documentation for ChartsToolbarImageExportTrigger (pro)
- [ChartsToolbarPrintExportTrigger](/x/api/charts/charts-toolbar-print-export-trigger.md): API documentation for ChartsToolbarPrintExportTrigger (pro)
- [ChartsToolbarPro](/x/api/charts/charts-toolbar-pro.md): API documentation for ChartsToolbarPro (pro)
- [ChartsToolbarZoomInTrigger](/x/api/charts/charts-toolbar-zoom-in-trigger.md): API documentation for ChartsToolbarZoomInTrigger (pro)
- [ChartsToolbarZoomOutTrigger](/x/api/charts/charts-toolbar-zoom-out-trigger.md): API documentation for ChartsToolbarZoomOutTrigger (pro)
- [ChartsTooltip](/x/api/charts/charts-tooltip.md): API documentation for ChartsTooltip
- [ChartsTooltipContainer](/x/api/charts/charts-tooltip-container.md): API documentation for ChartsTooltipContainer
- [ChartsWrapper](/x/api/charts/charts-wrapper.md): API documentation for ChartsWrapper
- [ChartsXAxis](/x/api/charts/charts-x-axis.md): API documentation for ChartsXAxis
- [ChartsYAxis](/x/api/charts/charts-y-axis.md): API documentation for ChartsYAxis
- [ChartZoomSlider](/x/api/charts/chart-zoom-slider.md): API documentation for ChartZoomSlider (pro)
- [ContinuousColorLegend](/x/api/charts/continuous-color-legend.md): API documentation for ContinuousColorLegend
- [FunnelChart](/x/api/charts/funnel-chart.md): API documentation for FunnelChart (pro)
- [FunnelPlot](/x/api/charts/funnel-plot.md): API documentation for FunnelPlot (pro)
- [Gauge](/x/api/charts/gauge.md): API documentation for Gauge
- [GaugeContainer](/x/api/charts/gauge-container.md): API documentation for GaugeContainer
- [Heatmap](/x/api/charts/heatmap.md): API documentation for Heatmap (pro)
- [HeatmapPlot](/x/api/charts/heatmap-plot.md): API documentation for HeatmapPlot (pro)
- [HeatmapTooltip](/x/api/charts/heatmap-tooltip.md): API documentation for HeatmapTooltip (pro)
- [HeatmapTooltipContent](/x/api/charts/heatmap-tooltip-content.md): API documentation for HeatmapTooltipContent (pro)
- [LineChart](/x/api/charts/line-chart.md): API documentation for LineChart
- [LineChartPro](/x/api/charts/line-chart-pro.md): API documentation for LineChartPro (pro)
- [LineElement](/x/api/charts/line-element.md): API documentation for LineElement
- [LineHighlightElement](/x/api/charts/line-highlight-element.md): API documentation for LineHighlightElement
- [LineHighlightPlot](/x/api/charts/line-highlight-plot.md): API documentation for LineHighlightPlot
- [LinePlot](/x/api/charts/line-plot.md): API documentation for LinePlot
- [MarkElement](/x/api/charts/mark-element.md): API documentation for MarkElement
- [MarkPlot](/x/api/charts/mark-plot.md): API documentation for MarkPlot
- [PieArc](/x/api/charts/pie-arc.md): API documentation for PieArc
- [PieArcLabel](/x/api/charts/pie-arc-label.md): API documentation for PieArcLabel
- [PieArcLabelPlot](/x/api/charts/pie-arc-label-plot.md): API documentation for PieArcLabelPlot
- [PieArcPlot](/x/api/charts/pie-arc-plot.md): API documentation for PieArcPlot
- [PiecewiseColorLegend](/x/api/charts/piecewise-color-legend.md): API documentation for PiecewiseColorLegend
- [PieChart](/x/api/charts/pie-chart.md): API documentation for PieChart
- [PieChartPro](/x/api/charts/pie-chart-pro.md): API documentation for PieChartPro (pro)
- [PiePlot](/x/api/charts/pie-plot.md): API documentation for PiePlot
- [RadarAxis](/x/api/charts/radar-axis.md): API documentation for RadarAxis
- [RadarAxisHighlight](/x/api/charts/radar-axis-highlight.md): API documentation for RadarAxisHighlight
- [RadarChart](/x/api/charts/radar-chart.md): API documentation for RadarChart
- [RadarChartPro](/x/api/charts/radar-chart-pro.md): API documentation for RadarChartPro (pro)
- [RadarGrid](/x/api/charts/radar-grid.md): API documentation for RadarGrid
- [RadarMetricLabels](/x/api/charts/radar-metric-labels.md): API documentation for RadarMetricLabels
- [RadarSeriesArea](/x/api/charts/radar-series-area.md): API documentation for RadarSeriesArea
- [RadarSeriesMarks](/x/api/charts/radar-series-marks.md): API documentation for RadarSeriesMarks
- [RadarSeriesPlot](/x/api/charts/radar-series-plot.md): API documentation for RadarSeriesPlot
- [SankeyChart](/x/api/charts/sankey-chart.md): API documentation for SankeyChart (pro)
- [SankeyPlot](/x/api/charts/sankey-plot.md): API documentation for SankeyPlot (pro)
- [SankeyTooltip](/x/api/charts/sankey-tooltip.md): API documentation for SankeyTooltip (pro)
- [SankeyTooltipContent](/x/api/charts/sankey-tooltip-content.md): API documentation for SankeyTooltipContent (pro)
- [Scatter](/x/api/charts/scatter.md): API documentation for Scatter
- [ScatterChart](/x/api/charts/scatter-chart.md): API documentation for ScatterChart
- [ScatterChartPro](/x/api/charts/scatter-chart-pro.md): API documentation for ScatterChartPro (pro)
- [ScatterPlot](/x/api/charts/scatter-plot.md): API documentation for ScatterPlot
- [SparkLineChart](/x/api/charts/spark-line-chart.md): API documentation for SparkLineChart
- [Toolbar](/x/api/charts/toolbar.md): API documentation for Toolbar
- [ToolbarButton](/x/api/charts/toolbar-button.md): API documentation for ToolbarButton
- [AxisConfig](/x/api/charts/axis-config.md): API documentation for AxisConfig
- [BarSeries](/x/api/charts/bar-series.md): API documentation for BarSeries
- [FunnelSeries](/x/api/charts/funnel-series.md): API documentation for FunnelSeries
- [HeatmapSeries](/x/api/charts/heatmap-series.md): API documentation for HeatmapSeries
- [LineSeries](/x/api/charts/line-series.md): API documentation for LineSeries
- [PieSeries](/x/api/charts/pie-series.md): API documentation for PieSeries
- [RadarSeries](/x/api/charts/radar-series.md): API documentation for RadarSeries
- [ScatterSeries](/x/api/charts/scatter-series.md): API documentation for ScatterSeries
- [LegendItemParams](/x/api/charts/legend-item-params.md): API documentation for LegendItemParams
- [ChartImageExportOptions](/x/api/charts/chart-image-export-options.md): API documentation for ChartImageExportOptions
- [ChartPrintExportOptions](/x/api/charts/chart-print-export-options.md): API documentation for ChartPrintExportOptions
- [Overview](/x/react-charts/hooks.md): The package provides a set of hooks to access chart data and utilities for building custom components.
- [useSeries](/x/react-charts/hooks/use-series.md): Access raw series data for all chart types.
- [useLegend](/x/react-charts/hooks/use-legend.md): Access formatted legend data for creating custom legend components.
- [useDrawingArea](/x/react-charts/hooks/use-drawing-area.md): Access the chart's drawing area dimensions and coordinates.
- [useScale](/x/react-charts/hooks/use-scale.md): Access D3 scale functions for coordinate transformations.
- [useAxes](/x/react-charts/hooks/use-axes.md): Access axis configuration and properties for cartesian and polar charts.
- [useDataset](/x/react-charts/hooks/use-dataset.md): Access the dataset used to populate series and axes data.
- [Plugins](/x/react-charts/plugins.md): The library relies on two systems to perform data processing: the plugins and the series config.

---

## Tree View

This is the documentation for the Tree View package.
It contains comprehensive guides, components, and utilities for building user interfaces.

- [Quickstart](/x/react-tree-view/quickstart.md): Install the MUI X Tree View package and start building.

### Simple Tree View

- [Items](/x/react-tree-view/simple-tree-view/items.md): Learn how to add simple data to the Tree View component.
- [Selection](/x/react-tree-view/simple-tree-view/selection.md): Learn how to enable item selection for the Tree View component.
- [Expansion](/x/react-tree-view/simple-tree-view/expansion.md): Learn how to handle expanding and collapsing Tree View items.
- [Customization](/x/react-tree-view/simple-tree-view/customization.md): Learn how to customize the Simple Tree View component.
- [Focus](/x/react-tree-view/simple-tree-view/focus.md): Learn how to focus Tree View items.

### Rich Tree View

- [Items](/x/react-tree-view/rich-tree-view/items.md): Pass data to your Tree View.
- [Selection](/x/react-tree-view/rich-tree-view/selection.md): Handle how users can select items.
- [Expansion](/x/react-tree-view/rich-tree-view/expansion.md): Handle how users can expand items.
- [Customization](/x/react-tree-view/rich-tree-view/customization.md): Learn how to customize the Rich Tree View component.
- [Focus](/x/react-tree-view/rich-tree-view/focus.md): Learn how to focus Tree View items.
- [Label editing](/x/react-tree-view/rich-tree-view/editing.md): Learn how to edit the label of Tree View items. 🆕
- [Lazy loading](/x/react-tree-view/rich-tree-view/lazy-loading.md): Lazy load the data from your Tree View. (pro) 🆕
- [Ordering](/x/react-tree-view/rich-tree-view/ordering.md): Drag and drop your items to reorder them. (pro) 🆕

### Main features

- [Accessibility](/x/react-tree-view/accessibility.md): Learn how the Tree View implements accessibility features and guidelines, including keyboard navigation that follows international standards.
- [Item customization](/x/react-tree-view/tree-item-customization.md): Learn how to customize the Tree Item component.

### Resources

- [RichTreeView](/x/api/tree-view/rich-tree-view.md): API documentation for RichTreeView
- [RichTreeViewPro](/x/api/tree-view/rich-tree-view-pro.md): API documentation for RichTreeViewPro (pro)
- [SimpleTreeView](/x/api/tree-view/simple-tree-view.md): API documentation for SimpleTreeView
- [TreeItem](/x/api/tree-view/tree-item.md): API documentation for TreeItem
- [TreeItemDragAndDropOverlay](/x/api/tree-view/tree-item-drag-and-drop-overlay.md): API documentation for TreeItemDragAndDropOverlay
- [TreeItemIcon](/x/api/tree-view/tree-item-icon.md): API documentation for TreeItemIcon
- [TreeItemProvider](/x/api/tree-view/tree-item-provider.md): API documentation for TreeItemProvider

---

## Data Grid

This is the documentation for the Data Grid package.
It contains comprehensive guides, components, and utilities for building user interfaces.

- [Quickstart](/x/react-data-grid/quickstart.md): Install the MUI X Data Grid package and start building your React data table.
- [Features](/x/react-data-grid/features.md): Explore all of the available features in each of the Data Grid packages.

### Demos

- [time data](/x/react-data-grid/demos/real-time-data.md): Real-time data updates in the Data Grid, using simulated market data to showcase live changes.
- [Time off calendar](/x/react-data-grid/demos/time-off-calendar.md): Date range visualization in the Data Grid, using a calendar UI to display and manage time periods.
- [Inventory](/x/react-data-grid/demos/inventory.md): An inventory dashboard for vendors showcasing product availability.

### Main features

- [Layout](/x/react-data-grid/layout.md): The Data Grid offers multiple layout modes.

#### Columns

- [Column definition](/x/react-data-grid/column-definition.md): Define your columns.
- [Column dimensions](/x/react-data-grid/column-dimensions.md): Customize the dimensions and resizing behavior of your columns.
- [Column visibility](/x/react-data-grid/column-visibility.md): Define which columns are visible.
- [Custom columns](/x/react-data-grid/custom-columns.md): Create custom column types.
- [Column header](/x/react-data-grid/column-header.md): Customize your columns header.
- [Column menu](/x/react-data-grid/column-menu.md): Customize your columns menu.
- [Column spanning](/x/react-data-grid/column-spanning.md): Span cells across several columns.
- [Column groups](/x/react-data-grid/column-groups.md): Group your columns.
- [Column reordering](/x/react-data-grid/column-ordering.md): The Data Grid Pro lets users drag and drop columns to reorder them. (pro)
- [Column pinning](/x/react-data-grid/column-pinning.md): Implement pinning to keep columns in the Data Grid visible at all times. (pro)
- [Recipes](/x/react-data-grid/column-recipes.md): Advanced column customization recipes.

#### Rows

- [Row definition](/x/react-data-grid/row-definition.md): Define your rows.
- [Row updates](/x/react-data-grid/row-updates.md): Always keep your rows up to date.
- [Row height](/x/react-data-grid/row-height.md): Customize the height of your rows.
- [Row spanning](/x/react-data-grid/row-spanning.md): Span cells across several rows. 🆕
- [detail row panels](/x/react-data-grid/master-detail.md): Implement master-detail row panels to let users view extended information without leaving the Data Grid. (pro)
- [Row reordering](/x/react-data-grid/row-ordering.md): The Data Grid Pro lets users drag and drop rows to reorder them. (pro)
- [Row pinning](/x/react-data-grid/row-pinning.md): Implement pinning to keep rows in the Data Grid visible at all times. (pro)
- [Recipes](/x/react-data-grid/row-recipes.md): Advanced row customization recipes.

- [Cells](/x/react-data-grid/cells.md): Learn how to customize the rendered elements and values of a cell.

#### Editing

- [Overview](/x/react-data-grid/editing.md): The Data Grid has built-in support for cell and row editing.
- [Persistence](/x/react-data-grid/editing/persistence.md): Persisting edited rows.
- [Custom edit component](/x/react-data-grid/editing/custom-edit-component.md): Creating custom edit component.
- [Editing events](/x/react-data-grid/editing/editing-events.md): Using editing events.
- [Recipes editing](/x/react-data-grid/recipes-editing.md): Advanced grid customization recipes.

- [Sorting](/x/react-data-grid/sorting.md): Easily sort your rows based on one or several criteria.

#### Filtering

- [Overview](/x/react-data-grid/filtering.md): Easily filter your rows based on one or several criteria.
- [Customization](/x/react-data-grid/filtering/customization.md): Ways to customize your filters.
- [Quick filter](/x/react-data-grid/filtering/quick-filter.md): One filter field to quickly filter grid.
- [side filtering](/x/react-data-grid/filtering/server-side.md): Filter rows on the server.
- [filters](/x/react-data-grid/filtering/multi-filters.md): Let end users apply multiple filters to the Data Grid simultaneously. (pro)
- [Header filters](/x/react-data-grid/filtering/header-filters.md): Give users quick-access column filters in the Data Grid header. (pro)
- [Recipes](/x/react-data-grid/filtering-recipes.md): Advanced filtering customization recipes.

- [Pagination](/x/react-data-grid/pagination.md): Easily paginate your rows and only fetch what you need.

#### Selection

- [Row selection](/x/react-data-grid/row-selection.md): Row selection lets users select and highlight a single row or multiple rows that they can then take action on.
- [Cell selection](/x/react-data-grid/cell-selection.md): Let users select individual cells or a range of cells. (premium)

- [Virtualization](/x/react-data-grid/virtualization.md): The grid is high performing thanks to its rows and columns virtualization engine.
- [Accessibility](/x/react-data-grid/accessibility.md): Learn how the Data Grid implements accessibility features and guidelines, including keyboard navigation that follows international standards.
- [Localization](/x/react-data-grid/localization.md): The Data Grid's localization features provide the appropriate translations and formatting for users around the world.

### Advanced features

- [Tree data](/x/react-data-grid/tree-data.md): Use tree data to render rows with parent-child relationships in the Data Grid. (pro)

#### Row grouping

- [Overview](/x/react-data-grid/row-grouping.md): Group rows together based on column values in the Data Grid.
- [Recipes](/x/react-data-grid/recipes-row-grouping.md): Advanced grid customization recipes.

- [Aggregation](/x/react-data-grid/aggregation.md): Add aggregation functions to the Data Grid to let users combine row values. (premium)

#### Pivoting

- [Overview](/x/react-data-grid/pivoting.md): Rearrange rows and columns to view data from multiple perspectives.

- [Export](/x/react-data-grid/export.md): Export the rows in CSV or Excel formats, or use the browser's print dialog to print or save as PDF.
- [Copy and paste](/x/react-data-grid/clipboard.md): Copy and paste data using clipboard.
- [Scrolling](/x/react-data-grid/scrolling.md): This section presents how to programmatically control the scroll.
- [List view](/x/react-data-grid/list-view.md): Display data in a single-column list view for a more compact Data Grid on smaller screens and mobile devices. (pro)

#### Server-side data

- [Overview](/x/react-data-grid/server-side-data.md): Learn how to work with server-side data in the Data Grid using the Data Source layer.
- [Tree data](/x/react-data-grid/server-side-data/tree-data.md): Implement lazy-loading server-side tree data in the Data Grid using the Data Source layer. (pro)
- [Lazy loading](/x/react-data-grid/server-side-data/lazy-loading.md): Implement lazy-loading rows with server-side data in the Data Grid using the Data Source layer. (pro)
- [Row grouping](/x/react-data-grid/server-side-data/row-grouping.md): Implement row grouping with server-side data in the Data Grid using the Data Source layer. (premium)
- [Aggregation](/x/react-data-grid/server-side-data/aggregation.md): Implement aggregation with server-side data in the Data Grid using the Data Source layer. (premium)
- [Pivoting](/x/react-data-grid/server-side-data/pivoting.md): Implement pivoting with server-side data in the Data Grid using the Data Source layer. (premium)
- [Recipes](/x/react-data-grid/server-side-data/recipes.md): Recipes for advanced data source use-cases.

- [Charts integration](/x/react-data-grid/charts-integration.md): Use the MUI X Charts to visualize data from the Data Grid. (premium)
- [AI Assistant](/x/react-data-grid/ai-assistant.md): Translate natural language into Data Grid views. (premium) 🆕

### Components

- [Toolbar](/x/react-data-grid/components/toolbar.md): Add custom actions and controls to the Data Grid.
- [Export](/x/react-data-grid/components/export.md): Let users export the Data Grid for Excel, CSV, or printing.
- [Quick Filter](/x/react-data-grid/components/quick-filter.md): Provide users with an expandable search field to filter data in the Data Grid.
- [Columns Panel](/x/react-data-grid/components/columns-panel.md): Customize the Data Grid's columns panel. (planned)
- [Filter Panel](/x/react-data-grid/components/filter-panel.md): Customize the Data Grid's filter panel. (planned)
- [Prompt Field](/x/react-data-grid/components/prompt-field.md): Provide users with a prompt field to interact with the AI assistant. (premium)
- [Pivot Panel](/x/react-data-grid/components/pivot-panel.md): Customize the Data Grid's pivot panel. (premium) (planned)
- [Charts Panel](/x/react-data-grid/components/charts-panel.md): Customize the Data Grid's Charts panel. (premium) (planned)
- [AI Assistant Panel](/x/react-data-grid/components/ai-assistant-panel.md): Customize the Data Grid's AI assistant panel. (premium) (planned)

### Customization

- [Styling basics](/x/react-data-grid/style.md): The grid CSS can be easily overwritten.
- [Styling recipes](/x/react-data-grid/style-recipes.md): Advanced grid styling recipes.
- [Overlays](/x/react-data-grid/overlays.md): The various Data Grid overlays.

### Resources

- [API object](/x/react-data-grid/api-object.md): Interact with the Data Grid using its API.
- [Events](/x/react-data-grid/events.md): Subscribe to the events emitted by the Data Grid to trigger custom behavior.
- [State](/x/react-data-grid/state.md): Initialize and read the state of the Data Grid.
- [Performance](/x/react-data-grid/performance.md): Follow these recommendations to improve your Data Grid's performance.

### API reference

- [Index](/x/api/data-grid.md): API documentation for Index
- [AiAssistantPanelTrigger](/x/api/data-grid/ai-assistant-panel-trigger.md): API documentation for AiAssistantPanelTrigger (premium)
- [ChartsPanelTrigger](/x/api/data-grid/charts-panel-trigger.md): API documentation for ChartsPanelTrigger (premium)
- [ColumnsPanelTrigger](/x/api/data-grid/columns-panel-trigger.md): API documentation for ColumnsPanelTrigger
- [DataGrid](/x/api/data-grid/data-grid.md): API documentation for DataGrid
- [DataGridPremium](/x/api/data-grid/data-grid-premium.md): API documentation for DataGridPremium (premium)
- [DataGridPro](/x/api/data-grid/data-grid-pro.md): API documentation for DataGridPro (pro)
- [ExportCsv](/x/api/data-grid/export-csv.md): API documentation for ExportCsv
- [ExportExcel](/x/api/data-grid/export-excel.md): API documentation for ExportExcel (premium)
- [ExportPrint](/x/api/data-grid/export-print.md): API documentation for ExportPrint
- [FilterPanelTrigger](/x/api/data-grid/filter-panel-trigger.md): API documentation for FilterPanelTrigger
- [GridChartsPanel](/x/api/data-grid/grid-charts-panel.md): API documentation for GridChartsPanel (premium)
- [GridChartsRendererProxy](/x/api/data-grid/grid-charts-renderer-proxy.md): API documentation for GridChartsRendererProxy (premium)
- [GridFilterForm](/x/api/data-grid/grid-filter-form.md): API documentation for GridFilterForm
- [GridFilterPanel](/x/api/data-grid/grid-filter-panel.md): API documentation for GridFilterPanel
- [GridToolbarQuickFilter](/x/api/data-grid/grid-toolbar-quick-filter.md): API documentation for GridToolbarQuickFilter
- [PivotPanelTrigger](/x/api/data-grid/pivot-panel-trigger.md): API documentation for PivotPanelTrigger (premium)
- [PromptField](/x/api/data-grid/prompt-field.md): API documentation for PromptField (premium)
- [PromptFieldControl](/x/api/data-grid/prompt-field-control.md): API documentation for PromptFieldControl (premium)
- [PromptFieldRecord](/x/api/data-grid/prompt-field-record.md): API documentation for PromptFieldRecord (premium)
- [PromptFieldSend](/x/api/data-grid/prompt-field-send.md): API documentation for PromptFieldSend (premium)
- [QuickFilter](/x/api/data-grid/quick-filter.md): API documentation for QuickFilter
- [QuickFilterClear](/x/api/data-grid/quick-filter-clear.md): API documentation for QuickFilterClear
- [QuickFilterControl](/x/api/data-grid/quick-filter-control.md): API documentation for QuickFilterControl
- [QuickFilterTrigger](/x/api/data-grid/quick-filter-trigger.md): API documentation for QuickFilterTrigger
- [Toolbar](/x/api/data-grid/toolbar.md): API documentation for Toolbar
- [ToolbarButton](/x/api/data-grid/toolbar-button.md): API documentation for ToolbarButton
- [GridApi](/x/api/data-grid/grid-api.md): API documentation for GridApi
- [GridCellParams](/x/api/data-grid/grid-cell-params.md): API documentation for GridCellParams
- [GridColDef](/x/api/data-grid/grid-col-def.md): API documentation for GridColDef
- [GridSingleSelectColDef](/x/api/data-grid/grid-single-select-col-def.md): API documentation for GridSingleSelectColDef
- [GridActionsColDef](/x/api/data-grid/grid-actions-col-def.md): API documentation for GridActionsColDef
- [GridListViewColDef](/x/api/data-grid/grid-list-view-col-def.md): API documentation for GridListViewColDef
- [GridExportStateParams](/x/api/data-grid/grid-export-state-params.md): API documentation for GridExportStateParams
- [GridFilterItem](/x/api/data-grid/grid-filter-item.md): API documentation for GridFilterItem
- [GridFilterModel](/x/api/data-grid/grid-filter-model.md): API documentation for GridFilterModel
- [GridFilterOperator](/x/api/data-grid/grid-filter-operator.md): API documentation for GridFilterOperator
- [GridRenderContext](/x/api/data-grid/grid-render-context.md): API documentation for GridRenderContext
- [GridRowClassNameParams](/x/api/data-grid/grid-row-class-name-params.md): API documentation for GridRowClassNameParams
- [GridRowParams](/x/api/data-grid/grid-row-params.md): API documentation for GridRowParams
- [GridRowSpacingParams](/x/api/data-grid/grid-row-spacing-params.md): API documentation for GridRowSpacingParams
- [GridRowOrderChangeParams](/x/api/data-grid/grid-row-order-change-params.md): API documentation for GridRowOrderChangeParams
- [GridAggregationFunction](/x/api/data-grid/grid-aggregation-function.md): API documentation for GridAggregationFunction
- [GridAggregationFunctionDataSource](/x/api/data-grid/grid-aggregation-function-data-source.md): API documentation for GridAggregationFunctionDataSource
- [GridCsvExportOptions](/x/api/data-grid/grid-csv-export-options.md): API documentation for GridCsvExportOptions
- [GridPrintExportOptions](/x/api/data-grid/grid-print-export-options.md): API documentation for GridPrintExportOptions
- [GridExcelExportOptions](/x/api/data-grid/grid-excel-export-options.md): API documentation for GridExcelExportOptions

### Tutorials

- [side data](/x/react-data-grid/tutorials/server-side-data.md)