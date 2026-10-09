# release notes

## Cache isolation for dictionary hosting
- limit worker cleanup and manual reset to blog-owned caches and the root worker
- bypass dictionary routes, external requests, and byte-range requests
- read only the blog cache and bump its version to `my-blog-v4`
- validate cleanup, request bypass, scoped reads, and reset using isolated JavaScript checks
- preserve the previous main commit with the `before-cache-isolation` tag

## 2026-03-08
- add visitor intelligence runtime modules for signal capture, bot scoring, Google One Tap, personalization, and Apps Script delivery
- wire the new telemetry stack into all public pages and the post template so generated post pages inherit it automatically
- localize rendered dates from the detected visitor locale/timezone and add returning-visitor UI
- add footer privacy disclosure and local clear-data control
- document the Google Sheets / Apps Script / Google Identity setup in `README.md` and `architectural.md`

## 2026-03-07
- generate per-post HTML pages with Open Graph/Twitter metadata for rich social previews
- update share links to point at `posts/<slug>.html` for consistent LinkedIn context
- expand the posts generator workflow to publish the new HTML pages
- add cover image support with a default fallback for social previews

## 2026-02-01
- added iOS home screen icon sizes and wired apple-touch-icon tags on the homepage
- cached iOS touch icons in the service worker for offline availability
- added `agent.md` with workflow checklist
- added `architectural.md` with system overview
- added file tree to `architectural.md`
- documented docs and next steps in `README.md`
- expanded `agent.md` with commit-message guidance
- added looping typewriter animation for the brand logo across pages
- introduced `assets/js/typewriter.js` and updated styles for the underscore cursor
- replaced page layouts with the BlogReplit-inspired design across all pages
- swapped in compiled Tailwind CSS plus `assets/css/custom.css` overrides
- updated `assets/js/app.js` to render the new card layouts and compute read time
- added social share actions to blog cards and expanded post sharing links
- added Replit assets (favicon, opengraph, logo)
- refreshed PWA theme colors and cache manifest
- configured the nightly posts generator to push via deploy key when rulesets require bypass


## Site efficiency — September 29, 2026

Listing pages now load generated `data/posts-index.json` with metadata and precomputed read times. Full article HTML stays in `data/posts.json` for article views. Requests are shared per page, including personalization refreshes; failed requests can retry. The publishing workflow tracks both data files and reruns for generator/template edits. Service worker v5 precaches both the small index and the full article JSON during installation, preserving offline article access after installation completes. Listing pages use the small index for rendering; the full dataset still downloads in the background. Both JSON endpoints retain the existing offline refresh strategy. Homepage scripts use ordered deferred execution; logo dimensions reserve layout space.


## Article rendering performance — September 29, 2026

Generated article pages include complete HTML from a renderer shared with the dynamic offline fallback. Prerendered articles only bind share controls; personalization does not rebuild them. Published dates are stable UTC dates. The existing logo has a 140px WebP delivery variant with explicit dimensions. Source pages allow zoom and use ordered deferred scripts. Service-worker v6 preserves full JSON precaching and includes the shared renderer and small logo. Initial service-worker activation no longer reloads a first-time visit; updates for existing controlled sessions retain the existing refresh behavior.

The footer displays this visit’s navigation-to-load duration using Navigation Timing, with reserved space and an unavailable fallback. It is a real visit measurement, not a Lighthouse score.

## 2026-10-05 — Paperlens scanner upgrade

- replace the basic `scan/index.html` with the upgraded single-page scanner, preserving `/scan/`
- add edge detection, draggable corners, perspective correction, automatic/manual capture, multiple pages, and on-device draft recovery
- enlarge the workspace and camera overlays; replace text symbols with inline SVG icons; add full-screen zoom
- add brightness, contrast, sharpening, page reordering, JPEG/PNG quality presets, and A4/Letter/fitted PDF export with configurable margins
- prepare files before native sharing; include image-preview and download fallbacks for Photos saving
- bypass scanner routes in the root blog worker and advance its cache version to prevent stale basic-scanner responses
- update README and architecture; validate processing/export using canvas fixtures and parsed PDFs

## 2026-10-05 — Paperlens project and blog

- add the Paperlens project entry and the one-file document scanner build story using the existing Markdown/frontmatter conventions
- publish the supplied iPhone screenshot as the shared cover image and show it within the blog
- generate both content feeds and static pages with scanner links and social metadata; validate IDs, slugs, image references, and output

## 2026-10-05 — Paperlens front/back ID mode

- add guided ID/license camera or photo capture from the home screen and Add page menu
- crop each side independently, retake or re-crop it, and combine front/back on one white export page
- export the composite through existing Photos JPEG/PNG and single-page PDF actions; preserve side originals for later edits
- save unfinished ID drafts locally and restore them alongside existing documents; add scoped draft discard
- reuse the existing image pipeline, cap composition resolution, and add no production dependencies
- validate canvas output, exports, cancellation, editing, normal scans and draft recovery; update usage and architecture docs

## 2026-10-05 — Developer passport-photo print studio

- add a default-off, locally remembered Developer mode switch in Studio settings
- reveal passport-photo upload, ratio-locked crop, pan/zoom and repeat-sheet controls
- add U.S./India overseas 2-inch presets, exact 51 mm and conditional 35 × 45 mm sizes with application-specific warnings
- pack a landscape 6 × 4 sheet with maximum or spaced copies, preserving required dimensions
- prepare 1800 × 1200 JPEGs tagged at 300 ppi and exact 6 × 4-inch PDFs, independent of document settings
- keep portraits local and memory-only; omit filters/retouching and flag print scaling/overscan risks
- test layouts, cropping, exports, metadata and existing document/ID behavior; update usage and architectural docs

## 2026-10-05 — Pastel theme and main-page photo studio

- show the complete passport-photo workspace on the main page when Developer mode is enabled, including after reload
- remove its popup/Close interaction; keep settings navigation and compact the scanner start card
- replace dark app chrome with pastel lavender, mint, peach and sky-blue surfaces and readable dark text
- preserve existing crop/export logic and rerun passport plus document/ID/draft regression tests


## 2026-10-06 — Dayboard Kanban at /cards/

- publish the standalone Kanban application as `cards/index.html`
- include expandable notes, due date/time, persistent countdown timers, status changes and desktop drag-and-drop
- make the page title editable and synchronize browser/iOS shortcut title metadata
- add separate bookmarkable board URLs with independent local saving
- preserve JSON import/export and HTML export with board-specific filenames and an independent copied board
- isolate the cards route from the root blog worker; update documentation and functional checks


## 2026-10-06 — Dayboard project and blog

- add the Dayboard project entry and local-first Kanban build story in the existing Markdown style
- use distinct supplied desktop and mobile screenshots for project and blog covers and in-body figures
- link both entries to the live app and explain local saving, editable titles, independent board URLs, timers and portable backups without claiming sync or background notifications
- publish immediately through the existing content generator and GitHub Pages pipeline; disable the prior one-time nighttime task to avoid duplicate work


## 2026-10-09 — QR Lab at /qr/

- add one-file QR generation and reading at `qr/index.html`, with Wi-Fi selected by default and 11 supported payload types
- add gear-only color/character configuration with Save/Cancel and local appearance preferences
- export PNG/SVG, share or print; enforce scan-friendly contrast and decode generated designs before export
- read uploaded images or live camera frames on device, with explicit link opening and camera cleanup
- isolate the QR route from the root blog cache; document use, architecture and validation limits
