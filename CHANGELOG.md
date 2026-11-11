# Changelog

All notable changes to **blanmont** are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.29.1] - 2026-11-11

### Chores
- chore(ci): switch to Variant C zero-Actions VPS CI & release workflow (`0313276`)
## [0.29.0] - 2026-11-04

### Added
- feat(shop): persist equipment orders and add admin tracking (#179) (`39875ef`)

### Fixed
- fix(deps): clear critical/high npm audit findings (#174) (`bd3660c`)
- fix(lint): resolve all 213 eslint errors (#176) (`813e0f8`)
- fix(home): prevent mobile collisions in group roads and photo plates (#177) (`efd7d6b`)

### Chores
- ci: add verify workflow (tsc, vitest, lint, build, audit) (#175) (`fe3cd3e`)
- docs(audit): 2026-11-04 project audit + Brain sync (#173) (`e631712`)
- chore: remove tracked scratch files, refresh stale docs, harden storage rules (#178) (`06b67b4`)

## [0.28.0] - 2026-10-12

### Added
- feat(privacy): restreindre le Carré Vert et les albums photos aux membres connectés (#170) (#171) (`d889a46`)

### Fixed
- fix(tooling): add Windows path normalization and utf-8 support in super-board scripts (#172) (`076cc14`)

## [0.27.3] - 2026-10-09

### Changed
- ✨ [feat] sentry: install and configure Sentry Next.js SDK (#169) (`47a1500`)

## [0.27.2] - 2026-10-08

### Changed
- Staging (#156) (`3031675`)
- Staging (#158) (`da10f93`)
- Staging (#162) (`0b8b1a5`)
- 🚀 [release] promote staging to master (issues #150, #163) (`ce7862f`)

## [0.27.1] - 2026-10-07

### Fixed
- fix(stats): differentiate group colors in dynamics chart and elevate admin views (#144) (`bd71572`)
- fix(admin): resolve horizontal tab overflow and modernize admin tutorial modals (#145) (`7cfe6df`)

### Changed
- 🔧 [chore] super-board: configure autonomous project pipeline (`d1b1705`)
- 📝 [docs] super-board: add pre-flight readiness checklist (`2f55820`)

### Chores
- docs(admin): update tutorial modals with La Feuille de Blanmont styling (`acaf988`)

## [0.27.0] - 2026-09-25

### Added
- feat(admin): apply La Feuille de Blanmont IGN design system across admin modules (#137) (`e39fde1`)
- feat(ui): implement custom navigation-style tooltip for buttons and fix pointage express selection (#138) (`c5989b0`)

## [0.26.0] - 2026-09-23

### Added
- feat(carte): implement ground-up topographic redesign 'La Feuille de Blanmont' with map and slider fixes (#132) (`4f7bc4d`)
- feat(home): reorder homepage sections and fix Vercel pnpm deployment issue (#133) (`0f61869`)
- feat(brand): implement heart line logo mark across platform components (#135) (`2af2d6f`)
- feat(galerie): elevate gallery and lightbox craft to La Feuille de Blanmont specifications (#136) (`c55b397`)

### Chores
- docs(design): align impeccable documentation with La Feuille de Blanmont and git workflow (#134) (`2e76e5a`)

## [0.25.0] - 2026-09-22

### Added
- feat(admin): add trial ride requests lead management CRM (/admin/prospects) (#127) (`9f6e131`)
- feat(leaderboard): add multi-season selector and all-time Hall of Fame fidelity rankings (#128) (`a1dee39`)
- feat(leaderboard): elevate multi-season and hall of fame to impeccable craft standards with vector icons and tests (`5ddf8b2`)

### Fixed
- fix(deps): update pnpm-lock.yaml to synchronize with package.json (#130) (`cc02448`)

### Chores
- test(coverage): add comprehensive test suites for api routes, firebase services, and ui components (#125) (`afd8370`)
- docs(roadmap): establish comprehensive application audit and master feature roadmap (2026-2027) (#126) (`e830fa7`)
- docs(design): update DESIGN.md and design tokens (#129) (`3169a5d`)

## [0.24.0] - 2026-09-18

### Added
- feat(mobile): adapt interactive touch targets to 44px and fix reduced motion handling (#107) (`dc5550e`)
- feat(mobile): enlarge 82 interactive touch targets to 44px minimum (#110) (`3ab0679`)
- feat(mobile): enlarge interactive touch targets to 44px minimum (#112) (`2b2aa66`)
- feat(ui): complete dark mode variants for calendar subscription, 404, and error boundary (#113) (`ab0cafe`)
- feat(blog): implement editorial prose styling and Cloudinary WYSIWYG image upload (#117) (`fb94d8c`)
- feat(galerie): implement historical albums migration and editorial gallery viewer (#118) (`3f31fbf`)
- feat(galerie): refine filter toolbar layout, dual-axis controls, and active chips (#119) (`57dcff5`)
- feat(admin): reorganize navigation hierarchy and eliminate duplicate icons (#120) (`70c0471`)

### Fixed
- fix(equipment): add optional cut property to Equipment interface and exclude tests from build tsconfig (#109) (`9c3b8a3`)
- fix(ui): remove black bar on hero slider and border clash on PELOTON section (#114) (`059609a`)
- fix(firebase): use Admin SDK for server-side feedback operations (#115) (`00f8bac`)

### Changed
- refactor(ui): eliminate redundant kickers, inert controls, and orphan styles in v2 (#108) (`6fa8491`)
- style(ui): polish transitions and hairline borders across screens (#111) (`67133b2`)
- Scrape gallery albums from cyclo-blanmont.be (#116) (`f9f8ef5`)
- style(layout): remove repetitive hairline divider below hero titles across all pages (#121) (`d92dbee`)
- style(hero): align background watermark consistently across all pages (#122) (`6c448f7`)

## [0.23.0] - 2026-09-17

### Added
- feat(ui): add editorial parallax layers, align type ramp, and fix image props (#106) (`cee05b7`)

### Changed
- style(typography): replace 192 arbitrary micro font-sizes with text-xs (#103) (`4b0b0a1`)

### Chores
- docs(design): sync design tokens and harmonize component snippets (#105) (`a455b38`)

## [0.22.0] - 2026-09-16

### Added
- feat(a11y): harden form controls, modals, and admin UI accessibility (#95) (`7ec15e6`)
- feat(sondages): auto-create weekend poll on Mondays with manual sync & editing (#99) (`d4ba046`)

### Fixed
- fix(auth): correct badge and notification contrast across authentication flows (#96) (`8e5b640`)
- fix(calendar): prevent mobile line break and fix truncation in shortcut pill (#97) (`f3fb64e`)
- fix(ui): polish mobile reviews and drawer footer button alignment (`9005ffe`)

### Changed
- refactor: context architecture optimization and mobile UI polish (#98) (`36e8f6c`)

### Chores
- docs(design): update design token definitions in DESIGN.md (`4d1237b`)
- docs(design): automate git flow for document and sync sidecar (#100) (`06d2248`)
- docs(workflow): add git workflow guide and link in conventions (#101) (`9345462`)
- test: add comprehensive test suite across middleware, actions, api, and ui components (#102) (`4912c57`)

## [0.21.0] - 2026-09-15

### Added
- feat(nav): clarify, reorder, and reshape navigation and Le Club menu (#91) (`f806035`)
- feat(leaderboard): improve accessibility, date formatting and dynamic metadata (#92) (`81e019a`)

### Fixed
- fix(leaderboard): remove unused imports and add return type to keydown handler (#93) (`c147698`)

## [0.20.0] - 2026-09-14

### Added
- feat(ux): add aria-label and focus states to delete buttons (#88) (`ab2d366`)
- feat(admin): add member photo cadrage, positioning and 4:5 cropper (#89) (`04b99f8`)
- feat: display GPX info on NextRideCard (#86) (`20342a5`)
- feat: implement content-gap features and editorial peloton enhancements (`557a99f`)

### Fixed
- fix(deps): update pnpm-lock.yaml to synchronize with package.json (`ef9dad6`)

## [0.19.1] - 2026-09-11

### Changed
- Remove unused Firebase Storage in favor of Cloudinary (#85) (`a955a88`)

## [0.19.0] - 2026-09-10

### Added
- Add tests for useImageUpload hook (#77) (`1bad13e`)

### Changed
- perf: Optimize Firebase equipment data seeding with Promise.all() (#79) (`36cca9f`)
- 🧪 Add tests for logger (#82) (`56d5c87`)

## [0.18.0] - 2026-09-09

### Added
- feat(ui): add bespoke cycling icons and refine visual elements across core pages (`7ea7103`)
- feat(ui): harmonize editorial cycling iconography and architectural frames across app (`6335d58`)
- feat(admin): create weekend poll based on Saturday ride info and distances (`dc4d76e`)
- feat(admin): add Capitaine de Route status and member role management (`3614333`)
- feat(calendrier): redesign drawer with debriefs, cycling telemetry, and fix SSR hydration (#74) (`7fa763a`)
- feat: clarify calendrier agenda UX, polish checkout page and e2e testing (#76) (`1296815`)

### Fixed
- fix(a11y): address PR review feedback on accessible buttons and map toggle (`d1c647a`)
- fix(admin): use fixed portal tooltip for collapsed sidebar navigation (`74e15b3`)
- fix(config): disable devIndicators to prevent overlay in admin layout (`15e1004`)

### Chores
- test(auth): add unit test suite for member account activation gate (`667e73f`)
- docs(design): refresh DESIGN.md with Stitch schema and Editorial Peloton rules (`f9af88c`)

## [0.17.0] - 2026-09-08

### Added
- feat(ui): fix homepage double hairline border, add hero telemetry customization and theme toggle (#62) (`b58ec53`)
- feat(ui): add header theme toggle and complete light/dark mode styling (`b4e877f`)
- feat(ui): adapt equipment catalog and loading states for light and dark modes (`0a0fcd7`)
- feat(ui): adapt leaderboard podium cards, rankings table, and drawer for dark mode (`c713eb8`)
- feat(admin): add interactive 21:9 cropper and visual framing adjustment for hero slider (#63) (`799bd50`)
- feat(ui): fix navbar presentation icon in light mode and adapt le-club page for dark mode (`79814d9`)
- feat(admin): lock admin backoffice strictly to light mode (`434016a`)
- feat(leaderboard): allow clicking attendance dates to view calendar event details (`72752f6`)
- feat(auth): restrict account activation to registered members only (`dd2953e`)

### Fixed
- fix(auth): implement secure password hashing, secure sessions, and Zod input validation (#59) (`02d0b62`)
- fix(hero): add no-referrer policy, URL sanitization and image error fallback (#64) (`e4db4bb`)
- fix(deps): resolve peer dependency conflict for Vercel deployment (`ee6e9a4`)

### Changed
- refactor(traces): temporarily hide traces and GPX catalog routes (`49c5b0d`)
- 🎨 Palette: Add ARIA labels to icon-only buttons and aria-expanded to map toggle (`cfecbd7`)

### Chores
- test: configure vitest and add comprehensive unit test suite (`caf0917`)
- test(e2e): configure playwright webapp testing and server lifecycle (`f874319`)

## [0.16.0] - 2026-09-07

### Added
- feat(ui): display 'Mon Compte' label next to user avatar in navbar (#60) (`961f794`)
- feat(ui): trigger hamburger menu earlier and refine group badges on le-club (#61) (`62ce8c8`)

## [0.15.0] - 2026-09-02

### Added
- feat(calendrier): redesign calendar page with editorial cover hero and interactive views (`1f883ca`)
- feat(ui): align main pages with Editorial Peloton design system and vector fallbacks (`26b4e95`)
- feat(calendar,admin): global multi-month calendar search and admin portal distillation (`a199893`)
- feat(app): harden resilience, date parsing, error boundaries, and loading states (#55) (`cc4f848`)
- feat(admin): implement comprehensive onboarding, tutorials, and driver.js guided tours (#56) (`4d5492f`)
- feat(ui): polish hero actions, footer ride card deduplication, and weather badge styling (`59da262`)
- feat(ui): implement hairline stat strips, strip banned kickers and halos, harden a11y across all pages (#57) (`c50d305`)
- feat(ui,auth): visual typography watermark layers, activation flow, and editorial chronicle (`d72590a`)
- feat(admin): hide traces GPS section from navigation and checklist (#58) (`79ffd44`)

## [0.14.0] - 2026-09-01

### Added
- feat(home): colorize app subtly and modernize homepage (#50) (`afbc6db`)
- feat(ui): implement cycling gazette editorial design system across app (`61e0735`)

### Changed
- style(typography): harmonize application-wide typographic system and tokens (`557a189`)

## [0.13.0] - 2026-08-31

### Added
- feat(security): secure admin api routes, httponly session auth, and prevent blog xss (`0a6ae60`)
- feat(calendar): add iCal sync feed, Open-Meteo weather integration, and 2-step PDF import preview (`ce3a22e`)
- feat(footer): make next ride rendezvous card expandable (`c5865b8`)
- feat(polls): add weekend attendance QCM poll and admin management suite (`e497564`)
- feat(ui): add first-arrival brand kinetic loading animation (`83a9cab`)
- feat(landing): amplify landing page with bold athletic design and bento showcase (`c010847`)
- feat(landing): lighten color scheme, streamline CTAs, and create spacious airy layout (`da8b844`)

### Fixed
- fix: place weekend poll at end of navbar menu and fix top hero layout on /sondage (`4b07b30`)

### Changed
- refactor: completely remove MUI/Emotion, introduce Sonner toasts, and clean up HTML & dead code (`3acc4bd`)
- refactor(ui): apply quieter and refined visual design across the app and home page (`852eaed`)

## [0.12.0] - 2026-08-27

### Added
- feat(footer): reposition next ride card beside club identity and align navigation below (`550679a`)
- feat: add Carré Vert Google Sheet sync button in admin and display remarks in footer next ride card (`e6833a4`)
- feat: add Garmin/Strava GPX trace link to calendar events, admin edit, and footer next ride card, and hide traces from header navbar (`d3dbeea`)
- feat(calendar): move GPX trace card to top of event drawer and top-align brand in footer (`70cc9aa`)

### Changed
- refactor: replace Blanmont Cycling Club with Club de Blanmont and remove social links from footer (`03c1658`)
- style(footer): align brand block to the top of next ride box (`e1cd98e`)
- style(footer): set 50/50 equal width split between brand block and next ride card (`88397bf`)

## [0.11.0] - 2026-08-26

### Added
- feat(footer): update footer with live club navigation and details (`d882727`)
- feat(ai): integrate graft context graph and impeccable design context (`5f411ef`)
- feat(footer): make next rendez-vous dynamic from calendar with redirect link (`7ce3f18`)
- feat(calendar): allow admin click on event to redirect to edit page (`cdc93ad`)

### Fixed
- fix(navbar): add solid background and contrast to header navigation (`364ac0d`)

## [0.10.0] - 2026-03-10

### Added
- feat(leaderboard): update Carré Vert Google Sheet URL to 2026 spreadsheet (`8c17e56`)
- feat: migrate leaderboard sync from Notion to Firebase DB (`838d542`)

## [0.9.0] - 2026-02-07

### Added
- feat(stats): refactor statistics with chart.js and Carre Vert rules (`2828b6c`)

### Fixed
- fix(api): fix CalendarEvent import and export in firebase library (`7653e64`)

## [0.8.0] - 2026-02-06

### Added
- feat(actions): enhance profile image upload with Cloudinary (`02d6f19`)
- Initial plan (`4c3bec7`)

### Fixed
- fix: resolve traces page crash and update app components (`9875281`)
- fix(build): add missing @emotion/cache dependency (`36149bd`)
- fix(build): resolve script-related build errors (`663f5c1`)
- fix: improve mobile responsiveness for home page hero and admin layout (`c9b05d8`)

### Changed
- style: fix Tailwind class ordering in home page stat bar (`a8e7bcb`)

### Chores
- docs: remove exposed Cloudinary credentials from documentation (`d02374a`)
- chore: update build config and homepage padding (`c272fd2`)
- chore: remove package-lock.json (`617166c`)
- build(deps): regenerate package-lock.json (`e6986b0`)

## [0.7.0] - 2026-02-04

### Added
- feat(blog): add blog system with admin management (`cf11d51`)
- feat(admin): add admin dashboard and authentication enhancements (`f5372d0`)
- feat(ui): add error handling and 404 pages (`63af997`)
- feat(data): add firebase integration and migration scripts (`bd8a26e`)
- feat(storage): implement Firebase Storage for image uploads (`1340e22`)

### Changed
- refactor: migrate data source from Notion to Firebase (`8fec2e0`)

### Chores
- chore: exclude local backups, public uploads and temp files (`f0ba7ec`)
- chore: update dependencies and project configuration (`41cd8ac`)

## [0.6.0] - 2026-01-07

### Added
- feat(import): add editable distance, elevation and description fields (`751efec`)
- feat(traces): add post-import editing capability (`1cba387`)
- feat(traces): add immediate edit/delete after import (`1f66258`)
- feat(traces): replace browser confirm with Headless UI modal (`3010518`)
- feat(ui): unify TracePreviewForm styling with AddTraceForm (`6c2ecfa`)

### Fixed
- fix(traces): correct direction and surface options to match Notion schema (`86659ef`)
- fix(traces): skip empty select values when updating trace (`a35edc9`)

### Changed
- review code for improvement (vibe-kanban ed565be0) (`644be69`)
- Mixed Architecture Patterns (vibe-kanban 7af20874) (`d0c1540`)
- Performance Issues (vibe-kanban 0a320dbc) (`ceea744`)
- Potential for invalid data   (vibe-kanban 665b39e5) (`9f662be`)
- **Code Style & Consistency** (vibe-kanban 11a5e052) (`1b0e29d`)
- refactor(utils): extract duplicate classNames utility to shared cn module (`241885c`)
- style: unify garmin import page with add-trace card layout (`873d933`)

## [0.5.0] - 2025-12-29

### Added
- feat(leaderboard): highlight top 3 members per group (`d444917`)
- feat(profile): add user profile page and update navbar (`bbb2554`)
- feat(profile): add profile photo update functionality (`d2e5bb3`)
- feat(profile): add profile picture upload with crop and zoom (`bdd8b94`)
- feat(calendar): implement event details drawer with map (`56c12fa`)
- feat(import): implement Strava Trace Import (`214fa48`)
- feat(import): add map preview, surface, rating, and improved feedback (`e65d537`)
- feat(import): enhance feedback UI with tailwind notification style (`99d4af0`)
- feat(import): add view trace link and delete option to success notification (`48a8bbb`)
- feat(import): use MUI Snackbar for feedback notifications (`8ad8d55`)
- feat: Implement Strava import, GPX download, and Navbar refactor (`7a50967`)
- feat(garmin): Implement Garmin Import (GPX) (`c7a5d85`)
- feat(garmin): add URL input support (`1e2126c`)
- feat(members): filter list to show only club officials (`b056ddd`)

### Fixed
- fix(calendar): resolve timezone parsing issue hiding 2026 events (`6fc2db5`)
- fix(leaderboard): implement shared ranking for tied scores (`2c19428`)
- fix(profile): split name, add phone, hide id, fix button hover (`afc49c3`)
- fix(auth): add local storage persistence and prevent reload on upload (`3faa890`)
- fix(calendar): replace broken iframe with map link card (`d19a997`)
- fix(import): fix Notion API error and add Name/Direction fields (`97b983e`)
- fix(import): add photos support, fix distance prop, improve direction handling (`39a41d0`)
- fix(import): fix Notion API photos/distance error, embed photos as content blocks (`4526683`)
- fix(import): fix 0km by adding Distance property, fix direction duplicates (`f60b498`)
- fix(import): fix broken trace view link to /traces/[id] (`cfbaef3`)
- fix(import): fix notification width and syntax (`2324578`)
- fix(notion): implement polyline chunking for >2000 char strings (`95ab9f7`)

### Changed
- style(profile): redesign page to match product overview layout (`947ffb0`)
- style(profile): update buttons to use brand-primary color (`5c07e10`)
- style(import): update feedback to top-right notification with actions below text (`fd0c593`)
- refactor(nav): move admin and import links to user dropdown menu (`357283f`)
- refactor(nav): refactor User Menu to Popover style (`bb7306f`)
- refactor(nav): mobile overlay and user avatar (`9abade1`)
- Refactor: Feature-based architecture and strict typing (`33d3ee3`)

## [0.4.0] - 2025-12-23

### Added
- feat(calendar): implement calendar page & optimize GPX (`6006da2`)
- feat(calendar): add page header (`f1073f1`)

### Fixed
- fix(calendar): initialize view with current month (`294f6c2`)

### Changed
- Update leaderboard and komoot files (`ba43fbc`)
- style(calendar): simplify UI controls - Remove 'Ajouter' and 'Vue mensuelle' buttons - Rename 'Aujourd'hui' to 'Ce mois-ci' (`e2f11f6`)
- style(calendar): apply brand colors to dates - Weekdays: Brand Primary (Red) - Weekends: Brand Secondary (Green) (`e234fb0`)
- style(calendar): fix color visibility and emphasis - Enable visible black dates for weekends - Add red background styling for weekday events (`84d1877`)

### Chores
- docs: add rule for committing changes after task completion (`ce0e8a9`)
- docs: update AI context and README for full project scope (`056056f`)

## [0.3.0] - 2025-12-19

### Added
- feat(ui): Material UI integration, Direction field, and UX enhancements (`b162a18`)
- feat(app): localize to French and complete UI refactor (`f514415`)
- feat: enhance trace filtering with direction and improve filter UI (`d828771`)

### Changed
- bugfix(cors): fix issue with google image caused by cors (`45089be`)

## [0.2.0] - 2025-12-18

### Added
- Initial commit (`d0d8b50`)
- feat(trace-detail): implement trace detail feature (`07d4b7a`)
- feat(poll): implement poll for selecting trace (`d501def`)
- feat(trace): refactor doc and add set of instruction for ai (`8772502`)
- feat(filter): add filter feature to the trace page (`d23bb52`)

### Chores
- docs: refactor documentation (`6938089`)

## [0.1.0] - 2025-12-10

### Added
- Initial commit from Create Next App (`67b0ff6`)
